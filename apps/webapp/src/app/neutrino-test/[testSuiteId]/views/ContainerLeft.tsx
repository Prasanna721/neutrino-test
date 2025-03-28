"use client";
import TabView, { TabItem } from "@/components/TabView";
import React from "react";
import ConfigsTab from "./ConfigsTab";
import TestSuiteTab from "./TestSuiteTab";
import { TestSuite } from "@/types/testSuiteTypes";

export default function ContainerLeft({ testSuite }: { testSuite: TestSuite }) {

    const tabs: TabItem[] = [
        { key: "testSuite", label: "Test Suite", content: <TestSuiteTab testSuite={testSuite} /> },
        { key: "configs", label: "Configs", content: <ConfigsTab testSuite={testSuite} /> },
    ];

    return (
        <section className="md:w-[35%] w-full border-r border-gray-200">
            <TabView tabs={tabs} />
        </section>
    );
}
