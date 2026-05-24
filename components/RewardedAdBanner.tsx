'use client'

import { useState, useEffect, useCallback } from 'react'

const ADSTERRA_ZONE_1 = '8464f78b8275107f3e25f93bd3267132'
const ADSTERRA_ZONE_2 = '19e2b3c14a4cd7a4c721f49ee8ddb156'
const ADSTERRA_ZONES = [ADSTERRA_ZONE_1, ADSTERRA_ZONE_2]

interface RewardedAdBannerProps {
    onComplete: () => void
    onClose: () => void
}

function randomViewDuration(): number {
    return 10000 + Math.floor(Math.random() * 6000)
}

const RewardedAdBanner = ({ onComplete, onClose }: RewardedAdBannerProps) => {
    const [duration] = useState(randomViewDuration)
    const [progress, setProgress] = useState(0)
    const [adReady, setAdReady] = useState(false)
    const [canClaim, setCanClaim] = useState(false)
    const [adKey] = useState(() => ADSTERRA_ZONES[Math.floor(Math.random() * ADSTERRA_ZONES.length)])

    useEffect(() => {
        setAdReady(true)
    }, [])

    useEffect(() => {
        if (!adReady) return

        const steps = 100
        const stepTime = duration / steps
        let current = 0

        const interval = setInterval(() => {
            current += 1
            setProgress(current)
            if (current >= steps) {
                clearInterval(interval)
                setCanClaim(true)
            }
        }, stepTime)

        return () => clearInterval(interval)
    }, [adReady, duration])

    return (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-sm bg-[#1a1a1b] rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-[#007aff] to-[#0056cc] p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Watch Ad</h3>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">✕</button>
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    <div className="w-full flex justify-center bg-[#0f0f10] rounded-xl overflow-hidden">
                        <iframe
                            srcDoc={`
                                <!DOCTYPE html>
                                <html>
                                <body style="margin:0;padding:0;">
                                <script>
                                    atOptions = {
                                        'key' : '${adKey}',
                                        'format' : 'iframe',
                                        'height' : 250,
                                        'width' : 300,
                                        'params' : {}
                                    };
                                </script>
                                <script src="https://www.highperformanceformat.com/${adKey}/invoke.js"></script>
                                </body>
                                </html>
                            `}
                            style={{ width: 300, height: 250, border: 'none', maxWidth: '100%' }}
                            title="Ad"
                            sandbox="allow-scripts allow-same-origin"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>Ad viewing progress</span>
                            <span>{Math.min(100, Math.floor(progress))}%</span>
                        </div>
                        <div className="w-full bg-[#2d2d2e] rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-100 bg-gradient-to-r from-[#007aff] to-[#22c55e]"
                                style={{ width: `${Math.min(100, progress)}%` }}
                            />
                        </div>
                    </div>

                    {canClaim ? (
                        <button
                            onClick={onComplete}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-bold"
                        >
                            Claim Reward ✓
                        </button>
                    ) : (
                        <div className="text-center text-xs text-gray-500">
                            Please wait while the ad loads...
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default RewardedAdBanner
