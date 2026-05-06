'use client'

const PawIcon = ({ size = 62 }: { size?: number }) => {
    const toeW = size * 0.258
    const toeH = size * 0.355
    const padW = size * 0.452
    const padH = size * 0.387
    const padTop = size * 0.419
    return (
        <svg width={size} height={size} viewBox="0 0 62 62" fill="none">
            <ellipse cx={18} cy={10} rx={toeW / 2} ry={toeH / 2} fill="rgba(255,255,255,0.92)" transform="rotate(-18 18 10)" />
            <ellipse cx={44} cy={10} rx={toeW / 2} ry={toeH / 2} fill="rgba(255,255,255,0.92)" transform="rotate(18 44 10)" />
            <ellipse cx={8} cy={24} rx={toeW / 2} ry={toeH / 2} fill="rgba(255,255,255,0.92)" transform="rotate(-35 8 24)" />
            <ellipse cx={54} cy={24} rx={toeW / 2} ry={toeH / 2} fill="rgba(255,255,255,0.92)" transform="rotate(35 54 24)" />
            <ellipse cx={31} cy={padTop + padH / 2} rx={padW / 2} ry={padH / 2} fill="rgba(255,255,255,0.92)" />
        </svg>
    )
}

const stages = [
    {
        phase: 'Phase 1 · Foundation',
        align: 'left' as const,
        title: '',
        items: ['Basic game', 'Mining updates', 'Earn tasks'],
        badges: []
    },
    {
        phase: 'Phase 2 · Launch',
        align: 'right' as const,
        title: '',
        items: ['TGE 1 successfully completed', 'First phase of token utility activated', 'Early ecosystem traction and visibility established'],
        badges: []
    },
    {
        phase: 'Phase 3 · Momentum',
        align: 'left' as const,
        title: '',
        items: ['Beta users fully onboarded', 'Performance improvements completed', 'Partnerships and integrations expanded'],
        badges: []
    },
    {
        phase: 'Phase 4 · Present',
        align: 'right' as const,
        title: 'Second Mining Phase',
        description: 'Active mining, strong engagement, and ecosystem readiness defining the current stage.',
        badges: ['Active mining', 'Community retention', 'Reward clarity', 'Transparency']
    },
    {
        phase: 'Phase 5',
        align: 'left' as const,
        title: '',
        items: ['New utility features introduced', 'User growth via targeted campaigns', 'Consistent updates and reporting'],
        badges: []
    },
    {
        phase: 'Phase 6',
        align: 'right' as const,
        title: '',
        items: ['Feature reveals and utility tease', 'Incentive-driven ecosystem activity', 'Liquidity expansion strategy'],
        badges: []
    },
    {
        phase: 'Phase 7',
        align: 'left' as const,
        title: '',
        items: ['TGE 2 successfully completed', 'Broader liquidity and trading access achieved'],
        badges: []
    },
]

