import { db } from '@/utils/firebaseClient'
import { doc, getDoc, setDoc, increment, collection, query, where, getDocs, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore'

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
    tierLevel: number
    tierRewardsClaimed: number[]
    friendsList: ReferralFriend[]
    referralRewardClaimed: boolean
    lastReferralAt?: Timestamp
}

async function checkAndUpdateTier(userId: string, referralCount: number): Promise<{ newTierLevel: number, bonusClaimed: boolean }> {
    let newTierLevel = 0
    let bonusClaimed = false

    for (const tier of REFERRAL_TIERS) {
        if (referralCount >= tier.requiredFriends && tier.level > newTierLevel) {
            newTierLevel = tier.level
        }
    }

    if (newTierLevel > 0) {
        const userRef = doc(db, 'users', userId)
        const userSnap = await getDoc(userRef)
        
        if (userSnap.exists()) {
            const userData = userSnap.data() as UserReferralData
            const claimedTiers = userData.tierRewardsClaimed || []
            
            if (!claimedTiers.includes(newTierLevel)) {
                const tierBonus = REFERRAL_TIERS.find(t => t.level === newTierLevel)?.bonusReward || 0
                
                await updateDoc(userRef, {
                    tierLevel: newTierLevel,
                    tierRewardsClaimed: arrayUnion(newTierLevel),
                    balance: increment(tierBonus),
                    referralEarnings: increment(tierBonus)
                })
                
                bonusClaimed = true
            }
        }
    }

    return { newTierLevel, bonusClaimed }
}

export async function processNewReferral(
    inviterId: string,
    newUserId: string,
    username: string,
    isPremium: boolean = false
): Promise<void> {
    const inviterRef = doc(db, 'users', inviterId)
    const inviterSnap = await getDoc(inviterRef)
    
    if (!inviterSnap.exists()) return

    const baseReward = REFERRAL_REWARDS.baseReward
    const premiumBonus = isPremium ? REFERRAL_REWARDS.premiumFriendBonus : 0
    const totalReward = baseReward + premiumBonus

    const newFriend: ReferralFriend = {
        id: newUserId,
        username,
        isPremium,
        joinedAt: Timestamp.now(),
        bonusEarned: totalReward,
        tasksCompleted: 0
    }

    await updateDoc(inviterRef, {
        referralCount: increment(1),
        premiumReferralCount: isPremium ? increment(1) : increment(0),
        referralEarnings: increment(totalReward),
        balance: increment(totalReward),
        friendsList: arrayUnion(newFriend),
        lastReferralAt: Timestamp.now()
    })

    const inviterData = (await getDoc(inviterRef)).data() as UserReferralData
    await checkAndUpdateTier(inviterId, inviterData.referralCount)
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
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) return false

    const userData = userSnap.data() as UserReferralData
    
    if (userData.referralCount < tier.requiredFriends) return false
    if ((userData.tierRewardsClaimed || []).includes(tierLevel)) return false

    await updateDoc(userRef, {
        tierLevel: tierLevel,
        tierRewardsClaimed: arrayUnion(tierLevel),
        balance: increment(tier.bonusReward),
        referralEarnings: increment(tier.bonusReward)
    })

    return true
}
