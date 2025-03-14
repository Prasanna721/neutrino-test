"use client";

import React, { useState, useEffect } from "react";
import CurrentPodComponent from "../components/CurrentPodComponent";
import { useTestsuiteStore } from "@/store/useTestsuiteStore";
import { TestSuite } from "@/types/testSuiteTypes";
import { BaseButton, buttonDefault } from "@/components/Buttons";
import { getRecentBrowserAction, getBrowserActionUrl } from "@/lib/dbhelper";
import { BrowserAction } from "@neutrino-package/supabase/types";
import { TestflowView } from "./TestFlowView";
import { ShimmerBrowserView } from "@/components/ShimmerBrowserView";

export interface BrowserTabProps {
    testSuite: TestSuite;
    setLogViewId: React.Dispatch<React.SetStateAction<string | null>>;
}

const BrowserTab = ({ testSuite, setLogViewId }: BrowserTabProps) => {
    const currentTestRun = useTestsuiteStore((state) => state.currentTestRun);

    return (
        <div className="browser-tab px-4">
            {currentTestRun.jobName !== "" && (
                <CurrentPodComponent
                    recentTestRun={currentTestRun}
                    activeTestRun={true}
                    setLogViewId={setLogViewId}
                    className="mt-4"
                />
            )}

            <div className="mt-4 relative">
                {currentTestRun.jobName !== "" ? (
                    <TestflowView jobName={currentTestRun.jobName} />
                ) : (
                    <div className="relative rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <img
                            src="/static/browser_temp.png"
                            alt="Browser Temp"
                            className="w-full object-cover blur-sm"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <BaseButton className={`${buttonDefault}`}>
                                Connect Browser
                            </BaseButton>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowserTab;
