import { db } from '@/utils/firebaseClient'
import { doc, getDoc, increment, collection, query, getDocs, updateDoc, arrayUnion, Timestamp, runTransaction, where } from 'firebase/firestore'

export type ReferralStatus = 'pending' | 'qualified' | 'rewarded' | 'rejected'

export interface Referral {
    id: string
    referrerId: string
    referredId: string
    referralCode: string
    status: ReferralStatus
    rewardAmount: number
    source: 'telegram' | 'web' | 'app' | 'unknown'
    createdAt: Timestamp
    qualifiedAt?: Timestamp
    rewardedAt?: Timestamp
    rejectedAt?: Timestamp
    rejectionReason?: string
}

export interface RewardLedgerEntry {
    id: string
    userId: string
    referralId: string
    eventType: 'referral_reward' | 'referral_signup_bonus' | 'tier_bonus' | 'friend_task_bonus'
    amount: number
    status: 'completed' | 'failed'
    idempotencyKey: string
    createdAt: Timestamp
    errorMessage?: string
}

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

export interface ReferrerStats {
    totalReferrals: number
    pendingReferrals: number
    qualifiedReferrals: number
    rewardedReferrals: number
    rejectedReferrals: number
    totalEarnings: number
    totalFriends: number
    premiumFriends: number
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
    friendMiningBonus: 1000,
    referredSignupBonus: 2000,
}

const ANTI_FRAUD = {
    maxReferralsPerHour: 10,
    maxReferralsPerDay: 50,
    minBalanceRequired: 1000,
}

const REFERAL_DOC_PREFIX = 'ref_'
const REWARD_LEDGER_PREFIX = 'reward_'

function generateIdempotencyKey(userId: string, eventType: string, nonce: string): string {
    return `${eventType}_${userId}_${nonce}`
}

function generateDocId(prefix: string, id: string): string {
    return `${prefix}${id}`
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
    completedTasks?: string[]
}

function canProcessReferral(userData: UserReferralData): { allowed: boolean; reason?: string } {
    if (ANTI_FRAUD.maxReferralsPerDay > 0 && (userData.referralDailyCount || 0) >= ANTI_FRAUD.maxReferralsPerDay) {
        return { allowed: false, reason: 'Daily referral limit reached' }
    }

    if (ANTI_FRAUD.maxReferralsPerHour > 0 && (userData.referralHourlyCount || 0) >= ANTI_FRAUD.maxReferralsPerHour) {
        return { allowed: false, reason: 'Hourly referral limit reached' }
    }

    return { allowed: true }
}

function shouldResetCounters(currentTime: number, lastReset: number, intervalMs: number): boolean {
    return currentTime - lastReset >= intervalMs
}

function getNewCounterValues(
    currentHourlyCount: number,
    currentDailyCount: number,
    currentHourlyReset: number,
    currentDailyReset: number
): {
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

export async function getReferralByReferredUser(referredId: string): Promise<Referral | null> {
    const refId = generateDocId(REFERAL_DOC_PREFIX, referredId)
    const refDoc = doc(db, 'referrals', refId)
    const snap = await getDoc(refDoc)
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() } as Referral
}

