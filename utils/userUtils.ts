import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/utils/firebaseClient'

export interface User {
    id: string
    username: string
    balance: number
    created_at?: string
}

export async function getOrCreateUser(userId: string, username: string): Promise<User | null> {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
        return userSnap.data() as User
    } else {
        const newUser: User = {
            id: userId,
            username: username,
            balance: 50000
        }
        await setDoc(userRef, newUser)
        return newUser
    }
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