'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'

interface TokenomicsCategory {
    label: string
    percentage: number
    amount: string
    color: string
    description: string
    locked?: boolean
    lockPeriod?: string
}

const tokenomicsData: TokenomicsCategory[] = [
    {
        label: 'Community & Airdrop',
        percentage: 40,
        amount: '40B PAWS',
        color: '#4c9ce2',
        description: 'Distributed to the community via airdrops, referral rewards, and engagement campaigns'
    },
    {
        label: 'Mining & Rewards',
        percentage: 25,
        amount: '25B PAWS',
        color: '#22c55e',
        description: 'Reserved for in-game mining, daily tasks, hourly claims, and milestone bonuses'
    },
    {
        label: 'Liquidity & CEX',
        percentage: 15,
        amount: '15B PAWS',
        color: '#f59e0b',
        description: 'Allocated for DEX liquidity pools and centralized exchange listings (TGE 1 & 2)'
    },
    {
        label: 'Team & Development',
        percentage: 8,
        amount: '8B PAWS',
        color: '#a855f7',
        description: 'Core team compensation and ongoing project development',
        locked: true,
        lockPeriod: '12 months vesting'
    },
    {
        label: 'Ecosystem & Partnerships',
        percentage: 7,
        amount: '7B PAWS',
        color: '#ec4899',
        description: 'Strategic partnerships, collaborations, and ecosystem expansion initiatives'
    },
    {
        label: 'Treasury & Reserve',
        percentage: 5,
        amount: '5B PAWS',
        color: '#6b7280',
        description: 'Emergency reserve, future initiatives, and long-term project sustainability'
    }
]

const totalSupply = '100,000,000,000'

const TokenomicsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

    const donutSegments = tokenomicsData.map((cat) => {
        const radius = 70
        const circumference = 2 * Math.PI * radius
        const strokeDasharray = (cat.percentage / 100) * circumference
        return { ...cat, strokeDasharray, circumference }
    })

    let cumulativeOffset = 0

    return typeof document !== 'undefined' ? createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70" onClick={onClose}>
            <div className="w-full max-w-md bg-black border-t border-[#2d2d2e] rounded-t-2xl animate-slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 pb-32">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-[#fefefe]">Tokenomics</h2>
                        <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center bg-[#151516] text-[#868686]">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="text-center mb-6">
                        <div className="text-xs text-[#868686] uppercase tracking-wider">Total Supply</div>
                        <div className="text-2xl font-bold text-[#fefefe] mt-1">{totalSupply}</div>
                        <div className="text-sm text-[#4c9ce2]">PAWS Token</div>
                    </div>

                    {/* Donut Chart */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                                {donutSegments.map((seg, i) => {
                                    const offset = cumulativeOffset
                                    cumulativeOffset += seg.strokeDasharray
                                    return (
                                        <circle
                                            key={i}
                                            cx="100"
                                            cy="100"
                                            r={seg.radius}
                                            fill="none"
                                            stroke={seg.color}
                                            strokeWidth="28"
                                            strokeDasharray={`${seg.strokeDasharray} ${seg.circumference}`}
                                            strokeDashoffset={-offset}
                                            className="cursor-pointer transition-opacity duration-200"
                                            style={{ opacity: selectedCategory === null || selectedCategory === i ? 1 : 0.3 }}
                                            onClick={() => setSelectedCategory(selectedCategory === i ? null : i)}
                                        />
                                    )
                                })}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-[10px] text-[#868686] uppercase tracking-wider">Total</div>
                                <div className="text-lg font-bold text-[#fefefe]">100B</div>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-2 mb-5">
                        {tokenomicsData.map((cat, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedCategory(selectedCategory === i ? null : i)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors"
                                style={{
                                    backgroundColor: selectedCategory === i ? cat.color + '22' : '#151516',
                                    color: selectedCategory === i ? cat.color : '#868686',
                                    border: `1px solid ${selectedCategory === i ? cat.color + '44' : '#2d2d2e'}`
                                }}
                            >
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                {cat.percentage}%
                            </button>
                        ))}
                    </div>

                    {/* Detail Cards */}
                    <div className="space-y-2">
                        {tokenomicsData.map((cat, i) => {
                            const isSelected = selectedCategory === null || selectedCategory === i
                            if (!isSelected) return null

                            return (
                                <div
                                    key={i}
                                    className="rounded-xl border border-[#2d2d2e] p-4 bg-[#151516]"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                            <span className="text-sm font-semibold text-[#fefefe]">{cat.label}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-bold" style={{ color: cat.color }}>{cat.percentage}%</span>
                                            <span className="text-xs text-[#868686] ml-1">{cat.amount}</span>
                                        </div>
                                    </div>

                                    <div className="w-full bg-[#2d2d2e] rounded-full h-1.5 mb-2">
                                        <div
                                            className="h-1.5 rounded-full transition-all duration-500"
                                            style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                                        />
                                    </div>

                                    <p className="text-xs text-[#868686] leading-relaxed">{cat.description}</p>

                                    {cat.locked && (
                                        <div className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#a855f7]/10 border border-[#a855f7]/20 w-fit">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                            <span className="text-[11px] font-medium text-[#a855f7]">{cat.lockPeriod}</span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Summary Stats */}
                    <div className="mt-5 bg-[#ffffff0d] border border-[#2d2d2e] rounded-xl p-4">
                        <div className="text-xs text-[#868686] uppercase tracking-wider mb-3">Quick Summary</div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="text-[11px] text-[#868686]">Community + Mining</div>
                                <div className="text-base font-bold text-[#fefefe]">65%</div>
                                <div className="text-[11px] text-[#22c55e]">65B PAWS</div>
                            </div>
                            <div>
                                <div className="text-[11px] text-[#868686]">Liquid Supply</div>
                                <div className="text-base font-bold text-[#fefefe]">55%</div>
                                <div className="text-[11px] text-[#f59e0b]">55B PAWS</div>
                            </div>
                            <div>
                                <div className="text-[11px] text-[#868686]">Team Vesting</div>
                                <div className="text-base font-bold text-[#fefefe]">8%</div>
                                <div className="text-[11px] text-[#a855f7]">Locked 12mo</div>
                            </div>
                            <div>
                                <div className="text-[11px] text-[#868686]">Chain</div>
                                <div className="text-base font-bold text-[#fefefe]">TON</div>
                                <div className="text-[11px] text-[#4c9ce2]">The Open Network</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    , document.body) : null
}

export default TokenomicsModal