const FootprintMap: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto animate-slide-up" style={{ background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 55%, #020617 100%)' }}>
            <style>{`
                @keyframes paw-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                .paw-float { animation: paw-float 3s ease-in-out infinite; }
            `}</style>

            <div className="min-h-screen px-4 py-7 sm:px-7">
                <div className="max-w-[1400px] mx-auto" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.18)', borderRadius: 28, padding: 28, boxShadow: '0 30px 80px rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}>
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1" style={{ background: 'linear-gradient(180deg, rgba(31,41,55,0.95), rgba(17,24,39,0.96))', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 24, padding: 22 }}>
                            <h1 className="text-[34px] leading-[1.08] tracking-[-0.03em] font-bold mb-3" style={{ letterSpacing: '-0.03em' }}>PAWS Token Footprint Map</h1>
                            <div className="flex flex-wrap gap-2.5 mt-4">
                                <span className="rounded-full px-3 py-2 text-[12px] font-semibold tracking-wide" style={{ border: '1px solid rgba(245,158,11,0.35)', color: '#fde68a', background: 'rgba(245,158,11,0.10)' }}>Origin to Present</span>
                                <span className="rounded-full px-3 py-2 text-[12px] font-semibold tracking-wide" style={{ border: '1px solid rgba(245,158,11,0.35)', color: '#fde68a', background: 'rgba(245,158,11,0.10)' }}>Second Mining Era</span>
                                <span className="rounded-full px-3 py-2 text-[12px] font-semibold tracking-wide" style={{ border: '1px solid rgba(245,158,11,0.35)', color: '#fde68a', background: 'rgba(245,158,11,0.10)' }}>Growth Milestones</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="ml-4 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-white/10 transition-colors"
                            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Timeline */}
                    <div className="relative py-5">
                        {/* Center line - desktop */}
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 rounded-full" style={{ background: 'linear-gradient(180deg, #60a5fa, #f59e0b, #22c55e)', boxShadow: '0 0 18px rgba(96,165,250,0.22)' }} />
                        {/* Left line - mobile */}
                        <div className="md:hidden absolute left-[18px] top-0 bottom-0 w-1 rounded-full" style={{ background: 'linear-gradient(180deg, #60a5fa, #f59e0b, #22c55e)', boxShadow: '0 0 18px rgba(96,165,250,0.22)' }} />

                        {stages.map((stage, index) => {
                            const isLeft = stage.align === 'left'
                            return (
                                <div key={index} className="relative mb-5 last:mb-0">
                                    {/* Desktop: 3-column grid */}
                                    <div className="hidden md:grid grid-cols-[1fr_120px_1fr] gap-5 items-center">
                                        {isLeft ? (
                                            <>
                                                <ContentCard phase={stage.phase} title={stage.title} description={stage.description} items={stage.items} badges={stage.badges} />
                                                <div className="paw-float flex justify-center">
                                                    <div className="w-[120px] h-[120px] rounded-full flex items-center justify-center" style={{ background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.22), rgba(255,255,255,0.04) 35%, rgba(0,0,0,0.10) 100%)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: 'inset 0 0 24px rgba(255,255,255,0.03), 0 12px 30px rgba(0,0,0,0.25)' }}>
                                                        <PawIcon size={62} />
                                                    </div>
                                                </div>
                                                <div />
                                            </>
                                        ) : (
                                            <>
                                                <div />
                                                <div className="paw-float flex justify-center">
                                                    <div className="w-[120px] h-[120px] rounded-full flex items-center justify-center" style={{ background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.22), rgba(255,255,255,0.04) 35%, rgba(0,0,0,0.10) 100%)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: 'inset 0 0 24px rgba(255,255,255,0.03), 0 12px 30px rgba(0,0,0,0.25)' }}>
                                                        <PawIcon size={62} />
                                                    </div>
                                                </div>
                                                <ContentCard phase={stage.phase} title={stage.title} description={stage.description} items={stage.items} badges={stage.badges} />
                                            </>
                                        )}
                                    </div>

                                    {/* Mobile: 2-column with icon on left */}
                                    <div className="md:hidden grid grid-cols-[42px_1fr] gap-3 items-start">
                                        <div className="flex justify-center pt-6">
                                            <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center" style={{ background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.22), rgba(255,255,255,0.04) 35%, rgba(0,0,0,0.10) 100%)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: 'inset 0 0 24px rgba(255,255,255,0.03), 0 12px 30px rgba(0,0,0,0.25)' }}>
                                                <PawIcon size={22} />
                                            </div>
                                        </div>
                                        <ContentCard phase={stage.phase} title={stage.title} description={stage.description} items={stage.items} badges={stage.badges} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

function ContentCard({ phase, title, description, items, badges }: { phase: string; title: string; description?: string; items: string[]; badges: string[] }) {
    return (
        <div className="rounded-[24px] p-5 min-h-[150px]" style={{ background: 'linear-gradient(180deg, rgba(31,41,55,0.96), rgba(15,23,42,0.98))', border: '1px solid rgba(148,163,184,0.14)', boxShadow: '0 14px 40px rgba(0,0,0,0.18)' }}>
            <div className="inline-flex items-center gap-2 text-[12px] text-[#cbd5e1] tracking-[0.08em] uppercase font-bold mb-2.5">
                {phase}
            </div>
            {title && <h3 className="text-[20px] font-semibold mb-2 mt-1">{title}</h3>}
            {description && <p className="text-[14px] leading-[1.65] mt-1" style={{ color: '#94a3b8' }}>{description}</p>}
            {items.length > 0 && (
                <ul className="mt-2.5 ml-4.5 space-y-1">
                    {items.map((item, i) => (
                        <li key={i} className="text-[14px] leading-[1.65]" style={{ color: '#94a3b8' }}>{item}</li>
                    ))}
                </ul>
            )}
            {badges.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                    {badges.map((badge, i) => (
                        <div key={i} className="rounded-[14px] px-3 py-2.5 text-[12px] leading-[1.45]" style={{ background: 'rgba(96,165,250,0.10)', border: '1px solid rgba(96,165,250,0.18)', color: '#dbeafe' }}>
                            {badge}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default FootprintMap
