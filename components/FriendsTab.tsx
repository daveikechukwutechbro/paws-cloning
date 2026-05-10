'use client'

import { paws } from '@/images'
import Image from 'next/image'
import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { useUser } from '@/contexts/UserContext'
import { REFERRAL_TIERS, REFERRAL_REWARDS, getReferralStats, getFriendsList, claimTierReward, claimAllAvailableRewards, ReferralTier, formatReferralLink } from '@/utils/referralSystem'
import type { ReferralFriend, ReferralStats } from '@/utils/referralSystem'

const POLL_INTERVAL_MS = 15000
const BOT_USERNAME = 'Pawscloudminebot'

const tierColors: Record<string, { bg: string; text: string; gradient: string }> = {
    'Bronze': { bg: 'from-orange-700 to-amber-600', text: 'text-orange-400', gradient: 'border-orange-500/30 bg-orange-500/10' },
    'Silver': { bg: 'from-gray-400 to-gray-500', text: 'text-gray-300', gradient: 'border-gray-400/30 bg-gray-400/10' },
    'Gold': { bg: 'from-yellow-500 to-amber-500', text: 'text-yellow-400', gradient: 'border-yellow-500/30 bg-yellow-500/10' },
    'Diamond': { bg: 'from-cyan-400 to-blue-500', text: 'text-cyan-300', gradient: 'border-cyan-500/30 bg-cyan-500/10' },
    'Master': { bg: 'from-pink-500 to-purple-500', text: 'text-pink-400', gradient: 'border-pink-500/30 bg-pink-500/10' }
}

