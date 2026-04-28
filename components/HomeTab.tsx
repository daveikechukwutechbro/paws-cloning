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
import { updateUserBalance, updateUserUpgrade } from '@/utils/userUtils'
import { connectWallet, disconnectWallet, getWalletAddress, isWalletConnected } from '@/utils/tonService'

const HomeTab = () => {
    const { user, loading, refreshUser } = useUser()
    
    // Get user ID - wait for user to load first
    const [userId, setUserId] = useState('')
    
    useEffect(() => {
        if (user?.id) {
            setUserId(user.id)
        } else {
            const stored = localStorage.getItem('paws_user_id')
            if (stored) setUserId(stored)
        }
    }, [user])
    
    const timerKey = `lastClaim_${userId}`
    const balanceKey = `paws_balance_${userId}`
    
    // Load balance from localStorage immediately, then update from Firebase
    const [localBalance, setLocalBalance] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(balanceKey)
            return saved ? parseInt(saved) : 50000
        }
        return 50000
    })
    const [lastClaim, setLastClaim] = useState<number | null>(null)
    const [timeRemaining, setTimeRemaining] = useState(0)
    const [walletConnected, setWalletConnected] = useState(false)
    const [showWalletMenu, setShowWalletMenu] = useState(false)
    const [showBuyMenu, setShowBuyMenu] = useState(false)
    const [showCommunityMenu, setShowCommunityMenu] = useState(false)
    
    const buyPackages = [
        { name: '1,000 PAWS', price: '$1', amount: 1000 },
        { name: '5,000 PAWS', price: '$4', amount: 5000 },
        { name: '10,000 PAWS', price: '$7', amount: 10000 },
        { name: '50,000 PAWS', price: '$30', amount: 50000 },
    ]

    useEffect(() => {
        const savedLastClaim = localStorage.getItem(timerKey)
        if (savedLastClaim) setLastClaim(parseInt(savedLastClaim))
    }, [timerKey])

    // Update from Firebase when loaded
    useEffect(() => {
        if (!loading && user?.balance) {
            setLocalBalance(user.balance)
            localStorage.setItem(balanceKey, user.balance.toString())
        }
    }, [loading, user, balanceKey])

    // Save to localStorage whenever balance changes
    useEffect(() => {
        localStorage.setItem(balanceKey, localBalance.toString())
    }, [localBalance, balanceKey])

    useEffect(() => {
        const interval = setInterval(() => {
            const saved = localStorage.getItem(timerKey)
            if (saved) {
                const lastClaimTime = parseInt(saved)
                const remaining = 180000 - (Date.now() - lastClaimTime)
                setTimeRemaining(Math.max(0, remaining))
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [timerKey])

    const claimHourlyReward = async () => {
        if (!userId) {
            alert('Please refresh the page first')
            return
        }
        
        const newBalance = localBalance + 2000
        setLocalBalance(newBalance)
        
        const now = Date.now()
        setLastClaim(now)
        localStorage.setItem(timerKey, now.toString())

        await updateUserBalance(userId, newBalance)
        
        setTimeout(() => refreshUser(), 500)
    }

    const formatTime = (ms: number) => {
        const hours = Math.floor(ms / 3600000)
        const minutes = Math.floor((ms % 3600000) / 60000)
        const seconds = Math.floor((ms % 60000) / 1000)
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    const displayBalance = localBalance
    const displayUsername = user?.username || 'Guest'
    const isNewUser = user?.balance === 50000

    // Show loading while syncing with Firebase
    if (loading && localBalance === 50000) {
        return (
            <div className="home-tab-con flex flex-col items-center justify-center min-h-[400px]">
                <PawsLogo className="w-20 h-20 animate-pulse" />
                <div className="mt-4 text-gray-400">Loading...</div>
            </div>
        )
    }

    const communities = [
        { name: 'X (Twitter)', url: 'https://x.com/GOTPAWSED' },
        { name: 'Discord', url: 'https://discord.com/invite/pawsuplabs' },
        { name: 'TikTok', url: 'https://www.tiktok.com/@pawslabs' },
        { name: 'YouTube', url: 'https://www.youtube.com/@PawsUpLabs' },
    ]

    return (
        <div className={`home-tab-con transition-all duration-300`}>
            {/* Connect Wallet Button */}
            {walletConnected ? (
                <button 
                    onClick={() => {
                        disconnectWallet()
                        setWalletConnected(false)
                        alert('Wallet disconnected')
                    }}
                    className="w-full flex justify-center mt-4"
                >
                    <div className="bg-[#007aff] text-white px-3 py-0.5 rounded-full flex items-center gap-2">
                        <Wallet className="w-5 h-5" />
                        <span>Wallet Connected</span>
                    </div>
                </button>
            ) : (
                <button 
                    onClick={async () => {
                        const result = await connectWallet()
                        if (result.success) {
                            setWalletConnected(true)
                            const address = getWalletAddress()
                            alert('Wallet connected: ' + address)
                        } else {
                            alert(result.error || 'Connection failed. Please try again.')
                        }
                    }}
                    className="w-full flex justify-center mt-4"
                >
                    <div className="bg-[#007aff] text-white px-3 py-0.5 rounded-full flex items-center gap-2">
                        <Wallet className="w-5 h-5" />
                        <span>Connect wallet</span>
                    </div>
                </button>
            )}

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

                {/* Buy PAWS Button */}
                <button 
                    onClick={() => setShowBuyMenu(!showBuyMenu)}
                    className="w-full bg-[#007aff] border border-[#007aff] rounded-lg px-4 py-3 flex items-center justify-between mt-3"
                >
                    <div className="flex items-center gap-3 font-medium text-white">
                        <PawsLogo className="w-8 h-8" />
                        <span>Buy PAWS</span>
                    </div>
                    <ArrowRight className={`w-6 h-6 text-white transition-transform ${showBuyMenu ? 'rotate-90' : ''}`} />
                </button>

                {showBuyMenu && (
                    <div className="mt-2 bg-[#1a1a1b] border-[1px] border-[#2d2d2e] rounded-lg overflow-hidden p-4">
                        <div className="text-center mb-4">
                            <div className="text-sm text-gray-400 mb-2">Send TON to this address:</div>
                            <div className="text-xs bg-[#2d2d2e] p-2 rounded break-all text-white">
                                UQDQG85BG8NZpaZzktagBiS_Y5sllQQT4iX43wM_XuK4cl3J
                            </div>
                            <button 
                                onClick={() => navigator.clipboard.writeText('UQDQG85BG8NZpaZzktagBiS_Y5sllQQT4iX43wM_XuK4cl3J')}
                                className="mt-2 text-[#007aff] text-sm"
                            >
                                Copy Address
                            </button>
                        </div>
                        <div className="text-center text-xs text-gray-500 mb-4">
                            After sending, contact admin to credit your PAWS
                        </div>
                        <div className="space-y-2">
                            {buyPackages.map((pkg, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-[#2d2d2e] rounded">
                                    <span className="text-white">{pkg.name}</span>
                                    <span className="text-gray-400">{pkg.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default HomeTab