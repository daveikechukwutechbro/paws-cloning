'use client'

interface TaskSoundProps {
    className?: string
}

const TaskSound = ({ className }: TaskSoundProps) => {
    return (
        <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="80" height="80" rx="16" fill="url(#soundGrad)"/>
            <rect x="20" y="24" width="12" height="32" rx="4" fill="#fff"/>
            <rect x="32" y="16" width="10" height="48" rx="4" fill="#fff"/>
            <rect x="44" y="28" width="10" height="24" rx="4" fill="#fff"/>
            <rect x="54" y="20" width="8" height="40" rx="4" fill="#fff"/>
            <circle cx="40" cy="10" r="4" fill="#00d4aa"/>
            <circle cx="40" cy="70" r="4" fill="#00d4aa"/>
            <circle cx="26" cy="8" r="2" fill="#ffaa00"/>
            <circle cx="54" cy="8" r="2" fill="#ffaa00"/>
            <circle cx="26" cy="72" r="2" fill="#ffaa00"/>
            <circle cx="54" cy="72" r="2" fill="#ffaa00"/>
            <path d="M68 30 Q74 36 68 42 Q62 48 68 54" stroke="#fff" strokeWidth="2" fill="none" opacity="0.8"/>
            <path d="M72 26 Q78 36 72 46" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.5"/>
            <defs>
                <linearGradient id="soundGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00d4aa"/>
                    <stop offset="1" stopColor="#00b894"/>
                </linearGradient>
            </defs>
        </svg>
    )
}

export default TaskSound