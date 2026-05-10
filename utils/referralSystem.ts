import { db } from '@/utils/firebaseClient'
import { doc, getDoc, setDoc, increment, collection, query, orderBy, limit, getDocs, updateDoc, arrayUnion, Timestamp, runTransaction, where } from 'firebase/firestore'

export interface ReferralTier {
    level: number
    requiredFriends: number
    bonusReward: number
    label: string
    icon: string
}

export interface ReferralFriend {
    id: string
    username: string
    isPremium: boolean
    joinedAt: Timestamp
    bonusEarned: number
    tasksCompleted: number
    lastActiveAt?: Timestamp
}

export interface ReferralStats {
    totalFriends: number
    premiumFriends: number
    totalEarnings: number
    currentTier: ReferralTier | null
    nextTier: ReferralTier | null
    progressToNextTier: number
    availableTierRewards: ReferralTier[]
    claimableAmount: number
}

export const REFERRAL_TIERS: ReferralTier[] = [
    { level: 1, requiredFriends: 3, bonusReward: 5000, label: 'Bronze', icon: '🥉' },
    { level: 2, requiredFriends: 10, bonusReward: 15000, label: 'Silver', icon: '🥈' },
    { level: 3, requiredFriends: 25, bonusReward: 50000, label: 'Gold', icon: '🥇' },
    { level: 4, requiredFriends: 50, bonusReward: 150000, label: 'Diamond', icon: '💎' },
    { level: 5, requiredFriends: 100, bonusReward: 500000, label: 'Master', icon: '👑' }
]

export const REFERRAL_REWARDS = {
    baseReward: 5000,
    premiumFriendBonus: 25000,
    friendTaskCompletionBonus: 2500,
    friendMiningBonus: 1000
}

const ANTI_FRAUD = {
    maxReferralsPerHour: 10,
    maxReferralsPerDay: 50,
    minBalanceRequired: 1000,
    requireMinimumActivity: false
}

interface UserReferralData {
    id: string
    referralCode: string
    referredBy?: string
    referralCount: number
    premiumReferralCount: number
    referralEarnings: number
    balance?: number
    tierLevel: number
    tierRewardsClaimed: number[]
    friendsList: ReferralFriend[]
    referralRewardClaimed: boolean
    lastReferralAt?: Timestamp
    referralHourlyCount?: number
    referralDailyCount?: number
    lastReferralHourReset?: number
    lastReferralDayReset?: number
    created_at?: string
    username?: string
}

function canProcessReferral(userData: UserReferralData): { allowed: boolean; reason?: string } {
    if (ANTI_FRAUD.maxReferralsPerDay > 0 && userData.referralDailyCount >= ANTI_FRAUD.maxReferralsPerDay) {
        return { allowed: false, reason: 'Daily referral limit reached' }
    }
    
    if (ANTI_FRAUD.maxReferralsPerHour > 0 && userData.referralHourlyCount >= ANTI_FRAUD.maxReferralsPerHour) {
        return { allowed: false, reason: 'Hourly referral limit reached' }
    }
    
    return { allowed: true }
}

function shouldResetCounters(currentTime: number, lastReset: number, intervalMs: number): boolean {
    return currentTime - lastReset >= intervalMs
}

function getNewCounterValues(currentHourlyCount: number, currentDailyCount: number, currentHourlyReset: number, currentDailyReset: number): {
    hourlyCount: number
    dailyCount: number
    hourlyReset: number
    dailyReset: number
} {
    const now = Date.now()
    const hourMs = 60 * 60 * 1000
    const dayMs = 24 * hourMs
    
    let newHourlyCount = currentHourlyCount
    let newDailyCount = currentDailyCount
    let newHourlyReset = currentHourlyReset
    let newDailyReset = currentDailyReset
    
    if (shouldResetCounters(now, currentHourlyReset, hourMs)) {
        newHourlyCount = 0
        newHourlyReset = now
    }
    
    if (shouldResetCounters(now, currentDailyReset, dayMs)) {
        newDailyCount = 0
        newDailyReset = now
    }
    
    return { hourlyCount: newHourlyCount, dailyCount: newDailyCount, hourlyReset: newHourlyReset, dailyReset: newDailyReset }
}

