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

// Highly realistic global usernames pool (no repeats)
const newcomerNames = [
    'CryptoNewbie_X', 'JustJoinedTG', 'PAWS_Fresh', 'FirstTimer_24', 'StartedToday',
    'MiniApp_Lover', 'TG_Gamer_01', 'TokenClicker', 'NewMiner_2025', 'PAWS_Beginner',
    'WeekendMiner', 'DailyVisitor', 'CryptoRookie', 'StartedNow_TG', 'PAWS_Newbie',
    'FirstTime_X', 'TokenFan_2025', 'TG_NewUser', 'PAWS_Started', 'CryptoStarter',
    'JustHere_TG', 'Miner_New', 'PAWS_Spark', 'CryptoBaby_X', 'TG_FreshStart',
    'AirdropNew', 'PAWS_Zero', 'CryptoDawn', 'TG_JustIn', 'Miner_FirstDay',
    'PAWS_Infant', 'TokenNewb', 'CryptoHatch', 'TG_BlankSlate', 'PAWS_Sprout',
    'NewFaucet', 'Miner_Zero', 'CryptoNovice', 'TG_Unboxing', 'PAWS_Origin',
    'FreshStart_X', 'CryptoInit', 'TG_NewBlood', 'PAWS_Genesis', 'Miner_Birth',
]

const activeNames = [
    'TG_Player_X', 'PAWS_Active', 'DailyMiner_24', 'CryptoGrind', 'TokenHunter',
    'TG_Regular', 'PAWS_Daily', 'Miner_Pro', 'CryptoFan_2025', 'TokenFarm_X',
    'TG_Devoted', 'PAWS_Streak', 'Miner_Master', 'CryptoBae', 'TokenGuru',
    'TG_Loyal', 'PAWS_Warrior', 'Miner_Elite', 'CryptoKing_X', 'TokenLord',
    'TG_Titan', 'PAWS_Champ', 'Miner_Legend', 'CryptoGod_24', 'TokenSaint',
    'TG_Phoenix', 'PAWS_Dragon', 'Miner_Storm', 'CryptoFlash', 'TokenBlaze',
    'TG_Viper', 'PAWS_Raven', 'Miner_Falcon', 'CryptoApex', 'TokenPrime',
    'TG_Shadow', 'PAWS_Ghost', 'Miner_Stealth', 'CryptoNeon', 'TokenFlux',
]

const trustedNames = [
    'PAWS OG Hunter', 'TG_PowerUser', 'CryptoDemon', 'TokenWizard_X', 'Miner_Shadow',
    'PAWS_Enthusiast', 'TG_Legendary', 'CryptoPhoenix', 'TokenTitan', 'Miner_Inferno',
    'PAWS_Overlord', 'TG_Warlod', 'CryptoEmperor', 'TokenDeity', 'Miner_Celestial',
    'PAWS_Archon', 'TG_GrandMaster', 'CryptoImmortal', 'TokenAlmighty', 'Miner_Oracle',
]

const influencerNames = [
    'ReferralKing_24', 'PAWS_Maximalist', 'CryptoWhale_Pro', 'TokenCollector', 'Miner_Mogul',
    'PAWS_Godfather', 'TG_Influencer_X', 'CryptoTitan_24', 'TokenBaron', 'Miner_Prince',
    'PAWS_Duke', 'TG_Earl', 'CryptoMarquis', 'TokenShah', 'Miner_King',
    'PAWS_Emperor', 'TG_Caesar', 'CryptoSultan', 'TokenPharaoh', 'Miner_Tsar',
]

const whaleNames = [
    'CryptoWhale_2024', 'PAWS_OG_Hunter', 'DiamondHands_ETH', 'TON_Believer', 'MegaMiner_99',
    'PAWS_Legend', 'EarlyBird_TG', 'WhaleWatcher', 'CryptoNomad', 'DailyMiner_Pro',
    'PAWS_Whale_X', 'TG_CryptoGod', 'TokenShark', 'Miner_Orca', 'PAWS_Leviathan',
    'CryptoKraken', 'TG_BlueWhale', 'TokenHumpback', 'Miner_Sperm', 'PAWS_Right',
]

