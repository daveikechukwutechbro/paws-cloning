'use client'

import { useState } from 'react'
import PawPrint from '@/icons/PawPrint'

interface StageProps {
    title: string
    subtitle: string
    items: string[]
    isCurrent?: boolean
    isPast?: boolean
    icon: string
    index: number
}

const StageCard: React.FC<StageProps> = ({ title, subtitle, items, isCurrent, isPast, icon, index }) => {
    const isOdd = index % 2 === 0

    if (isCurrent) {
        return (
            <div className="relative w-full">
                <div className="current-stage-glow absolute inset-0 rounded-2xl blur-2xl opacity-60"></div>
                <div className="relative bg-gradient-to-br from-[#0a1628] to-[#0d1f3c] border-2 border-[#4c9ce2] rounded-2xl p-5 mx-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="current-pulse w-12 h-12 rounded-full bg-gradient-to-br from-[#4c9ce2] to-[#007aff] flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(76,156,226,0.6)]">
                            {icon}
                        </div>
                        <div>
                            <div className="text-[#4c9ce2] text-xs font-semibold tracking-wider uppercase">Current Stage</div>
                            <h3 className="text-white text-lg font-bold">{title}</h3>
                        </div>
                    </div>
                    <p className="text-[#868686] text-sm mb-4">{subtitle}</p>
                    <div className="space-y-2">
                        {items.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <PawPrint className="w-4 h-4 text-[#4c9ce2] flex-shrink-0" />
                                <span className="text-gray-300 text-sm">{item}</span>
                            </div>
                        ))}
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#4c9ce2] rounded-full flex items-center justify-center text-xs font-bold text-black shadow-[0_0_10px_rgba(76,156,226,0.8)] animate-pulse">
                        {index + 1}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`flex items-start gap-4 w-full ${isOdd ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className={`w-2/5 ${isOdd ? 'text-right' : 'text-left'} pl-4 pr-4`}>
                <div className={`bg-[#ffffff0a] border border-[#2d2d2e] rounded-xl p-4 ${isPast ? 'border-l-2 border-l-[#22c55e]' : ''}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${isPast ? 'bg-[#22c55e20] text-[#22c55e]' : 'bg-[#ffffff10] text-gray-400'}`}>
                            {icon}
                        </div>
                        <div className={`text-xs font-semibold tracking-wider uppercase ${isPast ? 'text-[#22c55e]' : 'text-gray-500'}`}>
                            {isPast ? 'Completed' : `Phase ${index + 1}`}
                        </div>
                    </div>
                    <h3 className="text-white font-bold mb-1">{title}</h3>
                    <p className="text-[#868686] text-xs mb-3">{subtitle}</p>
                    <div className="space-y-1.5">
                        {items.map((item, i) => (
                            <div key={i} className={`flex items-center gap-1.5 ${isOdd ? 'justify-end' : ''}`}>
                                {!isOdd && <PawPrint className="w-3 h-3 text-gray-500 flex-shrink-0" />}
                                <span className="text-gray-400 text-xs">{item}</span>
                                {isOdd && <PawPrint className="w-3 h-3 text-gray-500 flex-shrink-0" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="w-1/10 flex justify-center flex-shrink-0 pt-8">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isPast ? 'bg-[#22c55e] text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-[#2d2d2e] text-gray-500'}`}>
                    {index + 1}
                </div>
            </div>
            <div className="w-2/5"></div>
        </div>
    )
}

const RoadmapStage: React.FC<{ month: string; title: string; items: string[]; icon: string; isCompleted?: boolean }> = ({ month, title, items, icon, isCompleted }) => (
    <div className="relative">
        <div className={`bg-[#ffffff08] border ${isCompleted ? 'border-[#22c55e30]' : 'border-[#2d2d2e]'} rounded-xl p-4 backdrop-blur-sm`}>
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isCompleted ? 'bg-[#22c55e20] text-[#22c55e]' : 'bg-[#ffffff10] text-gray-400'}`}>
                    {icon}
                </div>
                <div>
                    <div className={`text-xs font-semibold tracking-wider uppercase ${isCompleted ? 'text-[#22c55e]' : 'text-gray-500'}`}>{month}</div>
                    <h4 className="text-white font-bold text-sm">{title}</h4>
                </div>
            </div>
            <div className="space-y-1.5">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <PawPrint className={`w-3.5 h-3.5 flex-shrink-0 ${isCompleted ? 'text-[#22c55e]' : 'text-gray-600'}`} />
                        <span className="text-gray-400 text-xs">{item}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
)

const FootprintMap: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [activeView, setActiveView] = useState<'journey' | 'roadmap'>('journey')

    const historyStages = [
        {
            title: 'HISTORY / ORIGIN',
            subtitle: 'The foundation of PAWS',
            items: ['Idea birth', 'Community curiosity', 'Initial vision', 'Brand identity formation'],
            icon: '🌱',
            isPast: true,
            isCurrent: false
        },
        {
            title: 'EARLY GROWTH',
            subtitle: 'First wave of traction',
            items: ['Token awareness', 'Early supporters', 'Social buzz', 'Telegram/community growth'],
            icon: '📈',
            isPast: true,
            isCurrent: false
        },
        {
            title: 'PRE-MINING / BUILD-UP',
            subtitle: 'Structured progress begins',
            items: ['Reward structure', 'User onboarding', 'Ecosystem preparation', 'Momentum building'],
            icon: '⚡',
            isPast: true,
            isCurrent: false
        },
        {
            title: 'SECOND MINING',
            subtitle: 'Active community participation & reward distribution',
            items: ['Active second mining', 'Community participation', 'Reward distribution', 'Retention and engagement', 'Trust, transparency, consistency'],
            icon: '🐾',
            isPast: false,
            isCurrent: true
        }
    ]

    const roadmapMonths = [
        {
            month: 'Month 1',
            title: 'Expansion & Re-engagement',
            items: ['Increased mining activity', 'Re-activation of users', 'Referral push', 'Community growth drive'],
            icon: '🚀'
        },
        {
            month: 'Month 2',
            title: 'Utility Reveal',
            items: ['Feature teasers', 'Product hints', 'Ecosystem announcements', 'Stronger token narrative'],
            icon: '💎'
        },
        {
            month: 'Month 3',
            title: 'Missions & Participation',
            items: ['Quests launch', 'Social tasks', 'Engagement rewards', 'Community missions'],
            icon: '🎯'
        },
        {
            month: 'Month 4',
            title: 'Partnerships & Visibility',
            items: ['Strategic collaborations', 'Public visibility', 'Brand expansion', 'Exchange readiness'],
            icon: '🤝'
        },
        {
            month: 'Month 5',
            title: 'Scaling & Optimization',
            items: ['Reward optimization', 'Better onboarding', 'Stronger UX', 'Ecosystem refinement'],
            icon: '📊'
        },
        {
            month: 'Month 6',
            title: 'Milestone & Next Horizon',
            items: ['Major milestone', 'Ecosystem maturity', 'Growth checkpoint', 'Next phase prep'],
            icon: '🌟'
        }
    ]

    return (
        <div className="fixed inset-0 z-50 bg-black animate-slide-up">
            <div className="relative h-full overflow-y-auto pb-20">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-md border-b border-[#2d2d2e]">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                            <PawPrint className="w-8 h-8 text-[#4c9ce2]" />
                            <div>
                                <h1 className="text-white font-bold text-lg tracking-wide">PAWS FOOTPRINT MAP</h1>
                                <p className="text-[#868686] text-xs">Trail of Growth — From Origin to Future</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#2d2d2e] flex items-center justify-center text-white hover:bg-[#3d3d3e] transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex justify-center gap-2 px-4 py-4">
                    <button
                        onClick={() => setActiveView('journey')}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeView === 'journey' ? 'bg-[#4c9ce2] text-white shadow-[0_0_15px_rgba(76,156,226,0.4)]' : 'bg-[#2d2d2e] text-gray-400'}`}
                    >
                        Journey
                    </button>
                    <button
                        onClick={() => setActiveView('roadmap')}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeView === 'roadmap' ? 'bg-[#4c9ce2] text-white shadow-[0_0_15px_rgba(76,156,226,0.4)]' : 'bg-[#2d2d2e] text-gray-400'}`}
                    >
                        6-Month Roadmap
                    </button>
                </div>

                {/* Glowing Trail Divider */}
                <div className="flex justify-center items-center gap-2 py-3">
                    <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#4c9ce2]"></div>
                    <PawPrint className="w-5 h-5 text-[#4c9ce2] animate-pulse" />
                    <PawPrint className="w-4 h-4 text-[#4c9ce2] opacity-60" />
                    <PawPrint className="w-3 h-3 text-[#4c9ce2] opacity-40" />
                    <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#4c9ce2]"></div>
                </div>

                {activeView === 'journey' ? (
                    <div className="px-2 space-y-6">
                        {/* Journey Stages */}
                        {historyStages.map((stage, index) => (
                            <div key={index}>
                                <StageCard
                                    title={stage.title}
                                    subtitle={stage.subtitle}
                                    items={stage.items}
                                    isCurrent={stage.isCurrent}
                                    isPast={stage.isPast}
                                    icon={stage.icon}
                                    index={index}
                                />
                                {index < historyStages.length - 1 && (
                                    <div className="flex justify-center py-4">
                                        <div className="flex flex-col items-center gap-1">
                                            <PawPrint className="w-5 h-5 text-[#4c9ce2] opacity-50" />
                                            <PawPrint className="w-4 h-4 text-[#4c9ce2] opacity-30" />
                                            <div className="w-[1px] h-4 bg-gradient-to-b from-[#4c9ce2] to-transparent opacity-30"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Stats Banner */}
                        <div className="mx-4 mt-8 bg-gradient-to-r from-[#0a1628] via-[#0d1f3c] to-[#0a1628] border border-[#4c9ce230] rounded-xl p-4">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-[#4c9ce2]">50K+</div>
                                    <div className="text-xs text-gray-400 mt-1">Community</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#22c55e]">Active</div>
                                    <div className="text-xs text-gray-400 mt-1">Mining Phase</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#f59e0b]">6</div>
                                    <div className="text-xs text-gray-400 mt-1">Months Ahead</div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Tagline */}
                        <div className="text-center py-8 px-4">
                            <div className="flex justify-center items-center gap-2 mb-3">
                                <PawPrint className="w-6 h-6 text-[#4c9ce2] opacity-60" />
                                <PawPrint className="w-5 h-5 text-[#4c9ce2] opacity-40" />
                                <PawPrint className="w-4 h-4 text-[#4c9ce2] opacity-20" />
                            </div>
                            <p className="text-gray-500 text-sm italic">The trail continues. Every footprint leads forward.</p>
                            <p className="text-[#4c9ce2] text-xs mt-2 font-semibold tracking-wider">PAWS TOKEN — FROM ORIGIN TO FUTURE</p>
                        </div>
                    </div>
                ) : (
                    <div className="px-4 space-y-4">
                        {/* Current Phase Banner */}
                        <div className="relative bg-gradient-to-br from-[#0a1628] to-[#0d1f3c] border-2 border-[#4c9ce2] rounded-xl p-4 mb-6">
                            <div className="current-stage-glow absolute inset-0 rounded-xl blur-xl opacity-40"></div>
                            <div className="relative flex items-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#4c9ce2] to-[#007aff] flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(76,156,226,0.5)] current-pulse">
                                    🐾
                                </div>
                                <div>
                                    <div className="text-[#4c9ce2] text-xs font-semibold tracking-wider uppercase animate-pulse">You Are Here</div>
                                    <h3 className="text-white font-bold text-lg">Second Mining Phase</h3>
                                    <p className="text-[#868686] text-xs">Building momentum for the future</p>
                                </div>
                            </div>
                        </div>

                        {/* Roadmap Grid */}
                        <div className="space-y-4">
                            {roadmapMonths.map((month, index) => (
                                <div key={index} className="relative">
                                    <RoadmapStage
                                        month={month.month}
                                        title={month.title}
                                        items={month.items}
                                        icon={month.icon}
                                        isCompleted={false}
                                    />
                                    {index < roadmapMonths.length - 1 && (
                                        <div className="flex justify-center py-2">
                                            <div className="flex flex-col items-center">
                                                <PawPrint className="w-4 h-4 text-[#4c9ce2] opacity-40" />
                                                <div className="w-[1px] h-3 bg-[#4c9ce2] opacity-20"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Final Milestone */}
                        <div className="mt-6 bg-gradient-to-r from-[#f59e0b10] via-[#f59e0b20] to-[#f59e0b10] border border-[#f59e0b30] rounded-xl p-4 text-center">
                            <div className="text-3xl mb-2">🏆</div>
                            <h4 className="text-[#f59e0b] font-bold text-sm">MAJOR MILESTONE</h4>
                            <p className="text-gray-400 text-xs mt-1">Ecosystem maturity and preparation for the next phase of growth</p>
                        </div>

                        {/* Footer Tagline */}
                        <div className="text-center py-8">
                            <div className="flex justify-center items-center gap-2 mb-3">
                                <PawPrint className="w-6 h-6 text-[#4c9ce2] opacity-60" />
                                <PawPrint className="w-5 h-5 text-[#4c9ce2] opacity-40" />
                                <PawPrint className="w-4 h-4 text-[#4c9ce2] opacity-20" />
                            </div>
                            <p className="text-gray-500 text-sm italic">The path unfolds one footprint at a time.</p>
                            <p className="text-[#4c9ce2] text-xs mt-2 font-semibold tracking-wider">PAWS TOKEN — TRAIL OF GROWTH</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default FootprintMap
