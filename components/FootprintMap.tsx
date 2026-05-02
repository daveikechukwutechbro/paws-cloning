'use client'

const roadmapStages = [
    { icon: '🐾', label: 'Origin', type: 'past' },
    { icon: '🚀', label: 'Growth', type: 'past' },
    { icon: '⚙️', label: 'Build-Up', type: 'past' },
    { icon: '⛏️', label: 'Second Mining', type: 'current' },
    { icon: '🔥', label: 'Month 1: Surge', type: 'future' },
    { icon: '💡', label: 'Month 2: Utility', type: 'future' },
    { icon: '🎯', label: 'Month 3: Missions', type: 'future' },
    { icon: '🤝', label: 'Month 4: Partnerships', type: 'future' },
    { icon: '⚡️', label: 'Month 5: Scaling', type: 'future' },
    { icon: '🎉', label: 'Month 6: Milestone', type: 'future' }
]

const FootprintMap: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 z-50 bg-[#080712] animate-slide-up">
        <style>{`
            @keyframes roadmap-pulse {
                0% { transform: scale(1); box-shadow: 0 0 15px #4dabf7, 0 0 30px #4dabf7; }
                50% { transform: scale(1.1); box-shadow: 0 0 30px #1c92f2, 0 0 45px #1c92f2; }
                100% { transform: scale(1); box-shadow: 0 0 15px #4dabf7, 0 0 30px #4dabf7; }
            }
            @keyframes roadmap-sparkle {
                0% { transform: translate(0, 0) scale(1); opacity: 0.8; }
                50% { transform: translate(-20px, 20px) scale(1.5); opacity: 0.2; }
                100% { transform: translate(0, 0) scale(1); opacity: 0; }
            }
            @keyframes roadmap-sparkle2 {
                0% { transform: translate(0, 0) scale(1); opacity: 0.6; }
                50% { transform: translate(20px, -20px) scale(1.3); opacity: 0.1; }
                100% { transform: translate(0, 0) scale(1); opacity: 0; }
            }
            .roadmap-pulse { animation: roadmap-pulse 2s infinite; }
            .roadmap-sparkle { animation: roadmap-sparkle 2s infinite ease-in-out; }
            .roadmap-sparkle2 { animation: roadmap-sparkle2 3s infinite ease-in-out; }
        `}</style>

        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#080712]/90 backdrop-blur-sm border-b border-white/5">
            <div className="flex items-center justify-between px-4 py-4">
                <div className="text-center w-full">
                    <h1 className="text-white font-bold text-lg tracking-wider uppercase">PAWS Token Roadmap</h1>
                    <p className="text-[#4dabf7] text-[10px] tracking-widest uppercase mt-0.5">From Origin to Future</p>
                </div>
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 active:bg-white/10"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        {/* Timeline */}
        <div className="flex flex-col items-center pt-10 pb-16 px-6">
            {roadmapStages.map((stage, index) => (
                <div key={index} className="flex flex-col items-center">
                    {/* Node */}
                    <div className={`relative text-center ${stage.type === 'current' ? 'mb-2' : 'mb-2'}`}>
                        {/* Sparkles for current */}
                        {stage.type === 'current' && (
                            <>
                                <div className="absolute rounded-full bg-white roadmap-sparkle" style={{ top: -8, left: '65%', width: 12, height: 12, opacity: 0.8 }} />
                                <div className="absolute rounded-full bg-[#5fcde4] roadmap-sparkle2" style={{ top: '65%', left: -8, width: 15, height: 15, opacity: 0.6 }} />
                            </>
                        )}

                        <div
                            className={`rounded-full flex items-center justify-center ${
                                stage.type === 'current'
                                    ? 'w-[60px] h-[60px] roadmap-pulse'
                                    : 'w-[50px] h-[50px]'
                            }`}
                            style={
                                stage.type === 'current'
                                    ? {
                                          background: 'linear-gradient(135deg, #4dabf7, #80d0c7)',
                                          boxShadow: '0 0 15px #4dabf7, 0 0 30px #4dabf7'
                                      }
                                    : {
                                          background: 'linear-gradient(135deg, #1c92f2, #f2fcfe)'
                                      }
                            }
                        >
                            <span className={stage.type === 'current' ? 'text-2xl' : 'text-xl'}>
                                {stage.icon}
                            </span>
                        </div>

                        <div className={`mt-2 text-sm font-semibold ${stage.type === 'current' ? 'text-[#4dabf7]' : 'text-white/80'}`}>
                            {stage.label}
                        </div>
                    </div>

                    {/* Path line (except last) */}
                    {index < roadmapStages.length - 1 && (
                        <div
                            className="w-1 h-10"
                            style={{
                                background: index >= 3
                                    ? 'linear-gradient(180deg, #4dabf7, #33415c)'
                                    : 'linear-gradient(180deg, #33415c, #080712)'
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    </div>
)

export default FootprintMap
