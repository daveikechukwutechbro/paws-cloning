import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { applyReferralReward, getOrCreateUser, User } from '@/utils/userUtils'

type UserContextType = {
    user: User | null
    loading: boolean
    refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

function getFallbackUser(): { userId: string; username: string; isPremium: boolean } {
    const tg = (window as any).Telegram?.WebApp
    const tgUser = tg?.initDataUnsafe?.user
    
    if (tgUser?.id) {
        return {
            userId: 'tg_' + tgUser.id.toString(),
            username: tgUser.first_name || tgUser.username || 'Telegram User',
            isPremium: tgUser.is_premium || false
        }
    }
    
    let storedId = localStorage.getItem('paws_user_id')
    if (!storedId) {
        storedId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        localStorage.setItem('paws_user_id', storedId)
    }
    return {
        userId: storedId,
        username: 'User' + storedId.slice(-4),
        isPremium: false
    }
}

function resolveReferrerId(refCode: string): string {
    if (!refCode) return refCode
    if (refCode.startsWith('tg_') || refCode.startsWith('user_')) return refCode
    return 'tg_' + refCode
}

function getReferralCode(): string | undefined {
    const tg = (window as any).Telegram?.WebApp
    const params = new URLSearchParams(window.location.search)
    let refCode = params.get('ref') || undefined
    
    if (!refCode && tg?.initDataUnsafe?.start_param) {
        refCode = tg.initDataUnsafe.start_param
    }
    
    if (refCode) {
        refCode = resolveReferrerId(refCode)
    }
    
    return refCode
}

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const loadUser = useCallback(async () => {
        const { userId, username, isPremium } = getFallbackUser()
        const refCode = getReferralCode()

        try {
            const userData = await getOrCreateUser(userId, username, refCode, isPremium)
            if (userData) {
                setUser(userData)
                applyReferralReward(userId).catch(() => {})
            } else {
                setUser({
                    id: userId,
                    username,
                    balance: 50000,
                    referralCode: userId,
                    referralCount: 0,
                    premiumReferralCount: 0,
                    referralEarnings: 0,
                    tierLevel: 0,
                    tierRewardsClaimed: [],
                    friendsList: [],
                    referralRewardClaimed: false,
                    isPremium
                })
            }
        } catch (error) {
            console.error('Error loading user:', error)
            setUser({
                id: userId,
                username,
                balance: 50000,
                referralCode: userId,
                referralCount: 0,
                premiumReferralCount: 0,
                referralEarnings: 0,
                tierLevel: 0,
                tierRewardsClaimed: [],
                friendsList: [],
                referralRewardClaimed: false,
                isPremium
            })
        } finally {
            setLoading(false)
        }
    }, [])

    const refreshUser = useCallback(async () => {
        setLoading(true)
        await loadUser()
    }, [loadUser])

    useEffect(() => {
        loadUser()
    }, [loadUser])

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
