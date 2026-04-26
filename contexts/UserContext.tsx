// contexts/UserContext.tsx

/**
 * This project was developed by Nikandr Surkov.
 * 
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * GitHub: https://github.com/nikandr-surkov
 */

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/utils/supabaseClient'

export interface User {
    id: string
    username: string
    balance: number
    created_at?: string
}

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
            // Test mode - generate a test user ID
            userId = 'test_user_' + Date.now()
            username = 'TestUser'
        }

        if (!userId) {
            setLoading(false)
            return
        }

        try {
            const { data: existingUser } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            if (existingUser) {
                if (existingUser.balance !== 50000) {
                    await supabase
                        .from('users')
                        .update({ balance: 50000 })
                        .eq('id', userId)
                    existingUser.balance = 50000
                }
                setUser(existingUser)
            } else {
                const { data: newUser, error } = await supabase
                    .from('users')
                    .insert({
                        id: userId,
                        username: username,
                        balance: 50000
                    })
                    .select()
                    .single()

                if (error) {
                    console.error('Error creating user:', error)
                } else {
                    setUser(newUser)
                }
            }
        } catch (error) {
            console.error('Error in refreshUser:', error)
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