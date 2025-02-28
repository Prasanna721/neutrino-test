"use client";

import React, { useState } from "react";
import NavItem from "./NavItem";

export interface NavigationItem {
    icon: React.ReactNode;
    label: string;
    name: string;
    onClick?: () => void;
}

interface NavigationPanelProps {
    navigationItems: NavigationItem[];
    selectedLabel: string;
    setSelectedLabel: React.Dispatch<React.SetStateAction<string>>;
}

export default function NavigationPanel({ navigationItems, selectedLabel, setSelectedLabel }: NavigationPanelProps) {
    return (
        <section className="md:w-[30%] lg:w-[20%] w-full border-r border-gray-200">
            <nav className="flex flex-col gap-3 p-3">
                {navigationItems.map((item) => (
                    <NavItem
                        key={item.label}
                        icon={item.icon}
                        label={item.name}
                        isSelected={selectedLabel === item.label}
                        onClick={() => {
                            setSelectedLabel(item.label);
                            item.onClick?.();
                        }}
                    />
                ))}
            </nav>
        </section>
    );
}
