'use client'

import PawsLogo from '@/icons/PawsLogo'
import { trophy } from '@/images/'
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

// Massive realistic global human name pools (all continents)
// These are common real names - feels human, not robotic
const newcomerNames = [
    // English/Western
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
    'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
    'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra',
    'Donald', 'Donna', 'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle',
    'Kenneth', 'Laura', 'Kevin', 'Sarah', 'Brian', 'Kimberly', 'George', 'Deborah', 'Edward', 'Dorothy',
    'Ronald', 'Lisa', 'Timothy', 'Nancy', 'Jason', 'Karen', 'Jeffrey', 'Betty', 'Ryan', 'Helen',
    // African
    'Kwame', 'Amara', 'Chidi', 'Zainab', 'Tunde', 'Fatima', 'Oluwaseun', 'Aisha', 'Kofi', 'Nia',
    'Mandla', 'Zola', 'Sipho', 'Thandi', 'Juma', 'Hassan', 'Omar', 'Amina', 'Emeka', 'Chioma',
    'Bakari', 'Dalia', 'Femi', 'Grace', 'Ibrahim', 'Hawa', 'Jelani', 'Kesi', 'Lekan', 'Makena',
    // Asian
    'Wei', 'Yuki', 'Raj', 'Sunita', 'Min', 'Hana', 'Arjun', 'Priya', 'Chen', 'Mei',
    'Hiroshi', 'Sakura', 'Vikram', 'Anjali', 'Takeshi', 'Yuna', 'Sanjay', 'Deepa', 'Kenji', 'Rina',
    'Li', 'Xia', 'Rahul', 'Neha', 'Zhang', 'Jing', 'Amit', 'Pooja', 'Tanaka', 'Yui',
    // European
    'Hans', 'Greta', 'Pierre', 'Marie', 'Giovanni', 'Sophia', 'Lars', 'Ingrid', 'Mateo', 'Carmen',
    'Franz', 'Klaus', 'Heidi', 'Luca', 'Isabella', 'Niklas', 'Elena', 'Dmitri', 'Svetlana', 'Ivan',
    'Andrei', 'Katya', 'Sven', 'Freya', 'Marco', 'Giulia', 'Anton', 'Natasha', 'Hugo', 'Clara',
    // Latin American
    'Santiago', 'Valentina', 'Mateo', 'Camila', 'Diego', 'Sofia', 'Miguel', 'Isabella', 'Javier', 'Lucia',
    'Carlos', 'Gabriela', 'Luis', 'Daniela', 'Jose', 'Mariana', 'Fernando', 'Alejandra', 'Ricardo', 'Valeria',
    'Andres', 'Paula', 'Sebastian', 'Martina', 'Nicolas', 'Emilia', 'Pablo', 'Jimena', 'Hector', 'Renata',
    // Middle Eastern
    'Ahmed', 'Fatima', 'Omar', 'Layla', 'Ali', 'Zahra', 'Hassan', 'Noor', 'Khalid', 'Amina',
    'Tariq', 'Yasmin', 'Samir', 'Leila', 'Rashid', 'Samira', 'Faisal', 'Hoda', 'Bassem', 'Rania',
    'Karim', 'Dalia', 'Zaid', 'Maya', 'Ibrahim', 'Nour', 'Hamid', 'Jamila', 'Saeed', 'Lina',
]

