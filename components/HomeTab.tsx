'use client'

import Wallet from '@/icons/Wallet'
import PawsLogo from '@/icons/PawsLogo'
import Community from '@/icons/Community'
import Star from '@/icons/Star'
import ArrowRight from '@/icons/ArrowRight'
import { sparkles } from '@/images'
import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useUser } from '@/contexts/UserContext'
import { updateUserBalance, updateCompletedTask } from '@/utils/userUtils'
import { checkAndQualify } from '@/utils/referralSystem'
import {
    connectWalletWithProvider,
    disconnectWallet,
    getWalletAddress,
    isWalletConnected,
    restoreWalletConnection,
    SupportedWallet
} from '@/utils/tonService'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/utils/firebaseClient'
import { getUserTier, getNextTier, getProgressToNextTier, getEstimatedRank, RANK_TIERS } from '@/utils/rankingSystem'
import TokenomicsModal from '@/components/TokenomicsModal'
import AirdropEligibility from '@/components/AirdropEligibility'
import MiningUpgradeShop from '@/components/MiningUpgradeShop'
import { getCurrentUserCount, formatUserCount } from '@/utils/userGrowth'
import { REWARDS } from '@/utils/types'
import { PRESALE_PACKAGES, PRESALE_RECEIVING_WALLET, formatPresaleAmount } from '@/utils/preSale'
import { processPreSalePurchase } from '@/utils/userUtils'

