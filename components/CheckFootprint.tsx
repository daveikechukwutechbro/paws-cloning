'use client'

import ArrowBigRight from "@/icons/ArrowBigRight"
import { useState, useEffect } from 'react'
import FootprintMap from './FootprintMap'
import { getCurrentUserCount, formatUserCount } from '@/utils/userGrowth'

const CheckFootprint = () => {
    const [showMap, setShowMap] = useState(false)
    const [userCount, setUserCount] = useState(0)

    useEffect(() => {
        setUserCount(getCurrentUserCount())
        const interval = setInterval(() => {
            setUserCount(getCurrentUserCount())
        }, 30000)
        return () => clearInterval(interval)
    }, [])

    return (
        <>
            {showMap && <FootprintMap onClose={() => setShowMap(false)} />}
            <div className="flex justify-center w-full">
                <div className="fixed top-0 w-full max-w-md bg-[#151516] z-40">
                    <div className="px-4 py-2 cursor-pointer" onClick={() => setShowMap(true)}>
                        <div className="flex justify-between items-center pl-2 border-l-[2px] border-[#4c9ce2]">
                            <div className="text-base text-white font-medium">Check the footprint map</div>
                            <button className="bg-[#4c9ce2] rounded-full px-2 py-1">
                                <ArrowBigRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="px-4 pb-1 flex items-center justify-between text-[9px] text-gray-500">
                        <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-[#22c55e] animate-pulse" />
                            {formatUserCount(userCount)} total users
                        </span>
                        <span>Airdrop eligibility active</span>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CheckFootprint
