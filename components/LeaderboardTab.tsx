'use client'

import PawsLogo from '@/icons/PawsLogo'
import { trophy } from '@/images'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { getTopUsers, getUserRankOptimized } from '@/utils/leaderboardService'

type LeaderboardItem = {
    username: string
    balance: number
    rank: number
}

const LeaderboardTab = () => {
    const { user, loading } = useUser()
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([])
    const [userRank, setUserRank] = useState<number | null>(null)
    const [userBalance, setUserBalance] = useState<number>(0)
    const [totalUsers, setTotalUsers] = useState<number>(0)
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true)

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const topUsers = await getTopUsers(50)
                setLeaderboardData(topUsers.slice(0, 8))
            } catch (error) {
                console.error('Error fetching leaderboard:', error)
            } finally {
                setLoadingLeaderboard(false)
            }
        }
        fetchLeaderboard()
    }, [])

    useEffect(() => {
        async function fetchUserRank() {
            if (user?.id) {
                try {
                    const rankData = await getUserRankOptimized(user.id)
                    if (rankData) {
                        setUserRank(rankData.rank)
                        setUserBalance(rankData.balance)
                        setTotalUsers(rankData.totalUsers)
                    }
                } catch (error) {
                    console.error('Error fetching user rank:', error)
                }
            }
        }
        fetchUserRank()
    }, [user])

    const getMedal = (rank: number): string => {
        if (rank === 1) return '🥇'
        if (rank === 2) return '🥈'
        if (rank === 3) return '🥉'
        return `#${rank}`
    }

    const formatBalance = (balance: number): string => {
        return balance.toLocaleString()
    }

    return (
        <div className={`leaderboard-tab-con transition-all duration-300`}>
            <div className="px-4">
                <div className="flex flex-col items-center mt-4">
                    <Image
                        src={trophy}
                        alt="Trophy"
                        width={80}
                        height={80}
                        className="mb-2"
                    />
                    <h1 className="text-2xl font-bold mb-2">Leaderboard</h1>
                    <div className="w-full mt-2 px-6 py-1 flex justify-between rounded-lg text-sm font-medium text-[#fefefe] bg-[#151516]">
                        <span>Total</span>
                        <span>{totalUsers > 0 ? totalUsers.toLocaleString() : 'Loading...'} users</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 mt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 p-1.5 bg-black rounded-lg">
                                <PawsLogo className="w-full h-full" />
                            </div>
                            <div className="text-black font-medium">
                                <div className="text-base">
                                    {loading ? 'Loading...' : (user?.username || 'You')}
                                </div>
                                <div className="text-xs">
                                    {loading ? '--' : formatBalance(userBalance || user?.balance || 0)} PAWS
                                </div>
                            </div>
                        </div>
                        <div className="text-black">
                            {userRank ? `#${userRank.toLocaleString()}` : '#--'}
                        </div>
                    </div>
                </div>

                <div className="mt-4 space-y-0 rounded-t-2xl">
                    {loadingLeaderboard ? (
                        <div className="text-center py-8 text-gray-400">Loading leaderboard...</div>
                    ) : leaderboardData.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">No data available yet</div>
                    ) : (
                        leaderboardData.map((item, index) => (
                            <div
                                key={item.rank}
                                className={`p-4 flex items-center justify-between border-b-[1px] border-[#222622] ${
                                    index === 0 ? 'bg-[#2d2b1b] rounded-t-2xl' :
                                    index === 1 ? 'bg-[#272728]' :
                                    index === 2 ? 'bg-[#2d241b]' :
                                    'bg-[#151515]'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 p-1.5 bg-white rounded-lg">
                                        <PawsLogo className="w-full h-full text-black" />
                                    </div>
                                    <div>
                                        <div className="text-base font-medium">{item.username}</div>
                                        <div className="text-sm font-medium text-[#7c7c7c]">
                                            {formatBalance(item.balance)} PAWS
                                        </div>
                                    </div>
                                </div>
                                <div className="text-base font-medium text-white">
                                    {getMedal(item.rank)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default LeaderboardTab
