'use client'

import PawsLogo from '@/icons/PawsLogo'
import { trophy } from '@/images'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { getUserTier, getEstimatedRank, getNextTier, getProgressToNextTier, RANK_TIERS } from '@/utils/rankingSystem'

type LeaderboardItem = {
    username: string
    balance: number
    place: number
    medal?: string
}

const leaderboardData: LeaderboardItem[] = [
    { username: 'CryptoWhale_2024', balance: 87_452_310, place: 1, medal: '👑' },
    { username: 'PAWS OG Hunter', balance: 76_891_204, place: 2, medal: '💎' },
    { username: 'DiamondHands_ETH', balance: 65_230_487, place: 3, medal: '💎' },
    { username: 'TON Believer', balance: 54_102_930, place: 4, medal: '💎' },
    { username: 'MegaMiner_99', balance: 43_871_256, place: 5, medal: '💎' },
    { username: 'PAWS Legend', balance: 32_654_018, place: 6, medal: '💎' },
    { username: 'EarlyBird_TG', balance: 28_401_732, place: 7, medal: '💎' },
    { username: 'TokenCollector', balance: 21_987_654, place: 8, medal: '💎' },
    { username: 'AirdropFarmer', balance: 18_320_412, place: 9, medal: '💎' },
    { username: 'PAWS Maximalist', balance: 12_764_891, place: 10, medal: '🐋' },
    { username: 'WhaleWatcher', balance: 9_450_213, place: 11, medal: '🐋' },
    { username: 'CryptoNomad', balance: 7_832_109, place: 12, medal: '🐋' },
    { username: 'DailyMiner_Pro', balance: 5_120_432, place: 13, medal: '🐋' },
    { username: 'PAWS Enthusiast', balance: 3_890_765, place: 14, medal: '🌟' },
    { username: 'TG Power User', balance: 2_541_230, place: 15, medal: '🌟' },
    { username: 'ReferralKing', balance: 1_876_543, place: 16, medal: '🌟' },
    { username: 'TaskMaster_2024', balance: 1_234_876, place: 17, medal: '🌟' },
    { username: 'ConsistentEarner', balance: 892_341, place: 18, medal: '✅' },
    { username: 'PAWS Grind', balance: 654_789, place: 19, medal: '✅' },
    { username: 'ActiveMiner_Daily', balance: 432_156, place: 20, medal: '🐾' },
]

const totalUsers = 23_253_686

const LeaderboardTab = () => {
    const { user, loading } = useUser()
    const [userRank, setUserRank] = useState('#--')
    const [userPosition, setUserPosition] = useState<number | null>(null)
    const [showTierFilter, setShowTierFilter] = useState(false)
    const [selectedTier, setSelectedTier] = useState<string>('all')

    useEffect(() => {
        if (user && user.balance) {
            const rank = getEstimatedRank(user.balance)
            setUserRank(rank)

            const tier = getUserTier(user.balance)
            const tierIndex = leaderboardData.findIndex(item => getUserTier(item.balance).label === tier.label)
            if (tierIndex >= 0) {
                setUserPosition(tierIndex + 1)
            }
        } else if (!loading) {
            setUserRank('#--')
        }
    }, [user, loading])

    const currentTier = user ? getUserTier(user.balance || 0) : null

    const getTierColor = (balance: number) => {
        return getUserTier(balance).color
    }

    const getTierIcon = (balance: number) => {
        return getUserTier(balance).icon
    }

    const getMedalColor = (place: number) => {
        if (place === 1) return 'from-[#ffd700] to-[#b8860b]'
        if (place === 2) return 'from-[#c0c0c0] to-[#808080]'
        if (place === 3) return 'from-[#cd7f32] to-[#8b4513]'
        return ''
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
                    <div className="w-full mt-2 px-4 py-2 flex justify-between rounded-lg text-sm font-medium text-[#fefefe] bg-[#151516] border border-[#2d2d2e]">
                        <span>Total Users</span>
                        <span>{totalUsers.toLocaleString()}</span>
                    </div>
                </div>

                {/* User Card */}
                <div
                    className="rounded-2xl p-4 mt-4 border-2"
                    style={{
                        backgroundColor: currentTier ? currentTier.bgColor : '#151516',
                        borderColor: currentTier ? currentTier.color : '#2d2d2e'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 p-1.5 rounded-lg" style={{ backgroundColor: '#0f172a' }}>
                                <PawsLogo className="w-full h-full" />
                            </div>
                            <div>
                                <div className="text-base font-semibold text-[#fefefe]">{loading ? 'Loading...' : (user?.username || 'You')}</div>
                                <div className="text-xs" style={{ color: currentTier?.color || '#868686' }}>
                                    {loading ? '--' : (user?.balance || 50000).toLocaleString()} PAWS · {currentTier?.label || 'Newcomer'}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-[#fefefe]">{userRank}</div>
                            <div className="text-[10px] text-[#868686]">of {totalUsers.toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Progress to next tier */}
                    {currentTier && currentTier.maxBalance !== Infinity && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="flex justify-between text-xs text-[#868686] mb-1">
                                <span>Next: {RANK_TIERS[RANK_TIERS.indexOf(currentTier) + 1]?.label || 'Legend'}</span>
                                <span style={{ color: RANK_TIERS[RANK_TIERS.indexOf(currentTier) + 1]?.color || '#ffd700' }}>
                                    {Math.floor(getProgressToNextTier(user?.balance || 0))}%
                                </span>
                            </div>
                            <div className="w-full bg-[#1f1f20] rounded-full h-1.5">
                                <div
                                    className="h-1.5 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${getProgressToNextTier(user?.balance || 0)}%`,
                                        backgroundColor: RANK_TIERS[RANK_TIERS.indexOf(currentTier) + 1]?.color || '#ffd700'
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Top Leaderboard */}
                <div className="mt-5">
                    <div className="text-sm font-semibold text-[#fefefe] mb-3 flex items-center gap-2">
                        <span>Top Holders</span>
                        <span className="text-[10px] text-[#868686] font-normal">Top 20 globally</span>
                    </div>

                    <div className="space-y-1">
                        {leaderboardData.map((item, index) => {
                            const tierColor = getTierColor(item.balance)
                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-xl bg-[#151516] border border-[#222622] hover:bg-[#1a1a1b] transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {item.medal ? (
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm bg-gradient-to-br ${getMedalColor(item.place)}`}>
                                                {item.medal}
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-[#2d2d2e] flex items-center justify-center text-xs text-[#868686] font-semibold">
                                                #{item.place}
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-sm font-medium text-[#fefefe]">{item.username}</div>
                                            <div className="text-xs text-[#868686]">
                                                {item.balance.toLocaleString()} PAWS
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm">{getTierIcon(item.balance)}</span>
                                        <div
                                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                            style={{ color: tierColor, backgroundColor: getUserTier(item.balance).bgColor }}
                                        >
                                            {getTierIcon(item.balance)} {getUserTier(item.balance).label}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="h-24" />
            </div>
        </div>
    )
}

export default LeaderboardTab