export async function processNewReferral(
    inviterId: string,
    newUserId: string,
    username: string,
    isPremium: boolean = false
): Promise<{ success: boolean; error?: string }> {
    if (!inviterId || !newUserId) {
        return { success: false, error: 'Invalid user IDs' }
    }
    
    if (inviterId === newUserId) {
        return { success: false, error: 'Cannot refer yourself' }
    }
    
    const inviterRef = doc(db, 'users', inviterId)

    try {
        await runTransaction(db, async (transaction) => {
            const inviterSnap = await transaction.get(inviterRef)
            
            if (!inviterSnap.exists()) {
                throw new Error('Inviter not found')
            }

            const inviterData = inviterSnap.data() as UserReferralData
            
            const fraudCheck = canProcessReferral(inviterData)
            if (!fraudCheck.allowed) {
                throw new Error(fraudCheck.reason || 'Referral not allowed')
            }

            const friendsList = inviterData.friendsList || []
            const alreadyReferred = friendsList.some(f => f.id === newUserId)
            if (alreadyReferred) {
                throw new Error('User already referred')
            }

            if (inviterData.referredBy === newUserId) {
                throw new Error('Cannot create circular referral')
            }

            const now = Date.now()
            const counters = getNewCounterValues(
                inviterData.referralHourlyCount || 0,
                inviterData.referralDailyCount || 0,
                inviterData.lastReferralHourReset || 0,
                inviterData.lastReferralDayReset || 0
            )

            const baseReward = REFERRAL_REWARDS.baseReward
            const premiumBonus = isPremium ? REFERRAL_REWARDS.premiumFriendBonus : 0
            const totalReward = baseReward + premiumBonus

            const newFriend: ReferralFriend = {
                id: newUserId,
                username: username || 'User',
                isPremium,
                joinedAt: Timestamp.now(),
                bonusEarned: totalReward,
                tasksCompleted: 0,
                lastActiveAt: Timestamp.now()
            }

            const updatedFriendsList = [newFriend, ...friendsList].slice(0, 200)

            const currentTierLevel = inviterData.tierLevel || 0
            let newTierLevel = currentTierLevel
            let bonusReward = 0
            let newClaimedTiers = inviterData.tierRewardsClaimed || []

            for (const tier of REFERRAL_TIERS) {
                const newReferralCount = (inviterData.referralCount || 0) + 1
                if (newReferralCount >= tier.requiredFriends && tier.level > currentTierLevel) {
                    if (!newClaimedTiers.includes(tier.level)) {
                        newTierLevel = tier.level
                        bonusReward = tier.bonusReward
                        newClaimedTiers = [...newClaimedTiers, tier.level]
                    }
                }
            }

            const updateData: Record<string, any> = {
                referralCount: increment(1),
                premiumReferralCount: isPremium ? increment(1) : increment(0),
                referralEarnings: increment(totalReward),
                balance: increment(totalReward + bonusReward),
                friendsList: updatedFriendsList,
                lastReferralAt: Timestamp.now(),
                referralHourlyCount: increment(1),
                referralDailyCount: increment(1),
                lastReferralHourReset: counters.hourlyReset,
                lastReferralDayReset: counters.dailyReset,
            }

            if (bonusReward > 0) {
                updateData.tierLevel = newTierLevel
                updateData.tierRewardsClaimed = newClaimedTiers
            }

            transaction.update(inviterRef, updateData)
        })

        return { success: true }
    } catch (error: any) {
        console.error('Transaction failed processing referral:', error)
        return { success: false, error: error.message || 'Failed to process referral' }
    }
}

export async function getReferralStats(userId: string): Promise<ReferralStats> {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
        return {
            totalFriends: 0,
            premiumFriends: 0,
            totalEarnings: 0,
            currentTier: null,
            nextTier: REFERRAL_TIERS[0],
            progressToNextTier: 0,
            availableTierRewards: [],
            claimableAmount: 0
        }
    }

    const userData = userSnap.data() as UserReferralData
    const currentTier = REFERRAL_TIERS.find(t => t.level === userData.tierLevel) || null
    
    const currentTierIndex = currentTier ? REFERRAL_TIERS.indexOf(currentTier) : -1
    const nextTier = currentTierIndex < REFERRAL_TIERS.length - 1 ? REFERRAL_TIERS[currentTierIndex + 1] : null
    
    let progressToNextTier = 0
    if (nextTier && currentTier) {
        const prevRequired = currentTier.requiredFriends
        const progress = userData.referralCount - prevRequired
        const range = nextTier.requiredFriends - prevRequired
        progressToNextTier = Math.min(100, Math.max(0, (progress / range) * 100))
    } else if (currentTier && !nextTier) {
        progressToNextTier = 100
    }
    
    const claimedTiers = userData.tierRewardsClaimed || []
    const availableTierRewards = REFERRAL_TIERS.filter(tier => 
        userData.referralCount >= tier.requiredFriends && 
        !claimedTiers.includes(tier.level)
    )
    
    let claimableAmount = 0
    for (const tier of availableTierRewards) {
        claimableAmount += tier.bonusReward
    }

    return {
        totalFriends: userData.referralCount || 0,
        premiumFriends: userData.premiumReferralCount || 0,
        totalEarnings: userData.referralEarnings || 0,
        currentTier,
        nextTier,
        progressToNextTier,
        availableTierRewards,
        claimableAmount
    }
}

