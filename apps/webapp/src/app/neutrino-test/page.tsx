"use client";

import React, { useEffect, useState } from "react";
import { TestSuite } from "@/types/testSuiteTypes";
import { getAllTestSuites, createTestSuite } from "@/lib/dbhelper";
import ViewHeader from "@/components/ViewHeader";
import { buttonPrimary, buttonDefault, buttonDisabled, IconButton } from "@/components/Buttons";
import { PlusIcon } from "@heroicons/react/24/solid";
import NavigationPanel, { NavigationItem } from "@/components/NavigationPanel";
import { PlayCircleIcon, Square2StackIcon } from "@heroicons/react/24/outline";
import TestSuitesView from "./views/TestSuiteView";
import CreateTestSuiteDialog from "./components/CreateTestSuiteDialog";
import LoadingSVG from "@/components/LoadingSvg";

export default function Page() {
    const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Conditionally render header action button
    const actions = isCreating ? [
        <IconButton
            key="create"
            className={buttonDisabled}
            icon={<LoadingSVG size={16} strokeWidth={3} color="#000000" />}
        >
            Creating Test
        </IconButton>
    ] : [
        <IconButton
            key="create"
            className={buttonPrimary}
            onClick={() => setOpenDialog(true)}
            icon={<PlusIcon className="w-4 h-4" />}
        >
            Create Test
        </IconButton>
    ];

    const navigationItems: NavigationItem[] = [
        {
            icon: <Square2StackIcon className="w-5 h-5 text-gray-600" />,
            label: "test_suites",
            name: "Test Suites",
            onClick: () => { }
        },
        {
            icon: <PlayCircleIcon className="w-5 h-5 text-gray-600" />,
            label: "test_runs",
            name: "Test Runs",
            onClick: () => console.log("Clicked Test Runs")
        }
    ];
    const [selectedLabel, setSelectedLabel] = useState<string>(navigationItems[0].label);

    useEffect(() => {
        fetchTestSuites();
    }, []);

    const fetchTestSuites = async () => {
        setIsLoading(true);
        getAllTestSuites().then((ts: TestSuite[]) => {
            setTestSuites(ts);
            setIsLoading(false);
        });
    };

    const handleCreate = (name: string, description: string) => {
        setOpenDialog(false);
        setIsCreating(true);
        createTestSuite(name, description)
            .then((ts) => {
                window.location.href = `${window.location.pathname}/${ts.testSuiteId}`;
            })
            .catch((error: Error) => {
                setIsCreating(false);
                console.error("Error creating test suite:", error);
            });
    };

    return (
        <main className="min-h-screen w-full bg-white flex flex-col">
            <ViewHeader title="Neutrino Test" actions={actions} />

            <div className="flex flex-col md:flex-row flex-wrap w-full flex-1">
                <NavigationPanel
                    navigationItems={navigationItems}
                    selectedLabel={selectedLabel}
                    setSelectedLabel={setSelectedLabel}
                />
                <section className="md:w-[70%] lg:w-[80%] w-full flex items-center justify-center">
                    {selectedLabel === "test_suites" && (
                        <TestSuitesView testSuites={testSuites} isLoading={isLoading} />
                    )}
                    {selectedLabel === "test_runs" && <div className="p-4">Coming Soon..</div>}
                </section>
            </div>

            {openDialog && (
                <CreateTestSuiteDialog
                    onCreate={handleCreate}
                    onCancel={() => setOpenDialog(false)}
                />
            )}
        </main>
    );
}
