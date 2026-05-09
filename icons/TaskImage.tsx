'use client'

interface TaskImageProps {
    className?: string
}

const TaskImage = ({ className }: TaskImageProps) => {
    return (
        <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="80" height="80" rx="20" fill="url(#imageGrad2)"/>
            <rect x="12" y="16" width="56" height="40" rx="10" fill="#1a1a2e" stroke="#fff" strokeWidth="2"/>
            <circle cx="32" cy="32" r="8" fill="#ff9f43"/>
            <circle cx="32" cy="32" r="4" fill="#fff"/>
            <path d="M12 48 L28 32 L38 40 L50 28 L68 44 L68 56 L12 56 Z" fill="url(#mountainGrad2)" opacity="0.9"/>
            <path d="M12 56 L30 38 L45 48 L60 35 L68 48 L68 56 Z" fill="#2ecc71" opacity="0.7"/>
            <circle cx="58" cy="24" r="5" fill="#f1c40f"/>
            <path d="M20 20 L24 16 L28 20 L24 24 Z" fill="#fff" opacity="0.6"/>
            <circle cx="15" cy="22" r="2" fill="#e74c3c"/>
            <circle cx="65" cy="50" r="3" fill="#9b59b6"/>
            <defs>
                <linearGradient id="imageGrad2" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#667eea"/>
                    <stop offset="0.5" stopColor="#764ba2"/>
                    <stop offset="1" stopColor="#f093fb"/>
                </linearGradient>
                <linearGradient id="mountainGrad2" x1="12" y1="28" x2="68" y2="56" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#e74c3c"/>
                    <stop offset="1" stopColor="#c0392b"/>
                </linearGradient>
            </defs>
        </svg>
    )
}

export default TaskImage