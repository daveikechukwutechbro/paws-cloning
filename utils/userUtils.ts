import { doc, getDoc, increment, setDoc, Timestamp, runTransaction } from 'firebase/firestore'
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
    
    try {
        const result = await runTransaction(db, async (transaction) => {
            const userSnap = await transaction.get(userRef)
            
            if (userSnap.exists()) {
                const existingData = userSnap.data() as User
                if (existingData.username !== username || existingData.isPremium !== isPremium) {
                    transaction.update(userRef, {
                        username,
                        isPremium,
                        id: userId
                    })
                }
                return { created: false, data: { ...existingData, username, isPremium } }
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
                transaction.set(userRef, newUser)
                return { created: true, data: newUser }
            }
        })

        if (result.created && referredBy && referredBy !== userId) {
            await processNewReferral(referredBy, userId, username, isPremium)
        }
        
        const freshSnap = await getDoc(userRef)
        return freshSnap.data() as User
    } catch (error) {
        console.error('Transaction failed creating user:', error)
        
        try {
            await setDoc(userRef, {
                id: userId,
                username,
                isPremium,
                balance: 50000,
                referralCode: userId
            }, { merge: true })
            
            if (referredBy && referredBy !== userId) {
                await processNewReferral(referredBy, userId, username, isPremium)
            }
            
            const freshSnap = await getDoc(userRef)
            return freshSnap.data() as User
        } catch (retryError) {
            console.error('Retry also failed:', retryError)
            return null
        }
    }
}

export async function applyReferralReward(userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId)

    try {
        await runTransaction(db, async (transaction) => {
            const userSnap = await transaction.get(userRef)

            if (!userSnap.exists()) return

            const userData = userSnap.data() as User
            if (userData.referralRewardClaimed) return

            const inviterId = userData.referredBy
            if (!inviterId || inviterId === userId) {
                transaction.update(userRef, { referralRewardClaimed: true })
                return
            }

            const bonusForNewUser = 2000
            const currentBalance = userData.balance || 50000

            transaction.update(userRef, {
                balance: currentBalance + bonusForNewUser,
                referralRewardClaimed: true
            })
        })
    } catch (error) {
        console.error('Transaction failed applying referral reward:', error)
    }
}

export async function updateUserBalance(userId: string, balance: number): Promise<void> {
    const userRef = doc(db, 'users', userId)

    try {
        await runTransaction(db, async (transaction) => {
            const userSnap = await transaction.get(userRef)
            
            if (!userSnap.exists()) {
                transaction.set(userRef, {
                    id: userId,
                    balance,
                    username: 'User',
                    referralCode: userId,
                    referralCount: 0,
                    premiumReferralCount: 0,
                    referralEarnings: 0,
                    tierLevel: 0,
                    tierRewardsClaimed: [],
                    friendsList: [],
                    referralRewardClaimed: false,
                    isPremium: false
                })
                return
            }

            transaction.update(userRef, { balance })
        })
    } catch (error) {
        console.error('Transaction failed updating balance:', error)
    }
}

export async function updateUserUpgrade(userId: string, upgradeType: string, level: number): Promise<void> {
    const userRef = doc(db, 'users', userId)
    
    await setDoc(userRef, {
        [`upgrade_${upgradeType}`]: level,
        id: userId
    }, { merge: true })
}
