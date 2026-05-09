import { doc, getDoc, increment, setDoc, Timestamp, runTransaction } from 'firebase/firestore'
import { db } from '@/utils/firebaseClient'
import { processNewReferral, REFERRAL_TIERS } from '@/utils/referralSystem'
import { ActiveMiningUpgrade, MINING_UPGRADES, calculateNextExpiry } from './miningUpgrades'

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
    completedTasks?: string[]
    miningUpgrades?: ActiveMiningUpgrade[]
    miningUpgradedAt?: string
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

export async function updateCompletedTask(userId: string, taskId: string): Promise<void> {
    const userRef = doc(db, 'users', userId)

    try {
        await runTransaction(db, async (transaction) => {
            const userSnap = await transaction.get(userRef)

            if (!userSnap.exists()) return

            const userData = userSnap.data() as User
            const currentTasks = userData.completedTasks || []

            if (currentTasks.includes(taskId)) return

            transaction.update(userRef, {
                completedTasks: [...currentTasks, taskId],
                lastTaskCompletedAt: new Date().toISOString()
            })
        })
    } catch (error) {
        console.error('Transaction failed updating completed task:', error)
    }
}

export async function addMiningUpgrade(
    userId: string, 
    upgradeId: string, 
    transactionHash: string,
    autoRenewal: boolean = false
): Promise<{ success: boolean; error?: string }> {
    const userRef = doc(db, 'users', userId)
    
    try {
        await runTransaction(db, async (transaction) => {
            const userSnap = await transaction.get(userRef)
            
            if (!userSnap.exists()) {
                throw new Error('User not found')
            }

            const upgradeConfig = MINING_UPGRADES.find(u => u.id === upgradeId)
            if (!upgradeConfig) {
                throw new Error('Invalid upgrade')
            }

            const userData = userSnap.data() as User
            const currentUpgrades = userData.miningUpgrades || []
            
            // Check if user already has this upgrade active
            const existingUpgrade = currentUpgrades.find(
                u => u.upgradeId === upgradeId && new Date(u.expiryDate) > new Date()
            )
            
            if (existingUpgrade) {
                // Extend the expiry
                const newExpiry = calculateNextExpiry(existingUpgrade.expiryDate, upgradeConfig.durationDays)
                existingUpgrade.expiryDate = newExpiry
                existingUpgrade.autoRenewal = autoRenewal
                existingUpgrade.transactionHash = transactionHash
                existingUpgrade.purchaseDate = new Date().toISOString()
                
                transaction.update(userRef, {
                    miningUpgrades: currentUpgrades,
                    miningUpgradedAt: new Date().toISOString()
                })
            } else {
                // Add new upgrade
                const now = new Date()
                const expiry = new Date(now)
                expiry.setDate(expiry.getDate() + upgradeConfig.durationDays)

                const newUpgrade: ActiveMiningUpgrade = {
                    upgradeId,
                    purchaseDate: now.toISOString(),
                    expiryDate: expiry.toISOString(),
                    autoRenewal,
                    transactionHash
                }

                transaction.update(userRef, {
                    miningUpgrades: [...currentUpgrades, newUpgrade],
                    miningUpgradedAt: now.toISOString()
                })
            }
        })

        return { success: true }
    } catch (error: any) {
        console.error('Transaction failed adding mining upgrade:', error)
        return { success: false, error: error.message }
    }
}

export async function processMiningUpgradeRenewal(userId: string): Promise<{ success: boolean; autoRenewed: boolean }> {
    const userRef = doc(db, 'users', userId)
    
    try {
        const userSnap = await getDoc(userRef)
        
        if (!userSnap.exists()) {
            return { success: false, autoRenewed: false }
        }

        const userData = userSnap.data() as User
        const currentUpgrades = userData.miningUpgrades || []
        const now = new Date()

        let anyAutoRenewed = false

        for (const upgrade of currentUpgrades) {
            const expiry = new Date(upgrade.expiryDate)
            const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60)

            // If upgrade expires in 24 hours and has autoRenewal enabled
            if (hoursUntilExpiry <= 24 && hoursUntilExpiry > 0 && upgrade.autoRenewal) {
                // Note: Actual TON payment verification would need to be done via webhook
                // This marks it for potential auto-renewal
                anyAutoRenewed = true
            }
        }

        return { success: true, autoRenewed: anyAutoRenewed }
    } catch (error) {
        console.error('Error processing renewal:', error)
        return { success: false, autoRenewed: false }
    }
}

export async function checkAndExpireUpgrades(): Promise<void> {
    try {
        // This would be called by a scheduled function (e.g., Cloud Functions)
        // For now, expiry is checked client-side when displaying mining rate
    } catch (error) {
        console.error('Error checking expired upgrades:', error)
    }
}
