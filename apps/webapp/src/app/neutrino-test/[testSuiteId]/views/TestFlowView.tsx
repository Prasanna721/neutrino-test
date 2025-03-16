import { BaseButton, buttonDefault } from "@/components/Buttons";
import { ShimmerBrowserView } from "@/components/ShimmerBrowserView";
import { getBrowserActionsByJobName, getBrowserActionUrl } from "@/lib/dbhelper";
import { updateTestSuite, useTestsuiteStore } from "@/store/useTestsuiteStore";
import { BrowserAction, BrowserActionType } from "@neutrino-package/supabase/types";
import { useEffect, useState } from "react";

interface TestflowViewProps {
    jobName: string;
}

export const TestflowView = ({ jobName }: TestflowViewProps) => {
    const currentTestRun = useTestsuiteStore((state) => state.currentTestRun);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [browserActions, setBrowserActions] = useState<BrowserAction[]>([]);
    const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
    const [currentTaskBrowserUrl, setCurrentTaskBrowserUrl] = useState<string>("");
    const [lastImagePath, setLastImagePath] = useState<string>("");

    useEffect(() => {
        if (currentTestRun.jobName == jobName && currentTestRun.jobName !== "") {
            setIsLoading(true);
            fetchBrowserActions();
            const intervalId = setInterval(fetchBrowserActions, 2000);
            return () => clearInterval(intervalId);
        } else {
            fetchBrowserActions();
        }
    }, [currentTestRun.jobName]);

    const fetchBrowserActions = async () => {
        try {
            const tImages = await getBrowserActionsByJobName(jobName);
            if (tImages.length > 0) {
                const recentBrowserAction = tImages[tImages.length - 1];
                if (currentTestRun.jobName == jobName && recentBrowserAction.image_type == BrowserActionType.VIDEO) {
                    await updateTestSuite();
                }
                if (recentBrowserAction.file_path !== lastImagePath) {
                    setBrowserActions(tImages);
                    setCurrentTaskIndex(tImages.length - 1);
                    setLastImagePath(recentBrowserAction.file_path);
                    const url = await getBrowserActionUrl(recentBrowserAction.file_path);
                    setCurrentTaskBrowserUrl(url);
                }
            }
        }
        catch (error) {
            console.error("Error fetching task images:", error);
        }
        finally {
            setIsLoading(false);
        }
    }

    const handleNext = async () => {
        if (currentTaskIndex < browserActions.length - 1) {
            const newIndex = currentTaskIndex + 1;
            setCurrentTaskIndex(newIndex);
            const url = await getBrowserActionUrl(browserActions[newIndex].file_path);
            setCurrentTaskBrowserUrl(url);
            //   setAnimateNext(true);
            //   setTimeout(() => setAnimateNext(false), 1000);
        }
    };

    const handlePrev = async () => {
        if (currentTaskIndex > 0) {
            const newIndex = currentTaskIndex - 1;
            setCurrentTaskIndex(newIndex);
            const url = await getBrowserActionUrl(browserActions[newIndex].file_path);
            setCurrentTaskBrowserUrl(url);
        }
    };

    const currentBrowserAction = browserActions[currentTaskIndex];

    return (
        <div className="testflow-tab">
            {isLoading ?
                (<ShimmerBrowserView message="Loading testflow..." />) :
                browserActions.length === 0 ?
                    (<div className="text-gray-500 italic p-2">No Testflows available</div>) :
                    (
                        <div className="mt-4">
                            <div className="flex justify-end mb-2 gap-2">
                                <BaseButton
                                    onClick={handlePrev}
                                    disabled={currentTaskIndex === 0}
                                    className={`${buttonDefault} disabled:opacity-50`}
                                >
                                    Previous
                                </BaseButton>
                                <BaseButton
                                    onClick={handleNext}
                                    disabled={currentTaskIndex === browserActions.length - 1}
                                    className={`${buttonDefault} disabled:opacity-50`}
                                >
                                    Next
                                </BaseButton>
                            </div>

                            {currentBrowserAction && (
                                <div className="p-4 border border-gray-200 rounded-md mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    {currentBrowserAction.details &&
                                        typeof currentBrowserAction.details === "object" &&
                                        !Array.isArray(currentBrowserAction.details) &&
                                        "task" in currentBrowserAction.details && (
                                            <div className="flex">
                                                <span className="font-bold mr-2 capitalize">task:</span>
                                                <span className="break-words">{(currentBrowserAction.details as Record<string, any>).task}</span>
                                            </div>
                                        )}

                                    {currentBrowserAction.page_url && (
                                        <div className="flex">
                                            <span className="font-bold mr-2 capitalize">page url:</span>
                                            <span className="text-blue-600 underline break-all">
                                                {currentBrowserAction.page_url}
                                            </span>
                                        </div>
                                    )}

                                    {currentBrowserAction.details &&
                                        typeof currentBrowserAction.details === "object" &&
                                        !Array.isArray(currentBrowserAction.details) &&
                                        Object.entries(currentBrowserAction.details as Record<string, any>)
                                            .filter(([key]) => key !== "task")
                                            .map(([key, value]) => (
                                                <div key={key} className="flex">
                                                    <span className="font-bold mr-2 capitalize">{key}:</span>
                                                    {typeof value === "object" ? (
                                                        <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-100 p-2 rounded text-gray-600 rounded w-full overflow-auto">
                                                            {JSON.stringify(value, null, 2)}
                                                        </pre>
                                                    ) : (
                                                        <span className="break-words">{value}</span>
                                                    )}
                                                </div>
                                            ))}
                                </div>

                            )}

                            {currentBrowserAction.image_type == BrowserActionType.TASK && (<div className="relative">

                                {(currentTaskIndex === browserActions.length - 1) && (currentTestRun.jobName != "") && (
                                    <div className="absolute top-2 right-4 flex items-center space-x-1 z-10">
                                        <span className="relative flex h-3 w-3 items-center justify-center">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        <span className="text-green-500 font-bold">Live</span>
                                    </div>
                                )}
                                {currentTaskBrowserUrl && (
                                    <img
                                        src={currentTaskBrowserUrl}
                                        alt="Task Image"
                                        className="w-full h-auto rounded-lg shadow-lg border border-gray-200"
                                    />
                                )}
                            </div>)}

                            {currentBrowserAction.image_type === BrowserActionType.VIDEO && currentTaskBrowserUrl && (
                                <div className="relative">
                                    <video
                                        src={currentTaskBrowserUrl}
                                        controls
                                        className="w-full h-auto rounded-lg shadow-lg border border-gray-200"
                                    />
                                </div>
                            )}
                        </div>
                    )}
        </div>
    );
}