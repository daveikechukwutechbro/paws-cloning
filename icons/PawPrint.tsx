import { IconProps } from "../utils/types";

const PawPrint: React.FC<IconProps> & { small?: React.FC<IconProps> } = ({ size = 24, className = "" }) => {
    const svgSize = `${size}px`;

    return (
        <svg className={className} height={svgSize} width={svgSize} viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="14" cy="12" rx="5" ry="6" transform="rotate(-15 14 12)" />
            <ellipse cx="24" cy="7" rx="4.5" ry="5.5" />
            <ellipse cx="34" cy="12" rx="5" ry="6" transform="rotate(15 34 12)" />
            <path d="M10 24C10 20 14 17 18 18C20 18.5 22 20 24 20C26 20 28 18.5 30 18C34 17 38 20 38 24C38 30 32 35 24 37C16 35 10 30 10 24Z" />
        </svg>
    );
};

PawPrint.small = ({ size = 16, className = "" }) => {
    const svgSize = `${size}px`;
    return (
        <svg className={className} height={svgSize} width={svgSize} viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="14" cy="12" rx="5" ry="6" transform="rotate(-15 14 12)" />
            <ellipse cx="24" cy="7" rx="4.5" ry="5.5" />
            <ellipse cx="34" cy="12" rx="5" ry="6" transform="rotate(15 34 12)" />
            <path d="M10 24C10 20 14 17 18 18C20 18.5 22 20 24 20C26 20 28 18.5 30 18C34 17 38 20 38 24C38 30 32 35 24 37C16 35 10 30 10 24Z" />
        </svg>
    );
};

export default PawPrint;
