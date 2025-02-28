"use client";

import React, { useEffect, useState } from "react";
import { TestContainer } from "@/types/testSuiteTypes";
import { TaskStatus } from "@neutrino-package/supabase/types";
import { formatDate, getDurationString } from "@/app/utils";
import { ChipView } from "@/components/CustomViews";
import { formatLogs, getChipViewStylebyTaskStatus, getStatusColor, getStatusEmoji } from "../utils";
import { ChevronDownIcon, ChevronLeftIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { LAYOUT_CONSTANTS } from "@/components/constants";
import { getPodDetails, getPodLogs } from "@/lib/dbhelper";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { updateTestSuiteById } from "@/store/useTestsuiteStore";
import TabView, { TabItem } from "@/components/TabView";
import { TestflowView } from "./TestFlowView";

interface CompleteLogsViewProps {
    testSuitId: string;
    logContainer: TestContainer;
    islogContainerActive: boolean;
    setLogViewId: React.Dispatch<React.SetStateAction<string | null>>;
    className?: string;
}

export default function CompleteLogsView({
    testSuitId,
    logContainer,
    islogContainerActive,
    setLogViewId,
    className = "",
}: CompleteLogsViewProps) {
    const [logs, setLogs] = useState<string[]>([]);
    const [showTestConfigs, setShowTestConfigs] = useState(false);

    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval> | undefined;
        if (!islogContainerActive) {
            retriveLogs();
        }
        else {
            intervalId = getRealtimeLogs();
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, []);

    const getRealtimeLogs = () => {
        if (!logContainer.podId) return;
        const intervalId = setInterval(() => {
            (async () => {
                try {
                    if (logContainer.podId) {
                        const podLogs = await getPodLogs(logContainer.podId);
                        setLogs(formatLogs(podLogs));
                        const podDetails = await getPodDetails(logContainer.jobName);
                        if (podDetails.task_status !== TaskStatus.PROGESS) {
                            clearInterval(intervalId);
                            await updateTestSuiteById(testSuitId);
                        }
                    }
                } catch (error) {
                    console.error("Error retrieving realtime logs:", error);
                    clearInterval(intervalId);
                }
            })();
        }, 2000);
        return intervalId;
    };

    const retriveLogs = async () => {
        if (logContainer.podId) {
            const logs = await getPodLogs(logContainer.podId);
            setLogs(formatLogs(logs));
        }
    };

    const tabs: TabItem[] = [
        {
            key: "logs",
            label: "Logs",
            content: <LogView
                logs={logs} />
        },
        {
            key: "testflow",
            label: "Testflow",
            content: <TestflowView jobName={logContainer.jobName} />
        },
    ];

    return (
        <div className={`${className} w-full h-full flex flex-col bg-white`}>
            <div className={`${LAYOUT_CONSTANTS.HEADER_HEIGHT} flex align-center`}>
                <div className="cursor-pointer flex items-center pl-4 text-blue-500 text-sm hover:underline" onClick={() => setLogViewId(null)}>
                    <ChevronLeftIcon className="w-4 h-4 text-blue-500" />
                    <span>{logContainer.dockerContainerId}</span>
                </div>
            </div>
            <div className="flex flex-col px-4 ">
                <div className="flex border border-gray-300 rounded-lg">
                    <div className={`w-1 rounded-l-lg ${getStatusColor(logContainer.taskStatus)}`} />
                    <div className="flex-1 space-y-2 px-4 py-3">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-800">
                                {islogContainerActive ? "Active" : "Recent"} Test
                            </span>
                            <ChipView
                                className={`mr-0 text-xs uppercase font-bold ${getChipViewStylebyTaskStatus(
                                    logContainer.taskStatus
                                )}`}
                            >
                                {logContainer.taskStatus}
                            </ChipView>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <div className="pb-2 text-xs text-gray-600 flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-gray-100 rounded">{logContainer.environment}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="flex items-center">
                                    <span className="text-gray-600 font-bold w-32">
                                        Test ContainerId:
                                    </span>
                                    <span className="text-gray-600">
                                        {logContainer.dockerContainerId}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-gray-600 font-bold w-20">
                                        Test Status:
                                    </span>
                                    <div className="text-gray-600 space-x-1">
                                        <span>{getStatusEmoji(logContainer.taskStatus)}</span>
                                        <span>{formatDate(logContainer.createdTime)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="flex items-center">
                                    <span className="text-gray-600 font-bold w-32">
                                        Container Status:
                                    </span>
                                    <span className="text-gray-600 capitalize">
                                        {logContainer.podStatus}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-gray-600 font-bold w-20">
                                        Duration:
                                    </span>
                                    <span className="text-gray-600">
                                        {getDurationString(logContainer.createdTime, logContainer.endTime)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {logContainer.taskStatus === TaskStatus.FAILED && (
                            <div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded flex flex-col">
                                <span className="font-semibold text-gray-800 mb-2">Error</span>
                                <span className="text-xs">{logContainer.errorMessage}</span>
                            </div>
                        )}

                        <div className="border-t mt-4 pt-2 text-gray-600 flex flex-col gap-2 text-xs">
                            <div
                                onClick={() => setShowTestConfigs((prev) => !prev)}
                                className="cursor-pointer flex items-center gap-1 hover:underline">
                                {showTestConfigs ? (
                                    <ChevronUpIcon className="w-4 h-4" />
                                ) : (
                                    <ChevronDownIcon className="w-4 h-4" />
                                )}
                                <span>Test Configs</span>
                            </div>
                            {showTestConfigs && (
                                <div className="mt-2 text-gray-600">
                                    {/* Replace with your actual test configs */}
                                    <p className="text-xs">Test Config 1: Value 1</p>
                                    <p className="text-xs">Test Config 2: Value 2</p>
                                    <p className="text-xs">Test Config 3: Value 3</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <TabView
                    tabs={tabs}
                    tabHeaderClassName="flex border-b border-gray-200"
                    tabItemBaseClassName={`${LAYOUT_CONSTANTS.BOX_PADDING} rounded mr-2 my-1.5 text-sm font-medium cursor-pointer transition-colors`}
                    tabActiveClassName="text-black bg-gray-200"
                    containerClassName="w-full h-full flex flex-col mt-2 mb-8"
                />

            </div>
        </div>
    );
}

interface LogViewProps {
    logs: string[];
}

const LogView = ({ logs }: LogViewProps) => {

    const handleCopyLogs = () => {
        const text = logs.join("\n");
        navigator.clipboard.writeText(text).catch((err) => {
            console.error("Failed to copy logs", err);
        });
    };

    return (
        <div className="max-h-[30rem] overflow-y-auto bg-gray-100 mt-4">
            {logs.length > 0 && (<div className={`${LAYOUT_CONSTANTS.HEADER_HEIGHT} sticky top-0 flex items-center justify-end border-b border-gray-300 bg-gray-100 z-10`}>
                <div className="text-xs cursor-pointer flex items-center pr-4 text-gray-700 gap-1 hover:underline" onClick={handleCopyLogs}>
                    <DocumentDuplicateIcon className="w-4 h-4 text-gray-700" />
                    <span>Copy log</span>
                </div>
            </div>)}

            {logs.length === 0 ? (
                <div className="text-gray-500 italic p-2">No logs available</div>
            ) : (
                <div className="flex flex-col p-4">
                    {logs.map((line, index) => (
                        <pre
                            key={index}
                            className="text-xs text-gray-500 whitespace-pre-wrap break-words mb-1"
                        >
                            {line}
                        </pre>
                    ))}
                </div>
            )}
        </div>);
}