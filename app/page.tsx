// app/page.tsx

/**
 * This project was developed by Nikandr Surkov.
 * 
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * GitHub: https://github.com/nikandr-surkov
 */

'use client'

import CheckFootprint from '@/components/CheckFootprint'
import NavigationBar from '@/components/NavigationBar'
import TabContainer from '@/components/TabContainer'
import { TabProvider } from '@/contexts/TabContext'
import { UserProvider, useUser } from '@/contexts/UserContext'
import { useEffect } from 'react'

function AppContent() {
    const { user, loading } = useUser()

    useEffect(() => {
        console.log('User loading:', loading)
        console.log('User data:', user)
    }, [loading, user])

    return (
        <main className="min-h-screen bg-black text-white">
            <CheckFootprint />
            <TabContainer />
            <NavigationBar />
        </main>
    )
}

export default function Home() {
    return (
        <TabProvider>
            <UserProvider>
                <AppContent />
            </UserProvider>
        </TabProvider>
    )
}