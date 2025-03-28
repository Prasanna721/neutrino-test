"use client";

import React from "react";
import { BaseButton, IconButton, buttonTextDanger, buttonTextDangerDisabled } from "@/components/Buttons";
import LoadingSVG from "@/components/LoadingSvg";
import { ConfigItem } from "../views/ConfigsTab";

export default function ConfigListItem({
    item,
    index,
    showDeleteBtn,
    isDeleting,
    onDelete
}: {
    item: ConfigItem;
    index: number;
    showDeleteBtn: boolean;
    isDeleting: boolean;
    onDelete: () => void;
}) {
    return (
        <div className="flex flex-row items-center justify-between p-2">
            <div className="flex flex-row items-center text-sm ml-2 space-x-10">
                <span className="mr-1 font-semibold text-base">{item.key}</span>
                <span className="italic">{item.value}</span>
            </div>
            <div className="flex items-center">
                {showDeleteBtn &&
                    (isDeleting ? (
                        <IconButton
                            className={buttonTextDangerDisabled}
                            icon={<LoadingSVG size={16} strokeWidth={3} color="#ff0000" />}
                        >
                            Delete
                        </IconButton>
                    ) : (
                        <BaseButton
                            onClick={onDelete}
                            className={buttonTextDanger}
                        >
                            Delete
                        </BaseButton>
                    ))}
            </div>
        </div>
    );
}
