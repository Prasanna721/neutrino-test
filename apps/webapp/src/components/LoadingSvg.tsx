import React from 'react';

type LoadingSVGProps = {
    size?: number;
    color?: string;
    strokeWidth?: number;
};

const LoadingSVG: React.FC<LoadingSVGProps> = ({
    size = 50,
    color = "#555",
    strokeWidth = 2
}) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            xmlns="http://www.w3.org/2000/svg"
            stroke={color}
        >
            <g fill="none" fillRule="evenodd">
                <path
                    d="M36 18c0-9.94-8.06-18-18-18"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 20 20"
                        to="360 20 20"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                </path>
            </g>
        </svg>
    );
};

export default LoadingSVG;