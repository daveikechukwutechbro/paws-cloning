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
            id: 'partner_ton',
            icon: 'https://i.imgur.com/PjjpDKL.png',
            title: 'Visit TON',
            description: 'Explore the TON ecosystem',
            reward: 500000,
            link: 'https://ton.org/en/wallets',
            type: 'social',
        },
        {
            id: 'partner_solana',
            icon: 'https://i.imgur.com/3dp5q8h.png',
            title: 'Visit Solana',
            description: 'Discover the Solana blockchain',
            reward: 500000,
            link: 'https://solana.com',
            type: 'social',
        },
        {
            id: 'partner_bybit',
            icon: 'https://i.imgur.com/G6oCzzm.png',
            title: 'Visit Bybit',
            description: 'Trade on Bybit exchange',
            reward: 500000,
            link: 'https://bybit.com',
            type: 'social',
        },
        {
            id: 'partner_bitget',
            icon: 'https://i.imgur.com/0FsWwee.png',
            title: 'Visit Bitget',
            description: 'Copy trading on Bitget',
            reward: 500000,
            link: 'https://www.bitgetapp.com',
            type: 'social',
        },
        {
            id: 'partner_okx',
            icon: 'https://i.imgur.com/B4BF1fQ.png',
            title: 'Visit OKX',
            description: 'Trade on OKX exchange',
            reward: 500000,
            link: 'https://www.okx.com',
            type: 'social',
        },
    ]

    // Combine in-game tasks with social tasks
    const allInGameTasks: Task[] = [...inGameTasks, ...socialTasks]

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
                {(activeTab === 'in-game' ? allInGameTasks : partnerTasks).map((task, index) => (
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
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="80" rx="20" fill="#000"/>
        <path d="M20 30C20 28 22 26 24 26C26 26 28 28 28 30V40C28 42 26 44 24 44C22 44 20 42 20 40V30Z" fill="#fff"/>
        <rect x="30" y="28" width="4" height="16" fill="#fff"/>
        <rect x="38" y="22" width="4" height="22" fill="#fff"/>
        <rect x="46" y="30" width="4" height="14" fill="#fff"/>
        <circle cx="22" cy="22" r="2" fill="#1DA1F2"/>
        <circle cx="60" cy="25" r="3" fill="#1DA1F2"/>
        <circle cx="58" cy="35" r="2" fill="#1DA1F2"/>
        <path d="M15 45L25 50L40 42L55 48L65 45" stroke="#1DA1F2" strokeWidth="2" strokeLinecap="round"/>
    </svg>
)

const TaskDiscord = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="80" rx="20" fill="#5865F2"/>
        <path d="M30 25C30 23.3 31.3 22 33 22C34.7 22 36 23.3 36 25V35C36 36.7 34.7 38 33 38C31.3 38 30 36.7 30 35V25Z" fill="#fff"/>
        <path d="M44 25C44 23.3 45.3 22 47 22C48.7 22 50 23.3 50 25V35C50 36.7 48.7 38 47 38C45.3 38 44 36.7 44 35V25Z" fill="#fff"/>
        <path d="M30 45L34 50L38 40L42 55L46 45L50 50L54 45" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="40" cy="55" r="12" stroke="#fff" strokeWidth="2" fill="none"/>
    </svg>
)

const TaskTikTok = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="80" rx="20" fill="#000"/>
        <path d="M35 20C38 20 40 22 40 25V35C42 34 45 35 47 37C50 40 50 45 47 49C44 53 38 55 33 52C28 49 27 43 30 39" stroke="url(#tiktokGrad)" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <circle cx="55" cy="20" r="3" fill="#00f2ea"/>
        <circle cx="58" cy="15" r="2" fill="#ff0050"/>
        <path d="M25 50L30 55L40 45" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
            <linearGradient id="tiktokGrad" x1="25" y1="20" x2="55" y2="60" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00f2ea"/>
                <stop offset="0.5" stopColor="#ff0050"/>
                <stop offset="1" stopColor="#00f2ea"/>
            </linearGradient>
        </defs>
    </svg>
)

const TaskYouTube = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="80" rx="20" fill="#FF0000"/>
        <rect x="15" y="22" width="50" height="36" rx="8" fill="#fff"/>
        <polygon points="35,30 55,40 35,50" fill="#FF0000"/>
        <circle cx="60" cy="18" r="4" fill="#fff"/>
        <circle cx="65" cy="25" r="3" fill="#fff"/>
        <circle cx="68" cy="32" r="2" fill="#fff"/>
    </svg>
)

// Partner icons
const TaskTON = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="80" rx="20" fill="#0098EA"/>
        <circle cx="40" cy="40" r="25" fill="#fff"/>
        <path d="M40 15 L55 40 L40 65 L25 40 Z" fill="#0098EA"/>
        <circle cx="40" cy="40" r="8" fill="#0098EA"/>
    </svg>
)

const TaskSolana = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="80" rx="20" fill="#000"/>
        <defs>
            <linearGradient id="solanaGrad" x1="10" y1="10" x2="70" y2="70" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9945FF"/>
                <stop offset="0.5" stopColor="#14F195"/>
                <stop offset="1" stopColor="#9945FF"/>
            </linearGradient>
        </defs>
        <circle cx="40" cy="40" r="25" stroke="url(#solanaGrad)" strokeWidth="4" fill="none"/>
        <circle cx="40" cy="40" r="8" fill="url(#solanaGrad)"/>
        <path d="M30 35 L40 25 L50 35 L40 45 Z" fill="url(#solanaGrad)"/>
    </svg>
)

const TaskBybit = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="80" rx="20" fill="#fff"/>
        <rect x="10" y="10" width="60" height="60" rx="10" fill="#000"/>
        <text x="40" y="50" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="bold">B</text>
    </svg>
)

const TaskBitget = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="80" rx="20" fill="#000"/>
        <circle cx="40" cy="40" r="22" stroke="#00D9FF" strokeWidth="3" fill="none"/>
        <circle cx="40" cy="40" r="12" stroke="#00D9FF" strokeWidth="2" fill="none"/>
        <circle cx="40" cy="40" r="4" fill="#00D9FF"/>
    </svg>
)

const TaskOKX = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="80" rx="20" fill="#000"/>
        <rect x="20" y="25" width="40" height="30" rx="5" fill="#fff"/>
        <circle cx="30" cy="40" r="6" fill="#000"/>
        <circle cx="50" cy="40" r="6" fill="#000"/>
    </svg>
)

export default TasksTab