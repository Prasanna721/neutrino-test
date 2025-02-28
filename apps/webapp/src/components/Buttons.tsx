import { LAYOUT_CONSTANTS } from "./constants";

export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
}

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode;
}


export const buttonBase =
    `inline-flex items-center rounded-md ${LAYOUT_CONSTANTS.BOX_PADDING} text-sm font-[500] transition-colors`;

export const buttonPrimary =
    `${buttonBase} bg-black text-white border border-black`;

export const buttonDefault =
    `${buttonBase} bg-white text-gray-800 border border-gray-300 hover:bg-gray-100`;

export const buttonDisabled =
    `${buttonBase} bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-80`;

export const buttonTextDanger =
    `text-red-600 hover:text-red-700 focus:outline-none text-sm font-medium hover:bg-red-100 transition-colors rounded ${LAYOUT_CONSTANTS.BOX_PADDING}`;

export const buttonTextDangerDisabled =
    `${buttonBase} text-red-600 opacity-50 cursor-not-allowed focus:outline-none text-sm font-medium transition-colors rounded ${LAYOUT_CONSTANTS.BOX_PADDING}`;


export const BaseButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    return <button className={buttonDefault} {...props} style={{ fontFamily: "var(--font-neutrino), sans-serif" }} />;
};

export const IconButton = ({ icon, children, ...props }: IconButtonProps) => {
    return (
        <button
            className={`${buttonDefault} inline-flex items-center`}
            {...props}
            style={{ fontFamily: "var(--font-neutrino), sans-serif" }}
        >
            {icon}
            {children && <span className="ml-2">{children}</span>}
        </button>
    );
};
