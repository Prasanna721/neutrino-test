"use client";

import React, { useEffect, useState } from "react";
import { BaseButton, buttonDefault, buttonDisabled, buttonPrimary, buttonTextDanger, IconButton } from "@/components/Buttons";
import { API } from "@/requests";
import { LAYOUT_CONSTANTS } from "@/components/constants";
import { generateTestId } from "@/app/utils";
import LoadingSVG from "@/components/LoadingSvg";
import { TestSuite } from "@/types/testSuiteTypes";
import { PodStatus } from "@neutrino-package/supabase/types";
import { updateCurrentTestRun, updateTestSuiteById, useTestsuiteStore } from "@/store/useTestsuiteStore";
import { ApiRunTestInterface } from "@/interfaces/apiResponse";
import { getTestSuiteTasks } from "@/lib/dbhelper";
import toast from "react-hot-toast";
import { ToastView } from "@/components/ToastView";

export default function TestViewHeader({ testSuite }: { testSuite: TestSuite }) {

    const [jobName, setJobName] = useState<string>('');
    const [podId, setPodId] = useState<number>();
    const currentTestRun = useTestsuiteStore((state) => state.currentTestRun);
    const [testStatus, setTestStatus] = useState<PodStatus>(PodStatus.STOPPED);

    useEffect(() => {
        if (currentTestRun.jobName == "") {
            setTestStatus(PodStatus.STOPPED);
            setJobName('');
        }
    }, [currentTestRun]);

    const runTest = async () => {
        setTestStatus(PodStatus.STARTING);
        const jobId = generateTestId();
        const testSuiteId = testSuite.testSuiteId;
        const testSteps = await getTestSuiteTasks(testSuite.testSuiteId);
        if (testSteps.length > 0) {
            try {
                const response: ApiRunTestInterface = await API.runTestSuite(jobId, testSuiteId);
                await updateCurrentTestRun(response.jobName);
                await updateTestSuiteById(testSuite.testSuiteId);
                setTestStatus(PodStatus.RUNNING);
                setJobName(response.jobName);
                setPodId(response.podId);
            } catch (error) {
                console.error('Error running test:', error);
                await updateTestSuiteById(testSuite.testSuiteId);
                setTestStatus(PodStatus.STOPPED);
                toast.custom((t) => (<ToastView message="Error starting test" progress={true} type="error" />), {
                    duration: 5000,
                    position: "bottom-center",
                });
            }
        }
        else {
            setTestStatus(PodStatus.STOPPED);
            toast.custom((t) => (<ToastView message="Try adding tests" progress={true} type="error" />), {
                duration: 5000,
                position: "bottom-center",
            });
        }
    };

    const terminateTest = async () => {
        try {
            setTestStatus(PodStatus.TERMINATING);
            await API.terminateTestSuite(jobName);
            useTestsuiteStore.getState().resetCurrentTestRun();
            await updateTestSuiteById(testSuite.testSuiteId);
            setTestStatus(PodStatus.STOPPED);
            setJobName('');
        }
        catch (error) {
            console.error('Error terminating test:', error);
        }
    };


    return (
        <header
            className={`
                w-full
                ${LAYOUT_CONSTANTS.HEADER_HEIGHT}
                border-b
                border-gray-200
                flex
                justify-between
                items-center
                ${LAYOUT_CONSTANTS.CONTENT_PADDING}}`}
        >
            <div className="flex items-center">
                <span
                    className="text-lg font-bold"
                    style={{ fontFamily: "var(--font-neutrino), sans-serif" }}
                >
                    Neutrino Test
                </span>
            </div>

            <div className="flex items-center space-x-3">
                <BaseButton className={buttonDisabled}>Save Test</BaseButton>
                {testStatus === PodStatus.STOPPED &&
                    (<BaseButton
                        className={buttonDefault}
                        onClick={runTest}>
                        Run Test
                    </BaseButton>)}

                {testStatus === PodStatus.STARTING &&
                    (<IconButton
                        className={buttonDisabled}
                        icon={<LoadingSVG size={16} strokeWidth={3} color="#000000" />}>
                        Starting Test
                    </IconButton>)}

                {testStatus === PodStatus.TERMINATING &&
                    (<IconButton
                        className={buttonDisabled}
                        icon={<LoadingSVG size={16} strokeWidth={3} color="#000000" />}>
                        Terminating Test
                    </IconButton>)}

                {testStatus === PodStatus.RUNNING &&
                    (<BaseButton
                        className={buttonTextDanger}
                        onClick={terminateTest}>
                        Terminate Test
                    </BaseButton>)}

            </div>
        </header>
    );
}
