import { BaseButton, buttonDefault } from "@/components/Buttons";
import { ShimmerBrowserView } from "@/components/ShimmerBrowserView";
import { getTaskImagesByJobName, getTaskImageUrl } from "@/lib/dbhelper";
import { updateTestSuite, useTestsuiteStore } from "@/store/useTestsuiteStore";
import { TaskImage, TaskImageType } from "@neutrino-package/supabase/types";
import { useEffect, useState } from "react";

interface TestflowViewProps {
    jobName: string;
}

export const TestflowView = ({ jobName }: TestflowViewProps) => {
    const currentTestRun = useTestsuiteStore((state) => state.currentTestRun);
    const [taskImages, setTaskImages] = useState<TaskImage[]>([]);
    const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
    const [currentTaskBrowserUrl, setCurrentTaskBrowserUrl] = useState<string>("");
    const [lastImagePath, setLastImagePath] = useState<string>("");

    useEffect(() => {
        if (currentTestRun.jobName == jobName && currentTestRun.jobName !== "") {
            fetchTaskImages();
            const intervalId = setInterval(fetchTaskImages, 2000);
            return () => clearInterval(intervalId);
        } else {
            fetchTaskImages();
        }
    }, [currentTestRun.jobName]);

    const fetchTaskImages = async () => {
        try {
            const tImages = await getTaskImagesByJobName(jobName);
            if (tImages.length > 0) {
                const recentTaskImage = tImages[tImages.length - 1];
                console.log(recentTaskImage.file_path);
                console.log(lastImagePath);
                if (currentTestRun.jobName == jobName && recentTaskImage.image_type == TaskImageType.VIDEO) {
                    await updateTestSuite();
                }
                if (recentTaskImage.file_path !== lastImagePath) {
                    setTaskImages(tImages);
                    setCurrentTaskIndex(tImages.length - 1);
                    setLastImagePath(recentTaskImage.file_path);
                    const url = await getTaskImageUrl(recentTaskImage.file_path);
                    setCurrentTaskBrowserUrl(url);
                }
            }
        }
        catch (error) {
            console.error("Error fetching task images:", error);
        }
    }

    const handleNext = async () => {
        if (currentTaskIndex < taskImages.length - 1) {
            const newIndex = currentTaskIndex + 1;
            setCurrentTaskIndex(newIndex);
            const url = await getTaskImageUrl(taskImages[newIndex].file_path);
            setCurrentTaskBrowserUrl(url);
            //   setAnimateNext(true);
            //   setTimeout(() => setAnimateNext(false), 1000);
        }
    };

    const handlePrev = async () => {
        if (currentTaskIndex > 0) {
            const newIndex = currentTaskIndex - 1;
            setCurrentTaskIndex(newIndex);
            const url = await getTaskImageUrl(taskImages[newIndex].file_path);
            setCurrentTaskBrowserUrl(url);
        }
    };

    const currentTaskImage = taskImages[currentTaskIndex];

    return (
        <div className="testflow-tab">
            {taskImages.length === 0 ? (
                <ShimmerBrowserView message="Loading testflow..." />
            )
                : (
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
                                disabled={currentTaskIndex === taskImages.length - 1}
                                className={`${buttonDefault} disabled:opacity-50`}
                            >
                                Next
                            </BaseButton>
                        </div>

                        {currentTaskImage && (
                            <div className="p-4 border border-gray-200 rounded-md mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                {currentTaskImage.details &&
                                    typeof currentTaskImage.details === "object" &&
                                    !Array.isArray(currentTaskImage.details) &&
                                    "task" in currentTaskImage.details && (
                                        <div className="flex items-center">
                                            <span className="font-bold mr-2 capitalize">task:</span>
                                            <span>{(currentTaskImage.details as Record<string, any>).task}</span>
                                        </div>
                                    )}

                                {currentTaskImage.page_url && (
                                    <div className="flex items-center">
                                        <span className="font-bold mr-2 capitalize">page url:</span>
                                        <span className="text-blue-600 underline">
                                            {currentTaskImage.page_url}
                                        </span>
                                    </div>
                                )}

                                {currentTaskImage.details &&
                                    typeof currentTaskImage.details === "object" &&
                                    !Array.isArray(currentTaskImage.details) &&
                                    Object.entries(currentTaskImage.details as Record<string, any>)
                                        .filter(([key]) => key !== "task")
                                        .map(([key, value]) => (
                                            <div key={key} className="flex">
                                                <span className="font-bold mr-2 capitalize">{key}:</span>
                                                {typeof value === "object" ? (
                                                    <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-100 p-2 rounded text-gray-600 rounded">
                                                        {JSON.stringify(value, null, 2)}
                                                    </pre>
                                                ) : (
                                                    <span>{value}</span>
                                                )}
                                            </div>
                                        ))}
                            </div>

                        )}

                        {currentTaskImage.image_type == TaskImageType.TASK && (<div className="relative">

                            {(currentTaskIndex === taskImages.length - 1) && (currentTestRun.jobName != "") && (
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

                        {currentTaskImage.image_type === TaskImageType.VIDEO && currentTaskBrowserUrl && (
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