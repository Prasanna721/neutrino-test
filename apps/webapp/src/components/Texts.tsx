"use client";

import React from "react";

export const inputBase =
    `w-full border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none text-sm caret-black text-sm`;

export const BaseInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
    return (
        <input
            className={inputBase}
            {...props}
            style={{ fontFamily: "var(--font-neutrino), sans-serif", ...props.style }}
        />
    );
};

export const BaseTextBox = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
    return (
        <textarea
            className={`${inputBase} resize-none`}
            {...props}
            style={{ fontFamily: "var(--font-neutrino), sans-serif", ...props.style }}
        />
    );
};
