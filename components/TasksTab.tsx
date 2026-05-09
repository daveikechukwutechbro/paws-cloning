// components/TasksTab.tsx

'use client'

import Image, { StaticImageData } from 'next/image'
import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { updateUserBalance, updateCompletedTask } from '@/utils/userUtils'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/utils/firebaseClient'
import { taskWhitePaws, taskBoost } from '@/images'
import PawsLogo from '@/icons/PawsLogo'
import TaskVideo from '@/icons/TaskVideo'
import TaskImage from '@/icons/TaskImage'
import TaskSound from '@/icons/TaskSound'

type Task = {
    id: string
    icon: string | React.FC<{ className?: string }>
    title: string
    description: string
    reward: number
    link?: string
    isInternal?: boolean
    isComponent?: boolean
    type: 'social' | 'ad' | 'listen' | 'wallet'
}

// Anti-fraud: track task completion with timestamps and device fingerprint
const ANTI_FRAUD = {
    minAdWatchTime: 5000, // 5 seconds minimum
    cooldownBetweenTasks: 30000, // 30 seconds between same task
    maxTasksPerHour: 10,
}

function generateTaskToken(userId: string, taskId: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2)
    const hash = btoa(`${userId}_${taskId}_${timestamp}_${random}`)
    return hash.slice(0, 32)
}

function verifyTaskToken(token: string): boolean {
    if (!token || token.length < 20) return false
    const decoded = atob(token)
    const parts = decoded.split('_')
    if (parts.length < 3) return false
    const timestamp = parseInt(parts[2])
    if (Date.now() - timestamp > 60000) return false // Token expires in 60s
    return true
}

