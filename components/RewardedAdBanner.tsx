'use client'

import { useRef, useEffect, useState } from 'react'

// Replace this with your Adsterra banner zone key from your dashboard
const ADSTERRA_ZONE_KEY = 'YOUR_ADSTERRA_ZONE_KEY'

interface RewardedAdBannerProps {
    onComplete: () => void
    onClose: () => void
    duration?: number
}

const RewardedAdBanner = ({ onComplete, onClose, duration = 5000 }: RewardedAdBannerProps) => {
    const bannerRef = useRef<HTMLDivElement>(null)
    const [progress, setProgress] = useState(0)
    const [adReady, setAdReady] = useState(false)
    const [canClaim, setCanClaim] = useState(false)

    useEffect(() => {
        if (!bannerRef.current || ADSTERRA_ZONE_KEY === 'YOUR_ADSTERRA_ZONE_KEY') {
            setAdReady(true)
            return
        }

        const atOptions = {
            key: ADSTERRA_ZONE_KEY,
            format: 'iframe',
            height: 50,
            width: 320,
            params: {},
        }

        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.innerHTML = `
            atOptions = ${JSON.stringify(atOptions)};
            document.write('<scr' + 'ipt type="text/javascript" src="http' + (location.protocol === 'https:' ? 's' : '') + '://www.effectivecreativeformat.com/${ADSTERRA_ZONE_KEY}/invoke.js"></scr' + 'ipt>');
        `

        bannerRef.current.innerHTML = ''
        bannerRef.current.appendChild(script)
        setAdReady(true)

        return () => {
            if (bannerRef.current) {
                bannerRef.current.innerHTML = ''
            }
        }
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
                    {ADSTERRA_ZONE_KEY !== 'YOUR_ADSTERRA_ZONE_KEY' ? (
                        <div
                            ref={bannerRef}
                            className="w-full min-h-[60px] bg-[#0f0f10] rounded-xl flex items-center justify-center overflow-hidden"
                        />
                    ) : (
                        <div className="w-full h-[60px] bg-[#0f0f10] rounded-xl flex items-center justify-center text-xs text-gray-500">
                            Adsterra Banner Placeholder
                            <br />
                            (Replace YOUR_ADSTERRA_ZONE_KEY)
                        </div>
                    )}

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
