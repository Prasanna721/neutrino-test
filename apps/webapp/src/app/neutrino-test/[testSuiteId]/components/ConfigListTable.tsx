"use client";

import React, { useState } from "react";
import { BaseButton, IconButton, buttonTextDanger, buttonTextDangerDisabled } from "@/components/Buttons";
import LoadingSVG from "@/components/LoadingSvg";
import { ConfigItem } from "../views/ConfigsTab";

export default function ConfigListTable({
    configItems,
    setConfigItems,
    deleteTestsuiteConfig
}: {
    configItems: ConfigItem[];
    setConfigItems?: React.Dispatch<React.SetStateAction<ConfigItem[]>>;
    deleteTestsuiteConfig?: (key: string) => Promise<void>;
}) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteKey, setDeleteKey] = useState("");

    const handleDelete = async (key: string) => {
        setDeleteKey(key);
        setIsDeleting(true);
        if (deleteTestsuiteConfig) {
            await deleteTestsuiteConfig(key);
        }
        if (setConfigItems) {
            setConfigItems((prev) => prev.filter((item) => item.key !== key));
        }
        setIsDeleting(false);
        setDeleteKey("");
    };

    if (configItems.length === 0) return null;

    return (
        <div className="border border-gray-300 rounded-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Key</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Value</th>
                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {configItems.map((item, index) => (
                        <tr key={item.key}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.key}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 italic">{item.value}</td>
                            {deleteTestsuiteConfig && (<td className="px-4 py-2 text-right text-sm">
                                {isDeleting && (deleteKey == item.key) ? (
                                    <IconButton
                                        className={buttonTextDangerDisabled}
                                        icon={<LoadingSVG size={16} strokeWidth={3} color="#ff0000" />}
                                    >
                                        Delete
                                    </IconButton>
                                ) :
                                    isDeleting ?
                                        (<BaseButton
                                            onClick={() => handleDelete(item.key)}
                                            className={buttonTextDangerDisabled}>
                                            Delete
                                        </BaseButton>) :
                                        (<BaseButton
                                            onClick={() => handleDelete(item.key)}
                                            className={buttonTextDanger}>
                                            Delete
                                        </BaseButton>
                                        )
                                }
                            </td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
