// components/LeaderboardTab.tsx

/**
 * This project was developed by Nikandr Surkov.
 * 
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * GitHub: https://github.com/nikandr-surkov
 */

'use client'

import PawsLogo from '@/icons/PawsLogo'
import { trophy } from '@/images';
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'

type LeaderboardItem = {
    wallet: string;
    balance: string;
    place: string | number;
    medal?: '🥇' | '🥈' | '🥉';
}

const LeaderboardTab = () => {
    const { user, loading } = useUser()
    const [userRank, setUserRank] = useState('--')

    useEffect(() => {
        if (user && user.balance > 0) {
            const totalUsers = 23253686
            const estimatedRank = Math.floor(totalUsers * (1 - (user.balance / 100000000)))
            setUserRank(Math.max(1, estimatedRank).toLocaleString())
        }
    }, [user])

    const leaderboardData: LeaderboardItem[] = [
        { wallet: "Pishnahad_Sup", balance: "53,137,490", place: "🥇" },
        { wallet: "imGet", balance: "52,374,426", place: "🥈" },
        { wallet: "Esalat", balance: "45,459,702", place: "🥉" },
        { wallet: "mehranseydi", balance: "42,660,196", place: "#4" },
        { wallet: "abbas", balance: "34,626,638", place: "#5" },
        { wallet: "CenterProd", balance: "32,032,520", place: "#6" },
        { wallet: "tuxeoqt", balance: "31,568,259", place: "#7" },
        { wallet: "ladesov", balance: "28,707,823", place: "#8" },
    ]

    return (
        <div className={`leaderboard-tab-con transition-all duration-300`}>
            {/* Header */}
            <div className="px-4">
                <div className="flex flex-col items-center mt-4">
                    <Image
                        src={trophy}
                        alt="Trophy"
                        width={80}
                        height={80}
                        className="mb-2"
                    />
                    <h1 className="text-2xl font-bold mb-2">Leaderboard</h1>
                    <div className="w-full mt-2 px-6 py-1 flex justify-between rounded-lg text-sm font-medium text-[#fefefe] bg-[#151516]">
                        <span>Total</span>
                        <span>23,253,686 users</span>
                    </div>
                </div>

                {/* Current User Stats */}
                <div className="bg-white rounded-2xl p-6 mt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 p-1.5 bg-black rounded-lg">
                                <PawsLogo className="w-full h-full" />
                            </div>
                            <div className="text-black font-medium">
                                <div className="text-base">{loading ? 'Loading...' : (user?.username || 'You')}</div>
                                <div className="text-xs">{loading ? '--' : (user?.balance || 0).toLocaleString()} PAWS</div>
                            </div>
                        </div>
                        <div className="text-black">#{userRank}</div>
                    </div>
                </div>

                {/* Leaderboard List */}
                <div className="mt-4 space-y-0 rounded-t-2xl">
                    {leaderboardData.map((item, index) => (
                        <div
                            key={index}
                            className={`p-4 flex items-center justify-between border-b-[1px] border-[#222622] ${index === 0 ? 'bg-[#2d2b1b] rounded-t-2xl' :
                                index === 1 ? 'bg-[#272728]' :
                                    index === 2 ? 'bg-[#2d241b]' :
                                        'bg-[#151515]'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 p-1.5 bg-white rounded-lg">
                                    <PawsLogo className="w-full h-full text-black" />
                                </div>
                                <div>
                                    <div className="text-base font-medium">{item.wallet}</div>
                                    <div className="text-sm font-medium text-[#7c7c7c]">
                                        {item.balance} PAWS
                                    </div>
                                </div>
                            </div>
                            <div className={`text-base font-medium ${typeof item.place === 'string' && item.place.startsWith('#')
                                ? 'text-white'
                                : ''
                                }`}>
                                {item.place}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default LeaderboardTab