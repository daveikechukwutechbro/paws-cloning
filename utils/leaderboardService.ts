import { collection, query, orderBy, limit, getDocs, getDoc, doc } from 'firebase/firestore'
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

export async function getUserRank(userId: string): Promise<{ rank: number; balance: number } | null> {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) return null
    
    const userData = userSnap.data() as User
    const userBalance = userData.balance || 0
    
    const usersRef = collection(db, 'users')
    const q = query(usersRef, orderBy('balance', 'desc'))
    const snapshot = await getDocs(q)
    
    let rank = 1
    for (const docSnap of snapshot.docs) {
        if (docSnap.id === userId) break
        const data = docSnap.data() as User
        if ((data.balance || 0) > userBalance) {
            rank++
        }
    }
    
    return { rank, balance: userBalance }
}

export async function getUserRankOptimized(userId: string): Promise<{ rank: number; balance: number; totalUsers: number } | null> {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) return null
    
    const userData = userSnap.data() as User
    const userBalance = userData.balance || 0
    
    const usersRef = collection(db, 'users')
    const q = query(usersRef, orderBy('balance', 'desc'), limit(10000))
    const snapshot = await getDocs(q)
    
    let rank = 1
    let totalUsers = snapshot.size
    
    for (const docSnap of snapshot.docs) {
        if (docSnap.id === userId) break
        const data = docSnap.data() as User
        if ((data.balance || 0) > userBalance) {
            rank++
        }
    }
    
    return { rank, balance: userBalance, totalUsers }
}
