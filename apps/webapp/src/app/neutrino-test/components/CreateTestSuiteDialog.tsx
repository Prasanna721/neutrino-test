"use client";

import { BaseButton, buttonDefault, buttonPrimary } from "@/components/Buttons";
import { BaseInput, BaseTextBox, inputBase } from "@/components/Texts";
import React, { useEffect, useRef, useState } from "react";

interface CreateTestSuiteDialogProps {
    onCreate: (name: string, description: string) => void;
    onCancel: () => void;
}

export default function CreateTestSuiteDialog({ onCreate, onCancel }: CreateTestSuiteDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                onCancel();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onCancel]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10">
            <div ref={containerRef} className="bg-white rounded-md shadow-lg p-4 w-1/2">
                <h3 className="text-lg font-bold mb-4">Create Test Suite</h3>
                <BaseInput
                    type="text"
                    placeholder="Test Suite Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`${inputBase} mb-3`}
                />
                <BaseTextBox
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`${inputBase} mb-4`}
                    rows={3}
                />
                <div className="flex justify-end space-x-2">
                    <BaseButton onClick={onCancel} className={buttonDefault}>Cancel</BaseButton>
                    <BaseButton onClick={() => onCreate(name, description)} className={buttonPrimary}>Create Test</BaseButton>
                </div>
            </div>
        </div>
    );
}
