import { doc, getDoc, increment, setDoc } from 'firebase/firestore'
import { db } from '@/utils/firebaseClient'

export interface User {
    id: string
    username: string
    balance: number
    referralCode?: string
    referredBy?: string
    referralCount?: number
    referralEarnings?: number
    referralRewardClaimed?: boolean
    created_at?: string
}

export async function getOrCreateUser(
    userId: string,
    username: string,
    referredBy?: string
): Promise<User | null> {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
        return userSnap.data() as User
    } else {
        const newUser: User = {
            id: userId,
            username: username,
            balance: 50000,
            referralCode: userId,
            referredBy: referredBy && referredBy !== userId ? referredBy : undefined,
            referralCount: 0,
            referralEarnings: 0,
            referralRewardClaimed: false
        }
        await setDoc(userRef, newUser)
        return newUser
    }
}

export async function applyReferralReward(userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) return

    const userData = userSnap.data() as User
    if (userData.referralRewardClaimed) return

    const inviterId = userData.referredBy
    if (!inviterId || inviterId === userId) {
        await setDoc(userRef, { referralRewardClaimed: true }, { merge: true })
        return
    }

    const bonusForInvitedUser = 2000
    const bonusForInviter = 5000

    await setDoc(
        userRef,
        {
            balance: (userData.balance || 0) + bonusForInvitedUser,
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