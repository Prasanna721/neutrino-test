"use client";

import React, { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { BaseButton, buttonDefault, buttonDisabled, IconButton } from "@/components/Buttons";
import { TestSuiteListItem } from "./TestSuiteListComponent";
import { addTestSuiteTask } from "@/lib/dbhelper";
import LoadingSVG from "@/components/LoadingSvg";

function ListAddComponent({ testSuiteId, testSteps, setTestSteps }: ListAddComponentProps) {
    const [testStep, setTestStep] = useState("");
    const [addingTestStep, setAddingTestStep] = useState(false);

    const handleAdd = async () => {
        if (!testStep.trim()) return;
        setAddingTestStep(true);
        const newTestStep = await addTestSuiteTask(testSuiteId, testStep);
        setAddingTestStep(false);
        setTestSteps([...testSteps, newTestStep]);
        setTestStep("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !addingTestStep) {
            handleAdd();
        }
    };

    return (
        <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2 flex-1">
                <div className="p-1.5 bg-gray-200 rounded-full">
                    <PlusIcon className="w-5 h-5 text-gray-600" />
                </div>
                <input
                    type="text"
                    placeholder="Add Test Step"
                    value={testStep}
                    onChange={(e) => setTestStep(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="block w-full rounded-md px-3 py-1 
                            text-sm focus:outline-none"/>
            </div>

            <div>
                {addingTestStep ?
                    (<IconButton
                        className={buttonDisabled}
                        icon={<LoadingSVG size={16} strokeWidth={3} color="#000000" />}>
                        Add
                    </IconButton>
                    )
                    : (<BaseButton
                        className={buttonDefault}
                        onClick={handleAdd}
                        disabled={!testStep.trim()}>
                        Add
                    </BaseButton>)}
            </div>
        </div>
    );
}

interface ListAddComponentProps {
    testSuiteId: string;
    testSteps: TestSuiteListItem[];
    setTestSteps: React.Dispatch<React.SetStateAction<TestSuiteListItem[]>>;
}
export default ListAddComponent;