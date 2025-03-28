"use client";

import React, { useState } from "react";
import ConfigListItem from "./ConfigListItem";
import { ConfigItem } from "../views/ConfigsTab";

export default function ConfigListComponent({
    configs,
    setConfigs,
    deleteConfig
}: {
    configs: ConfigItem[]
    setConfigs: React.Dispatch<React.SetStateAction<ConfigItem[]>>
    deleteConfig?: (key: string) => Promise<void>
}) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (key: string) => {
        setIsDeleting(true);
        if (deleteConfig) await deleteConfig(key);
        setConfigs(prev => prev.filter(item => item.key !== key));
        setIsDeleting(false);
    };

    if (configs.length === 0) return null;

    return (
        <div className="border border-gray-300 rounded-md divide-y divide-gray-200">
            <div className="flex flex-row items-center justify-between p-2">
                <div className="flex flex-row items-center text-sm ml-2 space-x-10">
                    <span className="mr-1 font-semibold text-base">Key</span>
                    <span className="italic">Value</span>
                </div>
            </div>
            {configs.map((item, index) => (
                <ConfigListItem
                    key={item.key}
                    item={item}
                    index={index}
                    showDeleteBtn={index === configs.length - 1}
                    isDeleting={isDeleting}
                    onDelete={() => handleDelete(item.key)}
                />
            ))}
        </div>
    )
}