export async function captureReferral(
    referrerId: string,
    referredId: string,
    username: string,
    isPremium: boolean = false,
    source: 'telegram' | 'web' | 'app' = 'telegram'
): Promise<{ success: boolean; error?: string }> {
    if (!referrerId || !referredId) {
        return { success: false, error: 'Invalid user IDs' }
    }

    if (referrerId === referredId) {
        return { success: false, error: 'Cannot refer yourself' }
    }

    const referralDocId = generateDocId(REFERAL_DOC_PREFIX, referredId)

    try {
        await runTransaction(db, async (transaction) => {
            const referralRef = doc(db, 'referrals', referralDocId)
            const referralSnap = await transaction.get(referralRef)
            if (referralSnap.exists()) {
                throw new Error('User has already been referred')
            }

            const inviterRef = doc(db, 'users', referrerId)
            const inviterSnap = await transaction.get(inviterRef)
            if (!inviterSnap.exists()) {
                throw new Error('Referrer not found')
            }

            const inviterData = inviterSnap.data() as UserReferralData

            const fraudCheck = canProcessReferral(inviterData)
            if (!fraudCheck.allowed) {
                throw new Error(fraudCheck.reason || 'Referral not allowed')
            }

            if (inviterData.referredBy === referredId) {
                throw new Error('Circular referral detected')
            }

            const now = Date.now()
            const counters = getNewCounterValues(
                inviterData.referralHourlyCount || 0,
                inviterData.referralDailyCount || 0,
                inviterData.lastReferralHourReset || 0,
                inviterData.lastReferralDayReset || 0
            )

            const newReferral: Omit<Referral, 'id'> = {
                referrerId,
                referredId,
                referralCode: referrerId,
                status: 'pending',
                rewardAmount: 0,
                source,
                createdAt: Timestamp.now(),
            }

            transaction.set(referralRef, newReferral)

            transaction.update(inviterRef, {
                referralCount: increment(1),
                premiumReferralCount: isPremium ? increment(1) : increment(0),
                lastReferralAt: Timestamp.now(),
                referralHourlyCount: increment(1),
                referralDailyCount: increment(1),
                lastReferralHourReset: counters.hourlyReset,
                lastReferralDayReset: counters.dailyReset,
            })

            const newFriend: ReferralFriend = {
                id: referredId,
                username: username || 'User',
                isPremium,
                joinedAt: Timestamp.now(),
                bonusEarned: 0,
                tasksCompleted: 0,
                lastActiveAt: Timestamp.now(),
            }

            const existingFriends = inviterData.friendsList || []
            const updatedFriends = [newFriend, ...existingFriends].slice(0, 200)

            transaction.update(inviterRef, { friendsList: updatedFriends })
        })

        return { success: true }
    } catch (error: any) {
        console.error('captureReferral failed:', error)
        return { success: false, error: error.message || 'Failed to capture referral' }
    }
}

export async function qualifyReferral(referredId: string): Promise<{ success: boolean; error?: string }> {
    const referralDocId = generateDocId(REFERAL_DOC_PREFIX, referredId)

    try {
        const result = await runTransaction(db, async (transaction) => {
            const referralRef = doc(db, 'referrals', referralDocId)
            const referralSnap = await transaction.get(referralRef)

            if (!referralSnap.exists()) {
                return { success: false, error: 'No referral found for this user' }
            }

            const referralData = referralSnap.data() as Referral

            if (referralData.status !== 'pending') {
                if (referralData.status === 'rewarded') {
                    return { success: true, error: undefined }
                }
                return { success: false, error: `Referral is ${referralData.status}, cannot qualify` }
            }

            transaction.update(referralRef, {
                status: 'qualified',
                qualifiedAt: Timestamp.now(),
            })

            return { success: true, error: undefined }
        })

        if (result.success && !result.error) {
            return await rewardReferral(referredId)
        }

        return result
    } catch (error: any) {
        console.error('qualifyReferral failed:', error)
        return { success: false, error: error.message || 'Failed to qualify referral' }
    }
}

