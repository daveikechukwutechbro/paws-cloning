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
    await setDoc(doc(db, 'users', userId), { balance, id: userId }, { merge: true })
}