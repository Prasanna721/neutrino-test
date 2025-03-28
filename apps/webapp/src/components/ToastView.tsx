import React, { useEffect, useState } from "react";

export type ToastType = "error" | "warn" | "info";

interface ProgressBarProps {
    duration: number;
    isVisible: boolean;
    progressColor?: string;
}

const ProgressBar = ({ duration, isVisible, progressColor = "bg-black" }: ProgressBarProps) => {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (!isVisible) return;
        const start = Date.now();
        const timer = setInterval(() => {
            const elapsed = Date.now() - start;
            const progress = Math.min((elapsed / duration) * 100, 100);
            setWidth(progress);
            if (progress >= 100) clearInterval(timer);
        }, 100);
        return () => clearInterval(timer);
    }, [duration, isVisible]);

    return (
        <div className="w-full bg-black bg-opacity-30 rounded-b-md h-1 mt-2">
            <div
                className={`${progressColor} h-1 rounded transition-all duration-100 ease-out`}
                style={{ width: `${width}%` }}
            />
        </div>
    );
};

interface ToastViewProps {
    message: string;
    progress: boolean;
    type: ToastType;
}

export const ToastView = ({ message, progress, type }: ToastViewProps) => {
    let emoji = "", textColor = "", progressColor = "";
    switch (type) {
        case "error":
            emoji = "❌";
            textColor = "text-red-800";
            progressColor = "bg-red-600";
            break;
        case "warn":
            emoji = "⚠️";
            textColor = "text-yellow-800";
            progressColor = "bg-yellow-600";
            break;
        case "info":
            emoji = "🌀";
            textColor = "text-blue-800";
            progressColor = "bg-blue-600";
            break;
        default:
            emoji = "";
            textColor = "text-black";
            progressColor = "bg-gray-800";
    }

    return (
        <div
            className={`${progress ? "animate-enter" : "animate-leave"} bg-white ${textColor} rounded-md shadow-lg text-xs pt-3`}
            style={{ minWidth: "250px" }}
        >
            <span className="pb-3 px-2">{emoji} {message}</span>
            <ProgressBar duration={5000} isVisible={progress} />
        </div>
    );
}

export const ToastError = ({ message }: { message: string }) => {
    return (<div className="bg-red-100 border border-red-300 p-2 rounded">
        <p className="text-sm text-red-800">{message}</p>
    </div>);
}