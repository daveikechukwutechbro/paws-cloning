import { db } from '@/utils/firebaseClient'
import { doc, getDoc, setDoc, increment, collection, query, orderBy, limit, getDocs, updateDoc, arrayUnion, Timestamp, runTransaction } from 'firebase/firestore'

export interface ReferralTier {
    level: number
    requiredFriends: number
    bonusReward: number
    label: string
}

export interface ReferralFriend {
    id: string
    username: string
    isPremium: boolean
    joinedAt: Timestamp
    bonusEarned: number
    tasksCompleted: number
}

export interface ReferralTask {
    id: string
    name: string
    description: string
    reward: number
    isCompleted: boolean
}

export const REFERRAL_TIERS: ReferralTier[] = [
    { level: 1, requiredFriends: 3, bonusReward: 5000, label: 'Bronze' },
    { level: 2, requiredFriends: 10, bonusReward: 15000, label: 'Silver' },
    { level: 3, requiredFriends: 25, bonusReward: 50000, label: 'Gold' },
    { level: 4, requiredFriends: 50, bonusReward: 150000, label: 'Diamond' },
    { level: 5, requiredFriends: 100, bonusReward: 500000, label: 'Master' }
]

export const REFERRAL_REWARDS = {
    baseReward: 5000,
    premiumFriendBonus: 25000,
    friendTaskCompletionBonus: 2500,
    friendMiningBonus: 1000
}

export interface UserReferralData {
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
}

async function checkAndUpdateTierInTransaction(
    inviterRef: any,
    referralCount: number,
    claimedTiers: number[]
): Promise<{ level: number; bonus: number } | null> {
    let newTierLevel = 0

    for (const tier of REFERRAL_TIERS) {
        if (referralCount >= tier.requiredFriends && tier.level > newTierLevel) {
            newTierLevel = tier.level
        }
    }

    if (newTierLevel > 0 && !claimedTiers.includes(newTierLevel)) {
        const tierBonus = REFERRAL_TIERS.find(t => t.level === newTierLevel)?.bonusReward || 0
        return { level: newTierLevel, bonus: tierBonus }
    }

    return null
}

export async function processNewReferral(
    inviterId: string,
    newUserId: string,
    username: string,
    isPremium: boolean = false
): Promise<void> {
    const inviterRef = doc(db, 'users', inviterId)

    try {
        await runTransaction(db, async (transaction) => {
            const inviterSnap = await transaction.get(inviterRef)

            if (!inviterSnap.exists()) return

            const inviterData = inviterSnap.data() as UserReferralData
            const baseReward = REFERRAL_REWARDS.baseReward
            const premiumBonus = isPremium ? REFERRAL_REWARDS.premiumFriendBonus : 0
            const totalReward = baseReward + premiumBonus

            const currentReferralCount = inviterData.referralCount || 0
            const currentPremiumCount = inviterData.premiumReferralCount || 0
            const currentEarnings = inviterData.referralEarnings || 0
            const currentBalance = inviterData.balance || 50000
            const currentFriendsList = inviterData.friendsList || []
            const currentClaimedTiers = inviterData.tierRewardsClaimed || []

            const newFriend: ReferralFriend = {
                id: newUserId,
                username,
                isPremium,
                joinedAt: Timestamp.now(),
                bonusEarned: totalReward,
                tasksCompleted: 0
            }

            const updatedFriendsList = [newFriend, ...currentFriendsList].slice(0, 100)

            const newReferralCount = currentReferralCount + 1
            const newPremiumCount = currentPremiumCount + (isPremium ? 1 : 0)
            const newEarnings = currentEarnings + totalReward
            const newBalance = currentBalance + totalReward

            const tierUpdate = checkAndUpdateTierInTransaction(inviterRef, newReferralCount, currentClaimedTiers)

            if (tierUpdate) {
                transaction.update(inviterRef, {
                    referralCount: newReferralCount,
                    premiumReferralCount: newPremiumCount,
                    referralEarnings: newEarnings,
                    balance: newBalance + tierUpdate.bonus,
                    friendsList: updatedFriendsList,
                    lastReferralAt: Timestamp.now(),
                    tierLevel: tierUpdate.level,
                    tierRewardsClaimed: arrayUnion(tierUpdate.level)
                })
            } else {
                transaction.update(inviterRef, {
                    referralCount: newReferralCount,
                    premiumReferralCount: newPremiumCount,
                    referralEarnings: newEarnings,
                    balance: newBalance,
                    friendsList: updatedFriendsList,
                    lastReferralAt: Timestamp.now()
                })
            }
        })
    } catch (error) {
        console.error('Transaction failed processing referral:', error)
    }
}

export async function getReferralStats(userId: string): Promise<{
    totalFriends: number
    premiumFriends: number
    totalEarnings: number
    currentTier: ReferralTier | null
    nextTier: ReferralTier | null
    progressToNextTier: number
}> {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
        return {
            totalFriends: 0,
            premiumFriends: 0,
            totalEarnings: 0,
            currentTier: null,
            nextTier: REFERRAL_TIERS[0],
            progressToNextTier: 0
        }
    }

    const userData = userSnap.data() as UserReferralData
    const currentTier = REFERRAL_TIERS.find(t => t.level === userData.tierLevel) || null
    const nextTier = REFERRAL_TIERS.find(t => t.level === (userData.tierLevel || 0) + 1) || null
    
    let progressToNextTier = 0
    if (nextTier) {
        const prevTierRequired = currentTier?.requiredFriends || 0
        progressToNextTier = ((userData.referralCount - prevTierRequired) / (nextTier.requiredFriends - prevTierRequired)) * 100
        progressToNextTier = Math.min(100, Math.max(0, progressToNextTier))
    } else if (currentTier) {
        progressToNextTier = 100
    }

    return {
        totalFriends: userData.referralCount || 0,
        premiumFriends: userData.premiumReferralCount || 0,
        totalEarnings: userData.referralEarnings || 0,
        currentTier,
        nextTier,
        progressToNextTier
    }
}

export async function getFriendsList(userId: string): Promise<ReferralFriend[]> {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) return []

    const userData = userSnap.data() as UserReferralData
    return userData.friendsList || []
}

export async function getAvailableTierRewards(userId: string): Promise<ReferralTier[]> {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) return []

    const userData = userSnap.data() as UserReferralData
    const claimedTiers = userData.tierRewardsClaimed || []
    
    return REFERRAL_TIERS.filter(tier => 
        userData.referralCount >= tier.requiredFriends && 
        !claimedTiers.includes(tier.level)
    )
}

export async function claimTierReward(userId: string, tierLevel: number): Promise<boolean> {
    const tier = REFERRAL_TIERS.find(t => t.level === tierLevel)
    if (!tier) return false

    const userRef = doc(db, 'users', userId)

    try {
        const result = await runTransaction(db, async (transaction) => {
            const userSnap = await transaction.get(userRef)
            
            if (!userSnap.exists()) return false

            const userData = userSnap.data() as UserReferralData
            
            if (userData.referralCount < tier.requiredFriends) return false
            if ((userData.tierRewardsClaimed || []).includes(tierLevel)) return false

            const currentBalance = userData.balance || 50000
            const currentEarnings = userData.referralEarnings || 0

            transaction.update(userRef, {
                tierLevel: tierLevel,
                tierRewardsClaimed: arrayUnion(tierLevel),
                balance: currentBalance + tier.bonusReward,
                referralEarnings: currentEarnings + tier.bonusReward
            })

            return true
        })

        return result
    } catch (error) {
        console.error('Transaction failed claiming tier reward:', error)
        return false
    }
}
