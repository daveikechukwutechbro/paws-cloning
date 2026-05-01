import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/utils/firebaseClient'
import type { User } from '@/utils/userUtils'

export interface LeaderboardEntry {
    username: string
    balance: number
    rank: number
}

export async function getTopUsers(count: number = 50): Promise<LeaderboardEntry[]> {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, orderBy('balance', 'desc'), limit(count))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map((docSnap, index) => {
        const data = docSnap.data() as User
        return {
            username: data.username || 'Anonymous',
            balance: data.balance || 0,
            rank: index + 1
        }
    })
}
