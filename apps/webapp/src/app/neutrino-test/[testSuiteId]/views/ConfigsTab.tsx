"use client";

import React, { useState, useEffect } from "react";
import ConfigListComponent from "../components/ConfigListComponent";
import { LAYOUT_CONSTANTS } from "@/components/constants";
import ConfigAddComponent from "../components/ConfigAddComponent";
import ConfigListTable from "../components/ConfigListTable";
import { addTestsuiteConfig, deleteTestsuiteConfig, fetchTestsuiteConfig } from "@/lib/dbhelper";
import { TestSuite } from "@/types/testSuiteTypes";
import { updateTestsuiteConfig } from "@/store/useTestsuiteStore";

const { CONTENT_PADDING, HEADER_HEIGHT } = LAYOUT_CONSTANTS;

export interface ConfigItem {
    key: string
    value: string
    created_at: Date
}

export default function ConfigsTab({
    testSuite,
}: {
    testSuite: TestSuite
}) {
    const [configItems, setConfigItems] = useState<ConfigItem[]>([]);

    useEffect(() => {
        setConfigItems(testSuite.testSuiteConfigs);
    }, [testSuite]);

    const addConfig = async (configKey: string, configValue: string) => {
        const response = await addTestsuiteConfig(testSuite.testSuiteId, configKey, configValue);
        await updateTestsuiteConfig(testSuite.testSuiteId);
        if (response.key && response.value) {
            return true;
        }
        return false
    }

    const deleteConfig = async (configKey: string) => {
        await deleteTestsuiteConfig(testSuite.testSuiteId, configKey);
        await updateTestsuiteConfig(testSuite.testSuiteId);
    }

    return (
        <div className={`${CONTENT_PADDING} flex flex-col gap-4`}>
            <div className={`text-lg font-semibold ${HEADER_HEIGHT} flex items-center`}>Configs</div>
            <ConfigListTable configItems={configItems} setConfigItems={setConfigItems} deleteTestsuiteConfig={deleteConfig} />
            <ConfigAddComponent configs={configItems} addTestsuiteConfig={addConfig} />
        </div>
    )
}
