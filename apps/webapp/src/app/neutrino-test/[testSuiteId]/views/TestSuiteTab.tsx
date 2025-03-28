"use client";

import React, { useEffect, useState } from "react";
import TestSuiteListComponent, { TestSuiteListItem } from "../components/TestSuiteListComponent";
import ListAddComponent from "../components/ListAddComponent";
import { BaseButton, buttonDefault } from "@/components/Buttons";
import Select, { SelectOption } from "@/components/SelectView";
import { LAYOUT_CONSTANTS } from "@/components/constants";
import { TestSuite } from "@/types/testSuiteTypes";
import { getTestSuiteTasks } from "../../../../lib/dbhelper";

const { CONTENT_PADDING, HEADER_HEIGHT } = LAYOUT_CONSTANTS;

export default function TestSuiteTab({ testSuite }: { testSuite: TestSuite }) {
    const [testSteps, setTestSteps] = useState<TestSuiteListItem[]>([]);
    const [status, setStatus] = useState<"waiting" | "running">("waiting");

    useEffect(() => {
        fetchTestSuiteTasks();
    }, []);

    const fetchTestSuiteTasks = async () => {
        const tasks = await getTestSuiteTasks(testSuite.testSuiteId);
        setTestSteps(tasks);
    };

    const handleReset = () => {
        setStatus((prev) => (prev === "waiting" ? "running" : "waiting"));
    };
    const options: SelectOption[] = [
        { label: "Auto-run", value: "auto_run", disabled: true },
        { label: "Manual-run", value: "manual_run" },
    ];
    const [runMode, setRunMode] = useState<SelectOption>(options[1]);

    return (
        <div className={`flex flex-col w-full gap-4`}>
            <div className={`flex items-center justify-between border-b border-gray-300 ${HEADER_HEIGHT} ${CONTENT_PADDING}`}>
                <div className="flex items-center space-x-2">
                    <Select options={options} selected={runMode} onSelect={setRunMode} />
                </div>

                {runMode.value === options[0].value && (
                    <div className="flex items-center space-x-4">
                        <BaseButton className={buttonDefault} onClick={handleReset}>
                            Reset Browser
                        </BaseButton>
                        <StatusIndicator status={status} />
                    </div>
                )}
            </div>

            <div className={`flex flex-col space-y-4 ${CONTENT_PADDING} max-h-[calc(100vh-200px)] overflow-y-auto`}>
                <TestSuiteListComponent testSteps={testSteps} setTestSteps={setTestSteps} />

                <ListAddComponent testSuite={testSuite} testSteps={testSteps} setTestSteps={setTestSteps} />
            </div>
        </div>
    );
}

function StatusIndicator({ status }: { status: "waiting" | "running" }) {
    if (status === "running") {
        return (
            <div className="flex items-center space-x-2 text-gray-700 text-sm">
                <span className="animate-ping inline-flex h-1.5 w-1.5 rounded-full bg-gray-400 opacity-75"></span>
                <span>Running Tests..</span>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-2 text-gray-600 text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
            <span>Awaiting</span>
        </div>
    );
}
