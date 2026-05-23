export interface RankTier {
    label: string
    minBalance: number
    maxBalance: number
    color: string
    bgColor: string
    percentage: string
    usersEstimate: string
    icon: string
}

export const RANK_TIERS: RankTier[] = [
    {
        label: 'Newcomer',
        minBalance: 50000,
        maxBalance: 100_000,
        color: '#868686',
        bgColor: 'rgba(134, 134, 134, 0.15)',
        percentage: '~70%',
        usersEstimate: '1.4M users',
        icon: '🐣'
    },
    {
        label: 'Active',
        minBalance: 100_000,
        maxBalance: 1_500_000,
        color: '#4c9ce2',
        bgColor: 'rgba(76, 156, 226, 0.15)',
        percentage: '~15%',
        usersEstimate: '300K users',
        icon: '🐾'
    },
    {
        label: 'Trusted',
        minBalance: 1_500_000,
        maxBalance: 10_000_000,
        color: '#22c55e',
        bgColor: 'rgba(34, 197, 94, 0.15)',
        percentage: '~10%',
        usersEstimate: '200K users',
        icon: '✅'
    },
    {
        label: 'Influencer',
        minBalance: 10_000_000,
        maxBalance: 240_000_000,
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.15)',
        percentage: '~3.5%',
        usersEstimate: '70K users',
        icon: '🌟'
    },
    {
        label: 'Whale',
        minBalance: 240_000_000,
        maxBalance: 743_675_633,
        color: '#a855f7',
        bgColor: 'rgba(168, 85, 247, 0.15)',
        percentage: '~1.2%',
        usersEstimate: '24K users',
        icon: '🐋'
    },
    {
        label: 'Elite',
        minBalance: 743_675_633,
        maxBalance: 1_243_134_776,
        color: '#ec4899',
        bgColor: 'rgba(236, 72, 153, 0.15)',
        percentage: '~0.25%',
        usersEstimate: '5K users',
        icon: '💎'
    },
    {
        label: 'Legend',
        minBalance: 1_243_134_776,
        maxBalance: Infinity,
        color: '#ffd700',
        bgColor: 'rgba(255, 215, 0, 0.15)',
        percentage: '<0.05%',
        usersEstimate: '~100 users',
        icon: '👑'
    }
]

export function getUserTier(balance: number): RankTier {
    for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
        if (balance >= RANK_TIERS[i].minBalance) {
            return RANK_TIERS[i]
        }
    }
    return RANK_TIERS[0]
}

export function getNextTier(balance: number): RankTier | null {
    const current = getUserTier(balance)
    const index = RANK_TIERS.indexOf(current)
    if (index < RANK_TIERS.length - 1) {
        return RANK_TIERS[index + 1]
    }
    return null
}

export function getProgressToNextTier(balance: number): number {
    const current = getUserTier(balance)
    const next = getNextTier(balance)
    if (!next) return 100
    if (balance >= next.minBalance) return 100
    const range = next.minBalance - current.minBalance
    const progress = ((balance - current.minBalance) / range) * 100
    return Math.min(100, Math.max(0, progress))
}

export function getEstimatedRank(balance: number): string {
    const totalUsers = 2_000_000
    const distribution: { tierMin: number; tierMax: number; users: number }[] = [
        { tierMin: 50000, tierMax: 100_000, users: Math.floor(totalUsers * 0.70) },
        { tierMin: 100_000, tierMax: 1_500_000, users: Math.floor(totalUsers * 0.15) },
        { tierMin: 1_500_000, tierMax: 10_000_000, users: Math.floor(totalUsers * 0.10) },
        { tierMin: 10_000_000, tierMax: 240_000_000, users: Math.floor(totalUsers * 0.035) },
        { tierMin: 240_000_000, tierMax: 743_675_633, users: Math.floor(totalUsers * 0.012) },
        { tierMin: 743_675_633, tierMax: 1_243_134_776, users: Math.floor(totalUsers * 0.0025) },
        { tierMin: 1_243_134_776, tierMax: Infinity, users: Math.floor(totalUsers * 0.0005) }
    ]

    let rankAbove = 0
    for (const tier of distribution) {
        if (balance < tier.tierMin) {
            const usersInTier = tier.users
            if (tier.tierMax === Infinity || balance >= tier.tierMax) {
                rankAbove += usersInTier
            } else {
                const positionInTier = (balance - tier.tierMin) / (tier.tierMax - tier.tierMin)
                rankAbove += Math.floor(usersInTier * (1 - positionInTier))
            }
            break
        }
        rankAbove += tier.users
    }

    const estimatedRank = Math.max(1, totalUsers - rankAbove)
    return `#${estimatedRank.toLocaleString()}`
}

export function formatTierBalance(balance: number): string {
    if (balance >= 1_000_000) return `${(balance / 1_000_000).toFixed(1)}M`
    if (balance >= 1_000) return `${(balance / 1_000).toFixed(1)}K`
    return balance.toLocaleString()
}