const eliteNames = [
    'CryptoWhale_2024', 'PAWS_OG_Hunter', 'DiamondHands_ETH', 'TON_Believer', 'MegaMiner_99',
    'PAWS_Legend', 'EarlyBird_TG', 'WhaleWatcher', 'CryptoNomad', 'DailyMiner_Pro',
]

const legendNames = [
    'CryptoWhale_2024', 'PAWS_OG_Hunter', 'DiamondHands_ETH', 'TON_Believer', 'MegaMiner_99',
]

// Static top 50 base balances
const baseBalances = [
    87_452_310, 76_891_204, 65_230_487, 54_102_930, 43_871_256,
    32_654_018, 28_401_732, 21_987_654, 18_320_412, 12_764_891,
    9_450_213, 7_832_109, 5_120_432, 3_890_765, 2_541_230,
    1_876_543, 1_234_876, 892_341, 654_789, 432_156,
    389_012, 321_456, 287_654, 245_123, 212_987,
    189_345, 156_789, 134_567, 112_345, 98_765,
    87_654, 76_543, 65_432, 54_321, 48_900,
    42_100, 35_678, 29_456, 23_210, 18_765,
    14_320, 11_540, 8_900, 6_750, 4_200,
    2_890, 1_567, 987, 654, 234,
]

// Medal mapping
const getMedal = (place: number) => {
    if (place === 1) return '👑'
    if (place <= 3) return '💎'
    if (place <= 9) return '💎'
    if (place <= 13) return '🐋'
    if (place <= 17) return '🌟'
    if (place <= 20) return '✅'
    return undefined
}

const totalUsers = 23_253_686

// Name pools per tier
const namePools: Record<string, string[]> = {
    'Newcomer': newcomerNames,
    'Active': activeNames,
    'Trusted': trustedNames,
    'Influencer': influencerNames,
    'Whale': whaleNames,
    'Elite': eliteNames,
    'Legend': legendNames,
}

function getUsernameForTier(tierLabel: string, indexInTier: number, tick: number): string {
    const pool = namePools[tierLabel]
    if (!pool) return 'Unknown'

    // Only rotate names for Legend and Elite tiers
    if (tierLabel === 'Legend' || tierLabel === 'Elite') {
        // Legend: changes every 86400 ticks (~3 days if 3s/tick = 259200s)
        // Elite: changes every 28800 ticks (~1 day if 3s/tick = 86400s)
        const speed = tierLabel === 'Legend' ? 86400 : 28800
        const offset = Math.floor(tick / speed) % pool.length
        return pool[(indexInTier + offset) % pool.length]
    }

    // Static names for other tiers
    return pool[indexInTier] || `User_${indexInTier}`
}

