import { doc, getDoc, increment, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/utils/firebaseClient'
import { processNewReferral, REFERRAL_TIERS } from '@/utils/referralSystem'

export interface ReferralFriend {
    id: string
    username: string
    isPremium: boolean
    joinedAt: Timestamp
    bonusEarned: number
    tasksCompleted: number
}

export interface User {
    id: string
    username: string
    balance: number
    referralCode?: string
    referredBy?: string
    referralCount?: number
    premiumReferralCount?: number
    referralEarnings?: number
    tierLevel?: number
    tierRewardsClaimed?: number[]
    friendsList?: ReferralFriend[]
    referralRewardClaimed?: boolean
    lastReferralAt?: Timestamp
    isPremium?: boolean
    created_at?: string
}

export async function getOrCreateUser(
    userId: string,
    username: string,
    referredBy?: string,
    isPremium: boolean = false
): Promise<User | null> {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
        const existingData = userSnap.data() as User
        if (existingData.username !== username || existingData.isPremium !== isPremium) {
            await setDoc(userRef, {
                username,
                isPremium,
                id: userId
            }, { merge: true })
        }
        const freshSnap = await getDoc(userRef)
        return freshSnap.data() as User
    } else {
        const newUser: User = {
            id: userId,
            username: username,
            balance: 50000,
            referralCode: userId,
            referredBy: referredBy && referredBy !== userId ? referredBy : undefined,
            referralCount: 0,
            premiumReferralCount: 0,
            referralEarnings: 0,
            tierLevel: 0,
            tierRewardsClaimed: [],
            friendsList: [],
            referralRewardClaimed: false,
            isPremium: isPremium,
            created_at: new Date().toISOString()
        }
        await setDoc(userRef, newUser)

        if (referredBy && referredBy !== userId) {
            await processNewReferral(referredBy, userId, username, isPremium)
        }
        
        const freshSnap = await getDoc(userRef)
        return freshSnap.data() as User
    }
}

export async function applyReferralReward(userId: string): Promise<number | null> {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) return null

    const userData = userSnap.data() as User
    if (userData.referralRewardClaimed) return userData.balance

    const inviterId = userData.referredBy
    if (!inviterId || inviterId === userId) {
        await setDoc(userRef, { referralRewardClaimed: true }, { merge: true })
        const freshSnap = await getDoc(userRef)
        return (freshSnap.data() as User).balance
    }

    const bonusForInvitedUser = 2000
    const bonusForInviter = 5000

    await setDoc(
        userRef,
        {
            balance: increment(bonusForInvitedUser),
            referralRewardClaimed: true,
            id: userId
        },
        { merge: true }
    )

    const inviterRef = doc(db, 'users', inviterId)
    await setDoc(
        inviterRef,
        {
            id: inviterId,
            balance: increment(bonusForInviter),
            referralCount: increment(1),
            referralEarnings: increment(bonusForInviter)
        },
        { merge: true }
    )

    const freshSnap = await getDoc(userRef)
    return (freshSnap.data() as User).balance
}

export async function updateUserBalance(userId: string, balance: number): Promise<void> {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    const currentData = userSnap.data() || {}
    
    await setDoc(userRef, {
        ...currentData,
        balance: balance,
        id: userId
    }, { merge: true })
}

export async function updateUserUpgrade(userId: string, upgradeType: string, level: number): Promise<void> {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    const currentData = userSnap.data() || {}
    
    await setDoc(userRef, {
        ...currentData,
        [`upgrade_${upgradeType}`]: level,
        id: userId
    }, { merge: true })
}