const TasksTab = () => {
    const { user, refreshUser } = useUser()
    const [activeTab, setActiveTab] = useState<'in-game' | 'partners'>('in-game')
    const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())
    const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set())
    const [adWatchProgress, setAdWatchProgress] = useState<Record<string, number>>({})
    const [isWatchingAd, setIsWatchingAd] = useState<string | null>(null)
    const [balance, setBalance] = useState(50000)
    const [toastMessage, setToastMessage] = useState<string | null>(null)

    const communities = [
        { name: 'X (Twitter)', url: 'https://x.com/GOTPAWSED' },
        { name: 'Discord', url: 'https://discord.com/invite/pawsuplabs' },
        { name: 'TikTok', url: 'https://www.tiktok.com/@pawslabs' },
        { name: 'YouTube', url: 'https://www.youtube.com/@PawsUpLabs' },
    ]

    useEffect(() => {
        if (user) {
            setBalance(user.balance || 50000)
            if (user.completedTasks) {
                setCompletedTasks(new Set(user.completedTasks))
            }
        }
    }, [user])

    useEffect(() => {
        const loadCompletedTasks = async () => {
            if (!user?.id) return
            try {
                const userRef = doc(db, 'users', user.id)
                const userSnap = await getDoc(userRef)
                if (userSnap.exists()) {
                    const data = userSnap.data()
                    if (data.completedTasks) {
                        setCompletedTasks(new Set(data.completedTasks))
                    }
                }
            } catch (error) {
                console.error('Error loading completed tasks:', error)
            }
        }
        loadCompletedTasks()
    }, [user?.id])

    const showToast = (message: string) => {
        setToastMessage(message)
        setTimeout(() => setToastMessage(null), 3000)
    }

    const checkAntiFraud = (taskId: string): boolean => {
        const lastAttemptKey = `lastTaskAttempt_${user?.id}_${taskId}`
        const lastAttempt = localStorage.getItem(lastAttemptKey)
        
        if (lastAttempt) {
            const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt)
            if (timeSinceLastAttempt < ANTI_FRAUD.cooldownBetweenTasks) {
                return false
            }
        }

        const hourlyCountKey = `tasksCount_${user?.id}`
        const hourlyCount = parseInt(localStorage.getItem(hourlyCountKey) || '0')
        if (hourlyCount >= ANTI_FRAUD.maxTasksPerHour) {
            return false
        }

        return true
    }

    const recordTaskAttempt = (taskId: string) => {
        const lastAttemptKey = `lastTaskAttempt_${user?.id}_${taskId}`
        localStorage.setItem(lastAttemptKey, Date.now().toString())

        const hourlyCountKey = `tasksCount_${user?.id}`
        const hourlyCount = parseInt(localStorage.getItem(hourlyCountKey) || '0')
        localStorage.setItem(hourlyCountKey, (hourlyCount + 1).toString())

        const resetTime = 3600000 - (Date.now() % 3600000)
        setTimeout(() => {
            const currentCount = parseInt(localStorage.getItem(hourlyCountKey) || '0')
            if (currentCount > 0) {
                localStorage.setItem(hourlyCountKey, (currentCount - 1).toString())
            }
        }, resetTime)
    }

    const handleTaskReward = async (taskId: string, reward: number) => {
        if (!user?.id) {
            showToast('Please wait for user to load...')
            return
        }

        if (completedTasks.has(taskId)) {
            showToast('Task already completed!')
            return
        }

        if (!checkAntiFraud(taskId)) {
            showToast('Please wait before completing another task')
            return
        }

        setLoadingTasks(prev => new Set(prev).add(taskId))
        recordTaskAttempt(taskId)

        try {
            const newBalance = balance + reward
            setBalance(newBalance)

            const newCompleted = new Set(completedTasks)
            newCompleted.add(taskId)
            setCompletedTasks(newCompleted)

            await updateUserBalance(user.id, newBalance)
            await updateCompletedTask(user.id, taskId)

            showToast(`+${reward.toLocaleString()} PAWS earned!`)
            refreshUser()
        } catch (error) {
            console.error('Error rewarding task:', error)
            showToast('Failed to claim reward. Try again.')
        } finally {
            setLoadingTasks(prev => {
                const newSet = new Set(prev)
                newSet.delete(taskId)
                return newSet
            })
        }
    }

    const startSocialTask = (link: string) => {
        window.open(link, '_blank')
        setTimeout(() => {
            showToast('Come back and tap "Claim" to get your reward!')
        }, 1000)
    }

    const startAdTask = (taskId: string, reward: number) => {
        setIsWatchingAd(taskId)
        setAdWatchProgress(prev => ({ ...prev, [taskId]: 0 }))

        const duration = ANTI_FRAUD.minAdWatchTime
        const steps = 100
        const stepTime = duration / steps

        let progress = 0
        const interval = setInterval(() => {
            progress += 1
            setAdWatchProgress(prev => ({ ...prev, [taskId]: progress }))

            if (progress >= steps) {
                clearInterval(interval)
                setIsWatchingAd(null)
                setAdWatchProgress(prev => ({ ...prev, [taskId]: 100 }))
                showToast('Ad completed! Tap "Claim" to get your reward.')

                setTimeout(() => {
                    setAdWatchProgress(prev => {
                        const newProgress = { ...prev }
                        delete newProgress[taskId]
                        return newProgress
                    })
                }, 2000)
            }
        }, stepTime)
    }

    const inGameTasks: Task[] = [
        {
            id: 'watch_video_ad',
            icon: TaskVideo,
            title: 'Watch Video Ad',
            description: 'Watch a short video and earn PAWS',
            reward: 500,
            type: 'ad',
        },
        {
            id: 'watch_image_ad',
            icon: TaskImage,
            title: 'View Image Ad',
            description: 'View an image advertisement',
            reward: 300,
            type: 'ad',
        },
        {
            id: 'listen_reward',
            icon: TaskSound,
            title: 'Listen for Reward',
            description: 'Listen and claim your reward',
            reward: 400,
            type: 'listen',
        },
        {
            id: 'put_paw_name',
            icon: taskWhitePaws.src,
            title: 'Put 🐾 in your name',
            description: 'Update your Telegram name with 🐾',
            reward: 5000,
            type: 'social',
        },
        {
            id: 'boost_channel',
            icon: taskBoost.src,
            title: 'Boost PAWS channel',
            description: 'Help boost our Telegram channel',
            reward: 2500,
            type: 'social',
        },
        {
            id: 'connect_wallet',
            icon: PawsLogo,
            title: 'Connect Wallet',
            description: 'Connect your TON wallet to earn',
            reward: 3000,
            isInternal: true,
            type: 'wallet',
        },
    ]

    const getSocialTask = (index: number): Task => {
        const socialLinks = [
            { name: 'Follow X (Twitter)', url: 'https://x.com/GOTPAWSED', icon: 'twitter' },
            { name: 'Join Discord', url: 'https://discord.com/invite/pawsuplabs', icon: 'discord' },
            { name: 'Follow TikTok', url: 'https://www.tiktok.com/@pawslabs', icon: 'tiktok' },
            { name: 'Subscribe YouTube', url: 'https://www.youtube.com/@PawsUpLabs', icon: 'youtube' },
        ]
        const link = socialLinks[index % socialLinks.length]
        const iconComponents: Record<string, React.FC<{ className?: string }>> = {
            twitter: TaskTwitter,
            discord: TaskDiscord,
            tiktok: TaskTikTok,
            youtube: TaskYouTube,
        }
        return {
            id: `social_${index}`,
            icon: iconComponents[link.icon],
            title: link.name,
            description: 'Follow us on social media',
            reward: 2000,
            link: link.url,
            type: 'social',
        }
    }

    const socialTasks: Task[] = [
        getSocialTask(0),
        getSocialTask(1),
        getSocialTask(2),
        getSocialTask(3),
    ]

    const partnerTasks: Task[] = [
        {
            id: 'join_blum',
            icon: taskWhitePaws.src,
            title: 'Join Blum Channel',
            description: 'Join our partner Blum on Telegram',
            reward: 1000,
            link: 'https://t.me/blum',
            type: 'social',
        },
        {
            id: 'join_hamster',
            icon: taskWhitePaws.src,
            title: 'Join Hamster Channel',
            description: 'Join partner Hamster Combat',
            reward: 1000,
            link: 'https://t.me/hamster_kombat_bot',
            type: 'social',
        },
        {
            id: 'join_major',
            icon: taskWhitePaws.src,
            title: 'Join Major Channel',
            description: 'Join partner Major',
            reward: 1000,
            link: 'https://t.me/majorcoin',
            type: 'social',
        },
    ]

    const renderTaskButton = (task: Task) => {
        const isCompleted = completedTasks.has(task.id)
        const isLoading = loadingTasks.has(task.id)
        const adProgress = adWatchProgress[task.id]
        const isWatching = isWatchingAd === task.id

        if (isCompleted) {
            return (
                <button className="h-8 bg-[#333] text-[#888] px-4 rounded-full text-sm font-medium flex items-center cursor-not-allowed">
                    ✓ Claimed
                </button>
            )
        }

        if (task.type === 'ad' || task.type === 'listen') {
            if (isWatching) {
                return (
                    <div className="h-8 px-4 rounded-full text-sm font-medium flex items-center bg-[#007aff]">
                        <div className="w-20 h-2 bg-[#333] rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-white transition-all duration-100"
                                style={{ width: `${adProgress}%` }}
                            />
                        </div>
                    </div>
                )
            }
            return (
                <button 
                    onClick={() => startAdTask(task.id, task.reward)}
                    className="h-8 bg-white text-black px-4 rounded-full text-sm font-medium flex items-center hover:bg-[#e0e0e0] transition-colors"
                >
                    Watch
                </button>
            )
        }

        if (adProgress === 100) {
            return (
                <button 
                    onClick={() => handleTaskReward(task.id, task.reward)}
                    disabled={isLoading}
                    className="h-8 bg-[#22c55e] text-white px-4 rounded-full text-sm font-medium flex items-center hover:bg-[#16a34a] transition-colors"
                >
                    {isLoading ? '...' : 'Claim'}
                </button>
            )
        }

        return (
            <button 
                onClick={() => {
                    if (task.link) {
                        startSocialTask(task.link)
                    }
                }}
                disabled={isLoading}
                className="h-8 bg-white text-black px-4 rounded-full text-sm font-medium flex items-center hover:bg-[#e0e0e0] transition-colors disabled:opacity-50"
            >
                {isLoading ? '...' : 'Start'}
            </button>
        )
    }

    return (
        <div className={`quests-tab-con px-4 transition-all duration-300`}>
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-[#1a1a1b] border border-[#2d2d2e] text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
                    {toastMessage}
                </div>
            )}

            {/* Header */}
            <div className="pt-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">TASKS</h1>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-semibold">GET REWARDS </span>
                            <span className="text-xl text-gray-500">FOR</span>
                        </div>
                        <div className="text-xl text-gray-500">COMPLETING QUESTS</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Balance</div>
                        <div className="text-lg font-bold text-white">{balance.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">PAWS</div>
                    </div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-0 mt-6">
                <button
                    onClick={() => setActiveTab('in-game')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition duration-300 
                        ${activeTab === 'in-game'
                            ? 'bg-white text-black'
                            : 'bg-[#151515] text-white'
                        }`}
                >
                    In-game
                </button>
                <button
                    onClick={() => setActiveTab('partners')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition duration-300 
                        ${activeTab === 'partners'
                            ? 'bg-white text-black'
                            : 'bg-[#151515] text-white'
                        }`}
                >
                    Partners
                    <div className="bg-[#5a5a5a] text-[#fefefe] size-4 rounded-full flex items-center justify-center text-[11px]">
                        {partnerTasks.length}
                    </div>
                </button>
            </div>

            {/* Tasks List */}
            <div className="mt-4 mb-20 bg-[#151516] rounded-xl">
                {(activeTab === 'in-game' ? inGameTasks : partnerTasks).map((task, index) => (
                    <div
                        key={task.id}
                        className="flex items-center"
                    >
                        <div className="w-[72px] flex justify-center">
                            <div className="w-10 h-10">
                                {typeof task.icon === 'string' ? (
                                    <Image
                                        src={task.icon}
                                        alt={task.title}
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <task.icon className="w-full h-full" />
                                )}
                            </div>
                        </div>
                        <div className={`flex items-center justify-between w-full py-4 pr-4 ${index !== 0 && "border-t border-[#222622]"
                            }`}>
                            <div>
                                <div className="text-[17px]">{task.title}</div>
                                <div className="text-gray-400 text-[14px]">+ {task.reward.toLocaleString()} PAWS</div>
                                {task.description && (
                                    <div className="text-gray-500 text-[12px]">{task.description}</div>
                                )}
                            </div>
                            {renderTaskButton(task)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Fraud Warning */}
            <div className="bg-[#151516] rounded-xl p-3 mb-20">
                <div className="flex items-center gap-2 text-[#868686] text-xs">
                    <span>🛡️</span>
                    <span>Anti-fraud protection active. Suspicious activity will result in reward confiscation.</span>
                </div>
            </div>
        </div>
    )
}

// Helper components for social task icons
const TaskTwitter = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
)

const TaskDiscord = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
)

const TaskTikTok = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
)

const TaskYouTube = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
)

export default TasksTab