async function rewardReferral(referredId: string): Promise<{ success: boolean; error?: string }> {
    const referralDocId = generateDocId(REFERAL_DOC_PREFIX, referredId)

    try {
        await runTransaction(db, async (transaction) => {
            const referralRef = doc(db, 'referrals', referralDocId)
            const referralSnap = await transaction.get(referralRef)

            if (!referralSnap.exists()) {
                throw new Error('No referral found')
            }

            const referralData = referralSnap.data() as Referral

            if (referralData.status !== 'qualified') {
                if (referralData.status === 'rewarded') {
                    return
                }
                throw new Error(`Referral is ${referralData.status}, cannot reward`)
            }

            const idempotencyKey = generateIdempotencyKey(referralData.referrerId, 'referral_reward', referredId)
            const ledgerDocId = generateDocId(REWARD_LEDGER_PREFIX, idempotencyKey)

            const ledgerRef = doc(db, 'reward_ledger', ledgerDocId)
            const ledgerSnap = await transaction.get(ledgerRef)
            if (ledgerSnap.exists()) {
                return
            }

            const baseReward = REFERRAL_REWARDS.baseReward

            transaction.update(referralRef, {
                status: 'rewarded',
                rewardAmount: baseReward,
                rewardedAt: Timestamp.now(),
            })

            const inviterRef = doc(db, 'users', referralData.referrerId)
            const inviterSnap = await transaction.get(inviterRef)

            if (!inviterSnap.exists()) {
                throw new Error('Referrer not found')
            }

            const inviterData = inviterSnap.data() as UserReferralData

            let totalReward = baseReward
            let premiumBonus = 0

            const friendsList = inviterData.friendsList || []
            const friendEntry = friendsList.find(f => f.id === referredId)
            if (friendEntry?.isPremium) {
                premiumBonus = REFERRAL_REWARDS.premiumFriendBonus
                totalReward += premiumBonus
            }

            let bonusReward = 0
            let newTierLevel = inviterData.tierLevel || 0
            let newClaimedTiers = inviterData.tierRewardsClaimed || []

            for (const tier of REFERRAL_TIERS) {
                const newReferralCount = (inviterData.referralCount || 0)
                if (newReferralCount >= tier.requiredFriends && tier.level > newTierLevel) {
                    if (!newClaimedTiers.includes(tier.level)) {
                        newTierLevel = tier.level
                        bonusReward += tier.bonusReward
                        newClaimedTiers = [...newClaimedTiers, tier.level]
                    }
                }
            }

            const updateData: Record<string, any> = {
                balance: increment(totalReward + bonusReward),
                referralEarnings: increment(totalReward + bonusReward),
            }

            if (bonusReward > 0) {
                updateData.tierLevel = newTierLevel
                updateData.tierRewardsClaimed = newClaimedTiers
            }

            transaction.update(inviterRef, updateData)

            if (friendEntry) {
                const updatedFriendsList = friendsList.map(f =>
                    f.id === referredId
                        ? { ...f, bonusEarned: (f.bonusEarned || 0) + totalReward }
                        : f
                )
                transaction.update(inviterRef, { friendsList: updatedFriendsList })
            }

            const ledgerEntry: Omit<RewardLedgerEntry, 'id'> = {
                userId: referralData.referrerId,
                referralId: referralDocId,
                eventType: 'referral_reward',
                amount: totalReward + bonusReward,
                status: 'completed',
                idempotencyKey,
                createdAt: Timestamp.now(),
            }

            transaction.set(ledgerRef, ledgerEntry)
        })

        return { success: true }
    } catch (error: any) {
        console.error('rewardReferral failed:', error)
        return { success: false, error: error.message || 'Failed to reward referral' }
    }
}

export async function rejectReferral(
    referredId: string,
    reason: string
): Promise<{ success: boolean; error?: string }> {
    const referralDocId = generateDocId(REFERAL_DOC_PREFIX, referredId)

    try {
        await runTransaction(db, async (transaction) => {
            const referralRef = doc(db, 'referrals', referralDocId)
            const referralSnap = await transaction.get(referralRef)

            if (!referralSnap.exists()) {
                throw new Error('No referral found')
            }

            const referralData = referralSnap.data() as Referral
            if (referralData.status === 'rewarded' || referralData.status === 'rejected') {
                throw new Error(`Cannot reject referral with status ${referralData.status}`)
            }

            transaction.update(referralRef, {
                status: 'rejected',
                rejectedAt: Timestamp.now(),
                rejectionReason: reason,
            })
        })

        return { success: true }
    } catch (error: any) {
        console.error('rejectReferral failed:', error)
        return { success: false, error: error.message || 'Failed to reject referral' }
    }
}