export async function getFriendsList(userId: string): Promise<ReferralFriend[]> {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) return []

    const userData = userSnap.data() as UserReferralData
    return (userData.friendsList || []).sort((a, b) => {
        const aTime = a.joinedAt?.toMillis() || 0
        const bTime = b.joinedAt?.toMillis() || 0
        return bTime - aTime
    })
}

export async function claimTierReward(userId: string, tierLevel: number): Promise<{ success: boolean; error?: string }> {
    const tier = REFERRAL_TIERS.find(t => t.level === tierLevel)
    if (!tier) {
        return { success: false, error: 'Invalid tier' }
    }

    const userRef = doc(db, 'users', userId)

    try {
        const result = await runTransaction(db, async (transaction) => {
            const userSnap = await transaction.get(userRef)
            
            if (!userSnap.exists()) {
                throw new Error('User not found')
            }

            const userData = userSnap.data() as UserReferralData
            const claimedTiers = userData.tierRewardsClaimed || []
            
            if (userData.referralCount < tier.requiredFriends) {
                throw new Error(`Need ${tier.requiredFriends} friends to claim ${tier.label}`)
            }
            
            if (claimedTiers.includes(tierLevel)) {
                throw new Error('Tier already claimed')
            }

            transaction.update(userRef, {
                tierLevel: tierLevel,
                tierRewardsClaimed: arrayUnion(tierLevel),
                balance: increment(tier.bonusReward),
                referralEarnings: increment(tier.bonusReward)
            })

            return true
        })

        return { success: !!result }
    } catch (error: any) {
        console.error('Transaction failed claiming tier reward:', error)
        return { success: false, error: error.message || 'Failed to claim reward' }
    }
}

export async function claimAllAvailableRewards(userId: string): Promise<{ success: boolean; totalClaimed: number; error?: string }> {
    try {
        const stats = await getReferralStats(userId)
        
        if (stats.availableTierRewards.length === 0) {
            return { success: false, totalClaimed: 0, error: 'No rewards available' }
        }

        let totalClaimed = 0
        for (const tier of stats.availableTierRewards) {
            const result = await claimTierReward(userId, tier.level)
            if (result.success) {
                totalClaimed += tier.bonusReward
            }
        }

        return { success: true, totalClaimed, error: undefined }
    } catch (error: any) {
        return { success: false, totalClaimed: 0, error: error.message }
    }
}

export async function updateFriendActivity(userId: string, friendId: string, tasksCompleted: number = 0): Promise<void> {
    const userRef = doc(db, 'users', userId)
    
    try {
        await runTransaction(db, async (transaction) => {
            const userSnap = await transaction.get(userRef)
            
            if (!userSnap.exists()) return

            const userData = userSnap.data() as UserReferralData
            const friendsList = userData.friendsList || []
            
            const friendIndex = friendsList.findIndex(f => f.id === friendId)
            if (friendIndex === -1) return

            friendsList[friendIndex] = {
                ...friendsList[friendIndex],
                tasksCompleted: friendsList[friendIndex].tasksCompleted + tasksCompleted,
                lastActiveAt: Timestamp.now()
            }

            let bonusEarned = 0
            if (tasksCompleted > 0) {
                bonusEarned = REFERRAL_REWARDS.friendTaskCompletionBonus * tasksCompleted
            }

            transaction.update(userRef, {
                friendsList,
                ...(bonusEarned > 0 ? {
                    balance: increment(bonusEarned),
                    referralEarnings: increment(bonusEarned)
                } : {})
            })
        })
    } catch (error) {
        console.error('Error updating friend activity:', error)
    }
}

export function formatReferralLink(userId: string, botUsername: string = 'Pawscloudminebot'): string {
    const cleanId = userId.replace(/^(tg_|user_)/, '')
    return `https://t.me/${botUsername}?start=${encodeURIComponent(cleanId)}`
}

export function parseReferralCode(code: string): string {
    if (!code) return ''
    
    if (code.startsWith('tg_') || code.startsWith('user_')) {
        return code
    }
    
    if (/^\d+$/.test(code)) {
        return `tg_${code}`
    }
    
    return code
}