const HomeTab = () => {
    const { user, loading, refreshUser } = useUser()
    
    const [userId, setUserId] = useState('')
    
    useEffect(() => {
        if (user?.id) {
            setUserId(user.id)
        } else {
            const stored = localStorage.getItem('paws_user_id')
            if (stored) setUserId(stored)
        }
    }, [user])
    
    const timerKey = userId ? `lastClaim_${userId}` : 'lastClaim_default'
    const balanceKey = userId ? `paws_balance_${userId}` : 'paws_balance_default'
    
    const [displayBalance, setDisplayBalance] = useState(50000)
    const [timeRemaining, setTimeRemaining] = useState(0)
    const [walletConnected, setWalletConnected] = useState(false)
    const [walletAddress, setWalletAddress] = useState<string | null>(null)
    const [showWalletOptions, setShowWalletOptions] = useState(false)
    const [showBuyMenu, setShowBuyMenu] = useState(false)
    const [showCommunityMenu, setShowCommunityMenu] = useState(false)
    const [isClaiming, setIsClaiming] = useState(false)
    const [showRankModal, setShowRankModal] = useState(false)
    const [showTokenomics, setShowTokenomics] = useState(false)
    const [showMiningShop, setShowMiningShop] = useState(false)
    const [airdropCount, setAirdropCount] = useState(0)
    const [isOnline, setIsOnline] = useState(true)
    const AIRDROP_TARGET = 2_000_000
    const [selectedPresale, setSelectedPresale] = useState<string | null>(null)
    const [presaleTxHash, setPresaleTxHash] = useState('')
    const [presaleProcessing, setPresaleProcessing] = useState(false)
    const [presaleError, setPresaleError] = useState<string | null>(null)
    const [presaleSuccess, setPresaleSuccess] = useState(false)
    const [copied, setCopied] = useState(false)

    const syncBalanceFromFirebase = useCallback(async () => {
        if (!userId) return
        try {
            const userRef = doc(db, 'users', userId)
            const userSnap = await getDoc(userRef)
            if (userSnap.exists()) {
                const data = userSnap.data()
                const firebaseBalance = data.balance || 50000
                setDisplayBalance(firebaseBalance)
                localStorage.setItem(balanceKey, firebaseBalance.toString())
            }
        } catch (error) {
            console.error('Error syncing balance from Firebase:', error)
        }
    }, [userId, balanceKey])

    useEffect(() => {
        if (userId) {
            syncBalanceFromFirebase()
        }
    }, [userId, syncBalanceFromFirebase])

    useEffect(() => {
        if (user?.balance && user.balance !== displayBalance) {
            setDisplayBalance(user.balance)
        }
    }, [user?.balance])

    useEffect(() => {
        setAirdropCount(getCurrentUserCount())
        if (!isOnline) return
        const interval = setInterval(() => setAirdropCount(getCurrentUserCount()), 30000)
        return () => clearInterval(interval)
    }, [isOnline])

    useEffect(() => {
        const savedLastClaim = localStorage.getItem(timerKey)
        if (savedLastClaim) {
            const lastClaimTime = parseInt(savedLastClaim)
            const remaining = 3600000 - (Date.now() - lastClaimTime)
            if (remaining > 0) {
                setTimeRemaining(remaining)
            }
        }
    }, [timerKey])

    useEffect(() => {
        setIsOnline(navigator.onLine)
        const goOnline = () => { setIsOnline(true) }
        const goOffline = () => { setIsOnline(false) }
        window.addEventListener('online', goOnline)
        window.addEventListener('offline', goOffline)
        return () => {
            window.removeEventListener('online', goOnline)
            window.removeEventListener('offline', goOffline)
        }
    }, [])

    useEffect(() => {
        const initializeWalletState = async () => {
            const restored = await restoreWalletConnection()
            if (restored || isWalletConnected()) {
                setWalletConnected(true)
                setWalletAddress(getWalletAddress())
            }
        }

        initializeWalletState()
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            const saved = localStorage.getItem(timerKey)
            if (saved) {
                const lastClaimTime = parseInt(saved)
                const remaining = 3600000 - (Date.now() - lastClaimTime)
                setTimeRemaining(Math.max(0, remaining))
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [timerKey])

    const claimHourlyReward = async () => {
        if (!userId || isClaiming) return
        
        setIsClaiming(true)
        try {
            const newBalance = displayBalance + REWARDS.MINING_PER_HOUR
            setDisplayBalance(newBalance)
            localStorage.setItem(balanceKey, newBalance.toString())
            
            const now = Date.now()
            localStorage.setItem(timerKey, now.toString())
            const miningKey = `miningSessions_${userId}`
            const currentSessions = parseInt(localStorage.getItem(miningKey) || '0')
            localStorage.setItem(miningKey, (currentSessions + 1).toString())

            await updateUserBalance(userId, newBalance)
            
            setTimeout(() => {
                syncBalanceFromFirebase()
                refreshUser()
            }, 1000)
        } catch (error) {
            console.error('Error claiming reward:', error)
            alert('Failed to claim reward. Please try again.')
        } finally {
            setIsClaiming(false)
        }
    }

    const copyPresaleAddress = () => {
        navigator.clipboard.writeText(PRESALE_RECEIVING_WALLET)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handlePresalePurchase = async (packageId: string, amount: number) => {
        if (!navigator.onLine) {
            setPresaleError('No internet connection. Go online to claim tokens.')
            return
        }
        if (!user?.id || !presaleTxHash) {
            setPresaleError('Please enter the transaction hash')
            return
        }
        if (presaleTxHash.length < 64) {
            setPresaleError('Invalid transaction hash format')
            return
        }
        if (!/^[a-fA-F0-9]+$/.test(presaleTxHash)) {
            setPresaleError('Transaction hash must be hexadecimal')
            return
        }
        setPresaleProcessing(true)
        setPresaleError(null)
        try {
            const result = await processPreSalePurchase(user.id, packageId, amount, presaleTxHash)
            if (result.success) {
                localStorage.setItem('last_ton_transaction', presaleTxHash)
                setPresaleSuccess(true)
                setTimeout(() => {
                    setPresaleSuccess(false)
                    setSelectedPresale(null)
                    setPresaleTxHash('')
                    refreshUser()
                }, 3000)
            } else {
                setPresaleError(result.error || 'Verification failed')
            }
        } catch {
            setPresaleError('Failed to process purchase')
        } finally {
            setPresaleProcessing(false)
        }
    }

    const formatTime = (ms: number) => {
        const hours = Math.floor(ms / 3600000)
        const minutes = Math.floor((ms % 3600000) / 60000)
        const seconds = Math.floor((ms % 60000) / 1000)
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    const currentTier = getUserTier(displayBalance)
    const nextTier = getNextTier(displayBalance)
    const tierProgress = getProgressToNextTier(displayBalance)
    const estimatedRank = getEstimatedRank(displayBalance)

    const walletOptions: { key: SupportedWallet; label: string }[] = [
        { key: 'telegram-wallet', label: 'Telegram TON Wallet' },
        { key: 'tonkeeper', label: 'Tonkeeper' },
        { key: 'mytonwallet', label: 'MyTonWallet' }
    ]

    const handleConnectWallet = async (provider: SupportedWallet) => {
        const result = await connectWalletWithProvider(provider)

        if (!result.success) {
            alert(result.error || 'Connection failed. Please try again.')
            return
        }

        if (result.connectUrl) {
            window.open(result.connectUrl, '_blank')
            setShowWalletOptions(false)
            alert('Complete the connection in your wallet app, then return here.')
            return
        }

        setWalletConnected(true)
        setWalletAddress(getWalletAddress())
        setShowWalletOptions(false)

        if (user?.id) {
            try {
                const userRef = doc(db, 'users', user.id)
                const userSnap = await getDoc(userRef)
                const data = userSnap.data()
                const alreadyCompleted = data?.completedTasks?.includes('connect_wallet')
                if (!alreadyCompleted) {
                    const currentBalance = data?.balance || 50000
                    await updateUserBalance(user.id, currentBalance + 100000)
                    await updateCompletedTask(user.id, 'connect_wallet')
                    checkAndQualify(user.id).catch(() => {})
                    refreshUser()
                }
            } catch {}
        }

        alert('Wallet connected: ' + (getWalletAddress() || 'Connected'))
    }

    const formatWalletAddress = (address: string) => {
        if (address.length <= 12) return address
        return `${address.slice(0, 6)}...${address.slice(-6)}`
    }

    if (loading && displayBalance === 50000) {
        return (
            <div className="home-tab-con flex flex-col items-center justify-center min-h-[400px]">
                <PawsLogo className="w-36 h-36 animate-pulse" />
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

            {walletConnected ? (
                <div className="w-full flex flex-col items-center mt-4 px-4">
                    <button
                        onClick={() => setShowWalletOptions((prev) => !prev)}
                        className="bg-[#007aff] text-white px-3 py-0.5 rounded-full flex items-center gap-2"
                    >
                        <Wallet className="w-5 h-5" />
                        <span>{walletAddress ? formatWalletAddress(walletAddress) : 'Connected'}</span>
                    </button>

                    {showWalletOptions && (
                        <div className="w-full max-w-sm mt-3 bg-[#1a1a1b] border border-[#2d2d2e] rounded-lg overflow-hidden">
                            <button
                                onClick={() => {
                                    disconnectWallet()
                                    setWalletConnected(false)
                                    setWalletAddress(null)
                                    setShowWalletOptions(false)
                                    alert('Wallet disconnected')
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-[#2d2d2e] transition-colors border-b border-[#2d2d2e]"
                            >
                                Disconnect wallet
                            </button>

                            <div className="px-4 py-2 text-xs text-[#868686] border-b border-[#2d2d2e]">
                                Change wallet
                            </div>

                            {walletOptions.map((wallet) => (
                                <button
                                    key={wallet.key}
                                    onClick={() => handleConnectWallet(wallet.key)}
                                    className="w-full text-left px-4 py-3 hover:bg-[#2d2d2e] transition-colors border-b border-[#2d2d2e] last:border-b-0"
                                >
                                    {wallet.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-full flex flex-col items-center mt-4 px-4">
                    <button
                        onClick={() => setShowWalletOptions((prev) => !prev)}
                        className="bg-[#007aff] text-white px-3 py-0.5 rounded-full flex items-center gap-2"
                    >
                        <Wallet className="w-5 h-5" />
                        <span>Connect wallet</span>
                    </button>

                    {showWalletOptions && (
                        <div className="w-full max-w-sm mt-3 bg-[#1a1a1b] border border-[#2d2d2e] rounded-lg overflow-hidden">
                            {walletOptions.map((wallet) => (
                                <button
                                    key={wallet.key}
                                    onClick={() => handleConnectWallet(wallet.key)}
                                    className="w-full text-left px-4 py-3 hover:bg-[#2d2d2e] transition-colors border-b border-[#2d2d2e] last:border-b-0"
                                >
                                    {wallet.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="flex flex-col items-center mt-8">
                <PawsLogo className="w-44 h-44 mb-4" />
                <div className="flex items-center gap-1 text-center">
                    <div className="text-6xl font-bold mb-1">{displayBalance.toLocaleString()}</div>
                    <div className="text-white text-2xl">PAWS</div>
                </div>
                <button
                    onClick={() => setShowRankModal(true)}
                    className="flex items-center gap-2 rounded-full px-4 py-1.5 mt-2 cursor-pointer transition-colors"
                    style={{ backgroundColor: currentTier.bgColor }}
                >
                    <span style={{ color: currentTier.color, fontWeight: 600 }}>{currentTier.label}</span>
                    <span style={{ color: currentTier.color }}>·</span>
                    <span style={{ color: '#868686', fontSize: 13 }}>{estimatedRank}</span>
                    <span style={{ color: '#868686' }}>RANK</span>
                    <span className="w-5 h-5 flex items-center justify-center" style={{ color: currentTier.color }}>
                        <ArrowRight className="w-5 h-5" />
                    </span>
                </button>
            </div>

            {!isOnline && (
                <div className="mt-3 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 mx-4">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs text-red-400 font-medium">You're offline — data is frozen</span>
                </div>
            )}

            <div className="px-4 mt-6">
                <div className="bg-[#ffffff0d] border-[1px] border-[#2d2d2e] rounded-lg p-4">
                    <div className="text-center mb-3">
                        <div className="text-lg font-medium">Hourly Reward</div>
                        <div className="text-sm text-[#868686]">Claim {REWARDS.MINING_PER_HOUR.toLocaleString()} PAWS every hour</div>
                    </div>
                    {timeRemaining > 0 ? (
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#007aff]">{formatTime(timeRemaining)}</div>
                            <div className="text-sm text-[#868686]">until next claim</div>
                        </div>
                    ) : (
                        <button
                            onClick={claimHourlyReward}
                            disabled={isClaiming || !isOnline}
                            className="w-full bg-[#007aff] text-white py-2 rounded-lg font-medium hover:bg-[#0056cc] transition-colors disabled:opacity-50"
                        >
                            {!isOnline ? 'Offline' : isClaiming ? 'Claiming...' : `Claim ${REWARDS.MINING_PER_HOUR.toLocaleString()} PAWS`}
                        </button>
                    )}
                </div>

                {/* Mining Speed Upgrade Button */}
                <button
                    onClick={() => setShowMiningShop(true)}
                    className="w-full mt-3 bg-gradient-to-r from-[#f59e0b] to-[#ef4444] text-white rounded-lg px-4 py-3 flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⚡</span>
                        <div className="text-left">
                            <div className="font-semibold">Boost Mining Speed</div>
                            <div className="text-xs text-white/80">Up to +100,000 PAWS/hr</div>
                        </div>
                    </div>
                    <ArrowRight className="w-6 h-6" />
                </button>
            </div>

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

                <button
                    onClick={() => setShowTokenomics(true)}
                    className="w-full bg-[#ffffff0d] border-[1px] border-[#2d2d2e] rounded-lg px-4 py-2 flex items-center justify-between mt-3 shine-effect"
                >
                    <div className="flex items-center gap-3 font-medium">
                        <Star className="w-8 h-8" />
                        <span>Tokenomics</span>
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                </button>

                {/* Airdrop Growth Banner */}
                <div className="mt-3 bg-gradient-to-r from-[#22c55e]/20 via-[#4c9ce2]/20 to-[#f59e0b]/20 border border-[#22c55e]/30 rounded-xl p-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#22c55e]/5 animate-pulse" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">🪂</span>
                            <span className="text-sm font-bold text-[#22c55e] uppercase tracking-wider">Airdrop Growth</span>
                            <div className="ml-auto text-[10px] text-[#868686]">2-month campaign</div>
                        </div>
                        <div className="text-lg font-bold text-[#fefefe]">{formatUserCount(airdropCount)} of {formatUserCount(AIRDROP_TARGET)} users</div>
                        <div className="text-xs text-[#d1d5db] mt-1">Live community growth toward the 2M user target</div>
                        <div className="mt-3 w-full bg-[#ffffff0d] rounded-full h-2.5 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-[#4c9ce2] to-[#22c55e]"
                                style={{ width: `${Math.min(100, Math.floor((airdropCount / AIRDROP_TARGET) * 100))}%` }}
                            />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-[#d1d5db]">
                            <span>Starting from 1.4M and growing to 2M</span>
                            <span>{Math.min(100, Math.floor((airdropCount / AIRDROP_TARGET) * 100))}%</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <AirdropEligibility />
                </div>

                <button 
                    onClick={() => setShowBuyMenu(!showBuyMenu)}
                    className="w-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] border border-[#22c55e] rounded-xl px-4 py-3 flex items-center justify-between mt-3"
                >
                    <div className="flex items-center gap-3 font-medium text-white">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <span>🪙</span>
                        </div>
                        <div>
                            <div className="font-bold">Token Pre-Sale</div>
                            <div className="text-xs text-white/80">Buy PAWS with TON</div>
                        </div>
                    </div>
                    <ArrowRight className={`w-6 h-6 text-white transition-transform ${showBuyMenu ? 'rotate-90' : ''}`} />
                </button>

                {showBuyMenu && (
                    <div className="mt-2 bg-[#151516] border border-[#22c55e]/30 rounded-2xl overflow-hidden">
                        {presaleSuccess ? (
                            <div className="p-8 text-center">
                                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center text-4xl mb-4 animate-bounce">
                                    ✓
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Purchase Successful!</h3>
                                <p className="text-gray-400">Your PAWS tokens have been credited</p>
                            </div>
                        ) : selectedPresale ? (
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-white">Complete Purchase</h3>
                                    <button onClick={() => setSelectedPresale(null)} className="w-8 h-8 rounded-full bg-[#2d2d2e] flex items-center justify-center text-gray-400">✕</button>
                                </div>

                                {(() => {
                                    const pkg = PRESALE_PACKAGES.find(p => p.id === selectedPresale)
                                    if (!pkg) return null
                                    return (
                                        <div className="bg-[#1f1f20] rounded-xl p-4 mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#007aff] to-[#0056cc] flex items-center justify-center text-2xl">🪙</div>
                                                <div>
                                                    <div className="font-bold text-white text-lg">{pkg.name}</div>
                                                    <div className="text-[#22c55e] text-xl font-bold">{pkg.priceTon} TON</div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })()}

                                <div className="mb-4">
                                    <label className="text-sm text-gray-400 block mb-2">Send {PRESALE_PACKAGES.find(p => p.id === selectedPresale)?.priceTon} TON to:</label>
                                    <div className="bg-[#1f1f20] rounded-xl p-3 break-all text-sm text-[#22c55e] font-mono">
                                        {PRESALE_RECEIVING_WALLET}
                                    </div>
                                    <button onClick={copyPresaleAddress} className="mt-2 text-[#007aff] text-xs flex items-center gap-1">
                                        {copied ? '✓ Copied!' : '📋 Copy Address'}
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <label className="text-sm text-gray-400 block mb-2">Transaction Hash (TX Hash)</label>
                                    <input
                                        type="text"
                                        value={presaleTxHash}
                                        onChange={(e) => setPresaleTxHash(e.target.value.trim())}
                                        placeholder="Paste your TON transaction hash here..."
                                        className="w-full bg-[#1f1f20] text-white rounded-xl px-4 py-3 text-sm border border-[#2d2d2e] focus:border-[#007aff] outline-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Find TX hash in your TON wallet after sending</p>
                                </div>

                                {presaleError && (
                                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
                                        ⚠️ {presaleError}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSelectedPresale(null)}
                                        className="flex-1 py-3 rounded-xl bg-[#2d2d2e] text-white font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            const pkg = PRESALE_PACKAGES.find(p => p.id === selectedPresale)
                                            if (pkg) handlePresalePurchase(pkg.id, pkg.amount)
                                        }}
                                        disabled={presaleProcessing || !presaleTxHash}
                                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-bold disabled:opacity-50"
                                    >
                                        {presaleProcessing ? 'Processing...' : 'Claim Tokens'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="bg-gradient-to-r from-[#22c55e]/20 to-transparent p-4 border-b border-[#2d2d2e]">
                                    <div className="text-sm text-gray-400 mb-1">Send TON to:</div>
                                    <div className="text-xs bg-[#1f1f20] p-2 rounded-lg break-all text-[#22c55e] font-mono">
                                        {PRESALE_RECEIVING_WALLET}
                                    </div>
                                    <button 
                                        onClick={copyPresaleAddress}
                                        className="mt-2 text-[#007aff] text-xs flex items-center gap-1"
                                    >
                                        {copied ? '✓ Copied!' : '📋 Copy Address'}
                                    </button>
                                </div>

                                <div className="p-3 bg-[#f59e0b]/10 border-b border-[#2d2d2e]">
                                    <div className="flex items-center gap-2 text-[#f59e0b] text-xs">
                                        <span>⚠️</span>
                                        <span>Pre-sale ends when hard cap is reached. Send exact TON amount.</span>
                                    </div>
                                </div>

                                {/* Package Table */}
                                <div className="p-3">
                                    <div className="bg-[#1f1f20] rounded-xl overflow-hidden border border-[#2d2d2e]">
                                        <div className="grid grid-cols-2 gap-px bg-[#2d2d2e]">
                                            <div className="bg-[#1f1f20] p-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">PAWS Amount</div>
                                            <div className="bg-[#1f1f20] p-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Approx. Value in TON</div>
                                            {PRESALE_PACKAGES.map((pkg) => (
                                                <button
                                                    key={pkg.id}
                                                    type="button"
                                                    onClick={() => setSelectedPresale(pkg.id)}
                                                    className="bg-[#151516] p-3 col-span-2 grid grid-cols-2 hover:bg-[#1f1f20] transition-colors active:scale-[0.99] border-b border-[#2d2d2e] last:border-b-0"
                                                >
                                                    <span className="text-sm font-semibold text-white">{pkg.name}</span>
                                                    <span className="text-sm font-bold text-[#22c55e] text-right">≈ {pkg.priceTon.toLocaleString()} TON</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-3 text-center text-[10px] text-gray-500">
                                        Select a package → Send exact TON → Enter TX Hash → Tokens credited instantly
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

            {showTokenomics && <TokenomicsModal onClose={() => setShowTokenomics(false)} />}
            {showMiningShop && <MiningUpgradeShop onClose={() => setShowMiningShop(false)} onPurchaseComplete={() => { refreshUser(); setShowMiningShop(false) }} />}
        </div>

            {/* Rank Modal */}
            {showRankModal && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70" onClick={() => setShowRankModal(false)}>
                    <div className="w-full max-w-md bg-black border-t border-[#2d2d2e] rounded-t-2xl animate-slide-up max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 pb-32">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold text-[#fefefe]">Your Rank</h2>
                                <button
                                    onClick={() => setShowRankModal(false)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center bg-[#151516] text-[#868686]"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="text-center mb-6">
                                <div className="text-5xl mb-2">{currentTier.icon}</div>
                                <div className="text-2xl font-bold" style={{ color: currentTier.color }}>{currentTier.label}</div>
                                <div className="text-sm text-[#868686] mt-1">Rank {estimatedRank} · {displayBalance.toLocaleString()} PAWS</div>
                            </div>

                            {nextTier && (
                                <div className="bg-[#ffffff0d] border border-[#2d2d2e] rounded-xl p-4 mb-5">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-[#868686]">Progress to {nextTier.label}</span>
                                        <span style={{ color: nextTier.color, fontWeight: 600 }}>{Math.floor(tierProgress)}%</span>
                                    </div>
                                    <div className="w-full bg-[#1f1f20] rounded-full h-2.5">
                                        <div
                                            className="h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${tierProgress}%`, backgroundColor: nextTier.color }}
                                        />
                                    </div>
                                    <div className="text-xs text-[#868686] mt-2">
                                        Need {(nextTier.minBalance - displayBalance).toLocaleString()} more PAWS
                                    </div>
                                </div>
                            )}

                            {!nextTier && (
                                <div className="bg-[#ffffff0d] border border-[#2d2d2e] rounded-xl p-4 mb-5 text-center">
                                    <div className="text-lg font-semibold text-[#ffd700]">🏆 Maximum Rank Achieved!</div>
                                    <div className="text-sm text-[#868686] mt-1">You are a Legend among PAWS holders.</div>
                                </div>
                            )}

                            <div className="text-sm font-semibold text-[#fefefe] mb-3">All Ranks</div>
                            <div className="space-y-2">
                                {RANK_TIERS.map((tier) => {
                                    const isCurrentTier = tier.label === currentTier.label
                                    const isUnlocked = displayBalance >= tier.minBalance
                                    return (
                                        <div
                                            key={tier.label}
                                            className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                                                isCurrentTier ? 'border-[2px]' : 'border border-[#2d2d2e]'
                                            }`}
                                            style={{
                                                backgroundColor: isCurrentTier ? tier.bgColor : '#151516',
                                                borderColor: isCurrentTier ? tier.color : undefined
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="text-xl">{tier.icon}</div>
                                                <div>
                                                    <div className="text-sm font-semibold" style={{ color: isUnlocked ? tier.color : '#555' }}>{tier.label}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {isCurrentTier && (
                                                    <div className="text-[10px] font-semibold mt-0.5" style={{ color: tier.color }}>CURRENT</div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            , document.body)}
        </div>
    )
}

export default HomeTab
