"use client";

import React, { useEffect, useState } from "react";
import TabView, { TabItem } from "@/components/TabView";
import { LAYOUT_CONSTANTS } from "@/components/constants";
import TestsTab from "./TestsTab";
import { TestContainer, TestSuite } from "@/types/testSuiteTypes";
import CompleteLogsView from "./CompleteLogView";
import { useTestsuiteStore } from "@/store/useTestsuiteStore";
import BrowserTab from "./BrowserTag";

export default function ContainerRight({ testSuite }: { testSuite: TestSuite }) {
    const [enableLogView, setEnableLogView] = useState<boolean>(false);
    const [logViewId, setLogViewId] = useState<string | null>(null);
    const [logContainer, setLogContainer] = useState<TestContainer>();
    const [isTestRunActive, setIsTestRunActive] = useState<boolean>(false);

    useEffect(() => {
        if (logViewId) {
            const foundContainer = testSuite.testRuns.find(
                (testRun) => testRun.dockerContainerId === logViewId
            );
            if (foundContainer) {
                const currentTestRun = useTestsuiteStore.getState().currentTestRun;
                if (currentTestRun.jobName != "") {
                    setIsTestRunActive(true);
                }
                else {
                    setIsTestRunActive(false);
                }
                setLogContainer(foundContainer);
                setEnableLogView(true);
            }
        } else {
            setEnableLogView(false);
            setLogContainer(undefined);
        }
    }, [logViewId, testSuite]);

    const tabs: TabItem[] = [
        {
            key: "browser",
            label: "Browser",
            content: <BrowserTab testSuite={testSuite} setLogViewId={setLogViewId} />
        },
        {
            key: "tests",
            label: "Tests",
            content: <TestsTab testSuite={testSuite} setLogViewId={setLogViewId} />
        },
    ];
    const [activeTab, setActiveTab] = useState<string>(tabs[0].key);

    return (
        <section className="md:w-[65%] w-full flex items-center justify-center">
            {!enableLogView ? (
                <TabView
                    tabs={tabs}
                    activeKey={activeTab}
                    onTabChange={setActiveTab}
                    tabHeaderClassName="flex border-b border-gray-200 pl-2"
                    tabItemBaseClassName={`${LAYOUT_CONSTANTS.BOX_PADDING} rounded mx-1 my-1.5 text-sm font-medium cursor-pointer transition-colors`}
                    tabActiveClassName="text-black bg-gray-200"
                />
            ) : (
                <CompleteLogsView
                    testSuitId={testSuite.testSuiteId}
                    logContainer={logContainer!}
                    islogContainerActive={isTestRunActive}
                    setLogViewId={setLogViewId}
                />
            )}
        </section>
    );
}