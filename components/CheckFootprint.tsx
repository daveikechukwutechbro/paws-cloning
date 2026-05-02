'use client'

import ArrowBigRight from "@/icons/ArrowBigRight"
import { useState } from 'react'
import FootprintMap from './FootprintMap'

const CheckFootprint = () => {
    const [showMap, setShowMap] = useState(false)

    return (
        <>
            {showMap && <FootprintMap onClose={() => setShowMap(false)} />}
            <div className="flex justify-center w-full">
                <div className="fixed top-0 w-full max-w-md px-4 py-3 bg-[#151516] cursor-pointer z-40">
                    <div
                        className="flex justify-between items-center pl-2 border-l-[2px] border-[#4c9ce2]"
                        onClick={() => setShowMap(true)}
                    >
                        <div className="text-base text-white font-medium">Check the footprint map</div>
                        <button className="bg-[#4c9ce2] rounded-full px-2 py-1">
                            <ArrowBigRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CheckFootprint
