"use client";

import { BaseButton, buttonDisabled, buttonTextDanger, buttonTextDangerDisabled, IconButton } from "@/components/Buttons";
import { LAYOUT_CONSTANTS } from "@/components/constants";
import { ChipView, IconView } from "@/components/CustomViews";
import LoadingSVG from "@/components/LoadingSvg";
import { deleteTestSuiteTask } from "@/lib/dbhelper";
import { ChevronRightIcon, CursorArrowRaysIcon } from "@heroicons/react/24/solid";
import React, { useEffect, useState } from "react";

export interface TestSuiteListItem {
    id: number;
    order_index: number;
    text: string;
}

function TestSuiteListComponent({ testSteps, setTestSteps }: TestSuiteListComponentProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (id: number) => {
        setIsDeleting(true);
        await deleteTestSuiteTask(id);
        setIsDeleting(false);
        setTestSteps((prev) => prev.filter((item) => item.id !== id));
    };

    if (testSteps && testSteps.length == 0) {
        return null;
    }

    return (
        <div className="border border-gray-300 rounded-md divide-y divide-gray-200">
            {testSteps.map((item, index) => (
                <TestSuiteListItem
                    key={item.order_index}
                    index={index}
                    item={item}
                    isDeleting={isDeleting}
                    showDeleteBtn={testSteps.length - 1 == index}
                    onDelete={() => handleDelete(item.id)}
                />
            ))}
        </div>
    );
}

interface TestSuiteListItemProps {
    index: number;
    item: { id: number; text: string };
    showDeleteBtn: boolean;
    isDeleting: boolean;
    onDelete: () => void;
}

function TestSuiteListItem({
    index,
    item,
    showDeleteBtn,
    isDeleting,
    onDelete,
}: TestSuiteListItemProps) {
    return (
        <div className="flex flex-row items-center justify-between p-2">
            <div className="flex flex-row items-center text-sm">
                <ChipView>
                    <strong>{index + 1}.</strong>
                </ChipView>
                {item.text}
            </div>

            <div className="flex items-center text-sm">
                <IconView className="bg-gray-100"><CursorArrowRaysIcon className="w-4 h-4 text-black-600 m-1" /></IconView>
                <ChevronRightIcon className="w-3.5 h-3.5 text-gray-500" />
                {showDeleteBtn && (isDeleting ?
                    (<IconButton
                        className={buttonTextDangerDisabled}
                        icon={<LoadingSVG size={16} strokeWidth={3} color="#ff0000" />}>
                        Delete
                    </IconButton>)
                    : (<BaseButton
                        onClick={onDelete}
                        className={buttonTextDanger}>
                        Delete
                    </BaseButton>))}
            </div>
        </div>
    );
};

interface TestSuiteListComponentProps {
    testSteps: TestSuiteListItem[];
    setTestSteps: React.Dispatch<React.SetStateAction<TestSuiteListItem[]>>;
}

export default TestSuiteListComponent;