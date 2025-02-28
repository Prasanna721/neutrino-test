"use client";

import TableView from "@/components/TableView";
import { TestContainer, TestSuite } from "@/types/testSuiteTypes";
import React, { useEffect, useState } from "react";
import CurrentPodComponent from "../components/CurrentPodComponent";
import { useTestsuiteStore } from "@/store/useTestsuiteStore";
import { getTestSuite } from "@/lib/dbhelper";

export interface LogMessage {
    timestamp: number;
    level: "info" | "error" | "warn" | "debug";
    message: string;
    meta?: Record<string, unknown>;
}


export const TestsTab = ({ testSuite, setLogViewId }: TestsTabProps) => {
    const [logs, setLogs] = useState<LogMessage[]>([]);
    const [activeTestRun, setActiveTestRun] = useState<boolean>(false);
    const currentTestRun = useTestsuiteStore((state) => state.currentTestRun);
    const [recentTestRun, setRecentTestRun] = useState<TestContainer>();
    const [tableData, setTableData] = useState<any[]>([]);

    const columns = [
        { header: 'Environment', accessor: 'environment' },
        { header: 'Test', accessor: 'jobName' },
        { header: 'Status', accessor: 'status' },
        {
            header: '',
            accessor: 'actions',
            cell: (row: any) => (
                <a
                    className="text-blue-500 underline cursor-pointer hover:text-blue-800"
                    onClick={() => {
                        setLogViewId(row.dockerContainerId)
                    }}
                >
                    View details
                </a>
            ),
        }
    ];

    useEffect(() => {
        const sortedTestRuns = [...testSuite.testRuns].sort(
            (a, b) => (b.startTime ? b.startTime.getTime() : 0) - (a.startTime ? a.startTime.getTime() : 0));
        if (currentTestRun.jobName == "") {
            setActiveTestRun(false);
            if (sortedTestRuns.length > 0) {
                setRecentTestRun(sortedTestRuns[0]);
            }
        } else {
            setActiveTestRun(true);
            setRecentTestRun(currentTestRun);
        }
        const data = sortedTestRuns.map((testRun) => {
            return {
                environment: testRun.environment,
                jobName: testRun.jobName,
                status: testRun.taskStatus,
                dockerContainerId: testRun.dockerContainerId,
            };
        });
        setTableData(data);
    }, [testSuite, currentTestRun]);

    return (
        <div className="tests-tab p-4">
            {recentTestRun && (<CurrentPodComponent recentTestRun={recentTestRun} activeTestRun={activeTestRun} setLogViewId={setLogViewId} />)}
            <h2 className="text-base font-bold mb-4">All Tests</h2>
            <div className="tests-container space-y-2 max-h-96 overflow-y-auto">
                <TableView
                    columns={columns}
                    data={tableData}
                    emptyPlaceholder="No tests available" />
            </div>
        </div>
    );
};



const LogItem = ({ log }: { log: LogMessage }) => {
    const logColor = getLogColor(log.level);

    return (
        <div className={`log-item p-2 rounded-md ${logColor} bg-opacity-10`}>
            <div className="flex justify-between items-center">
                <span className="timestamp text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                <span className="level font-semibold">{log.level.toUpperCase()}</span>
            </div>
            <div className="message mt-1">{log.message}</div>
        </div>
    );
};

const getLogColor = (level: string) => {
    switch (level) {
        case "info":
            return "text-blue-500 bg-blue-100";
        case "error":
            return "text-red-500 bg-red-100";
        case "warn":
            return "text-yellow-500 bg-yellow-100";
        case "debug":
            return "text-green-500 bg-green-100";
        default:
            return "text-gray-500 bg-gray-100";
    }
};

interface TestsTabProps {
    testSuite: TestSuite;
    setLogViewId: React.Dispatch<React.SetStateAction<string | null>>;
};

export default TestsTab;
