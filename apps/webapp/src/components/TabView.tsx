"use client";

import React, { useState, ReactNode, useEffect } from "react";

export const TAB_CONSTANTS = {
    containerClassStyle: "w-full h-full flex flex-col",
    tabHeaderClassStyle: "flex border-b border-gray-200",
    tabItemBaseClassStyle: "flex-1 px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors",
    tabActiveClassStyle: "border-b-2 border-blue-500 text-black",
    tabInactiveClassStyle: "border-b-2 border-transparent text-gray-400 hover:text-blue-600",
} as const;

export interface TabItem {
    key: string;
    label: ReactNode;
    content: ReactNode;
}

export interface TabViewProps {
    tabs: TabItem[];
    defaultActiveKey?: string;
    activeKey?: string;
    onTabChange?: (key: string) => void;
    containerClassName?: string;
    tabHeaderClassName?: string;
    tabItemBaseClassName?: string;
    tabActiveClassName?: string;
    tabInactiveClassName?: string;
}

export default function TabView({
    tabs,
    defaultActiveKey,
    activeKey: controlledActiveKey,
    onTabChange,
    containerClassName = TAB_CONSTANTS.containerClassStyle,
    tabHeaderClassName = TAB_CONSTANTS.tabHeaderClassStyle,
    tabItemBaseClassName = TAB_CONSTANTS.tabItemBaseClassStyle,
    tabActiveClassName = TAB_CONSTANTS.tabActiveClassStyle,
    tabInactiveClassName = TAB_CONSTANTS.tabInactiveClassStyle,
}: TabViewProps) {
    const isControlled = controlledActiveKey !== undefined;
    const [internalActiveKey, setInternalActiveKey] = useState<string>(
        defaultActiveKey || (tabs.length > 0 ? tabs[0].key : "")
    );

    const currentActiveKey = isControlled ? controlledActiveKey : internalActiveKey;

    const handleTabClick = (key: string) => {
        if (!isControlled) {
            setInternalActiveKey(key);
        }
        if (onTabChange) {
            onTabChange(key);
        }
    };

    useEffect(() => {
        if (!tabs.find((tab) => tab.key === currentActiveKey) && tabs.length > 0) {
            handleTabClick(tabs[0].key);
        }
    }, [tabs, currentActiveKey]);

    return (
        <div className={containerClassName}>
            <div className={`${tabHeaderClassName} sticky top-0 bg-white z-10`}>
                {tabs.map((tab) => (
                    <div
                        key={tab.key}
                        className={`${tabItemBaseClassName} text-center ${currentActiveKey === tab.key ? tabActiveClassName : tabInactiveClassName
                            }`}
                        onClick={() => handleTabClick(tab.key)}
                    >
                        {tab.label}
                    </div>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto">
                {tabs.find((tab) => tab.key === currentActiveKey)?.content}
            </div>
        </div>
    );
}
