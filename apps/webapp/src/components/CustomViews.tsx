import { LAYOUT_CONSTANTS } from "./constants";

export const ChipView = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => {
    return <div className={`flex items-center ${LAYOUT_CONSTANTS.BOX_PADDING} rounded bg-gray-200 mr-2 cursor-default ${className}`} {...props}>{children}</div>;
};

export const IconView = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => {
    return <div className={`${className} flex items-center rounded bg-gray-200 mr-2 cursor-default`} {...props}>{children}</div>;
};