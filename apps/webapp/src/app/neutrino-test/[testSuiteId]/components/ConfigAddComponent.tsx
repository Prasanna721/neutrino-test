"use client";

import React, { useRef, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { BaseButton, IconButton, buttonDefault, buttonDisabled } from "@/components/Buttons";
import LoadingSVG from "@/components/LoadingSvg";
import { ConfigItem } from "../views/ConfigsTab";
import toast from "react-hot-toast";
import { ToastError } from "@/components/ToastView";

export default function ConfigAddComponent({
    configs,
    addTestsuiteConfig
}: {
    configs: ConfigItem[]
    addTestsuiteConfig: (configKey: string, configValue: string) => Promise<boolean>
}) {
    const [configKey, setConfigKey] = useState("");
    const [configValue, setConfigValue] = useState("");
    const [addingConfig, setAddingConfig] = useState(false);
    const keyRef = useRef<HTMLInputElement>(null);
    const valueRef = useRef<HTMLInputElement>(null);

    const handleAdd = async () => {
        const trimmedKey = configKey.trim();
        const trimmedValue = configValue.trim();
        if (trimmedKey && !trimmedValue) valueRef.current?.focus();
        if (!trimmedKey || !trimmedValue) return;
        if (!/^[A-Za-z0-9_]+$/.test(trimmedKey)) {
            toast.custom((t) => (<ToastError message="Key can only contain letters, numbers, and underscores." />), {
                duration: 3000,
                position: "bottom-center"
            });
            return;
        }
        setAddingConfig(true);
        try {
            const isAdded = await addTestsuiteConfig(trimmedKey, trimmedValue);
            if (isAdded) {
                setConfigKey("");
                setConfigValue("");
                keyRef.current?.focus();
            }
        } catch (_) { }
        setAddingConfig(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !addingConfig) handleAdd();
    };

    return (
        <div className="flex flex-col space-y-2">
            {configs.length > 0 && <div className="border-b border-gray-300"></div>}
            <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2 flex-1">
                    <div className="p-1.5 bg-gray-200 rounded-full">
                        <PlusIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <input
                        type="text"
                        placeholder="Config Key"
                        value={configKey}
                        ref={keyRef}
                        onChange={(e) => setConfigKey(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="block w-1/2 rounded-md px-3 py-1 text-sm focus:outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Config Value"
                        value={configValue}
                        ref={valueRef}
                        onChange={(e) => setConfigValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="block w-1/2 rounded-md px-3 py-1 text-sm focus:outline-none"
                    />
                </div>
                <div>
                    {addingConfig ? (
                        <IconButton className={buttonDisabled} icon={<LoadingSVG size={16} strokeWidth={3} color="#000000" />}>
                            Add
                        </IconButton>
                    ) : (
                        <BaseButton
                            className={buttonDefault}
                            onClick={handleAdd}
                            disabled={!configKey.trim() || !configValue.trim()}
                        >
                            Add
                        </BaseButton>
                    )}
                </div>
            </div>
        </div>
    )
}
