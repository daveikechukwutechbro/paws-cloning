// components/AirdropEligibility.tsx

/**
 * This project was developed by Nikandr Surkov.
 *
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * GitHub: https://github.com/nikandr-surkov
 */

'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/contexts/UserContext'
import { checkAirdropEligibility, AirdropStatus } from '@/utils/airdropEligibility'
import { getCurrentUserCount, formatUserCount } from '@/utils/userGrowth'
import { isWalletConnected } from '@/utils/tonService'
import { getUserTier } from '@/utils/rankingSystem'

const AIRDROP_TARGET = 2_000_000

const AirdropEligibility = () => {
    const { user } = useUser()
    const [status, setStatus] = useState<AirdropStatus>({
        miningSessions: 0,
        miningSessionsMet: false,
        hasTonTransaction: false,
        isEligible: false,
        progress: 0,
        miningSessionsRemaining: 100,
        txCompleted: false
    })
    const [userCount, setUserCount] = useState(0)
    const targetProgress = Math.min(100, Math.floor((userCount / AIRDROP_TARGET) * 100))

    useEffect(() => {
        setUserCount(getCurrentUserCount())
        const interval = setInterval(() => {
            setUserCount(getCurrentUserCount())
        }, 30000)
        return () => clearInterval(interval)
    }, [])

    const computeStatus = () => {
        const timerKey = user?.id ? `lastClaim_${user.id}` : 'lastClaim_default'
        const savedLastClaim = localStorage.getItem(timerKey)

        let miningSessions = 0
        if (savedLastClaim) {
            const firstClaimTime = parseInt(savedLastClaim)
            const elapsed = Date.now() - firstClaimTime
            miningSessions = Math.min(Math.floor(elapsed / 3600000), 200)
        }

        const lastTx = localStorage.getItem('last_ton_transaction')
        return checkAirdropEligibility(miningSessions, lastTx)
    }

    useEffect(() => {
        setStatus(computeStatus())
        const interval = setInterval(() => {
            setStatus(computeStatus())
        }, 5000)
        return () => clearInterval(interval)
    }, [user])

    const miningRemaining = status.miningSessionsRemaining
    const txRemaining = status.txCompleted ? 0 : 1
    const totalRequirements = 2
    const completedRequirements = (status.miningSessionsMet ? 1 : 0) + (status.txCompleted ? 1 : 0)

    return (
        <div className={`rounded-xl p-4 relative overflow-hidden border transition-all ${
            status.isEligible
                ? 'bg-gradient-to-r from-[#22c55e]/20 via-[#4c9ce2]/20 to-[#f59e0b]/20 border-[#22c55e]/30'
                : 'bg-[#ffffff0d] border-[#2d2d2e]'
        }`}>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🪂</span>
                    <span className="text-sm font-bold text-[#4c9ce2] uppercase tracking-wider">Airdrop Eligibility</span>
                    <div className="ml-auto flex items-center gap-1 bg-[#4c9ce2]/10 px-2 py-0.5 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#4c9ce2] animate-pulse" />
                        <span className="text-[10px] font-bold text-[#4c9ce2]">{formatUserCount(userCount)} / {formatUserCount(AIRDROP_TARGET)}</span>
                    </div>
                </div>

                {/* Detailed Progress */}
                <div className="mb-2 flex items-center justify-between text-xs text-[#d1d5db]">
                    <span>Overall Progress</span>
                    <span>{status.progress}%</span>
                </div>
                <div className="w-full bg-[#ffffff0d] rounded-full h-2.5 mb-3 overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-[#4c9ce2] to-[#22c55e]"
                        style={{ width: `${status.progress}%` }}
                    />
                </div>

                {/* Requirements */}
                <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className={`w-4 h-4 flex items-center justify-center ${
                                status.miningSessionsMet ? 'text-[#22c55e]' : 'text-gray-500'
                            }`}>
                                {status.miningSessionsMet ? '✓' : '⛏️'}
                            </span>
                            <span className={status.miningSessionsMet ? 'text-[#22c55e]' : 'text-gray-400'}>
                                Mining Sessions: {status.miningSessions}/100
                            </span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            status.miningSessionsMet 
                                ? 'bg-[#22c55e]/20 text-[#22c55e]' 
                                : 'bg-gray-500/20 text-gray-400'
                        }`}>
                            {status.miningSessionsMet ? '✅ Complete' : `${miningRemaining} more needed`}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className={`w-4 h-4 flex items-center justify-center ${
                                status.hasTonTransaction ? 'text-[#22c55e]' : 'text-gray-500'
                            }`}>
                                {status.hasTonTransaction ? '✓' : '💎'}
                            </span>
                            <span className={status.hasTonTransaction ? 'text-[#22c55e]' : 'text-gray-400'}>
                                TON Transaction
                            </span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            status.hasTonTransaction 
                                ? 'bg-[#22c55e]/20 text-[#22c55e]' 
                                : 'bg-gray-500/20 text-gray-400'
                        }`}>
                            {status.hasTonTransaction ? '✅ Verified' : 'Required'}
                        </span>
                    </div>
                </div>

                {/* Exact progress summary */}
                <div className="bg-[#1f1f20] rounded-lg p-2 mb-3 text-[10px] text-gray-400">
                    <div className="flex justify-between">
                        <span>Requirements completed: {completedRequirements}/{totalRequirements}</span>
                        <span>
                            {miningRemaining > 0 && `${miningRemaining} mining session${miningRemaining > 1 ? 's' : ''} left`}
                            {miningRemaining > 0 && txRemaining > 0 && ' + '}
                            {txRemaining > 0 && 'TON tx needed'}
                            {completedRequirements === totalRequirements && 'All requirements met!'}
                        </span>
                    </div>
                </div>

                {status.isEligible ? (
                    <div className="bg-[#22c55e]/20 border border-[#22c55e]/30 rounded-lg p-3 text-center">
                        <div className="text-sm font-bold text-[#22c55e]">✓ Completed</div>
                        <div className="text-xs text-gray-400 mt-0.5">You&apos;re eligible! Airdrop will be distributed after TGE 2</div>
                    </div>
                ) : (
                    <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg p-3 text-center">
                        <div className="text-sm font-bold text-[#f59e0b]">Requirements Not Met</div>
                        <div className="text-xs text-gray-400 mt-0.5">Complete the requirements above to qualify</div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AirdropEligibility
