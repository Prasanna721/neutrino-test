"use client";

import React from "react";
import { LAYOUT_CONSTANTS } from "@/components/constants";

export default function ShimmerListView() {
    return (
        <div className="border border-gray-200 rounded animate-pulse">
            <div className="p-4">
                <div className="bg-gray-200 h-5 w-1/5 mb-2 rounded"></div>
                <div className="bg-gray-200 h-3 w-full mb-1 rounded"></div>
                <div className="bg-gray-200 h-3 w-5/6 rounded"></div>
            </div>
            <div
                className="border-t py-2 px-4 flex items-center justify-between"
                style={{ height: LAYOUT_CONSTANTS.HEADER_HEIGHT }}
            >
                <div className="w-1/12">
                    <div className="bg-gray-200 h-4 rounded"></div>
                </div>
                <div className="w-1/4">
                    <div className="bg-gray-200 h-4 rounded"></div>
                </div>
            </div>
        </div>
    );
}
