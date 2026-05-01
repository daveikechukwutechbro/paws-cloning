'use client'

import { paws } from '@/images'
import Image from 'next/image'
import { useMemo, useState, useEffect, useCallback } from 'react'
import { useUser } from '@/contexts/UserContext'
import { REFERRAL_TIERS, REFERRAL_REWARDS, getReferralStats, getFriendsList, claimTierReward } from '@/utils/referralSystem'
import type { ReferralFriend, ReferralTier } from '@/utils/referralSystem'

const tierColors: Record<string, string> = {
    'Bronze': '#cd7f32',
    'Silver': '#c0c0c0',
    'Gold': '#ffd700',
    'Diamond': '#b9f2ff',
    'Master': '#ff00ff'
}

const FriendsTab = () => {
    const { user, refreshUser } = useUser()
    const [friendsList, setFriendsList] = useState<ReferralFriend[]>([])
    const [currentTier, setCurrentTier] = useState<ReferralTier | null>(null)
    const [nextTier, setNextTier] = useState<ReferralTier | null>(null)
    const [progress, setProgress] = useState(0)
    const [showFriendsList, setShowFriendsList] = useState(false)
    const [claimingTier, setClaimingTier] = useState<number | null>(null)
    const [showShareModal, setShowShareModal] = useState(false)
    const [copyFeedback, setCopyFeedback] = useState<{[key: string]: boolean}>({})

    const loadReferralData = useCallback(async () => {
        if (!user?.id) return
        try {
            const stats = await getReferralStats(user.id)
            setCurrentTier(stats.currentTier)
            setNextTier(stats.nextTier)
            setProgress(stats.progressToNextTier)

            const friends = await getFriendsList(user.id)
            setFriendsList(friends.sort((a, b) => b.joinedAt.toMillis() - a.joinedAt.toMillis()))
        } catch (error) {
            console.error('Error loading referral data:', error)
        }
    }, [user?.id])

    useEffect(() => {
        if (!user?.id) return
        loadReferralData()
        const interval = setInterval(loadReferralData, 5000)
        return () => clearInterval(interval)
    }, [user?.id, loadReferralData])

    useEffect(() => {
        if (!user?.id) return
        const interval = setInterval(() => refreshUser(), 8000)
        return () => clearInterval(interval)
    }, [user?.id, refreshUser])

    const directInviteLink = useMemo(() => {
        if (!user?.id) return ''
        const cleanId = user.id.replace('tg_', '').replace('user_', '')
        const encodedRef = encodeURIComponent(cleanId)
        return `https://t.me/Pawscloudminebot?start=${encodedRef}`
    }, [user?.id])

    const handleInvite = () => {
        setShowShareModal(true)
    }

    const shareViaTelegram = () => {
        if (!user?.id) return
        const refCode = user.id.replace('tg_', '').replace('user_', '')
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(`https://t.me/Pawscloudminebot?start=${refCode}`)}&text=${encodeURIComponent('Join PAWS and earn rewards! 🐾\nUse my link to get bonus tokens!')}`
        window.open(shareUrl, '_blank')
        setShowShareModal(false)
    }

    const shareViaNative = async () => {
        if (!user?.id) return
        const refCode = user.id.replace('tg_', '').replace('user_', '')
        const link = `https://t.me/Pawscloudminebot?start=${refCode}`
        
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Join PAWS',
                    text: 'Join PAWS and earn rewards! 🐾',
                    url: link
                })
                setShowShareModal(false)
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') return
            await copyInviteLink()
        }
    }

    const copyInviteLink = async () => {
        if (!user?.id) return
        const refCode = user.id.replace('tg_', '').replace('user_', '')
        const link = `https://t.me/Pawscloudminebot?start=${refCode}`
        
        try {
            await navigator.clipboard.writeText(link)
            setCopyFeedback(prev => ({ ...prev, 'invite-btn': true }))
            setTimeout(() => setCopyFeedback(prev => ({ ...prev, 'invite-btn': false })), 2000)
            setShowShareModal(false)
        } catch {
            alert('Failed to copy link')
        }
    }

    const copyLink = async () => {
        if (!user?.id) return
        const refCode = user.id.replace('tg_', '').replace('user_', '')
        const link = `https://t.me/Pawscloudminebot?start=${refCode}`
        
        try {
            await navigator.clipboard.writeText(link)
            setCopyFeedback(prev => ({ ...prev, 'copy-btn': true }))
            setTimeout(() => setCopyFeedback(prev => ({ ...prev, 'copy-btn': false })), 2000)
        } catch {
            alert('Failed to copy link')
        }
    }

    const handleClaimTier = async (tierLevel: number) => {
        if (!user?.id) return
        setClaimingTier(tierLevel)
        try {
            const success = await claimTierReward(user.id, tierLevel)
            if (success) {
                await refreshUser()
                await loadReferralData()
            }
        } catch (error) {
            console.error('Error claiming tier reward:', error)
        } finally {
            setClaimingTier(null)
        }
    }

    const availableTiers = REFERRAL_TIERS.filter(tier => {
        const refCount = user?.referralCount || 0
        const claimed = user?.tierRewardsClaimed || []
        return refCount >= tier.requiredFriends && !claimed.includes(tier.level)
    })

    const formatTimeAgo = (timestamp: { toDate?: () => Date } | Date | number) => {
        if (!timestamp) return ''
        const now = new Date()
        const then = (timestamp as { toDate?: () => Date }).toDate 
            ? (timestamp as { toDate: () => Date }).toDate() 
            : new Date(timestamp as Date | number)
        const diffMs = now.getTime() - then.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        
        if (diffHours < 1) return 'Just now'
        if (diffHours < 24) return `${diffHours}h ago`
        return `${diffDays}d ago`
    }

    const refCount = user?.referralCount || 0
    const premiumCount = user?.premiumReferralCount || 0
    const earnings = user?.referralEarnings || 0

    return (
        <div className="friends-tab-con px-4 pb-32 transition-all duration-300">
            <div className="pt-8">
                <h1 className="text-3xl font-bold mb-1">INVITE FRIENDS</h1>
                <p className="text-gray-400 text-lg">Get bonus for each friend</p>
            </div>

            <div className="mt-6 bg-gradient-to-br from-[#1a1a2e] to-[#151516] border border-[#2d2d2e] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-sm text-[#8e8e93]">Your reward</div>
                        <div className="text-2xl font-bold text-white">{REFERRAL_REWARDS.baseReward.toLocaleString()} PAWS</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${currentTier ? 'text-black' : 'text-gray-400'}`}
                        style={{ backgroundColor: currentTier ? (tierColors[currentTier.label] || '#4c9ce2') : '#2d2d2e' }}>
                        {currentTier?.label || 'No Tier'}
                    </div>
                </div>

                {nextTier && (
                    <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>{refCount} / {nextTier.requiredFriends} friends</span>
                            <span>Next: {nextTier.label}</span>
                        </div>
                        <div className="w-full bg-[#2d2d2e] rounded-full h-2">
                            <div 
                                className="h-2 rounded-full transition-all duration-500"
                                style={{ 
                                    width: `${progress}%`,
                                    backgroundColor: tierColors[nextTier.label] || '#4c9ce2'
                                }}
                            />
                        </div>
                        <div className="text-xs text-[#8e8e93] mt-1">
                            +{nextTier.bonusReward.toLocaleString()} PAWS bonus
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-[#1f1f20] p-3 rounded-xl">
                        <div className="text-xs text-[#8e8e93]">Friends</div>
                        <div className="text-xl font-bold">{refCount}</div>
                    </div>
                    <div className="bg-[#1f1f20] p-3 rounded-xl">
                        <div className="text-xs text-[#8e8e93]">Premium</div>
                        <div className="text-xl font-bold text-[#b9f2ff]">{premiumCount}</div>
                    </div>
                    <div className="bg-[#1f1f20] p-3 rounded-xl col-span-2">
                        <div className="text-xs text-[#8e8e93]">Total Earnings</div>
                        <div className="text-xl font-bold text-[#4c9ce2]">{earnings.toLocaleString()} PAWS</div>
                    </div>
                </div>
            </div>

            {availableTiers.length > 0 && (
                <div className="mt-4">
                    <div className="text-sm font-semibold mb-2 text-[#ffd700]">Claimable Rewards</div>
                    <div className="space-y-2">
                        {availableTiers.map(tier => (
                            <button
                                key={tier.level}
                                onClick={() => handleClaimTier(tier.level)}
                                disabled={claimingTier === tier.level}
                                className="w-full bg-[#1f1f20] border border-[#ffd700]/30 rounded-xl p-3 flex items-center justify-between active:scale-98 transition-transform"
                            >
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black"
                                        style={{ backgroundColor: tierColors[tier.label] }}
                                    >
                                        {tier.level}
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold">{tier.label}</div>
                                        <div className="text-xs text-[#8e8e93]">{tier.requiredFriends} friends</div>
                                    </div>
                                </div>
                                <div className="text-[#ffd700] font-bold">
                                    +{tier.bonusReward.toLocaleString()}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-4 bg-[#151516] border border-[#2d2d2e] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold">Special Bonuses</div>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between bg-[#1f1f20] p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">⭐</span>
                            <div>
                                <div className="text-sm font-medium">Premium Friend</div>
                                <div className="text-xs text-[#8e8e93]">Extra bonus for Telegram Premium</div>
                            </div>
                        </div>
                        <div className="text-[#b9f2ff] font-bold">+{REFERRAL_REWARDS.premiumFriendBonus.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <button
                    onClick={() => setShowFriendsList(!showFriendsList)}
                    className="w-full bg-[#151516] border border-[#2d2d2e] rounded-xl p-4 flex items-center justify-between"
                >
                    <div className="text-left">
                        <div className="text-sm font-semibold">Your Friends</div>
                        <div className="text-xs text-[#8e8e93]">{friendsList.length} friends joined</div>
                    </div>
                    <div className={`transform transition-transform ${showFriendsList ? 'rotate-180' : ''}`}>
                        ▼
                    </div>
                </button>

                {showFriendsList && (
                    <div className="mt-2 space-y-2">
                        {friendsList.length > 0 ? (
                            friendsList.map(friend => (
                                <div key={friend.id} className="bg-[#1f1f20] rounded-xl p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#2d2d2e] rounded-full flex items-center justify-center text-lg">
                                            {friend.isPremium ? '⭐' : '👤'}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">{friend.username}</div>
                                            <div className="text-xs text-[#8e8e93]">{formatTimeAgo(friend.joinedAt)}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-[#4c9ce2]">
                                        +{friend.bonusEarned.toLocaleString()}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-[#1f1f20] rounded-xl p-8 text-center">
                                <Image
                                    src={paws}
                                    alt="Paws"
                                    width={80}
                                    height={60}
                                    className="mx-auto mb-3 opacity-50"
                                />
                                <p className="text-[#8e8e93] text-sm">No friends yet. Invite someone!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-4 bg-[#151516] border border-[#2d2d2e] rounded-xl p-4">
                <div className="text-sm text-[#8e8e93] mb-2">Your invite link</div>
                <div className="text-xs break-all bg-[#1f1f20] p-3 rounded-lg text-white font-mono">
                    {directInviteLink || 'Generating...'}
                </div>
                <button
                    id="copy-btn"
                    onClick={copyLink}
                    disabled={!directInviteLink}
                    className={`mt-3 w-full text-white py-3 rounded-xl disabled:opacity-50 active:scale-98 transition-transform ${
                        copyFeedback['copy-btn'] ? 'bg-green-600' : 'bg-[#2d2d2e]'
                    }`}
                >
                    {copyFeedback['copy-btn'] ? 'Copied!' : 'Copy Link'}
                </button>
            </div>

            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={() => setShowShareModal(false)}>
                    <div className="w-full max-w-md bg-[#1c1c1e] rounded-t-3xl p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Share Invite Link</h3>
                            <button onClick={() => setShowShareModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2d2d2e]">✕</button>
                        </div>
                        
                        <div className="space-y-3">
                            <button
                                onClick={shareViaTelegram}
                                className="w-full flex items-center gap-4 bg-[#2d89ef] text-white p-4 rounded-xl active:scale-98 transition-transform"
                            >
                                <div className="text-2xl">📨</div>
                                <div className="text-left">
                                    <div className="font-semibold">Share via Telegram</div>
                                    <div className="text-xs opacity-80">Send to friends or groups</div>
                                </div>
                            </button>

                            <button
                                onClick={shareViaNative}
                                className="w-full flex items-center gap-4 bg-[#2d2d2e] text-white p-4 rounded-xl active:scale-98 transition-transform"
                            >
                                <div className="text-2xl">📤</div>
                                <div className="text-left">
                                    <div className="font-semibold">More Options</div>
                                    <div className="text-xs text-gray-400">Share to other apps</div>
                                </div>
                            </button>

                            <button
                                onClick={copyInviteLink}
                                className="w-full flex items-center gap-4 bg-[#2d2d2e] text-white p-4 rounded-xl active:scale-98 transition-transform"
                            >
                                <div className="text-2xl">📋</div>
                                <div className="text-left">
                                    <div className="font-semibold">Copy Link</div>
                                    <div className="text-xs text-gray-400">Copy to clipboard</div>
                                </div>
                            </button>
                        </div>

                        <div className="mt-6 bg-[#1f1f20] p-3 rounded-lg">
                            <div className="text-xs text-[#8e8e93] mb-1">Your unique link:</div>
                            <div className="text-xs break-all text-white font-mono">{directInviteLink}</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed bottom-[80px] left-0 right-0 py-4 flex justify-center bg-gradient-to-t from-black via-black to-transparent">
                <div className="w-full max-w-md px-4">
                    <button
                        id="invite-btn"
                        onClick={handleInvite}
                        className={`w-full text-white py-4 rounded-xl text-lg font-bold active:scale-98 transition-transform shadow-lg shadow-[#4c9ce2]/20 ${
                            copyFeedback['invite-btn'] ? 'bg-green-600' : 'bg-[#4c9ce2]'
                        }`}
                    >
                        {copyFeedback['invite-btn'] ? 'Copied!' : 'Invite a Friend'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FriendsTab
