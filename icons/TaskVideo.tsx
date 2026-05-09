'use client'

interface TaskVideoProps {
    className?: string
}

const TaskVideo = ({ className }: TaskVideoProps) => {
    return (
        <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="80" height="80" rx="16" fill="url(#videoGrad)"/>
            <rect x="12" y="16" width="56" height="40" rx="8" fill="#1a1a2e" stroke="#fff" strokeWidth="2"/>
            <circle cx="40" cy="36" r="12" fill="#fff"/>
            <polygon points="37,31 47,36 37,41" fill="#ff3b5c"/>
            <rect x="52" y="20" width="8" height="4" rx="1" fill="#ff3b5c"/>
            <rect x="52" y="26" width="6" height="4" rx="1" fill="#ffaa00"/>
            <rect x="52" y="32" width="4" height="4" rx="1" fill="#00d4aa"/>
            <circle cx="64" cy="24" r="2" fill="#ff3b5c"/>
            <circle cx="64" cy="30" r="2" fill="#ffaa00"/>
            <circle cx="64" cy="36" r="2" fill="#00d4aa"/>
            <defs>
                <linearGradient id="videoGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ff3b5c"/>
                    <stop offset="1" stopColor="#ff6b8a"/>
                </linearGradient>
            </defs>
        </svg>
    )
}

export default TaskVideo