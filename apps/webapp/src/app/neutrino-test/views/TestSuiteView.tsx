"use client";

import React, { useState } from "react";
import { TestSuite } from "@/types/testSuiteTypes";
import TestSuiteItem from "../components/TestSuiteItem";
import ShimmerListView from "@/components/ShimmerListView";
import { BaseInput, inputBase } from "@/components/Texts";

interface TestSuitesViewProps {
    testSuites: TestSuite[];
    isLoading?: boolean;
}

export default function TestSuitesView({ testSuites, isLoading = false }: TestSuitesViewProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredSuites = testSuites.filter((suite) =>
        suite.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const onClick = (suiteId: string) => {
        window.location.href = `${window.location.pathname}/${suiteId}`;
    };

    return (
        <div className="p-4 space-y-4 w-full h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Test Suites</h2>
            <div className="mb-4">
                <BaseInput
                    type="text"
                    placeholder="Search Test Suites..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${inputBase} md:w-96`}
                />
            </div>
            {isLoading ? (
                <>
                    <ShimmerListView />
                    <ShimmerListView />
                    <ShimmerListView />
                </>
            ) : filteredSuites.length > 0 ? (
                filteredSuites.map((suite) => (
                    <TestSuiteItem
                        key={suite.testSuiteId}
                        suite={suite}
                        onClick={() => onClick(suite.testSuiteId)}
                    />
                ))
            ) : (
                <div className="text-gray-600 italic">No test suites found.</div>
            )}
        </div>
    );
}