export async function checkAndQualify(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const userRef = doc(db, 'users', userId)
        const userSnap = await getDoc(userRef)
        if (!userSnap.exists()) {
            return { success: false, error: 'User not found' }
        }

        const userData = userSnap.data() as UserReferralData

        if (!userData.referredBy) {
            return { success: false, error: 'User was not referred' }
        }

        const tasks = userData.completedTasks || []
        if (tasks.length === 0) {
            return { success: false, error: 'No qualifying activity yet' }
        }

        const referral = await getReferralByReferredUser(userId)
        if (!referral) {
            return { success: false, error: 'No referral record found' }
        }

        if (referral.status !== 'pending') {
            return { success: true, error: undefined }
        }

        return await qualifyReferral(userId)
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to check qualification' }
    }
}

export async function processNewReferral(
    inviterId: string,
    newUserId: string,
    username: string,
    isPremium: boolean = false
): Promise<{ success: boolean; error?: string }> {
    const result = await captureReferral(inviterId, newUserId, username, isPremium)

    if (result.success) {
        const userRef = doc(db, 'users', newUserId)
        try {
            await updateDoc(userRef, { referredBy: inviterId })
        } catch { }
    }

    return result
}

export async function getReferrerStats(userId: string): Promise<ReferrerStats> {
    try {
        const referralsQuery = query(
            collection(db, 'referrals'),
            where('referrerId', '==', userId)
        )
        const snapshot = await getDocs(referralsQuery)

        let pending = 0
        let qualified = 0
        let rewarded = 0
        let rejected = 0
        let totalEarningsFromReferrals = 0

        snapshot.forEach(doc => {
            const data = doc.data() as Referral
            switch (data.status) {
                case 'pending': pending++; break
                case 'qualified': qualified++; break
                case 'rewarded':
                    rewarded++
                    totalEarningsFromReferrals += data.rewardAmount || 0
                    break
                case 'rejected': rejected++; break
            }
        })

        const userRef = doc(db, 'users', userId)
        const userSnap = await getDoc(userRef)

        let currentTier: ReferralTier | null = null
        let nextTier: ReferralTier | null = null
        let progressToNextTier = 0
        let availableTierRewards: ReferralTier[] = []
        let totalFriends = 0
        let premiumFriends = 0
        let totalEarnings = 0

        if (userSnap.exists()) {
            const userData = userSnap.data() as UserReferralData
            totalFriends = userData.referralCount || 0
            premiumFriends = userData.premiumReferralCount || 0
            totalEarnings = userData.referralEarnings || 0

            currentTier = REFERRAL_TIERS.find(t => t.level === userData.tierLevel) || null

            const currentTierIndex = currentTier ? REFERRAL_TIERS.indexOf(currentTier) : -1
            nextTier = currentTierIndex < REFERRAL_TIERS.length - 1 ? REFERRAL_TIERS[currentTierIndex + 1] : null

            if (nextTier && currentTier) {
                const prevRequired = currentTier.requiredFriends
                const progress = totalFriends - prevRequired
                const range = nextTier.requiredFriends - prevRequired
                progressToNextTier = Math.min(100, Math.max(0, (progress / range) * 100))
            } else if (currentTier && !nextTier) {
                progressToNextTier = 100
            }

            const claimedTiers = userData.tierRewardsClaimed || []
            availableTierRewards = REFERRAL_TIERS.filter(tier =>
                totalFriends >= tier.requiredFriends &&
                !claimedTiers.includes(tier.level)
            )
        }

        let claimableAmount = 0
        for (const tier of availableTierRewards) {
            claimableAmount += tier.bonusReward
        }

        return {
            totalReferrals: pending + qualified + rewarded + rejected,
            pendingReferrals: pending,
            qualifiedReferrals: qualified,
            rewardedReferrals: rewarded,
            rejectedReferrals: rejected,
            totalEarnings: totalEarningsFromReferrals,
            totalFriends,
            premiumFriends,
            currentTier,
            nextTier,
            progressToNextTier,
            availableTierRewards,
            claimableAmount,
        }
    } catch (error) {
        console.error('getReferrerStats failed:', error)
        return {
            totalReferrals: 0,
            pendingReferrals: 0,
            qualifiedReferrals: 0,
            rewardedReferrals: 0,
            rejectedReferrals: 0,
            totalEarnings: 0,
            totalFriends: 0,
            premiumFriends: 0,
            currentTier: null,
            nextTier: REFERRAL_TIERS[0],
            progressToNextTier: 0,
            availableTierRewards: [],
            claimableAmount: 0,
        }
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
        await runTransaction(db, async (transaction) => {
            const userSnap = await transaction.get(userRef)

            if (!userSnap.exists()) {
                throw new Error('User not found')
            }

            const userData = userSnap.data() as UserReferralData
            const claimedTiers = userData.tierRewardsClaimed || []

            if ((userData.referralCount || 0) < tier.requiredFriends) {
                throw new Error(`Need ${tier.requiredFriends} friends to claim ${tier.label}`)
            }

            if (claimedTiers.includes(tierLevel)) {
                throw new Error('Tier already claimed')
            }

            const idempotencyKey = generateIdempotencyKey(userId, 'tier_bonus', `${tierLevel}_${Date.now()}`)
            const ledgerDocId = generateDocId(REWARD_LEDGER_PREFIX, idempotencyKey)

            const ledgerRef = doc(db, 'reward_ledger', ledgerDocId)
            const ledgerSnap = await transaction.get(ledgerRef)
            if (ledgerSnap.exists()) {
                throw new Error('Reward already processed')
            }

            transaction.update(userRef, {
                tierLevel: tierLevel,
                tierRewardsClaimed: arrayUnion(tierLevel),
                balance: increment(tier.bonusReward),
                referralEarnings: increment(tier.bonusReward),
            })

            const ledgerEntry: Omit<RewardLedgerEntry, 'id'> = {
                userId,
                referralId: '',
                eventType: 'tier_bonus',
                amount: tier.bonusReward,
                status: 'completed',
                idempotencyKey,
                createdAt: Timestamp.now(),
            }

            transaction.set(ledgerRef, ledgerEntry)
        })

        return { success: true }
    } catch (error: any) {
        console.error('claimTierReward failed:', error)
        return { success: false, error: error.message || 'Failed to claim reward' }
    }
}

