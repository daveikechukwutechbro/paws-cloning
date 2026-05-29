import { IconProps } from "../utils/types";

const PawsLogo: React.FC<IconProps> = ({ size = 24, className = "" }) => {
    const svgSize = `${size}px`;

    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} height={svgSize} width={svgSize} viewBox="0 0 100 100" fill="none">
            {/* Top-left pad */}
            <ellipse cx="32" cy="30" rx="14" ry="10.5" transform="rotate(-18, 32, 30)" fill="white" />
            {/* Top-center pad */}
            <ellipse cx="50" cy="23" rx="13" ry="10" fill="white" />
            {/* Top-right pad */}
            <ellipse cx="68" cy="30" rx="14" ry="10.5" transform="rotate(18, 68, 30)" fill="white" />
            {/* Lower-left pad */}
            <ellipse cx="24" cy="56" rx="17" ry="13" transform="rotate(-22, 24, 56)" fill="white" />
            {/* Lower-right pad */}
            <ellipse cx="76" cy="56" rx="17" ry="13" transform="rotate(22, 76, 56)" fill="white" />

            {/* Pink oval accents in top-left pad */}
            <ellipse cx="32" cy="29" rx="5.5" ry="3.5" transform="rotate(-18, 32, 29)" fill="#FF9EBB" />
            {/* Pink oval accent in top-center pad */}
            <ellipse cx="50" cy="22" rx="5" ry="3.5" fill="#FF9EBB" />
            {/* Pink oval accent in top-right pad */}
            <ellipse cx="68" cy="29" rx="5.5" ry="3.5" transform="rotate(18, 68, 29)" fill="#FF9EBB" />

            {/* Black negative-space nose/mouth center */}
            <path d="M 46 45 Q 50 41 54 45 Q 50 51 46 45 Z" fill="black" />

            {/* Pink curved smile line */}
            <path d="M 34 63 Q 50 74 66 63" stroke="#FF9EBB" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* White teardrop pad below center */}
            <path d="M 50 73 Q 43 84 50 93 Q 57 84 50 73 Z" fill="white" />
        </svg>
    );
};

export default PawsLogo;
