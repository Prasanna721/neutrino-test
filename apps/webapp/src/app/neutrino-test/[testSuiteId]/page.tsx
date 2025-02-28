"use client";

import React, { use, useEffect, useState } from "react";
import TestViewHeader from "./components/TestViewHeader";
import ContainerLeft from "./views/ContainerLeft";
import ContainerRight from "./views/ContainerRight";
import { TestSuite } from "@/types/testSuiteTypes";
import { getTestSuite } from "../../../lib/dbhelper";
import LoadingView from "@/components/LoadingView";
import { useTestsuiteStore } from "@/store/useTestsuiteStore";
import { useParams } from "next/navigation";

export default function Page() {
    const { testSuiteId } = useParams();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const testSuite = useTestsuiteStore((state) => state.testSuite);
    const currentTestRun = useTestsuiteStore((state) => state.currentTestRun);

    useEffect(() => {
        if (isLoading && typeof testSuiteId === "string") {
            getTestSuite(testSuiteId).then((ts: TestSuite | null) => {
                if (ts == null) {
                    window.location.href = "/neutrino-test";
                    return;
                }
                useTestsuiteStore.getState().setTestSuite(ts);
                setIsLoading(false);
            });
        }
    }, [testSuite]);

    if (isLoading) {
        return <LoadingView />;
    }

    return (
        <main className="min-h-screen w-full bg-white flex flex-col">
            <TestViewHeader testSuite={testSuite} />

            <div className="flex flex-col md:flex-row flex-wrap w-full flex-1">
                <ContainerLeft testSuite={testSuite} />
                <ContainerRight testSuite={testSuite} />
            </div>
        </main>
    );
}