const activeNames = [
    // English/Western
    'Alexander', 'Emma', 'Benjamin', 'Olivia', 'Samuel', 'Sophia', 'Henry', 'Ava', 'Jackson', 'Isabella',
    'Sebastian', 'Mia', 'Jack', 'Charlotte', 'Owen', 'Amelia', 'Theodore', 'Harper', 'Aiden', 'Evelyn',
    'Elijah', 'Abigail', 'Levi', 'Emily', 'Isaac', 'Elizabeth', 'Lincoln', 'Mila', 'Hudson', 'Ella',
    'Grayson', 'Avery', 'Nathan', 'Scarlett', 'Caleb', 'Madison', 'Mason', 'Lily', 'Leo', 'Chloe',
    'Julian', 'Layla', 'Lucas', 'Riley', 'Miles', 'Nora', 'Ezra', 'Hazel', 'Silas', 'Ellie',
    // African
    'Chinedu', 'Ngozi', 'Kwesi', 'Abena', 'Obi', 'Nneka', 'Babatunde', 'Folake', 'Oladipo', 'Yetunde',
    'Chukwu', 'Adaeze', 'Ndidi', 'Obinna', 'Uche', 'Nkechi', 'Tayo', 'Bisola', 'Segun', 'Ronke',
    'Musa', 'Zainab', 'Kwame', 'Akosua', 'Kojo', 'Ama', 'Yaw', 'Adwoa', 'Kofi', 'Efua',
    // Asian
    'Rohan', 'Ananya', 'Vikram', 'Divya', 'Arnav', 'Kavya', 'Aditya', 'Shreya', 'Karan', 'Riya',
    'Hiro', 'Aoi', 'Ren', 'Yui', 'Daiki', 'Hina', 'Kaito', 'Mio', 'Sora', 'Nanami',
    'Jun', 'Minji', 'Tae', 'Eunji', 'Jin', 'Soo', 'Minho', 'Jisoo', 'Dong', 'Hyerin',
    // European
    'Bjorn', 'Astrid', 'Erik', 'Sigrid', 'Lars', 'Maja', 'Oskar', 'Linnea', 'Felix', 'Emilia',
    'Viktor', 'Anastasia', 'Igor', 'Olga', 'Pavel', 'Tatiana', 'Mikhail', 'Svetlana', 'Dmitry', 'Irina',
    'Hans', 'Lotte', 'Pieter', 'Mieke', 'Lukas', 'Anna', 'Matthias', 'Julia', 'Stefan', 'Eva',
    // Latin American
    'Agustin', 'Martina', 'Benicio', 'Renata', 'Ciro', 'Julieta', 'Dario', 'Santino', 'Guadalupe', 'Thiago',
    'Bautista', 'Alma', 'Lautaro', 'Regina', 'Joaquin', 'Elena', 'Bruno', 'Aitana', 'Gael', 'Vera',
    'Leonardo', 'Monserrat', 'Emiliano', 'Jimena', 'Maximiliano', 'Ximena', 'Iker', 'Mariana', 'Rodrigo', 'Daniela',
    // Middle Eastern
    'Yusuf', 'Maryam', 'Abdullah', 'Aisha', 'Hussein', 'Zainab', 'Tariq', 'Leila', 'Walid', 'Rana',
    'Bilal', 'Huda', 'Samir', 'Dina', 'Rami', 'Nadia', 'Ziad', 'Hala', 'Fadi', 'Rima',
    'Imad', 'Sana', 'Bashar', 'Alia', 'Mazen', 'Rania', 'Nabil', 'Hanan', 'Rafiq', 'Najwa',
]

const trustedNames = [
    'Jonathan', 'Rebecca', 'Becky', 'Jude', 'Bathrod', 'Nathaniel', 'Catherine', 'Zachary', 'Victoria', 'Gabriel',
    'Samantha', 'Benjamin', 'Audrey', 'Dominic', 'Penelope', 'Elijah', 'Claire', 'Julian', 'Lydia', 'Adrian',
    'Margaret', 'Isaac', 'Diana', 'Cameron', 'Grace', 'Evan', 'Hannah', 'Oliver', 'Sophie', 'Liam',
    'Chloe', 'Noah', 'Ava', 'Ethan', 'Mia', 'Lucas', 'Charlotte', 'Mason', 'Amelia', 'Logan',
    'Harper', 'Ella', 'Aiden', 'Scarlett', 'Jackson', 'Lily', 'Sebastian', 'Riley', 'Jack', 'Nora',
    'Henry', 'Hazel', 'Levi', 'Ellie', 'Miles', 'Abigail', 'Caleb', 'Emily', 'Grayson', 'Elizabeth',
    'Theodore', 'Mila', 'Hudson', 'Evelyn', 'Owen', 'Avery', 'Samuel', 'Madison', 'Joseph', 'Layla',
    'David', 'Aria', 'Daniel', 'Elena', 'Matthew', 'Sofia', 'Anthony', 'Aurora', 'Andrew', 'Natalie',
    'Joshua', 'Brooklyn', 'Christopher', 'Leah', 'John', 'Savannah', 'James', 'Blake', 'Robert', 'Lucy',
    'Thomas', 'Paisley', 'Charles', 'Addison', 'William', 'Stella', 'Joseph', 'Genesis', 'Richard', 'Violet',
    'Kwame', 'Amara', 'Chidi', 'Zainab', 'Tunde', 'Fatima', 'Oluwaseun', 'Aisha', 'Kofi', 'Nia',
    'Mandla', 'Zola', 'Sipho', 'Thandi', 'Juma', 'Hassan', 'Omar', 'Amina', 'Emeka', 'Chioma',
    'Bakari', 'Dalia', 'Femi', 'Grace', 'Ibrahim', 'Hawa', 'Jelani', 'Kesi', 'Lekan', 'Makena',
    'Wei', 'Yuki', 'Raj', 'Sunita', 'Min', 'Hana', 'Arjun', 'Priya', 'Chen', 'Mei',
    'Hiroshi', 'Sakura', 'Vikram', 'Anjali', 'Takeshi', 'Yuna', 'Sanjay', 'Deepa', 'Kenji', 'Rina',
    'Santiago', 'Valentina', 'Mateo', 'Camila', 'Diego', 'Sofia', 'Miguel', 'Isabella', 'Javier', 'Lucia',
    'Ahmed', 'Fatima', 'Omar', 'Layla', 'Ali', 'Zahra', 'Hassan', 'Noor', 'Khalid', 'Amina',
]

