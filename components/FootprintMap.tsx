'use client'

import { useState, useEffect } from 'react'

interface StageData {
    id: number
    phase: string
    title: string
    subtitle: string
    items: string[]
    icon: string
    type: 'past' | 'current' | 'future'
    accent: string
    border: string
    bgAccent: string
    badge: string
}

const stages: StageData[] = [
    {
        id: 1,
        phase: 'Phase 1',
        title: 'ORIGIN',
        subtitle: 'Where it all began',
        items: ['Idea birth', 'Community curiosity', 'Initial vision', 'Brand identity formation'],
        icon: '🌱',
        type: 'past',
        accent: '#22c55e',
        border: 'rgba(34, 197, 94, 0.2)',
        bgAccent: 'rgba(34, 197, 94, 0.08)',
        badge: 'Completed'
    },
    {
        id: 2,
        phase: 'Phase 2',
        title: 'EARLY GROWTH',
        subtitle: 'First wave of traction',
        items: ['Token awareness', 'Early supporters', 'Social buzz', 'Community growth'],
        icon: '📈',
        type: 'past',
        accent: '#22c55e',
        border: 'rgba(34, 197, 94, 0.2)',
        bgAccent: 'rgba(34, 197, 94, 0.08)',
        badge: 'Completed'
    },
    {
        id: 3,
        phase: 'Phase 3',
        title: 'BUILD-UP',
        subtitle: 'Structured progress begins',
        items: ['Reward structure', 'User onboarding', 'Ecosystem prep', 'Momentum building'],
        icon: '⚡',
        type: 'past',
        accent: '#22c55e',
        border: 'rgba(34, 197, 94, 0.2)',
        bgAccent: 'rgba(34, 197, 94, 0.08)',
        badge: 'Completed'
    },
    {
        id: 4,
        phase: 'Phase 4',
        title: 'SECOND MINING',
        subtitle: 'Active community participation & rewards',
        items: ['Active second mining', 'Community participation', 'Reward distribution', 'Trust & transparency'],
        icon: '🐾',
        type: 'current',
        accent: '#4c9ce2',
        border: 'rgba(76, 156, 226, 0.4)',
        bgAccent: 'rgba(76, 156, 226, 0.12)',
        badge: 'Current Phase'
    },
    {
        id: 5,
        phase: 'Month 1',
        title: 'EXPANSION',
        subtitle: 'Expansion & Re-engagement',
        items: ['Increased mining', 'User re-activation', 'Referral push', 'Community growth'],
        icon: '🚀',
        type: 'future',
        accent: '#f59e0b',
        border: 'rgba(245, 158, 11, 0.15)',
        bgAccent: 'rgba(245, 158, 11, 0.05)',
        badge: 'Month 1'
    },
    {
        id: 6,
        phase: 'Month 2',
        title: 'UTILITY REVEAL',
        subtitle: 'Feature teasers & product hints',
        items: ['Feature teasers', 'Product hints', 'Ecosystem news', 'Token narrative'],
        icon: '💎',
        type: 'future',
        accent: '#f59e0b',
        border: 'rgba(245, 158, 11, 0.15)',
        bgAccent: 'rgba(245, 158, 11, 0.05)',
        badge: 'Month 2'
    },
    {
        id: 7,
        phase: 'Month 3',
        title: 'MISSIONS',
        subtitle: 'Quests & community participation',
        items: ['Quests launch', 'Social tasks', 'Engagement rewards', 'Community missions'],
        icon: '🎯',
        type: 'future',
        accent: '#f59e0b',
        border: 'rgba(245, 158, 11, 0.15)',
        bgAccent: 'rgba(245, 158, 11, 0.05)',
        badge: 'Month 3'
    },
    {
        id: 8,
        phase: 'Month 4',
        title: 'PARTNERSHIPS',
        subtitle: 'Strategic collaborations',
        items: ['Strategic collabs', 'Public visibility', 'Brand expansion', 'Exchange readiness'],
        icon: '🤝',
        type: 'future',
        accent: '#f59e0b',
        border: 'rgba(245, 158, 11, 0.15)',
        bgAccent: 'rgba(245, 158, 11, 0.05)',
        badge: 'Month 4'
    },
    {
        id: 9,
        phase: 'Month 5',
        title: 'SCALING',
        subtitle: 'Optimization & refinement',
        items: ['Reward optimization', 'Better onboarding', 'Stronger UX', 'Ecosystem refinement'],
        icon: '📊',
        type: 'future',
        accent: '#f59e0b',
        border: 'rgba(245, 158, 11, 0.15)',
        bgAccent: 'rgba(245, 158, 11, 0.05)',
        badge: 'Month 5'
    },
    {
        id: 10,
        phase: 'Month 6',
        title: 'MILESTONE',
        subtitle: 'Ecosystem maturity & next horizon',
        items: ['Major milestone', 'Ecosystem maturity', 'Growth checkpoint', 'Next phase prep'],
        icon: '🌟',
        type: 'future',
        accent: '#f59e0b',
        border: 'rgba(245, 158, 11, 0.15)',
        bgAccent: 'rgba(245, 158, 11, 0.05)',
        badge: 'Month 6'
    }
]

