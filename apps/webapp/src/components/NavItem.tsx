"use client";

import React from "react";

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    isSelected?: boolean;
    onClick?: () => void;
}

export default function NavItem({ icon, label, isSelected, onClick }: NavItemProps) {
    return (
        <div
            className={`flex items-center space-x-2 py-2 px-4 cursor-pointer rounded ${isSelected ? "bg-gray-100" : "hover:bg-gray-100"}`}
            onClick={onClick}
        >
            {icon}
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
    );
}
