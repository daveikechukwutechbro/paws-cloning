// utils/airdropEligibility.ts

export interface AirdropStatus {
    miningSessions: number
    miningSessionsMet: boolean
    hasTonTransaction: boolean
    isEligible: boolean
    progress: number
    miningSessionsRemaining: number
    txCompleted: boolean
}

export function checkAirdropEligibility(
    miningSessions: number,
    lastTonTransactionHash?: string | null
): AirdropStatus {
    const MINING_REQUIRED = 100

    const miningSessionsMet = miningSessions >= MINING_REQUIRED
    const hasTonTransaction = !!lastTonTransactionHash && lastTonTransactionHash.length >= 64

    const isEligible = miningSessionsMet && hasTonTransaction

    const miningProgress = Math.min(miningSessions / MINING_REQUIRED, 1)
    const txProgress = hasTonTransaction ? 1 : 0
    const progress = Math.round((miningProgress * 0.6 + txProgress * 0.4) * 100)

    return {
        miningSessions,
        miningSessionsMet,
        hasTonTransaction,
        isEligible,
        progress,
        miningSessionsRemaining: Math.max(0, MINING_REQUIRED - miningSessions),
        txCompleted: hasTonTransaction
    }
}
