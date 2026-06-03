'use client'

import PawsLogo from '@/icons/PawsLogo'
import { trophy } from '@/images/'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useUser } from '@/contexts/UserContext'
import { getUserTier, getEstimatedRank, getNextTier, getProgressToNextTier, RANK_TIERS } from '@/utils/rankingSystem'
import { getCurrentUserCount, formatUserCount } from '@/utils/userGrowth'

type LeaderboardItem = {
    username: string
    balance: number
    place: number
    medal?: { emoji: string; bg: string } | null
    tierLabel: string
    icon?: string | null
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
    'Alessandro', 'Yuki', 'Kwame', 'Hiroshi', 'Mateo',
    'Anastasia', 'Ravi', 'Zara', 'Dmitri', 'Fatima',
    'Sebastián', 'Priya', 'Björn', 'Aisha', 'Kenji',
    'Valentina', 'Rashid', 'Mei', 'Santiago', 'Olga',
    'Thabo', 'Hana', 'Elena', 'Omar', 'Yuna',
    'Marco', 'Nia', 'Chen', 'Isabella', 'Lars',
    'Amara', 'Viktor', 'Layla', 'Takeshi', 'Aria',
    'Chidi', 'Ingrid', 'Wei', 'Carmen', 'Rohan',
    'Svetlana', 'Diego', 'Amina', 'Felix', 'Zahra',
    'Kofi', 'Minji', 'Giovanni', 'Thandi', 'Arjun',
]

const whaleNames = [
    'Ahmed', 'Sophia', 'Ibrahim', 'Maria', 'Sakura',
    'David', 'Hassan', 'Emma', 'Tariq', 'Liam',
    'Yusuf', 'Ava', 'Khalid', 'Olivia', 'Rina',
    'Noah', 'Zainab', 'Mia', 'Gabriel', 'Isla',
    'Rafael', 'Sana', 'Aditya', 'Luna', 'Hiro',
    'Noor', 'Daniel', 'Amira', 'Ethan', 'Nadia',
    'Lucas', 'Jamila', 'Mason', 'Mira', 'Aiden',
    'Sabrina', 'Lena', 'Hugo', 'Sara', 'Max',
    'Livia', 'Nina', 'Otto', 'Theo', 'Romy',
    'Elio', 'Sofie', 'Milan', 'Lea', 'Jonas',
]

const eliteNames = [
    'Alexander', 'Victoria', 'Benjamin', 'Charlotte', 'William',
    'Sofia', 'James', 'Amelia', 'Oliver', 'Mia',
]

const legendNames = [
    'Sebastian', 'Anya', 'Nathaniel', 'Aurora', 'Maximilian',
]

// Static top 55 base balances - Legend: 3, Elite: 4, then others
// Order: Legend (top 3) > Elite (next 4) > Whale (next 8) > Influencer (next 10) > Trusted (next 10) > Active (next 8) > Newcomer (rest)
const baseBalances = [
    // Legend tier: Top 3 with exact balances
    1_676_553_667, 1_423_524_112, 1_243_134_776,
    // Elite tier (next 4): Exact balances
    812_222_565, 782_111_453, 767_654_998, 743_675_633,
    // Whale tier (7): Slightly lower than Elite minimum, trending downward
    680_000_000, 620_000_000, 550_000_000, 480_000_000, 410_000_000, 350_000_000, 290_000_000,
    // Influencer tier (9): 1M-240M
    200_000_000, 170_000_000, 140_000_000, 110_000_000, 85_000_000, 65_000_000, 48_000_000, 32_000_000, 18_000_000,
    // Trusted tier (10): 500K-10M
    8_900_000, 7_800_000, 6_700_000, 5_800_000, 5_200_000, 4_500_000, 3_800_000, 3_100_000, 2_500_000, 2_000_000,
    // Active tier (6): 100K-2M
    1_500_000, 1_200_000, 950_000, 750_000, 550_000, 350_000,
    // Newcomer tier (8): 0-100K
    95_000, 87_000, 78_000, 68_000, 55_000, 42_000, 28_000, 12_000,
]

// Medal mapping - only top 3 get medals, others show rank number
const getMedal = (place: number) => {
    if (place === 1) return { emoji: '👑', bg: 'from-[#ffd700] to-[#b8860b]' }
    if (place === 2) return { emoji: '🥈', bg: 'from-[#c0c0c0] to-[#808080]' }
    if (place === 3) return { emoji: '🥉', bg: 'from-[#cd7f32] to-[#8b4513]' }
    return null
}

const totalUsers = 2_000_000
const totalUserTarget = 2_000_000

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

