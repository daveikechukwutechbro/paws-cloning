// components/InAppNotifications.tsx

/**
 * This project was developed by Nikandr Surkov.
 *
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * GitHub: https://github.com/nikandr-surkov
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { getRandomInternationalName } from '@/utils/internationalNames'

type NotificationType = 'nft' | 'mining' | 'presale'

interface Notification {
    id: number
    type: NotificationType
    userName: string
    message: string
    timestamp: number
}

function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

function randomTonPrice(): string {
    const prices = [15.67, 17.80, 19.87, 26.20, 33.22, 42.49, 49.53]
    const price = randomItem(prices)
    return price.toFixed(2)
}

function randomPawsAmount(): string {
    const amounts = ['25,000', '50,000', '75,000', '100,000', '150,000', '200,000']
    return randomItem(amounts)
}

const NFT_NAMES = [
    'Cosmic Paw', 'Neon Claw', 'Crystal Fang', 'Shadow Mane',
    'Thunder Pelt', 'Inferno Eye', 'Eternal Roar', 'Astral Wolf',
    'Blazing Fox', 'Celestial Bear', 'Dark Panther', 'Ethereal Dragon'
]

function generateNotification(id: number): Notification {
    const type = randomItem<NotificationType>(['nft', 'mining', 'presale'])
    const nameIndex = Math.floor(Math.random() * 10000)
    const userName = getRandomInternationalName(nameIndex)

    let message: string
    switch (type) {
        case 'nft':
            message = `just purchased ${randomItem(NFT_NAMES)} NFT for ${randomTonPrice()} TON`
            break
        case 'mining':
            message = `boosted mining speed with ${randomItem(['Bronze', 'Silver', 'Gold'])} Miner for ${randomTonPrice()} TON`
            break
        case 'presale':
            message = `just bought ${randomPawsAmount()} PAWS tokens in pre-sale`
            break
    }

    return { id, type, userName, message, timestamp: Date.now() }
}

const InAppNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [visible, setVisible] = useState<number | null>(null)

    const showNext = useCallback(() => {
        const id = Date.now()
        const notification = generateNotification(id)
        setNotifications(prev => [...prev, notification])
        setVisible(id)

        setTimeout(() => {
            setVisible(null)
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id))
            }, 400)
        }, 5000)
    }, [])

    useEffect(() => {
        const showNotification = () => {
            if (visible === null) {
                showNext()
            }
        }

        // First notification after 8 seconds
        const initial = setTimeout(showNotification, 8000)

        // Then periodically every 20-45 seconds
        let timeout: NodeJS.Timeout
        const scheduleNext = () => {
            const delay = 20000 + Math.random() * 25000
            timeout = setTimeout(() => {
                showNotification()
                scheduleNext()
            }, delay)
        }
        const initialSchedule = setTimeout(scheduleNext, 20000 + Math.random() * 15000)

        return () => {
            clearTimeout(initial)
            clearTimeout(initialSchedule)
            clearTimeout(timeout)
        }
    }, [visible, showNext])

    const currentNotification = notifications.find(n => n.id === visible)
    if (!currentNotification) return null

    const typeColors: Record<NotificationType, string> = {
        nft: 'from-[#a855f7] to-[#7c3aed]',
        mining: 'from-[#007aff] to-[#0056cc]',
        presale: 'from-[#22c55e] to-[#16a34a]'
    }

    const typeIcons: Record<NotificationType, string> = {
        nft: '💎',
        mining: '⚡',
        presale: '🪙'
    }

    return (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-3 pointer-events-none">
            <div
                className={`bg-[#1a1a1b]/95 backdrop-blur-xl border border-[#2d2d2e] rounded-2xl p-4 shadow-2xl transition-all duration-400 ease-out ${
                    visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
                }`}
                style={{
                    animation: visible ? 'slideDown 0.4s ease-out' : 'slideUp 0.4s ease-in forwards'
                }}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeColors[currentNotification.type]} flex items-center justify-center text-lg shrink-0`}>
                        {typeIcons[currentNotification.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-white truncate">{currentNotification.userName}</span>
                            <span className="text-[10px] text-gray-500 shrink-0">just now</span>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{currentNotification.message}</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideDown {
                    from { transform: translateY(-100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(0); opacity: 1; }
                    to { transform: translateY(-20px); opacity: 0; }
                }
            `}</style>
        </div>
    )
}

export default InAppNotifications
