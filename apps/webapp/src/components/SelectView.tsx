"use client";

import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { LAYOUT_CONSTANTS } from "./constants";

export interface SelectOption {
    label: string;
    value: string;
    disabled?: boolean;
}

export interface SelectProps {
    options: SelectOption[];
    selected?: SelectOption;
    onSelect?: (option: SelectOption) => void;
}

function Select({ options, selected: controlledSelected, onSelect }: SelectProps) {
    const [internalSelected, setInternalSelected] = useState<SelectOption>(options[0]);
    const [open, setOpen] = useState(false);

    const selected = controlledSelected || internalSelected;

    const handleSelect = (option: SelectOption) => {
        if (option.disabled) return;
        if (onSelect) {
            onSelect(option);
        } else {
            setInternalSelected(option);
        }
        setOpen(false);
    };

    return (
        <div className="relative inline-block text-left">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                style={{ fontFamily: "var(--font-neutrino), sans-serif" }}
                className={`
          inline-flex items-center justify-between
          border border-gray-300 bg-white
          ${LAYOUT_CONSTANTS.BOX_PADDING} text-sm font-medium text-gray-700
          rounded-md shadow-sm hover:bg-gray-50
        `}
            >
                {selected.label}
                <ChevronDownIcon className="w-3.5 h-3.5 ml-1 text-gray-500" />
            </button>

            {open && (
                <div
                    className="
            absolute z-10 mt-2 w-[120px] origin-top-right
            bg-white border border-gray-200 rounded-md shadow-lg
          "
                >
                    <div className="py-1">
                        {options.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => handleSelect(option)}
                                style={{ fontFamily: "var(--font-neutrino), sans-serif" }}
                                className={`
                  px-4 py-2 text-sm 
                  ${option.disabled ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100 cursor-pointer"}
                `}
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Select;