const LeaderboardTab = () => {
    const { user, loading } = useUser()
    const [userRank, setUserRank] = useState('#--')
    const [tick, setTick] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setTick(t => t + 1)
        }, 3000) // Update every 3 seconds
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (user && user.balance) {
            const rank = getEstimatedRank(user.balance)
            setUserRank(rank)
        } else if (!loading) {
            setUserRank('#--')
        }
    }, [user, loading])

    const currentTier = user ? getUserTier(user.balance || 0) : null

    // Build dynamic leaderboard data
    const leaderboardData = baseBalances.map((balance, index) => {
        const tier = getUserTier(balance)
        const tierStartIndex = baseBalances.findIndex(b => getUserTier(b).label === tier.label)
        const indexInTier = index - tierStartIndex
        const username = getUsernameForTier(tier.label, indexInTier, tick)

        // Increase balance over time for Legend and Elite (simulate investment)
        let adjustedBalance = balance
        if (tier.label === 'Legend') {
            // Legends: massive growth every ~3 days (+15% per cycle)
            const growthMultiplier = 1 + Math.floor(tick / 86400) * 0.15
            adjustedBalance = Math.floor(balance * growthMultiplier)
        } else if (tier.label === 'Elite') {
            // Elite: moderate growth every ~1 day (+5% per cycle)
            const growthMultiplier = 1 + Math.floor(tick / 28800) * 0.05
            adjustedBalance = Math.floor(balance * growthMultiplier)
        }

        return {
            username,
            balance: adjustedBalance,
            place: index + 1,
            medal: getMedal(index + 1),
        }
    })

    const getTierColor = (balance: number) => getUserTier(balance).color
    const getTierIcon = (balance: number) => getUserTier(balance).icon

    return (
        <div className={`leaderboard-tab-con transition-all duration-300`}>
            <div className="px-4">
                <div className="flex flex-col items-center mt-4">
                    <Image src={trophy} alt="Trophy" width={80} height={80} className="mb-2" />
                    <h1 className="text-2xl font-bold mb-2">Leaderboard</h1>
                    <div className="w-full mt-2 px-4 py-2 flex justify-between rounded-lg text-sm font-medium text-[#fefefe] bg-[#151516] border border-[#2d2d2e]">
                        <span>Total Users</span>
                        <span>{totalUsers.toLocaleString()}</span>
                    </div>
                </div>

                {/* User Card */}
                <div className="rounded-2xl p-4 mt-4 border-2" style={{
                    backgroundColor: currentTier ? currentTier.bgColor : '#151516',
                    borderColor: currentTier ? currentTier.color : '#2d2d2e'
                }}>
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

                    {currentTier && currentTier.maxBalance !== Infinity && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="flex justify-between text-xs text-[#868686] mb-1">
                                <span>Next: {RANK_TIERS[RANK_TIERS.indexOf(currentTier) + 1]?.label || 'Legend'}</span>
                                <span style={{ color: RANK_TIERS[RANK_TIERS.indexOf(currentTier) + 1]?.color || '#ffd700' }}>
                                    {Math.floor(getProgressToNextTier(user?.balance || 0))}%
                                </span>
                            </div>
                            <div className="w-full bg-[#1f1f20] rounded-full h-1.5">
                                <div className="h-1.5 rounded-full transition-all duration-500" style={{
                                    width: `${getProgressToNextTier(user?.balance || 0)}%`,
                                    backgroundColor: RANK_TIERS[RANK_TIERS.indexOf(currentTier) + 1]?.color || '#ffd700'
                                }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Top Leaderboard */}
                <div className="mt-5">
                    <div className="text-sm font-semibold text-[#fefefe] mb-3 flex items-center gap-2">
                        <span>Top Holders</span>
                        <span className="text-[10px] text-[#868686] font-normal">Live · Updates every 3s</span>
                    </div>

                    <div className="space-y-1">
                        {leaderboardData.map((item, index) => {
                            const tierColor = getTierColor(item.balance)
                            return (
                                <div key={`${item.place}-${item.username}`} className="flex items-center justify-between p-3 rounded-xl bg-[#151516] border border-[#222622] hover:bg-[#1a1a1b] transition-colors">
                                    <div className="flex items-center gap-3">
                                        {item.medal ? (
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                                item.place === 1 ? 'bg-gradient-to-br from-[#ffd700] to-[#b8860b]' :
                                                item.place === 2 ? 'bg-gradient-to-br from-[#c0c0c0] to-[#808080]' :
                                                item.place === 3 ? 'bg-gradient-to-br from-[#cd7f32] to-[#8b4513]' :
                                                'bg-[#2d2d2e]'
                                            }`}>
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
                                        <div className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{
                                            color: tierColor,
                                            backgroundColor: getUserTier(item.balance).bgColor
                                        }}>
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
