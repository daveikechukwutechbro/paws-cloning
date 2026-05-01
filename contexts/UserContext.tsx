import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { applyReferralReward, getOrCreateUser, User } from '@/utils/userUtils'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/utils/firebaseClient'

type UserContextType = {
    user: User | null
    loading: boolean
    refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchFreshUserData = useCallback(async (userId: string): Promise<User | null> => {
        const userRef = doc(db, 'users', userId)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
            return userSnap.data() as User
        }
        return null
    }, [])

    const refreshUser = useCallback(async () => {
        let userId = ''
        let username = ''
        let isPremium = false
        
        const tg = (window as any).Telegram?.WebApp
        const tgUser = tg?.initDataUnsafe?.user
        
        if (tgUser?.id) {
            userId = 'tg_' + tgUser.id.toString()
            username = tgUser.first_name || tgUser.username || 'Telegram User'
            isPremium = tgUser.is_premium || false
        } else {
            let storedId = localStorage.getItem('paws_user_id')
            if (!storedId) {
                storedId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
                localStorage.setItem('paws_user_id', storedId)
            }
            userId = storedId
            username = 'User' + userId.slice(-4)
        }

        const params = new URLSearchParams(window.location.search)
        let refCode = params.get('ref') || undefined
        
        if (!refCode && tg?.initDataUnsafe?.start_param) {
            refCode = tg.initDataUnsafe.start_param
        }

        try {
            const userData = await getOrCreateUser(userId, username, refCode, isPremium)
            if (userData) {
                await applyReferralReward(userId)
                const freshData = await fetchFreshUserData(userId)
                if (freshData) {
                    setUser(freshData)
                } else {
                    setUser(userData)
                }
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }, [fetchFreshUserData])

    useEffect(() => {
        refreshUser()
    }, [refreshUser])

    return (
        <UserContext.Provider value={{ user, loading, refreshUser }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
