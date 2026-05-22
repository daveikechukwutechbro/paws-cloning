// utils/userGrowth.ts

/**
 * Simulates organic user growth for the app.
 * Starts at 1.1M, reaches 3M over ~2 months.
 * Uses an S-curve (sigmoid) for realistic growth feel.
 */

const START_TIME = new Date('2026-05-01').getTime()
const START_USERS = 1_100_000
const END_USERS = 3_000_000
const GROWTH_DURATION_MS = 62 * 24 * 60 * 60 * 1000 // ~2 months

function sigmoid(t: number): number {
    // S-curve: slow start, fast middle, slow end
    return 1 / (1 + Math.exp(-10 * (t - 0.5)))
}

export function getCurrentUserCount(): number {
    const now = Date.now()
    const elapsed = now - START_TIME
    const t = Math.min(Math.max(elapsed / GROWTH_DURATION_MS, 0), 1)
    const growth = sigmoid(t)
    return Math.floor(START_USERS + (END_USERS - START_USERS) * growth)
}

export function formatUserCount(count: number): string {
    if (count >= 1_000_000) {
        return (count / 1_000_000).toFixed(1) + 'M'
    }
    if (count >= 1_000) {
        return (count / 1_000).toFixed(1) + 'K'
    }
    return count.toString()
}
