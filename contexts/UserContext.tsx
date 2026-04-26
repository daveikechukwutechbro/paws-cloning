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
        const tg = (window as any).Telegram?.WebApp
        const tgUser = tg?.initDataUnsafe?.user

        if (!tgUser) {
            setLoading(false)
            return
        }

        const userId = tgUser.id.toString()
        const username = tgUser.first_name || 'Telegram User'

        try {
            const { data: existingUser } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            if (existingUser) {
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