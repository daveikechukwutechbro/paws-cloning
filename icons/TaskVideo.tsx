'use client'

interface TaskVideoProps {
    className?: string
}

const TaskVideo = ({ className }: TaskVideoProps) => {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
            <polygon points="10,8 16,12 10,16" fill="currentColor"/>
        </svg>
    )
}

export default TaskVideo