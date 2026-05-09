'use client'

interface TaskSoundProps {
    className?: string
}

const TaskSound = ({ className }: TaskSoundProps) => {
    return (
        <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="80" height="80" rx="20" fill="url(#soundGrad2)"/>
            <circle cx="40" cy="40" r="28" fill="rgba(255,255,255,0.15)"/>
            <rect x="18" y="30" width="8" height="20" rx="3" fill="#00d4aa"/>
            <rect x="28" y="22" width="8" height="36" rx="3" fill="#00b894"/>
            <rect x="38" y="28" width="8" height="24" rx="3" fill="#00d4aa"/>
            <rect x="48" y="18" width="8" height="44" rx="3" fill="#00b894"/>
            <rect x="58" y="32" width="6" height="16" rx="3" fill="#00d4aa"/>
            <circle cx="40" cy="40" r="4" fill="#fff"/>
            <circle cx="18" cy="18" r="4" fill="#ff9f43"/>
            <circle cx="62" cy="18" r="4" fill="#ff9f43"/>
            <circle cx="18" cy="62" r="4" fill="#ff9f43"/>
            <circle cx="62" cy="62" r="4" fill="#ff9f43"/>
            <circle cx="40" cy="12" r="3" fill="#ff6b6b"/>
            <circle cx="40" cy="68" r="3" fill="#ff6b6b"/>
            <defs>
                <linearGradient id="soundGrad2" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00d4aa"/>
                    <stop offset="0.5" stopColor="#00b894"/>
                    <stop offset="1" stopColor="#55efc4"/>
                </linearGradient>
            </defs>
        </svg>
    )
}

export default TaskSound