// components/FriendsTab.tsx

/**
 * This project was developed by Nikandr Surkov.
 * 
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * GitHub: https://github.com/nikandr-surkov
 */

'use client'

import { paws } from '@/images'
import Image from 'next/image'
import { useMemo } from 'react'
import { useUser } from '@/contexts/UserContext'

interface TelegramWebApp {
    initDataUnsafe: {
        user?: {
            id?: number
            username?: string
            first_name?: string
        }
        chat?: {
            username?: string
        }
        start_param?: string
    }
    shareToStory?: (url: string, options?: { text?: string }) => void
}

const FriendsTab = () => {
    const { user } = useUser()

    const inviteLink = useMemo(() => {
        if (typeof window === 'undefined' || !user?.id) return ''
        
        const tg = (window as { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp
        const botUsername = tg?.initDataUnsafe?.chat?.username || tg?.initDataUnsafe?.user?.username
        
        // For Telegram Mini Apps, use the bot URL with start parameter
        if (botUsername) {
            return `https://t.me/${botUsername}?start=${encodeURIComponent(user.id)}`
        }
        
        // Fallback to web URL
        return `${window.location.origin}/?ref=${encodeURIComponent(user.id)}`
    }, [user?.id])

    const handleInvite = async () => {
        if (!inviteLink) {
            alert('Invite link is not ready yet. Please try again.')
            return
        }

        const tg = (window as { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp
        
        try {
            // Try Telegram's native sharing first
            if (tg && tg.shareToStory) {
                tg.shareToStory(inviteLink, {
                    text: 'Join PAWS with my invite link and earn rewards!'
                })
                return
            }

            // Try Web Share API
            if (navigator.share) {
                await navigator.share({
                    title: 'Join PAWS',
                    text: 'Join PAWS with my invite link and earn rewards!',
                    url: inviteLink
                })
                return
            }

            // Fallback to copy
            await navigator.clipboard.writeText(inviteLink)
            showCopyFeedback()
        } catch (error: unknown) {
            // User cancelled share
            if (error instanceof Error && error.name === 'AbortError') return
            
            console.error('Invite error:', error)
            // Try clipboard as last resort
            try {
                await navigator.clipboard.writeText(inviteLink)
                showCopyFeedback()
            } catch {
                alert('Could not share invite link. Please copy it manually.')
            }
        }
    }

    const showCopyFeedback = () => {
        const btn = document.getElementById('invite-btn')
        if (btn) {
            btn.textContent = 'Copied!'
            btn.classList.add('bg-green-600')
            setTimeout(() => {
                btn.textContent = 'Invite'
                btn.classList.remove('bg-green-600')
            }, 2000)
        }
    }

    const copyLink = async () => {
        if (!inviteLink) return
        try {
            await navigator.clipboard.writeText(inviteLink)
            const btn = document.getElementById('copy-btn')
            if (btn) {
                btn.textContent = 'Copied!'
                setTimeout(() => {
                    btn.textContent = 'Copy Link'
                }, 2000)
            }
        } catch (error) {
            console.error('Copy error:', error)
            alert('Failed to copy link')
        }
    }

    return (
        <div className={`friends-tab-con px-4 pb-24 transition-all duration-300`}>
            {/* Header Text */}
            <div className="pt-8 space-y-1">
                <h1 className="text-3xl font-bold">INVITE FRIENDS</h1>
                <div className="text-xl">
                    <span className="font-semibold">SHARE</span>
                    <span className="ml-2 text-gray-500">YOUR INVITATION</span>
                </div>
                <div className="text-xl">
                    <span className="text-gray-500">LINK &</span>
                    <span className="ml-2 font-semibold">GET 10%</span>
                    <span className="ml-2 text-gray-500">OF</span>
                </div>
                <div className="text-gray-500 text-xl">
                    FRIEND&apos;S POINTS
                </div>
            </div>

            <div className="mt-4 bg-[#151516] border border-[#2d2d2e] rounded-xl p-3">
                <div className="text-sm text-[#8e8e93] mb-2">Your invite link</div>
                <div className="text-xs break-all bg-[#1f1f20] p-2 rounded text-white">
                    {inviteLink || 'Generating invite link...'}
                </div>
                <button
                    id="copy-btn"
                    onClick={copyLink}
                    disabled={!inviteLink}
                    className="mt-3 w-full bg-[#2d2d2e] text-white py-2 rounded-lg disabled:opacity-50 transition-colors duration-200"
                >
                    Copy Link
                </button>

                <div className="grid grid-cols-2 gap-2 mt-3 text-center text-sm">
                    <div className="bg-[#1f1f20] p-2 rounded">
                        <div className="text-[#8e8e93]">Invites</div>
                        <div className="font-semibold">{user?.referralCount || 0}</div>
                    </div>
                    <div className="bg-[#1f1f20] p-2 rounded">
                        <div className="text-[#8e8e93]">Earned</div>
                        <div className="font-semibold">{(user?.referralEarnings || 0).toLocaleString()} PAWS</div>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            <div className="mt-8 mb-2">
                <div className="bg-[#151516] w-full rounded-2xl p-8 flex flex-col items-center">
                    <Image
                        src={paws}
                        alt="Paws"
                        width={171}
                        height={132}
                        className="mb-4"
                    />
                    <p className="text-xl text-[#8e8e93] text-center">
                        There is nothing else.<br />
                        Invite to get more rewards.
                    </p>
                </div>
            </div>

            {/* Fixed Invite Button */}
            <div className="fixed bottom-[80px] left-0 right-0 py-4 flex justify-center">
                <div className="w-full max-w-md px-4">
                    <button
                        id="invite-btn"
                        onClick={handleInvite}
                        className="w-full bg-[#4c9ce2] text-white py-4 rounded-xl text-lg font-medium transition-colors duration-200"
                    >
                        Invite
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FriendsTab