const influencerNames = [
    'CryptoKing', 'Maximalist', 'TokenCollector', 'Miner_Mogul', 'Godfather',
    'TG_Influencer', 'CryptoTitan', 'TokenBaron', 'Miner_Prince', 'Duke',
    'TG_Earl', 'CryptoMarquis', 'TokenShah', 'Miner_King', 'Emperor',
    'TG_Caesar', 'CryptoSultan', 'TokenPharaoh', 'Miner_Tsar', 'Sovereign',
    'TG_Magnate', 'CryptoBaron', 'TokenDuke', 'Miner_Earl', 'Lord',
    'TG_Baron', 'CryptoCount', 'TokenViscount', 'Miner_Baron', 'Viscount',
    'TG_Knight', 'CryptoEsquire', 'TokenLord', 'Miner_Sir', 'Noble',
    'TG_Prime', 'CryptoRoyal', 'TokenCrown', 'Miner_Regal', 'Majesty',
    'TG_Supreme', 'CryptoElite', 'TokenPrime', 'Miner_Alpha', 'Omega',
    'TG_Apex', 'CryptoZenith', 'TokenPeak', 'Miner_Summit', 'Pinnacle',
]

const whaleNames = [
    'CryptoWhale_2024', 'OG_Hunter', 'DiamondHands_ETH', 'TON_Believer', 'MegaMiner_99',
    'Legend', 'EarlyBird_TG', 'WhaleWatcher', 'CryptoNomad', 'DailyMiner_Pro',
    'Whale_X', 'TG_CryptoGod', 'TokenShark', 'Miner_Orca', 'Leviathan',
    'CryptoKraken', 'TG_BlueWhale', 'TokenHumpback', 'Miner_Sperm', 'Right',
    'CryptoMammoth', 'TG_Giant', 'TokenTitan', 'Miner_Colossus', 'Goliath',
    'CryptoJuggernaut', 'TG_Behemoth', 'TokenMonster', 'Miner_Alpha', 'Omega',
    'CryptoSupreme', 'TG_Ultra', 'TokenMega', 'Miner_Giga', 'Tera',
    'CryptoInfinite', 'TG_Eternal', 'TokenBoundless', 'Miner_Endless', 'Vast',
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

// Seeded PRNG (Mulberry32) - deterministic but feels random
function mulberry32(seed: number) {
    return function() {
        let t = seed += 0x6D2B79F5
        t = Math.imul(t ^ t >>> 15, t | 1)
        t ^= t + Math.imul(t ^ t >>> 7, t | 61)
        return ((t ^ t >>> 14) >>> 0) / 4294967296
    }
}

// Deterministic shuffle using seed
function seededShuffle(arr: string[], seed: number) {
    const shuffled = [...arr]
    const rng = mulberry32(seed)
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// Get a "time window" key that shifts based on real time, not tick state
// This ensures continuity across app restarts
function getTimeWindow(intervalSeconds: number): number {
    return Math.floor(Date.now() / 1000 / intervalSeconds)
}

function getUsernameForTier(tierLabel: string, indexInTier: number, timeWindows: Record<string, number>): string {
    const pool = namePools[tierLabel]
    if (!pool) return 'Unknown'

    // Elite & Legend: constant name pools, only shuffle positions periodically
    // Offset Legend by half its interval so they don't shuffle simultaneously
    if (tierLabel === 'Elite' || tierLabel === 'Legend') {
        const interval = tierLabel === 'Elite' ? 86400 : 259200 // 1 day / 3 days (in seconds)
        const offset = tierLabel === 'Legend' ? 129600 : 0 // Half of Legend's interval
        const windowKey = Math.floor((Date.now() / 1000 + offset) / interval)
        const shuffledPool = seededShuffle(pool, windowKey)
        return shuffledPool[indexInTier % shuffledPool.length]
    }

    // Lower tiers: rotate names continuously using real time
    // The window changes at different rates per tier, creating organic feel
    const tierIntervals: Record<string, number> = {
        'Newcomer': 3,     // Every 3 seconds
        'Active': 6,       // Every 6 seconds
        'Trusted': 12,     // Every 12 seconds
        'Influencer': 18,  // Every 18 seconds
        'Whale': 24,       // Every 24 seconds
    }

    const interval = tierIntervals[tierLabel] || 3
    const windowKey = Math.floor(Date.now() / 1000 / interval)
    // Use indexInTier + windowKey to get different name per position
    const shuffledPool = seededShuffle(pool, windowKey)
    return shuffledPool[indexInTier % shuffledPool.length]
}

const LeaderboardTab = () => {
    const { user, loading } = useUser()
    const [userRank, setUserRank] = useState('#--')
    const [timeWindows, setTimeWindows] = useState<Record<string, number>>({})

    // Update time windows every 3 seconds to trigger re-renders
    useEffect(() => {
        const updateWindows = () => {
            setTimeWindows({
                Newcomer: getTimeWindow(3),
                Active: getTimeWindow(6),
                Trusted: getTimeWindow(12),
                Influencer: getTimeWindow(18),
                Whale: getTimeWindow(24),
                Elite: getTimeWindow(86400),
                Legend: getTimeWindow(259200),
            })
        }
        updateWindows()
        const interval = setInterval(updateWindows, 3000)
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

    // Build dynamic leaderboard data sequentially to enforce food chain
    const leaderboardData: LeaderboardItem[] = []
    const tierOrder = ['Newcomer', 'Active', 'Trusted', 'Influencer', 'Whale', 'Elite', 'Legend']
    const daysSinceEpoch = Math.floor(Date.now() / 86400000)

    baseBalances.forEach((balance, index) => {
        const tier = getUserTier(balance)
        const tierStartIndex = baseBalances.findIndex(b => getUserTier(b).label === tier.label)
        const indexInTier = index - tierStartIndex
        const username = getUsernameForTier(tier.label, indexInTier, timeWindows)

        // Balance logic per tier - maintain food chain: Legend > Elite > Whale > Influencer > Trusted > Active > Newcomer
        let adjustedBalance = balance

        if (tier.label === 'Newcomer') {
            // Newcomer: static base balance (same for all new users)
            adjustedBalance = balance
        } else if (tier.label === 'Active' || tier.label === 'Trusted' || tier.label === 'Influencer' || tier.label === 'Whale') {
            // These tiers: balances always changing organically (like earning at different split seconds)
            // SLOWER changes: use minutes for slower oscillation
            const now = Date.now() / 1000 / 60
            const tierSpeed = tier.label === 'Active' ? 0.3 : tier.label === 'Trusted' ? 0.25 : tier.label === 'Influencer' ? 0.2 : 0.15
            const timeFactor = now * tierSpeed + index * 3.14159
            const wave1 = Math.sin(timeFactor * 0.3) * 0.015
            const wave2 = Math.sin(timeFactor * 0.7 + index) * 0.01
            const wave3 = Math.sin(timeFactor * 1.5 + index * 0.7) * 0.008
            const fluctuation = wave1 + wave2 + wave3
            adjustedBalance = Math.floor(balance * (1 + fluctuation))

            // FOOD CHAIN: Ensure this person stays below the person directly above
            if (leaderboardData.length > 0) {
                const personAbove = leaderboardData[leaderboardData.length - 1]
                if (adjustedBalance >= personAbove.balance) {
                    adjustedBalance = Math.floor(personAbove.balance * 0.95)
                }
            }
        } else if (tier.label === 'Elite') {
            // Elite: constant names, slow growth every ~5 days (+8% per cycle)
            const growthMultiplier = 1 + Math.floor(daysSinceEpoch / 5) * 0.08
            adjustedBalance = Math.floor(balance * growthMultiplier)
            // Ensure Elite < Legend (person above)
            if (leaderboardData.length > 0) {
                const personAbove = leaderboardData[leaderboardData.length - 1]
                if (adjustedBalance >= personAbove.balance) {
                    adjustedBalance = Math.floor(personAbove.balance * 0.90)
                }
            }
        } else if (tier.label === 'Legend') {
            // Legends: constant names, slowest growth every ~7 days (+12% per cycle)
            const growthMultiplier = 1 + Math.floor(daysSinceEpoch / 7) * 0.12
            adjustedBalance = Math.floor(balance * growthMultiplier)
        }

        leaderboardData.push({
            username,
            balance: adjustedBalance,
            place: index + 1,
            medal: getMedal(index + 1),
        })
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
