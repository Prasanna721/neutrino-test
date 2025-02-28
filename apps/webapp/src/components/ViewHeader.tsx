"use client";

import React from "react";
import { LAYOUT_CONSTANTS } from "@/components/constants";

const { HEADER_HEIGHT, CONTENT_PADDING } = LAYOUT_CONSTANTS;

interface ViewHeaderProps {
    title: string;
    actions?: React.ReactNode[];
}

export default function ViewHeader({ title, actions = [] }: ViewHeaderProps) {
    return (
        <header
            className={`
                w-full
                ${HEADER_HEIGHT}
                border-b
                border-gray-200
                flex
                justify-between
                items-center
                ${CONTENT_PADDING}`}>
            <div className="flex items-center">
                <span
                    className="text-lg font-bold"
                    style={{ fontFamily: "var(--font-neutrino), sans-serif" }}>
                    {title}
                </span>
            </div>

            <div className="flex items-center space-x-3">
                {actions.map((node, idx) => (
                    <React.Fragment key={idx}>{node}</React.Fragment>
                ))}
            </div>
        </header>
    );
}
