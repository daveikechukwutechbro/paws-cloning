'use client'

interface TaskSoundProps {
    className?: string
}

const TaskSound = ({ className }: TaskSoundProps) => {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 9C16.5 10.5 16.5 13.5 15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M18 6C21 8 21 16 18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    )
}

export default TaskSound