'use client'

interface TaskImageProps {
    className?: string
}

const TaskImage = ({ className }: TaskImageProps) => {
    return (
        <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="80" height="80" rx="16" fill="url(#imageGrad)"/>
            <rect x="12" y="18" width="56" height="38" rx="6" fill="#1a1a2e" stroke="#fff" strokeWidth="1.5"/>
            <circle cx="30" cy="34" r="6" fill="#ffaa00"/>
            <circle cx="30" cy="34" r="3" fill="#fff"/>
            <path d="M12 50 L35 35 L50 45 L60 38 L68 44 L68 56 L12 56 Z" fill="url(#mountainGrad)" opacity="0.8"/>
            <circle cx="55" cy="28" r="5" fill="#ff6b35"/>
            <path d="M12 56 L28 42 L38 50 L48 40 L60 48 L68 42 L68 56 Z" fill="#00d4aa" opacity="0.6"/>
            <defs>
                <linearGradient id="imageGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6c5ce7"/>
                    <stop offset="1" stopColor="#a29bfe"/>
                </linearGradient>
                <linearGradient id="mountainGrad" x1="12" y1="35" x2="68" y2="56" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#a29bfe"/>
                    <stop offset="1" stopColor="#6c5ce7"/>
                </linearGradient>
            </defs>
        </svg>
    )
}

export default TaskImage