export async function claimAllAvailableRewards(userId: string): Promise<{ success: boolean; totalClaimed: number; error?: string }> {
    try {
        const stats = await getReferrerStats(userId)

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

        return { success: totalClaimed > 0, totalClaimed, error: undefined }
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
                lastActiveAt: Timestamp.now(),
            }

            let bonusEarned = 0
            if (tasksCompleted > 0) {
                bonusEarned = REFERRAL_REWARDS.friendTaskCompletionBonus * tasksCompleted
            }

            transaction.update(userRef, {
                friendsList,
                ...(bonusEarned > 0 ? {
                    balance: increment(bonusEarned),
                    referralEarnings: increment(bonusEarned),
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

export async function getReferralStatus(userId: string): Promise<{ referred: boolean; status: ReferralStatus | null; referrerName?: string }> {
    try {
        const userRef = doc(db, 'users', userId)
        const userSnap = await getDoc(userRef)
        if (!userSnap.exists()) {
            return { referred: false, status: null }
        }

        const userData = userSnap.data() as UserReferralData
        if (!userData.referredBy) {
            return { referred: false, status: null }
        }

        const referral = await getReferralByReferredUser(userId)

        let referrerName: string | undefined
        if (userData.referredBy) {
            const referrerRef = doc(db, 'users', userData.referredBy)
            const referrerSnap = await getDoc(referrerRef)
            if (referrerSnap.exists()) {
                referrerName = referrerSnap.data()?.username || undefined
            }
        }

        return {
            referred: true,
            status: referral?.status || null,
            referrerName,
        }
    } catch (error) {
        console.error('getReferralStatus failed:', error)
        return { referred: false, status: null }
    }
}
