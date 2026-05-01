import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { applyReferralReward, getOrCreateUser, User } from '@/utils/userUtils'

type UserContextType = {
    user: User | null
    loading: boolean
    refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const refreshUser = async () => {
        let userId = ''
        let username = ''
        
        // Check for Telegram WebApp - use the exact user ID from Telegram
        const tg = (window as any).Telegram?.WebApp
        const tgUser = tg?.initDataUnsafe?.user
        
        if (tgUser?.id) {
            // Use Telegram user ID directly - this is unique per account
            userId = 'tg_' + tgUser.id.toString()
            username = tgUser.first_name || tgUser.username || 'Telegram User'
        } else {
            // Fallback - create unique ID per session
            let storedId = localStorage.getItem('paws_user_id')
            if (!storedId) {
                storedId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
                localStorage.setItem('paws_user_id', storedId)
            }
            userId = storedId
            username = 'User' + userId.slice(-4)
        }

        // Get ref code from URL or Telegram start_param
        const params = new URLSearchParams(window.location.search)
        let refCode = params.get('ref') || undefined
        
        // Check for Telegram start parameter (from t.me/bot?start=xxx links)
        if (!refCode && tg?.initDataUnsafe?.start_param) {
            refCode = tg.initDataUnsafe.start_param
        }

        try {
            const userData = await getOrCreateUser(userId, username, refCode)
            if (userData) {
                setUser(userData)
                await applyReferralReward(userId)
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refreshUser()
    }, [])

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