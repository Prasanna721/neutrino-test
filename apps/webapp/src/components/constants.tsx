import { error } from "console";

export const LAYOUT_CONSTANTS = {
    HEADER_HEIGHT: 'h-11',
    CONTENT_PADDING: `px-4 md:px-6`,
    BOX_PADDING: `px-2.5 py-1`,
} as const;

export const CHIPVIEW_CONSTANTS = {
    error: "text-red-500 bg-red-100",
    warn: "text-yellow-500 bg-yellow-100",
    info: "text-blue-500 bg-blue-100",
    success: "text-green-500 bg-green-100",
    default: "text-gray-500 bg-gray-100",
} as const;