const FriendsTab = () => {
    const { user, refreshUser } = useUser()
    const [stats, setStats] = useState<ReferralStats | null>(null)
    const [friendsList, setFriendsList] = useState<ReferralFriend[]>([])
    const [showFriendsList, setShowFriendsList] = useState(false)
    const [claimingTier, setClaimingTier] = useState<number | null>(null)
    const [showShareModal, setShowShareModal] = useState(false)
    const [copyFeedback, setCopyFeedback] = useState<{[key: string]: boolean}>({})
    const [error, setError] = useState<string | null>(null)
    const [claimingAll, setClaimingAll] = useState(false)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const loadReferralData = useCallback(async () => {
        if (!user?.id) return
        try {
            setError(null)
            const [statsData, friends] = await Promise.all([
                getReferralStats(user.id),
                getFriendsList(user.id)
            ])
            setStats(statsData)
            setFriendsList(friends)
        } catch (err: any) {
            console.error('Error loading referral data:', err)
            setError(err.message || 'Failed to load referral data')
        }
    }, [user?.id])

    useEffect(() => {
        if (!user?.id) return
        loadReferralData()

        intervalRef.current = setInterval(loadReferralData, POLL_INTERVAL_MS)

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [user?.id, loadReferralData])

    useEffect(() => {
        if (!user?.id) return

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                loadReferralData()
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [user?.id, loadReferralData])

    const inviteLink = useMemo(() => {
        if (!user?.id) return ''
        return formatReferralLink(user.id, BOT_USERNAME)
    }, [user?.id])

    const shareViaTelegram = () => {
        if (!user?.id || !inviteLink) return
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent('Join PAWS and earn rewards! 🐾\nUse my link to get bonus tokens!')}`
        window.open(shareUrl, '_blank')
        setShowShareModal(false)
    }

    const shareViaNative = async () => {
        if (!inviteLink) return
        
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Join PAWS',
                    text: 'Join PAWS and earn rewards! 🐾',
                    url: inviteLink
                })
                setShowShareModal(false)
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                await copyInviteLink()
            }
        }
    }

    const copyInviteLink = async () => {
        if (!inviteLink) return
        
        try {
            await navigator.clipboard.writeText(inviteLink)
            setCopyFeedback(prev => ({ ...prev, 'invite-btn': true }))
            setTimeout(() => setCopyFeedback(prev => ({ ...prev, 'invite-btn': false })), 2000)
            setShowShareModal(false)
        } catch {
            setError('Failed to copy link')
        }
    }

    const handleClaimTier = async (tierLevel: number) => {
        if (!user?.id || claimingTier !== null) return
        setClaimingTier(tierLevel)
        setError(null)
        
        try {
            const result = await claimTierReward(user.id, tierLevel)
            if (result.success) {
                await refreshUser()
                await loadReferralData()
            } else {
                setError(result.error || 'Failed to claim reward')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to claim tier reward')
        } finally {
            setClaimingTier(null)
        }
    }

    const handleClaimAll = async () => {
        if (!user?.id || !stats || claimingAll) return
        setClaimingAll(true)
        setError(null)
        
        try {
            const result = await claimAllAvailableRewards(user.id)
            if (result.success && result.totalClaimed > 0) {
                await refreshUser()
                await loadReferralData()
            } else if (!result.success && result.error) {
                setError(result.error)
            }
        } catch (err: any) {
            setError(err.message || 'Failed to claim rewards')
        } finally {
            setClaimingAll(false)
        }
    }

    const formatTimeAgo = (timestamp: { toDate?: () => Date } | Date | number) => {
        if (!timestamp) return ''
        const now = new Date()
        const then = 'toDate' in timestamp && typeof timestamp.toDate === 'function' 
            ? timestamp.toDate() 
            : new Date(timestamp as Date | number)
        const diffMs = now.getTime() - then.getTime()
        const diffMins = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        
        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        return `${diffDays}d ago`
    }

    if (!user) {
        return (
            <div className="friends-tab-con px-4 pb-32 flex items-center justify-center min-h-[400px]">
                <div className="text-gray-400">Loading...</div>
            </div>
        )
    }

    return (
        <div className="friends-tab-con px-4 pb-32 transition-all duration-300">
            {/* Header */}
            <div className="pt-8">
                <h1 className="text-3xl font-bold mb-1">INVITE FRIENDS</h1>
                <p className="text-gray-400 text-lg">Get bonus for each friend</p>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                    <div className="text-sm text-red-400 flex items-center gap-2">
                        <span>⚠️</span>
                        {error}
                        <button onClick={() => setError(null)} className="ml-auto text-red-400">✕</button>
                    </div>
                </div>
            )}

            {/* Main Stats Card */}
            <div className="mt-6 bg-gradient-to-br from-[#1a1a2e] to-[#151516] border border-[#2d2d2e] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-sm text-[#8e8e93]">Your reward per friend</div>
                        <div className="text-2xl font-bold text-white">{REFERRAL_REWARDS.baseReward.toLocaleString()} PAWS</div>
                    </div>
                    {stats?.currentTier && (
                        <div className={`px-3 py-1.5 rounded-full text-sm font-bold text-black bg-gradient-to-br ${tierColors[stats.currentTier.label]?.bg || 'from-gray-500 to-gray-600'}`}>
                            {tierColors[stats.currentTier.label]?.icon || '⭐'} {stats.currentTier.label}
                        </div>
                    )}
                </div>

                {stats?.nextTier && (
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                            <span>{stats.totalFriends} / {stats.nextTier.requiredFriends} friends</span>
                            <span className={tierColors[stats.nextTier.label]?.text}>Next: {tierColors[stats.nextTier.label]?.icon} {stats.nextTier.label}</span>
                        </div>
                        <div className="w-full bg-[#2d2d2e] rounded-full h-2.5 overflow-hidden">
                            <div 
                                className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{ 
                                    width: `${stats.progressToNextTier}%`,
                                    background: `linear-gradient(90deg, ${tierColors[stats.nextTier.label]?.text || '#4c9ce2'}, ${tierColors[stats.nextTier.label]?.text || '#4c9ce2'}88)`
                                }}
                            />
                        </div>
                        <div className="text-xs text-[#8e8e93] mt-1.5 flex justify-between">
                            <span>Progress</span>
                            <span>+{stats.nextTier.bonusReward.toLocaleString()} PAWS bonus</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#1f1f20] p-3 rounded-xl text-center">
                        <div className="text-xs text-[#8e8e93]">Friends</div>
                        <div className="text-xl font-bold">{stats?.totalFriends || 0}</div>
                    </div>
                    <div className="bg-[#1f1f20] p-3 rounded-xl text-center">
                        <div className="text-xs text-[#8e8e93]">Premium</div>
                        <div className="text-xl font-bold text-cyan-400">{stats?.premiumFriends || 0}</div>
                    </div>
                    <div className="bg-[#1f1f20] p-3 rounded-xl text-center">
                        <div className="text-xs text-[#8e8e93]">Earnings</div>
                        <div className="text-xl font-bold text-blue-400">{stats?.totalEarnings.toLocaleString() || 0}</div>
                    </div>
                </div>
            </div>

            {/* Claimable Rewards */}
            {stats && stats.availableTierRewards.length > 0 && (
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-yellow-400">Claimable Rewards</div>
                        <button
                            onClick={handleClaimAll}
                            disabled={claimingAll}
                            className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full disabled:opacity-50"
                        >
                            {claimingAll ? 'Claiming...' : `Claim All (+${stats.claimableAmount.toLocaleString()})`}
                        </button>
                    </div>
                    <div className="space-y-2">
                        {stats.availableTierRewards.map(tier => {
                            const colors = tierColors[tier.label] || tierColors['Bronze']
                            return (
                                <button
                                    key={tier.level}
                                    onClick={() => handleClaimTier(tier.level)}
                                    disabled={claimingTier !== null}
                                    className={`w-full bg-gradient-to-r ${colors.gradient} border rounded-xl p-4 flex items-center justify-between active:scale-[0.99] transition-transform disabled:opacity-50`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-xl shadow-lg`}>
                                            {tier.icon}
                                        </div>
                                        <div className="text-left">
                                            <div className={`font-semibold ${colors.text}`}>{tier.label}</div>
                                            <div className="text-xs text-gray-400">{tier.requiredFriends} friends needed</div>
                                        </div>
                                    </div>
                                    <div className={`font-bold ${colors.text} text-lg`}>
                                        +{tier.bonusReward.toLocaleString()}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Special Bonuses */}
            <div className="mt-4 bg-[#151516] border border-[#2d2d2e] rounded-xl p-4">
                <div className="text-sm font-semibold mb-3 text-[#8e8e93]">Bonus Multipliers</div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between bg-[#1f1f20] p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">👑</span>
                            <div>
                                <div className="text-sm font-medium">Premium Friend</div>
                                <div className="text-xs text-[#8e8e93]">Telegram Premium user</div>
                            </div>
                        </div>
                        <div className="text-cyan-400 font-bold">+{REFERRAL_REWARDS.premiumFriendBonus.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Friends List */}
            <div className="mt-4">
                <button
                    onClick={() => setShowFriendsList(!showFriendsList)}
                    className="w-full bg-[#151516] border border-[#2d2d2e] rounded-xl p-4 flex items-center justify-between"
                >
                    <div className="text-left">
                        <div className="text-sm font-semibold">Your Friends</div>
                        <div className="text-xs text-[#8e8e93]">{friendsList.length} friends joined</div>
                    </div>
                    <div className={`w-6 h-6 rounded-full bg-[#2d2d2e] flex items-center justify-center text-xs transition-transform ${showFriendsList ? 'rotate-180' : ''}`}>
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
                                            {friend.isPremium ? '👑' : '👤'}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">{friend.username}</div>
                                            <div className="text-xs text-[#8e8e93]">{formatTimeAgo(friend.joinedAt)}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-green-400 font-medium">+{friend.bonusEarned.toLocaleString()}</div>
                                        {friend.isPremium && <div className="text-[10px] text-cyan-400">Premium</div>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-[#1f1f20] rounded-xl p-8 text-center">
                                <Image src={paws} alt="Paws" width={80} height={60} className="mx-auto mb-3 opacity-50" />
                                <p className="text-[#8e8e93] text-sm">No friends yet. Start inviting!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Invite Link */}
            <div className="mt-4 bg-[#151516] border border-[#2d2d2e] rounded-xl p-4">
                <div className="text-xs text-[#8e8e93] mb-2">Your invite link</div>
                <div className="text-xs break-all bg-[#1f1f20] p-3 rounded-lg text-white font-mono">
                    {inviteLink || 'Generating...'}
                </div>
                <button
                    onClick={async () => {
                        if (inviteLink) {
                            await navigator.clipboard.writeText(inviteLink)
                            setCopyFeedback(prev => ({ ...prev, 'copy-btn': true }))
                            setTimeout(() => setCopyFeedback(prev => ({ ...prev, 'copy-btn': false })), 2000)
                        }
                    }}
                    disabled={!inviteLink}
                    className={`mt-3 w-full text-white py-3 rounded-xl disabled:opacity-50 transition-all active:scale-[0.98] ${
                        copyFeedback['copy-btn'] ? 'bg-green-600' : 'bg-[#2d2d2e]'
                    }`}
                >
                    {copyFeedback['copy-btn'] ? '✓ Copied!' : 'Copy Invite Link'}
                </button>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70" onClick={() => setShowShareModal(false)}>
                    <div className="w-full max-w-md bg-[#1c1c1e] rounded-t-3xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Share Invite Link</h3>
                            <button onClick={() => setShowShareModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2d2d2e]">✕</button>
                        </div>
                        
                        <div className="space-y-3">
                            <button
                                onClick={shareViaTelegram}
                                className="w-full flex items-center gap-4 bg-[#2d89ef] text-white p-4 rounded-xl active:scale-[0.98] transition-transform"
                            >
                                <div className="text-2xl">📨</div>
                                <div className="text-left">
                                    <div className="font-semibold">Share via Telegram</div>
                                    <div className="text-xs opacity-80">Send to friends or groups</div>
                                </div>
                            </button>

                            <button
                                onClick={shareViaNative}
                                className="w-full flex items-center gap-4 bg-[#2d2d2e] text-white p-4 rounded-xl active:scale-[0.98] transition-transform"
                            >
                                <div className="text-2xl">📤</div>
                                <div className="text-left">
                                    <div className="font-semibold">More Options</div>
                                    <div className="text-xs text-gray-400">Share to other apps</div>
                                </div>
                            </button>

                            <button
                                onClick={copyInviteLink}
                                className="w-full flex items-center gap-4 bg-[#2d2d2e] text-white p-4 rounded-xl active:scale-[0.98] transition-transform"
                            >
                                <div className="text-2xl">📋</div>
                                <div className="text-left">
                                    <div className="font-semibold">Copy Link</div>
                                    <div className="text-xs text-gray-400">Copy to clipboard</div>
                                </div>
                            </button>
                        </div>

                        <div className="mt-4 bg-[#1f1f20] p-3 rounded-lg">
                            <div className="text-xs text-[#8e8e93] mb-1">Your unique link:</div>
                            <div className="text-xs break-all text-white font-mono">{inviteLink}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Fixed Invite Button */}
            <div className="fixed bottom-[80px] left-0 right-0 py-4 flex justify-center bg-gradient-to-t from-black via-black/95 to-transparent">
                <div className="w-full max-w-md px-4">
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="w-full text-white py-4 rounded-xl text-lg font-bold active:scale-[0.98] transition-transform shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-500 to-blue-600"
                    >
                        Invite a Friend 🐾
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FriendsTab