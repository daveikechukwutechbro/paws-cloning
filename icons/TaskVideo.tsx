'use client'

interface TaskVideoProps {
    className?: string
}

const TaskVideo = ({ className }: TaskVideoProps) => {
    return (
        <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="80" height="80" rx="20" fill="url(#videoGrad2)"/>
            <circle cx="40" cy="40" r="24" fill="rgba(255,255,255,0.2)"/>
            <circle cx="40" cy="40" r="18" fill="#fff"/>
            <polygon points="35,30 55,40 35,50" fill="#ff3366"/>
            <circle cx="58" cy="20" r="4" fill="#ff3366"/>
            <circle cx="65" cy="28" r="3" fill="#ffaa00"/>
            <circle cx="22" cy="55" r="3" fill="#00d4aa"/>
            <path d="M15 25 L20 20 L25 25 L20 30 Z" fill="#ff3366" opacity="0.8"/>
            <path d="M55 55 L60 60 L65 55 L60 50 Z" fill="#00d4aa" opacity="0.8"/>
            <defs>
                <linearGradient id="videoGrad2" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ff3366"/>
                    <stop offset="0.5" stopColor="#ff6b8a"/>
                    <stop offset="1" stopColor="#ff9eb5"/>
                </linearGradient>
            </defs>
        </svg>
    )
}

export default TaskVideo