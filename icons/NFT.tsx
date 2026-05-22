// icons/NFT.tsx

/**
 * This project was developed by Nikandr Surkov.
 * 
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * GitHub: https://github.com/nikandr-surkov
 */

import { IconProps } from "../utils/types";

const NFT: React.FC<IconProps> = ({ size = 24, className = "" }) => {

    const svgSize = `${size}px`;

    return (
        <svg className={className} height={svgSize} width={svgSize} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2L35 11.5V28.5L20 38L5 28.5V11.5L20 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M20 8L28 13V23L20 28L12 23V13L20 8Z" fill="currentColor" opacity="0.3"/>
            <path d="M20 14L24 16.5V21.5L20 24L16 21.5V16.5L20 14Z" fill="currentColor" opacity="0.6"/>
            <circle cx="20" cy="20" r="3" fill="currentColor"/>
        </svg>
    );
};

export default NFT;
