// components/HomeTab.tsx

/**
 * This project was developed by Nikandr Surkov.
 * 
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * GitHub: https://github.com/nikandr-surkov
 */

'use client'

import Wallet from '@/icons/Wallet'
import PawsLogo from '@/icons/PawsLogo'
import Community from '@/icons/Community'
import Star from '@/icons/Star'
import Image from 'next/image'
import ArrowRight from '@/icons/ArrowRight'
import { sparkles } from '@/images'
import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { supabase } from '@/utils/supabaseClient'

const HomeTab = () => {
    const { user, loading, refreshUser } = useUser()
    const [localBalance, setLocalBalance] = useState(50000)
    const [lastClaim, setLastClaim] = useState<number | null>(null)
    const [timeRemaining, setTimeRemaining] = useState(0)
    const [showCommunityMenu, setShowCommunityMenu] = useState(false)

    useEffect(() => {
        const savedLastClaim = localStorage.getItem('lastClaim')
        if (savedLastClaim) setLastClaim(parseInt(savedLastClaim))
    }, [])

    useEffect(() => {
        if (!loading) {
            setLocalBalance(user?.balance > 0 ? user.balance : 50000)
        }
    }, [loading, user])

    useEffect(() => {
        const interval = setInterval(() => {
            if (lastClaim) {
                const remaining = 3600000 - (Date.now() - lastClaim)
                setTimeRemaining(Math.max(0, remaining))
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [lastClaim])

    const claimHourlyReward = async () => {
        if (!user?.id) return
        
        if (!lastClaim || Date.now() - lastClaim >= 3600000) {
            const currentBalance = localBalance || 50000
            const newBalance = Number(currentBalance) + 2000
            setLocalBalance(newBalance)
            const now = Date.now()
            setLastClaim(now)
            localStorage.setItem('lastClaim', now.toString())

            await supabase
                .from('users')
                .update({ balance: newBalance })
                .eq('id', user.id)
            
            refreshUser()
        }
    }

    const formatTime = (ms: number) => {
        const hours = Math.floor(ms / 3600000)
        const minutes = Math.floor((ms % 3600000) / 60000)
        const seconds = Math.floor((ms % 60000) / 1000)
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    const displayBalance = (user && user.balance > 0) ? user.balance : localBalance
    const displayUsername = user?.username || 'Guest'
    const isNewUser = user?.balance === 50000

    const communities = [
        { name: 'X (Twitter)', url: 'https://x.com/GOTPAWSED' },
        { name: 'Discord', url: 'https://discord.com/invite/pawsuplabs' },
        { name: 'TikTok', url: 'https://www.tiktok.com/@pawslabs' },
        { name: 'YouTube', url: 'https://www.youtube.com/@PawsUpLabs' },
    ]

    return (
        <div className={`home-tab-con transition-all duration-300`}>
            {/* Connect Wallet Button */}
            <button className="w-full flex justify-center mt-4">
                <div className="bg-[#007aff] text-white px-3 py-0.5 rounded-full flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    <span>Connect wallet</span>
                </div>
            </button>

            {/* PAWS Balance */}
            <div className="flex flex-col items-center mt-8">
                <PawsLogo className="w-28 h-28 mb-4" />
                <div className="flex items-center gap-1 text-center">
                    <div className="text-6xl font-bold mb-1">{displayBalance.toLocaleString()}</div>
                    <div className="text-white text-2xl">PAWS</div>
                </div>
                <div className="flex items-center gap-1 text-[#868686] rounded-full px-4 py-1.5 mt-2 cursor-pointer">
                    <span>{isNewUser ? 'NEWCOMER' : 'ACTIVE'}</span>
                    <Image
                        src={sparkles}
                        alt="sparkles"
                        width={18}
                        height={18}
                    />
                    <span>RANK</span>
                    <ArrowRight className="w-6 h-6" />
                </div>
            </div>

            {/* Hourly Claim */}
            <div className="px-4 mt-6">
                <div className="bg-[#ffffff0d] border-[1px] border-[#2d2d2e] rounded-lg p-4">
                    <div className="text-center mb-3">
                        <div className="text-lg font-medium">Hourly Reward</div>
                        <div className="text-sm text-[#868686]">Claim 2000 PAWS every hour</div>
                    </div>
                    {timeRemaining > 0 ? (
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#007aff]">{formatTime(timeRemaining)}</div>
                            <div className="text-sm text-[#868686]">until next claim</div>
                        </div>
                    ) : (
                        <button
                            onClick={claimHourlyReward}
                            className="w-full bg-[#007aff] text-white py-2 rounded-lg font-medium hover:bg-[#0056cc] transition-colors"
                        >
                            Claim 2000 PAWS
                        </button>
                    )}
                </div>
            </div>

            {/* Community Dropdown */}
            <div className="px-4 mt-8 mb-8">
                <button 
                    onClick={() => setShowCommunityMenu(!showCommunityMenu)}
                    className="shine-effect w-full bg-[#ffffff0d] border-[1px] border-[#2d2d2e] rounded-lg px-4 py-2 flex items-center justify-between"
                >
                    <div className="flex items-center gap-3 font-medium">
                        <Community className="w-8 h-8" />
                        <span>Join our community</span>
                    </div>
                    <ArrowRight className={`w-6 h-6 text-gray-400 transition-transform ${showCommunityMenu ? 'rotate-90' : ''}`} />
                </button>
                
                {showCommunityMenu && (
                    <div className="mt-2 bg-[#1a1a1b] border-[1px] border-[#2d2d2e] rounded-lg overflow-hidden">
                        {communities.map((community, index) => (
                            <a 
                                key={index}
                                href={community.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between px-4 py-3 hover:bg-[#2d2d2e] transition-colors border-b border-[#2d2d2e] last:border-b-0"
                            >
                                <span className="font-medium text-white">{community.name}</span>
                                <ArrowRight className="w-5 h-5 text-gray-400" />
                            </a>
                        ))}
                    </div>
                )}

                <button className="w-full bg-[#ffffff0d] border-[1px] border-[#2d2d2e] rounded-lg px-4 py-2 flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3 font-medium">
                        <Star className="w-8 h-8" />
                        <span>Check your rewards</span>
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                </button>
            </div>
        </div>
    )
}

export default HomeTab