const PawSvg: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="14" cy="12" rx="5" ry="6" transform="rotate(-15 14 12)" />
        <ellipse cx="24" cy="7" rx="4.5" ry="5.5" />
        <ellipse cx="34" cy="12" rx="5" ry="6" transform="rotate(15 34 12)" />
        <path d="M10 24C10 20 14 17 18 18C20 18.5 22 20 24 20C26 20 28 18.5 30 18C34 17 38 20 38 24C38 30 32 35 24 37C16 35 10 30 10 24Z" />
    </svg>
)

const FootprintMap: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [activeIndex, setActiveIndex] = useState(3)

    useEffect(() => {
        const timer = setTimeout(() => {
            const el = document.getElementById(`stage-${3}`)
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="fixed inset-0 z-50 bg-black animate-slide-up">
            <div className="grid-bg absolute inset-0"></div>
            <div className="radar-bg absolute inset-0"></div>

            {/* Floating paws */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[0, 1, 2, 3, 4, 5].map(i => (
                    <div
                        key={i}
                        className="absolute animate-float-paw"
                        style={{
                            left: `${10 + i * 15}%`,
                            top: `${20 + (i * 17) % 60}%`,
                            animationDelay: `${i * 0.4}s`,
                            opacity: 0.08,
                            color: i < 2 ? '#22c55e' : '#4c9ce2'
                        }}
                    >
                        <PawSvg size={24 + i * 6} />
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-xl border-b border-white/5">
                <div className="absolute inset-x-0 top-full h-[1px] bg-gradient-to-r from-transparent via-[#4c9ce2]/30 to-transparent"></div>
                <div className="relative px-4 pt-4 pb-3">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="relative">
                                <PawSvg size={28} className="text-[#4c9ce2] paw-glow" />
                                <div className="absolute inset-0 animate-pulse-ring rounded-full bg-[#4c9ce2]/20"></div>
                            </div>
                            <div>
                                <h1 className="text-white font-bold text-base tracking-wider">PAWS FOOTPRINT MAP</h1>
                                <p className="text-[#4c9ce2]/70 text-[10px] tracking-widest uppercase">Trail of Growth — From Origin to Future</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/70 active:bg-white/10"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Progress dots */}
                    <div className="flex items-center justify-between px-2">
                        {stages.map((stage, i) => (
                            <button
                                key={stage.id}
                                onClick={() => {
                                    const el = document.getElementById(`stage-${i}`)
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                    setActiveIndex(i)
                                }}
                                className="flex items-center flex-1 last:flex-none"
                            >
                                <div
                                    className={`rounded-full transition-all duration-300 ${i === activeIndex ? 'scale-125' : ''}`}
                                    style={{
                                        width: i === activeIndex ? 12 : 6,
                                        height: i === activeIndex ? 12 : 6,
                                        backgroundColor: stage.accent,
                                        boxShadow: i === activeIndex ? `0 0 10px ${stage.accent}` : 'none'
                                    }}
                                />
                                {i < stages.length - 1 && (
                                    <div className="flex-1 h-[1px] mx-1" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="relative overflow-y-auto" style={{ height: 'calc(100vh - 100px)' }}>
                <div className="px-4 py-6 pb-12">
                    {/* Trail connector line */}
                    <div className="absolute left-[28px] top-[100px] bottom-0 w-[2px] bg-gradient-to-b from-[#22c55e]/40 via-[#4c9ce2]/40 to-[#f59e0b]/20"></div>

                    {stages.map((stage, index) => (
                        <div
                            key={stage.id}
                            id={`stage-${index}`}
                            className="relative mb-6 animate-fade-in"
                            style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
                        >
                            {/* Trail node */}
                            <div className="absolute left-[16px] top-6 -translate-x-1/2 z-[1]">
                                <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center"
                                    style={{
                                        backgroundColor: stage.bgAccent,
                                        border: `2px solid ${stage.border}`,
                                        boxShadow: stage.type === 'current' ? `0 0 20px ${stage.accent}40` : stage.type === 'past' ? '0 0 10px rgba(34,197,94,0.2)' : 'none'
                                    }}
                                >
                                    <span className="text-xs">{stage.icon}</span>
                                    {stage.type === 'current' && (
                                        <div className="absolute inset-0 animate-pulse-ring rounded-full" style={{ backgroundColor: `${stage.accent}30` }}></div>
                                    )}
                                </div>
                            </div>

                            {/* Card */}
                            <div
                                className="ml-8 rounded-xl overflow-hidden transition-all duration-300"
                                style={{
                                    background: stage.type === 'current'
                                        ? `linear-gradient(135deg, ${stage.bgAccent}, rgba(0,0,0,0.5))`
                                        : stage.bgAccent,
                                    border: `1px solid ${stage.border}`,
                                    boxShadow: stage.type === 'current' ? `0 0 30px ${stage.accent}20, inset 0 0 30px ${stage.accent}08` : 'none'
                                }}
                            >
                                {/* Shimmer on current */}
                                {stage.type === 'current' && (
                                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                        <div className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer"></div>
                                    </div>
                                )}

                                <div className="relative p-4">
                                    {/* Badge + Icon row */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span
                                            className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full"
                                            style={{
                                                backgroundColor: stage.bgAccent,
                                                color: stage.accent,
                                                border: `1px solid ${stage.border}`
                                            }}
                                        >
                                            {stage.badge}
                                        </span>
                                        <span className="text-2xl">{stage.icon}</span>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-white font-bold text-lg mb-0.5">{stage.title}</h2>
                                    <p className="text-sm mb-4" style={{ color: stage.accent }}>{stage.subtitle}</p>

                                    {/* Items */}
                                    <div className="space-y-2.5">
                                        {stage.items.map((item, i) => (
                                            <div key={i} className="flex items-center gap-2.5">
                                                <div
                                                    className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: `${stage.accent}20` }}
                                                >
                                                    <PawSvg size={10} className="" style={{ color: stage.accent }} />
                                                </div>
                                                <span className="text-sm text-gray-300">{item}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Current stage progress bar */}
                                    {stage.type === 'current' && (
                                        <div className="mt-4 pt-3 border-t border-[#4c9ce2]/15">
                                            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1.5">
                                                <span>Active Now</span>
                                                <span style={{ color: '#4c9ce2' }}>65%</span>
                                            </div>
                                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-[#4c9ce2] to-[#22c55e] animate-pulse"
                                                    style={{ width: '65%' }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Milestone banner */}
                    <div className="ml-8 mt-8 mb-6 rounded-xl overflow-hidden glass-panel border border-[#f59e0b]/20">
                        <div className="p-5 text-center">
                            <div className="text-4xl mb-3 animate-float-paw">🏆</div>
                            <h3 className="text-[#f59e0b] font-bold text-base mb-1">MAJOR MILESTONE</h3>
                            <p className="text-gray-500 text-xs mb-4">Ecosystem maturity and preparation for the next phase of growth</p>
                            <div className="flex justify-center items-center gap-5">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-[#f59e0b]">6</div>
                                    <div className="text-[10px] text-gray-500">Months</div>
                                </div>
                                <div className="w-[1px] h-8 bg-[#f59e0b]/20"></div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-[#4c9ce2]">10</div>
                                    <div className="text-[10px] text-gray-500">Phases</div>
                                </div>
                                <div className="w-[1px] h-8 bg-[#f59e0b]/20"></div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-[#22c55e]">∞</div>
                                    <div className="text-[10px] text-gray-500">Possibilities</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="ml-8 text-center py-6">
                        <div className="flex justify-center items-center gap-2 mb-3">
                            <PawSvg size={20} className="text-[#4c9ce2] paw-glow" />
                            <PawSvg size={16} className="text-[#4c9ce2] opacity-50" />
                            <PawSvg size={12} className="text-[#4c9ce2] opacity-30" />
                        </div>
                        <p className="text-gray-600 text-xs italic mb-2">The trail continues. Every footprint leads forward.</p>
                        <p className="text-[#4c9ce2]/60 text-[10px] font-bold tracking-widest uppercase">PAWS Token — From Origin to Future</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FootprintMap
