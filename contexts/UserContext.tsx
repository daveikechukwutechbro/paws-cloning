import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getOrCreateUser, User } from '@/utils/userUtils'

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
        
        const tg = (window as any).Telegram?.WebApp
        const tgUser = tg?.initDataUnsafe?.user
        
        if (tgUser) {
            userId = tgUser.id.toString()
            username = tgUser.first_name || 'Telegram User'
        } else {
            userId = localStorage.getItem('paws_user_id') || 'test_user_' + Date.now()
            localStorage.setItem('paws_user_id', userId)
            username = 'User' + userId.slice(-4)
        }

        try {
            const userData = await getOrCreateUser(userId, username)
            setUser(userData)
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