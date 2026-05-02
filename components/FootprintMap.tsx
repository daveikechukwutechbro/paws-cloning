'use client'

import { useState, useEffect, useRef } from 'react'

interface Stage {
    id: number
    title: string
    subtitle: string
    items: string[]
    icon: string
    isCurrent?: boolean
    isPast?: boolean
    color: string
    glowColor: string
}

const PawPrint: React.FC<{ className?: string; size?: number; glow?: boolean }> = ({ className = '', size = 24, glow = false }) => (
    <svg
        className={`${className} ${glow ? 'paw-glow' : ''}`}
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <ellipse cx="14" cy="12" rx="5" ry="6" transform="rotate(-15 14 12)" />
        <ellipse cx="24" cy="7" rx="4.5" ry="5.5" />
        <ellipse cx="34" cy="12" rx="5" ry="6" transform="rotate(15 34 12)" />
        <path d="M10 24C10 20 14 17 18 18C20 18.5 22 20 24 20C26 20 28 18.5 30 18C34 17 38 20 38 24C38 30 32 35 24 37C16 35 10 30 10 24Z" />
    </svg>
)

const FootprintMap: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [scrollProgress, setScrollProgress] = useState(0)
    const [activeStage, setActiveStage] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    const stages: Stage[] = [
        {
            id: 1,
            title: 'ORIGIN',
            subtitle: 'Where it all began',
            items: ['Idea birth', 'Community curiosity', 'Initial vision', 'Brand identity formation'],
            icon: '🌱',
            isPast: true,
            color: '#22c55e',
            glowColor: 'rgba(34, 197, 94, 0.4)'
        },
        {
            id: 2,
            title: 'EARLY GROWTH',
            subtitle: 'First wave of traction',
            items: ['Token awareness', 'Early supporters', 'Social buzz', 'Community growth'],
            icon: '📈',
            isPast: true,
            color: '#22c55e',
            glowColor: 'rgba(34, 197, 94, 0.4)'
        },
        {
            id: 3,
            title: 'BUILD-UP',
            subtitle: 'Structured progress begins',
            items: ['Reward structure', 'User onboarding', 'Ecosystem prep', 'Momentum building'],
            icon: '⚡',
            isPast: true,
            color: '#22c55e',
            glowColor: 'rgba(34, 197, 94, 0.4)'
        },
        {
            id: 4,
            title: 'SECOND MINING',
            subtitle: 'Active community participation & rewards',
            items: ['Active second mining', 'Community participation', 'Reward distribution', 'Trust & transparency'],
            icon: '🐾',
            isCurrent: true,
            color: '#4c9ce2',
            glowColor: 'rgba(76, 156, 226, 0.6)'
        },
        {
            id: 5,
            title: 'MONTH 1',
            subtitle: 'Expansion & Re-engagement',
            items: ['Increased mining', 'User re-activation', 'Referral push', 'Community growth'],
            icon: '🚀',
            color: '#f59e0b',
            glowColor: 'rgba(245, 158, 11, 0.4)'
        },
        {
            id: 6,
            title: 'MONTH 2',
            subtitle: 'Utility Reveal',
            items: ['Feature teasers', 'Product hints', 'Ecosystem news', 'Token narrative'],
            icon: '💎',
            color: '#f59e0b',
            glowColor: 'rgba(245, 158, 11, 0.4)'
        },
        {
            id: 7,
            title: 'MONTH 3',
            subtitle: 'Missions & Participation',
            items: ['Quests launch', 'Social tasks', 'Engagement rewards', 'Community missions'],
            icon: '🎯',
            color: '#f59e0b',
            glowColor: 'rgba(245, 158, 11, 0.4)'
        },
        {
            id: 8,
            title: 'MONTH 4',
            subtitle: 'Partnerships & Visibility',
            items: ['Strategic collabs', 'Public visibility', 'Brand expansion', 'Exchange readiness'],
            icon: '🤝',
            color: '#f59e0b',
            glowColor: 'rgba(245, 158, 11, 0.4)'
        },
        {
            id: 9,
            title: 'MONTH 5',
            subtitle: 'Scaling & Optimization',
            items: ['Reward optimization', 'Better onboarding', 'Stronger UX', 'Ecosystem refinement'],
            icon: '📊',
            color: '#f59e0b',
            glowColor: 'rgba(245, 158, 11, 0.4)'
        },
        {
            id: 10,
            title: 'MONTH 6',
            subtitle: 'Milestone & Next Horizon',
            items: ['Major milestone', 'Ecosystem maturity', 'Growth checkpoint', 'Next phase prep'],
            icon: '🌟',
            color: '#f59e0b',
            glowColor: 'rgba(245, 158, 11, 0.4)'
        }
    ]

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return
            const scrollTop = containerRef.current.scrollTop
            const scrollHeight = containerRef.current.scrollHeight - containerRef.current.clientHeight
            setScrollProgress(scrollTop / scrollHeight)
        }

        const container = containerRef.current
        if (container) {
            container.addEventListener('scroll', handleScroll)
            return () => container.removeEventListener('scroll', handleScroll)
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            if (!containerRef.current) return
            const scrollTop = containerRef.current.scrollTop
            const stageHeight = window.innerHeight * 0.75
            const newActive = Math.floor(scrollTop / stageHeight)
            setActiveStage(Math.min(newActive, stages.length - 1))
        }, 100)
        return () => clearInterval(interval)
    }, [stages.length])

    return (
        <div className="fixed inset-0 z-50 bg-black">
            <style>{`
                @keyframes float-paw {
                    0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
                    50% { transform: translateY(-10px) scale(1.1); opacity: 0.7; }
                }
                @keyframes trail-glow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes pulse-ring {
                    0% { transform: scale(0.8); opacity: 1; }
                    100% { transform: scale(2); opacity: 0; }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-float-paw { animation: float-paw 3s ease-in-out infinite; }
                .animate-trail-glow { animation: trail-glow 4s ease-in-out infinite; background-size: 200% 200%; }
                .animate-shimmer { animation: shimmer 3s ease-in-out infinite; }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }
                .animate-pulse-ring { animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                .paw-glow { filter: drop-shadow(0 0 8px currentColor); }
                .glass-panel {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .trail-line {
                    background: linear-gradient(180deg, transparent, rgba(76, 156, 226, 0.3), rgba(76, 156, 226, 0.6), rgba(76, 156, 226, 0.3), transparent);
                }
                .grid-bg {
                    background-image: 
                        linear-gradient(rgba(76, 156, 226, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(76, 156, 226, 0.03) 1px, transparent 1px);
                    background-size: 50px 50px;
                }
                .radar-bg {
                    background: radial-gradient(circle at center, rgba(76, 156, 226, 0.05) 0%, transparent 70%);
                }
            `}</style>

            {/* Background Effects */}
            <div className="absolute inset-0 grid-bg"></div>
            <div className="absolute inset-0 radar-bg"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] animate-spin-slow opacity-20">
                <svg viewBox="0 0 600 600" className="w-full h-full">
                    <circle cx="300" cy="300" r="200" fill="none" stroke="url(#grad1)" strokeWidth="0.5" strokeDasharray="4 8" />
                    <circle cx="300" cy="300" r="250" fill="none" stroke="url(#grad1)" strokeWidth="0.3" strokeDasharray="2 6" />
                    <circle cx="300" cy="300" r="300" fill="none" stroke="url(#grad1)" strokeWidth="0.2" strokeDasharray="1 4" />
                    <defs>
                        <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#4c9ce2" />
                            <stop offset="100%" stopColor="transparent" />
                        </radialGradient>
                    </defs>
                </svg>
            </div>

            {/* Floating Paw Prints Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-float-paw"
                        style={{
                            left: `${15 + (i * 12) % 80}%`,
                            top: `${10 + (i * 23) % 80}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${3 + (i % 3)}s`,
                            opacity: 0.15,
                            color: i < 3 ? '#22c55e' : '#4c9ce2'
                        }}
                    >
                        <PawPrint size={20 + (i % 3) * 10} />
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-[#2d2d2e]">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4c9ce2]/10 to-transparent"></div>
                    <div className="relative flex items-center justify-between px-4 py-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <PawPrint className="text-[#4c9ce2]" size={32} glow />
                                <div className="absolute inset-0 animate-pulse-ring rounded-full bg-[#4c9ce2]/30"></div>
                            </div>
                            <div>
                                <h1 className="text-white font-bold text-xl tracking-wider uppercase">PAWS Footprint Map</h1>
                                <p className="text-[#4c9ce2] text-xs tracking-widest uppercase">Trail of Growth — From Origin to Future</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-[#1a1a1b]">
                    <div
                        className="h-full bg-gradient-to-r from-[#22c55e] via-[#4c9ce2] to-[#f59e0b] transition-all duration-300 animate-trail-glow"
                        style={{ width: `${scrollProgress * 100}%` }}
                    ></div>
                </div>

                {/* Stage Indicators */}
                <div className="flex justify-center gap-1.5 py-3 px-4 overflow-x-auto">
                    {stages.map((stage, index) => (
                        <button
                            key={stage.id}
                            onClick={() => {
                                const target = index * (window.innerHeight * 0.75)
                                containerRef.current?.scrollTo({ top: target, behavior: 'smooth' })
                            }}
                            className={`transition-all duration-300 flex-shrink-0 ${
                                activeStage === index
                                    ? 'scale-125'
                                    : stage.isPast || stage.isCurrent
                                    ? 'opacity-70'
                                    : 'opacity-40'
                            }`}
                        >
                            <div
                                className="w-2 h-2 rounded-full transition-all"
                                style={{
                                    backgroundColor: stage.isCurrent && activeStage === index ? stage.color : stage.isPast ? '#22c55e' : '#4c9ce2',
                                    boxShadow: activeStage === index ? `0 0 8px ${stage.glowColor}` : 'none',
                                    width: activeStage === index ? '16px' : '8px'
                                }}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable Content */}
            <div ref={containerRef} className="h-[calc(100vh-140px)] overflow-y-auto scroll-smooth">
                <div className="relative px-4 py-8 space-y-0">
                    {/* Central Trail Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-[2px] trail-line hidden md:block"></div>

                    {stages.map((stage, index) => (
                        <div
                            key={stage.id}
                            className={`relative min-h-[70vh] flex items-center transition-all duration-700`}
                            style={{
                                opacity: Math.max(0.3, 1 - Math.abs(index - activeStage) * 0.3),
                                transform: `scale(${1 - Math.abs(index - activeStage) * 0.05})`
                            }}
                        >
                            {/* Trail Paw Print */}
                            <div className="absolute left-8 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                                    style={{
                                        backgroundColor: stage.isCurrent ? stage.color : stage.isPast ? 'rgba(34, 197, 94, 0.2)' : 'rgba(76, 156, 226, 0.1)',
                                        border: `2px solid ${stage.isCurrent ? stage.color : stage.isPast ? '#22c55e' : '#4c9ce2'}`,
                                        boxShadow: stage.isCurrent ? `0 0 30px ${stage.glowColor}` : stage.isPast ? '0 0 15px rgba(34, 197, 94, 0.3)' : 'none'
                                    }}
                                >
                                    <span className="text-2xl">{stage.icon}</span>
                                    {stage.isCurrent && (
                                        <div className="absolute inset-0 animate-pulse-ring rounded-full" style={{ backgroundColor: stage.glowColor }}></div>
                                    )}
                                </div>
                                {index < stages.length - 1 && (
                                    <div className="w-[2px] h-16 bg-gradient-to-b from-[#4c9ce2]/50 to-transparent">
                                        <PawPrint className="text-[#4c9ce2] mx-auto animate-float-paw" size={16} />
                                    </div>
                                )}
                            </div>

                            {/* Stage Card */}
                            <div className={`w-full md:w-4/5 md:ml-16 ${index % 2 === 0 ? 'md:ml-16' : 'md:ml-16 md:mr-auto md:pr-8'}`}>
                                <div
                                    className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
                                        stage.isCurrent
                                            ? 'scale-105'
                                            : 'scale-100'
                                    }`}
                                    style={{
                                        background: stage.isCurrent
                                            ? `linear-gradient(135deg, rgba(76, 156, 226, 0.15) 0%, rgba(10, 22, 40, 0.9) 50%, rgba(76, 156, 226, 0.1) 100%)`
                                            : 'rgba(255, 255, 255, 0.02)',
                                        border: `1px solid ${stage.isCurrent ? stage.color : 'rgba(255, 255, 255, 0.06)'}`,
                                        boxShadow: stage.isCurrent ? `0 0 40px ${stage.glowColor}, inset 0 0 40px rgba(76, 156, 226, 0.1)` : 'none'
                                    }}
                                >
                                    {/* Shimmer Effect for Current Stage */}
                                    {stage.isCurrent && (
                                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                            <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
                                        </div>
                                    )}

                                    {/* Glow Background for Current */}
                                    {stage.isCurrent && (
                                        <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(circle at 30% 50%, ${stage.glowColor}, transparent 70%)` }}></div>
                                    )}

                                    <div className="relative p-6">
                                        {/* Stage Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span
                                                        className="text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full"
                                                        style={{
                                                            backgroundColor: stage.isCurrent ? 'rgba(76, 156, 226, 0.2)' : stage.isPast ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                                            color: stage.isCurrent ? '#4c9ce2' : stage.isPast ? '#22c55e' : '#868686',
                                                            border: `1px solid ${stage.isCurrent ? 'rgba(76, 156, 226, 0.3)' : stage.isPast ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)'}`
                                                        }}
                                                    >
                                                        {stage.isCurrent ? 'Current Phase' : stage.isPast ? 'Completed' : `Phase ${stage.id}`}
                                                    </span>
                                                    {stage.isCurrent && (
                                                        <span className="flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#4c9ce2] opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4c9ce2]"></span>
                                                        </span>
                                                    )}
                                                </div>
                                                <h2
                                                    className="text-2xl font-bold mb-1"
                                                    style={{ color: stage.isCurrent ? '#ffffff' : stage.isPast ? '#e5e5e5' : '#a3a3a3' }}
                                                >
                                                    {stage.title}
                                                </h2>
                                                <p className="text-sm" style={{ color: stage.color }}>{stage.subtitle}</p>
                                            </div>
                                            <div className="text-4xl">{stage.icon}</div>
                                        </div>

                                        {/* Items */}
                                        <div className="space-y-3 mt-6">
                                            {stage.items.map((item, i) => (
                                                <div key={i} className="flex items-center gap-3 group">
                                                    <div
                                                        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                                                        style={{
                                                            backgroundColor: `${stage.color}15`,
                                                            border: `1px solid ${stage.color}30`
                                                        }}
                                                    >
                                                        <PawPrint size={16} className="transition-colors" style={{ color: stage.color }} />
                                                    </div>
                                                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{item}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Decorative Elements */}
                                        {stage.isCurrent && (
                                            <div className="mt-6 pt-4 border-t border-[#4c9ce2]/20">
                                                <div className="flex items-center justify-between text-xs text-[#868686]">
                                                    <span>Active Now</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1 bg-[#1a1a1b] rounded-full overflow-hidden">
                                                            <div className="h-full bg-gradient-to-r from-[#4c9ce2] to-[#22c55e] rounded-full animate-pulse" style={{ width: '65%' }}></div>
                                                        </div>
                                                        <span style={{ color: '#4c9ce2' }}>65%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Final Milestone Banner */}
                    <div className="relative mt-12 mb-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#f59e0b]/10 via-[#f59e0b]/20 to-[#f59e0b]/10 rounded-2xl blur-xl"></div>
                        <div className="relative glass-panel rounded-2xl p-8 text-center border border-[#f59e0b]/30">
                            <div className="text-5xl mb-4 animate-float-paw">🏆</div>
                            <h3 className="text-2xl font-bold text-[#f59e0b] mb-2">MAJOR MILESTONE</h3>
                            <p className="text-gray-400 mb-6">Ecosystem maturity and preparation for the next phase of growth</p>
                            <div className="flex justify-center items-center gap-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-[#f59e0b]">6</div>
                                    <div className="text-xs text-gray-500">Months</div>
                                </div>
                                <div className="w-[1px] h-10 bg-[#f59e0b]/30"></div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-[#4c9ce2]">10</div>
                                    <div className="text-xs text-gray-500">Phases</div>
                                </div>
                                <div className="w-[1px] h-10 bg-[#f59e0b]/30"></div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-[#22c55e]">∞</div>
                                    <div className="text-xs text-gray-500">Possibilities</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center py-12">
                        <div className="flex justify-center items-center gap-3 mb-4">
                            <PawPrint className="text-[#4c9ce2]" size={24} glow />
                            <PawPrint className="text-[#4c9ce2] opacity-60" size={20} />
                            <PawPrint className="text-[#4c9ce2] opacity-40" size={16} />
                            <PawPrint className="text-[#4c9ce2] opacity-20" size={12} />
                        </div>
                        <p className="text-gray-500 italic">The trail continues. Every footprint leads forward.</p>
                        <p className="text-[#4c9ce2] text-sm mt-3 font-bold tracking-widest uppercase">PAWS Token — From Origin to Future</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FootprintMap