function getUsernameForTier(tierLabel: string, indexInTier: number, timeWindows: Record<string, number>, nowOverride?: number): string {
    const pool = namePools[tierLabel]
    if (!pool) return 'Unknown'

    const now = nowOverride ?? Date.now()

    // Whale, Elite & Legend: static names (only change when user reaches threshold)
    if (tierLabel === 'Whale' || tierLabel === 'Elite' || tierLabel === 'Legend') {
        const shuffledPool = seededShuffle(pool, 0)
        return shuffledPool[indexInTier % shuffledPool.length]
    }

    // Lower tiers: rotate names at set intervals
    const tierIntervals: Record<string, number> = {
        'Newcomer': 6,         // Every 6 seconds
        'Active': 1800,        // Every 30 minutes
        'Trusted': 3600,       // Every 1 hour
        'Influencer': 172800,  // Every 2 days
    }

    const interval = tierIntervals[tierLabel] || 3
    const windowKey = Math.floor(now / 1000 / interval)
    const shuffledPool = seededShuffle(pool, windowKey)
    return shuffledPool[indexInTier % shuffledPool.length]
}

const LeaderboardTab = () => {
    const { user, loading } = useUser()
    const [userRank, setUserRank] = useState('#--')
    const [timeWindows, setTimeWindows] = useState<Record<string, number>>({})
    const [currentUsers, setCurrentUsers] = useState(getCurrentUserCount())
    const [isOnline, setIsOnline] = useState(true)
    const frozenTimestamp = useRef(Date.now())
    const totalUserProgress = Math.min(100, Math.floor((currentUsers / totalUserTarget) * 100))

    useEffect(() => {
        const goOnline = () => { setIsOnline(true); frozenTimestamp.current = Date.now() }
        const goOffline = () => { setIsOnline(false); frozenTimestamp.current = Date.now() }
        frozenTimestamp.current = Date.now()
        setIsOnline(navigator.onLine)
        window.addEventListener('online', goOnline)
        window.addEventListener('offline', goOffline)
        return () => {
            window.removeEventListener('online', goOnline)
            window.removeEventListener('offline', goOffline)
        }
    }, [])

    useEffect(() => {
        if (!isOnline) return
        const interval = setInterval(() => setCurrentUsers(getCurrentUserCount()), 30000)
        return () => clearInterval(interval)
    }, [isOnline])

    // Update time windows to trigger re-renders (only when online)
    useEffect(() => {
        const updateWindows = () => {
            if (navigator.onLine) {
                setTimeWindows({
                    Newcomer: getTimeWindow(6),
                    Active: getTimeWindow(1800),
                    Trusted: getTimeWindow(3600),
                    Influencer: getTimeWindow(172800),
                })
            }
        }
        updateWindows()
        const interval = setInterval(updateWindows, 6000)
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

    // Custom names and icons for top 14 entries
    const customNames: Record<number, string> = {
        0: 'Miles Deutscher',
        3: 'Crypto Capo',
        5: 'Sasha',
        8: 'Elio airdrop queen',
        10: 'Murad Mahmudov',
        11: 'Ash Crypto Hunter',
    }

    const entryIcons: Record<number, string> = {
        0: 'https://i.imgur.com/n9P1XZq.png',
        1: 'https://i.imgur.com/VjxGg7r.png',
        2: 'https://i.imgur.com/xIakklb.png',
        3: 'https://i.imgur.com/UxfGhXz.png',
        4: 'https://i.imgur.com/UgAe5Lr.png',
        5: 'https://i.imgur.com/GqTFnuh.png',
        6: 'https://i.imgur.com/qQpZKvj.png',
        7: 'https://i.imgur.com/XqNEeC6.png',
        8: 'https://i.imgur.com/2VwqadO.png',
        9: 'https://i.imgur.com/IBKrbvu.png',
        10: 'https://i.imgur.com/KFEebQT.png',
        11: 'https://i.imgur.com/39EVvkp.png',
        12: 'https://i.imgur.com/SzqCmoH.png',
        13: 'https://i.imgur.com/FYFMtTu.png',
    }

    // Build dynamic leaderboard data sequentially to enforce food chain
    const leaderboardData: LeaderboardItem[] = []
    const tierOrder = ['Newcomer', 'Active', 'Trusted', 'Influencer', 'Whale', 'Elite', 'Legend']
    const now = isOnline ? Date.now() : frozenTimestamp.current
    const weekDuration = 7 * 86400000
    const weeksSinceEpoch = Math.floor(now / weekDuration)
    const weekProgress = Math.min(1, (now % weekDuration) / weekDuration)

    baseBalances.forEach((balance, index) => {
        const tier = getUserTier(balance)
        const tierStartIndex = baseBalances.findIndex(b => getUserTier(b).label === tier.label)
        const indexInTier = index - tierStartIndex
        let username = getUsernameForTier(tier.label, indexInTier, timeWindows, isOnline ? undefined : frozenTimestamp.current)

        // Override custom names for top entries
        if (index in customNames) {
            username = customNames[index]
        }

        // Balance logic per tier - maintain food chain: Legend > Elite > Whale > Influencer > Trusted > Active > Newcomer
        let adjustedBalance = balance

        if (tier.label === 'Newcomer') {
            adjustedBalance = balance
        } else if (tier.label === 'Influencer') {
            // Influencers: total ~87M/wk (15B/2mo across all tiers)
            const weeklyAdd = 15_000_000 - indexInTier * 1_400_000
            const totalGrowth = weeklyAdd * (weeksSinceEpoch + weekProgress)
            adjustedBalance = Math.floor(balance + totalGrowth)
            if (leaderboardData.length > 0) {
                const personAbove = leaderboardData[leaderboardData.length - 1]
                if (adjustedBalance >= personAbove.balance) {
                    adjustedBalance = Math.floor(personAbove.balance * 0.95)
                }
            }
        } else if (tier.label === 'Trusted') {
            // Trusted: total ~22M/wk
            const weeklyAdd = 4_000_000 - indexInTier * 400_000
            const totalGrowth = weeklyAdd * (weeksSinceEpoch + weekProgress)
            adjustedBalance = Math.floor(balance + totalGrowth)
            if (leaderboardData.length > 0) {
                const personAbove = leaderboardData[leaderboardData.length - 1]
                if (adjustedBalance >= personAbove.balance) {
                    adjustedBalance = Math.floor(personAbove.balance * 0.95)
                }
            }
        } else if (tier.label === 'Active') {
            // Active: total ~4.4M/wk
            const weeklyAdd = 900_000 - indexInTier * 100_000
            const totalGrowth = weeklyAdd * (weeksSinceEpoch + weekProgress)
            adjustedBalance = Math.floor(balance + totalGrowth)
            if (leaderboardData.length > 0) {
                const personAbove = leaderboardData[leaderboardData.length - 1]
                if (adjustedBalance >= personAbove.balance) {
                    adjustedBalance = Math.floor(personAbove.balance * 0.95)
                }
            }
        } else if (tier.label === 'Whale') {
            // Whale: total ~437.5M/wk
            const weeklyAdd = 100_000_000 - indexInTier * 12_500_000
            const totalGrowth = weeklyAdd * (weeksSinceEpoch + weekProgress)
            adjustedBalance = Math.floor(balance + totalGrowth)
            if (leaderboardData.length > 0) {
                const personAbove = leaderboardData[leaderboardData.length - 1]
                if (adjustedBalance >= personAbove.balance) {
                    adjustedBalance = Math.floor(personAbove.balance * 0.90)
                }
            }
        } else if (tier.label === 'Elite') {
            // Elite: total ~580M/wk
            const weeklyAdd = 175_000_000 - indexInTier * 20_000_000
            const totalGrowth = weeklyAdd * (weeksSinceEpoch + weekProgress)
            adjustedBalance = Math.floor(balance + totalGrowth)
            if (leaderboardData.length > 0) {
                const personAbove = leaderboardData[leaderboardData.length - 1]
                if (adjustedBalance >= personAbove.balance) {
                    adjustedBalance = Math.floor(personAbove.balance * 0.90)
                }
            }
        } else if (tier.label === 'Legend') {
            // Legend: total ~630M/wk
            const weeklyAdd = 240_000_000 - indexInTier * 30_000_000
            const totalGrowth = weeklyAdd * (weeksSinceEpoch + weekProgress)
            adjustedBalance = Math.floor(balance + totalGrowth)
            if (leaderboardData.length > 0) {
                const personAbove = leaderboardData[leaderboardData.length - 1]
                if (adjustedBalance >= personAbove.balance) {
                    adjustedBalance = Math.floor(personAbove.balance * 0.90)
                }
            }
        }

        leaderboardData.push({
            username,
            balance: adjustedBalance,
            place: index + 1,
            medal: getMedal(index + 1),
            tierLabel: tier.label,
            icon: entryIcons[index] || null,
        })
    })

    const getTierColor = (balance: number) => getUserTier(balance).color
    const getTierIcon = (balance: number) => getUserTier(balance).icon

    return (
        <div className={`leaderboard-tab-con transition-all duration-300`}>
            <div className="px-4">
                {/* Header */}
                <div className="flex flex-col items-center mt-4">
                    <Image src={trophy} alt="Trophy" width={72} height={72} className="mb-2" />
                    <h1 className="text-xl font-bold text-[#fefefe] mb-3">Leaderboard</h1>
                    <div className="w-full px-4 py-3 rounded-xl bg-[#151516] border border-[#2d2d2e]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-[#868686]">Total Users</span>
                            <span className="text-sm font-semibold text-[#fefefe]">{formatUserCount(currentUsers)} / {totalUserTarget.toLocaleString()}</span>
                        </div>
                        <div className="w-full rounded-full h-2 bg-[#2d2d2e] overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#4c9ce2] to-[#22c55e] transition-all duration-700" style={{ width: `${totalUserProgress}%` }} />
                        </div>
                        <div className="mt-1 text-[11px] text-[#868686] text-right">{totalUserProgress}% of target</div>
                    </div>
                </div>

                {/* Offline indicator */}
                {!isOnline && (
                    <div className="mt-3 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs text-red-400 font-medium">You're offline — data is frozen</span>
                    </div>
                )}

                {/* User Card - Only visible for Whale, Elite, and Legend */}
                {currentTier && (currentTier.label === 'Whale' || currentTier.label === 'Elite' || currentTier.label === 'Legend') && (
                    <div className="rounded-xl p-4 mt-4 bg-[#151516] border" style={{
                        borderColor: currentTier.color || '#2d2d2e'
                    }}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 p-2 rounded-xl bg-[#1f1f20]">
                                    <PawsLogo className="w-full h-full" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-[#fefefe]">{loading ? 'Loading...' : (user?.username || 'You')}</div>
                                    <div className="text-xs" style={{ color: currentTier.color || '#868686' }}>
                                        {(user?.balance || 50000).toLocaleString()} PAWS
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="text-lg font-bold text-[#fefefe]">{userRank}</div>
                                <div className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{
                                    color: currentTier.color,
                                    backgroundColor: `${currentTier.color}20`,
                                }}>
                                    {getTierIcon(user?.balance || 0)} {currentTier.label}
                                </div>
                            </div>
                        </div>

                        {currentTier && currentTier.maxBalance !== Infinity && (
                            <div className="pt-3 border-t border-[#2d2d2e]">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs text-[#868686]">Next: {RANK_TIERS[RANK_TIERS.indexOf(currentTier) + 1]?.label || 'Legend'}</span>
                                    <span className="text-xs font-medium" style={{
                                        color: RANK_TIERS[RANK_TIERS.indexOf(currentTier) + 1]?.color || '#ffd700'
                                    }}>
                                        {Math.floor(getProgressToNextTier(user?.balance || 0))}%
                                    </span>
                                </div>
                                <div className="w-full bg-[#2d2d2e] rounded-full h-1.5">
                                    <div className="h-1.5 rounded-full transition-all duration-500" style={{
                                        width: `${Math.min(100, getProgressToNextTier(user?.balance || 0))}%`,
                                        backgroundColor: RANK_TIERS[RANK_TIERS.indexOf(currentTier) + 1]?.color || '#ffd700'
                                    }} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Leaderboard List */}
                <div className="mt-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-[#fefefe]">Top Holders</span>
                        <span className="text-[10px] text-[#868686]">{isOnline ? 'Real-time' : 'Frozen'}</span>
                    </div>

                    <div className="space-y-1.5">
                        {leaderboardData.map((item) => {
                            const tierColor = getTierColor(item.balance)
                            return (
                                <div 
                                    key={`${item.place}-${item.username}`} 
                                    className="flex items-center justify-between p-3 rounded-xl bg-[#151516] border border-[#2d2d2e] transition-all active:scale-[0.99]"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm overflow-hidden"
                                            style={{
                                                background: item.icon || item.medal ? undefined : '#2d2d2e',
                                            }}
                                        >
                                            {item.icon ? (
                                                <img src={item.icon} alt="" className="w-full h-full object-cover" />
                                            ) : item.medal ? (
                                                <span className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br ${item.medal.bg} shadow-lg text-base`}>
                                                    {item.medal.emoji}
                                                </span>
                                            ) : (
                                                <PawsLogo className="w-full h-full p-1" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex items-center gap-2">
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-[#fefefe] truncate">{item.username}</div>
                                                <div className="text-[11px] text-[#868686] truncate">{item.balance.toLocaleString()} PAWS</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 ml-2">
                                        <div className="text-[11px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap" style={{
                                            color: tierColor,
                                            backgroundColor: `${tierColor}18`,
                                            border: `1px solid ${tierColor}30`
                                        }}>
                                            {getTierIcon(item.balance)} {item.tierLabel}
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
