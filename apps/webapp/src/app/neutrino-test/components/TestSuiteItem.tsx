"use client";

import React, { useState, useEffect, useRef } from "react";
import { TestSuite } from "@/types/testSuiteTypes";
import { getPassedTimeAsString } from "@/app/utils";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

interface TestSuiteItemProps {
    suite: TestSuite;
    onClick: () => void;
    onDelete?: () => void;
}

export default function TestSuiteItem({ suite, onClick, onDelete }: TestSuiteItemProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen((prev) => !prev);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen(false);
        onDelete && onDelete();
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const recentTestRun =
        suite.testRuns && suite.testRuns.length > 0 &&
        suite.testRuns.reduce((prev, curr) => {
            const prevTime = prev.startTime ? new Date(prev.startTime).getTime() : 0;
            const currTime = curr.startTime ? new Date(curr.startTime).getTime() : 0;
            return prevTime > currTime ? prev : curr;
        });

    return (
        <div
            ref={containerRef}
            onClick={onClick}
            className="border rounded cursor-pointer flex flex-col border-gray-200 hover:bg-gray-50 relative"
        >
            <div className="p-3 flex justify-between items-start">
                <div>
                    <h3 className="text-sm font-bold text-gray-600 hover:underline">{suite.name}</h3>
                    <p className="text-sm text-gray-500">{suite.description}</p>
                </div>
                <div className="relative">
                    <button onClick={toggleMenu} className="text-gray-600 hover:text-gray-800">
                        <EllipsisHorizontalIcon className="w-5 h-5" />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 w-32 bg-white border border-gray-200 rounded shadow-lg z-10">
                            <button
                                onClick={handleDelete}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {recentTestRun && (
                <div className="border-t p-2 text-xs text-gray-600 flex items-center flex-wrap gap-2 border-l-2 border-l-gray-400">
                    <span className="px-2 py-1 bg-gray-100 rounded">{recentTestRun.environment}</span>
                    <span className="ml-auto text-gray-400">{getPassedTimeAsString(recentTestRun.startTime)}</span>
                    <a className="text-blue-600 hover:underline cursor-pointer">View Logs</a>
                </div>
            )}
        </div>
    );
}
