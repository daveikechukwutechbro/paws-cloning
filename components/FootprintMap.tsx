'use client'

interface StageData {
    id: number
    time: string
    title: string
    description: string
    items: string[]
    type: 'past' | 'current' | 'future' | 'origin'
    isGrid?: boolean
    gridItems?: string[]
}

const stages: StageData[] = [
    {
        id: 1,
        time: 'Phase 1 · Foundation',
        title: 'Genesis and Idea Formation',
        description: 'Show the earliest roots of the PAWS concept: community interest, meme-driven identity, and the first spark that brought the token narrative to life.',
        items: ['Project idea is born', 'Initial community curiosity', 'Brand identity and paw motif established'],
        type: 'origin'
    },
    {
        id: 2,
        time: 'Phase 2 · Launch',
        title: 'Early Growth and Community Activation',
        description: 'Highlight the launch moment, early adopters, social buzz, referral momentum, and the first wave of engagement across Telegram and related channels.',
        items: ['Token launch and first visibility', 'Community onboarding', 'Viral social traction'],
        type: 'past'
    },
    {
        id: 3,
        time: 'Phase 3 · Momentum',
        title: 'Build-Up to Second Mining',
        description: 'Illustrate the transition from first-wave excitement into a more structured, utility-driven mining phase where users prepare for the next cycle.',
        items: ['Reward structure becomes clearer', 'User activity stabilizes', 'Mining expectations increase'],
        type: 'past'
    },
    {
        id: 4,
        time: 'Current Stage · Present',
        title: 'Second Mining Phase',
        description: 'This is the central spotlight. Show the project in its current mining stage with a stronger sense of structure, participation, and ecosystem readiness.',
        items: [],
        type: 'current',
        isGrid: true,
        gridItems: ['Active mining participation', 'Community retention focus', 'Reward distribution clarity', 'Trust and transparency signals']
    },
    {
        id: 5,
        time: 'Month 1',
        title: 'Mining Expansion and Re-Engagement',
        description: 'Increase mining activity, refresh community incentives, and make the roadmap feel alive with visible participation metrics.',
        items: [],
        type: 'future'
    },
    {
        id: 6,
        time: 'Month 2',
        title: 'Utility Tease and Feature Reveal',
        description: 'Introduce hints of real use cases, interface improvements, partnership teasers, and stronger narrative around token value.',
        items: [],
        type: 'future'
    },
    {
        id: 7,
        time: 'Month 3',
        title: 'Community Missions and Ecosystem Tasks',
        description: 'Reward user actions, boost participation, and build a more interactive token journey through quests, missions, and social challenges.',
        items: [],
        type: 'future'
    },
    {
        id: 8,
        time: 'Month 4',
        title: 'Liquidity, Partnerships, and Visibility',
        description: 'Focus on exchange readiness, partnership announcements, social proof, and wider public visibility to strengthen confidence.',
        items: [],
        type: 'future'
    },
    {
        id: 9,
        time: 'Month 5',
        title: 'Scaling Phase and Reward Optimization',
        description: 'Refine the reward system, improve onboarding, and make the token feel more polished, efficient, and scalable.',
        items: [],
        type: 'future'
    },
    {
        id: 10,
        time: 'Month 6',
        title: 'Major Milestone and Next Horizon',
        description: 'Present the roadmap climax as a powerful checkpoint: ecosystem maturity, stronger brand momentum, and a launchpad for the next chapter.',
        items: [],
        type: 'future'
    }
]

const PawIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="14" cy="12" rx="5" ry="6" transform="rotate(-15 14 12)" />
        <ellipse cx="24" cy="7" rx="4.5" ry="5.5" />
        <ellipse cx="34" cy="12" rx="5" ry="6" transform="rotate(15 34 12)" />
        <path d="M10 24C10 20 14 17 18 18C20 18.5 22 20 24 20C26 20 28 18.5 30 18C34 17 38 20 38 24C38 30 32 35 24 37C16 35 10 30 10 24Z" />
    </svg>
)

const StageCard: React.FC<{ stage: StageData; index: number }> = ({ stage, index }) => {
    const typeColors = {
        origin: { badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20', dot: 'bg-blue-400', text: 'text-blue-300' },
        past: { badge: 'bg-green-500/10 text-green-300 border-green-500/20', dot: 'bg-green-400', text: 'text-green-300' },
        current: { badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20', dot: 'bg-amber-400', text: 'text-amber-300' },
        future: { badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dot: 'bg-slate-500', text: 'text-slate-400' }
    }

    const colors = typeColors[stage.type]
    const isCurrent = stage.type === 'current'
    const isOrigin = stage.type === 'origin'

    return (
        <div className="relative pl-8 pb-8 last:pb-0">
            {/* Timeline line */}
            {index < stages.length - 1 && (
                <div
                    className="absolute left-[11px] top-[24px] bottom-0 w-[2px]"
                    style={{
                        background: isCurrent
                            ? 'linear-gradient(180deg, #f59e0b, rgba(245,158,11,0.3))'
                            : isOrigin
                            ? 'linear-gradient(180deg, #60a5fa, rgba(96,165,250,0.3))'
                            : stage.type === 'past'
                            ? 'linear-gradient(180deg, #22c55e, rgba(34,197,94,0.3))'
                            : 'linear-gradient(180deg, rgba(100,116,139,0.4), rgba(100,116,139,0.1))'
                    }}
                />
            )}

            {/* Paw node */}
            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border transition-all ${isCurrent ? 'border-amber-400/60 bg-amber-400/15 scale-110' : 'border-white/10 bg-white/5'}`}>
                <PawIcon className={isCurrent ? 'text-amber-400' : isOrigin ? 'text-blue-400' : stage.type === 'past' ? 'text-green-400' : 'text-slate-500'} />
                {isCurrent && (
                    <div className="absolute inset-[-4px] rounded-full border border-amber-400/20 animate-ping" />
                )}
            </div>

            {/* Card */}
            <div
                className="rounded-2xl p-4 border transition-all"
                style={{
                    background: isCurrent ? 'linear-gradient(180deg, rgba(245,158,11,0.08), rgba(15,23,42,0.95))' : 'linear-gradient(180deg, rgba(31,41,55,0.9), rgba(15,23,42,0.95))',
                    borderColor: isCurrent ? 'rgba(245,158,11,0.2)' : 'rgba(148,163,184,0.1)',
                    boxShadow: isCurrent ? '0 14px 40px rgba(245,158,11,0.08)' : '0 14px 40px rgba(0,0,0,0.15)'
                }}
            >
                {/* Time badge */}
                <div className={`inline-flex items-center gap-1.5 text-[10px] tracking-wider uppercase font-bold mb-2 px-2 py-1 rounded-full border ${colors.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>
                    {stage.time}
                </div>

                {/* Title */}
                <h3 className={`text-base font-bold mb-1.5 ${isCurrent ? 'text-amber-300' : isOrigin ? 'text-blue-300' : stage.type === 'past' ? 'text-green-300' : 'text-slate-200'}`}>
                    {stage.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{stage.description}</p>

                {/* Items or Grid */}
                {stage.isGrid && stage.gridItems ? (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                        {stage.gridItems.map((item, i) => (
                            <div
                                key={i}
                                className="bg-blue-500/10 border border-blue-500/15 rounded-xl px-3 py-2 text-[11px] text-blue-200 leading-snug"
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                ) : stage.items.length > 0 ? (
                    <ul className="space-y-1.5 mt-2">
                        {stage.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                                <span className={`mt-0.5 w-1 h-1 rounded-full flex-shrink-0 ${colors.dot}`}></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                        <span className="text-[10px] text-slate-500 tracking-wide uppercase font-semibold">Upcoming</span>
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-700 to-transparent"></div>
                    </div>
                )}
            </div>
        </div>
    )
}

const FootprintMap: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 z-50 bg-[#0f172a] animate-slide-up">
        {/* Background gradient */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 55%, #020617 100%)' }}></div>

        {/* Content */}
        <div className="relative h-full overflow-y-auto">
            <div className="max-w-md mx-auto px-4 py-6 pb-12">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <h1 className="text-white font-bold text-xl tracking-tight leading-tight">
                            PAWS Token<br />Footprint Map Roadmap
                        </h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 active:bg-white/10 flex-shrink-0 ml-3 mt-1"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    A refined, story-driven visual timeline that begins with the project's origin story, moves through its present second-mining stage, and stretches into a six-month roadmap.
                </p>

                {/* Chips */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                    {['Origin to Present', 'Second Mining Era', '6-Month Roadmap', 'Growth Milestones'].map((chip, i) => (
                        <span key={i} className="text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-200">
                            {chip}
                        </span>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-slate-700/30">
                    {[
                        { label: 'Origin and history', color: 'bg-blue-400' },
                        { label: 'Past phases', color: 'bg-green-400' },
                        { label: 'Current stage', color: 'bg-amber-400' },
                        { label: 'Roadmap', color: 'bg-slate-500' }
                    ].map((item, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 px-2 py-1 rounded-full bg-slate-800/60 border border-slate-700/30">
                            <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                            {item.label}
                        </span>
                    ))}
                </div>

                {/* Timeline */}
                <div className="relative">
                    {stages.map((stage, index) => (
                        <StageCard key={stage.id} stage={stage} index={index} />
                    ))}
                </div>

                {/* Bottom tagline */}
                <div className="text-center mt-10 pt-6 border-t border-slate-700/20">
                    <div className="flex justify-center items-center gap-2 mb-2">
                        <PawIcon className="text-amber-400" />
                        <PawIcon className="text-amber-400/60 scale-90" />
                        <PawIcon className="text-amber-400/30 scale-75" />
                    </div>
                    <p className="text-[10px] text-slate-500 tracking-widest uppercase font-bold">PAWS Token — Trail of Growth</p>
                </div>
            </div>
        </div>
    </div>
)

export default FootprintMap
