// components/NFTTab.tsx

/**
 * This project was developed by Nikandr Surkov.
 *
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * GitHub: https://github.com/nikandr-surkov
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/contexts/UserContext'
import { purchaseNFT, getLocalNFTs } from '@/utils/userUtils'
import { NFTItem, PurchasedNFT, NFTTier } from '@/utils/types'

const NFT_CATALOG: (NFTItem & { imageIdx: number })[] = [
    {
        id: 'cosmic_paw',
        name: 'Cosmic Paw',
        tier: 'Common',
        basePrice: 15.67,
        description: 'A digital paw print from the stars',
        icon: '/nfts/images/1.png',
        glowColor: 'from-gray-400 to-gray-600',
        imageIdx: 1
    },
    {
        id: 'neon_claw',
        name: 'Neon Claw',
        tier: 'Common',
        basePrice: 17.80,
        description: 'Glowing with neon energy',
        icon: '/nfts/images/2.png',
        glowColor: 'from-gray-400 to-gray-600',
        imageIdx: 2
    },
    {
        id: 'crystal_fang',
        name: 'Crystal Fang',
        tier: 'Rare',
        basePrice: 19.87,
        description: 'Sharpened crystal essence',
        icon: '/nfts/images/3.png',
        glowColor: 'from-blue-400 to-cyan-400',
        imageIdx: 3
    },
    {
        id: 'shadow_mane',
        name: 'Shadow Mane',
        tier: 'Rare',
        basePrice: 26.20,
        description: 'Forged in the dark',
        icon: '/nfts/images/4.png',
        glowColor: 'from-blue-400 to-cyan-400',
        imageIdx: 4
    },
    {
        id: 'thunder_pelt',
        name: 'Thunder Pelt',
        tier: 'Epic',
        basePrice: 33.22,
        description: 'Crackling with storm power',
        icon: '/nfts/images/5.png',
        glowColor: 'from-purple-400 to-pink-400',
        imageIdx: 5
    },
    {
        id: 'inferno_eye',
        name: 'Inferno Eye',
        tier: 'Epic',
        basePrice: 42.49,
        description: 'Sees through the flames',
        icon: '/nfts/images/6.png',
        glowColor: 'from-purple-400 to-pink-400',
        imageIdx: 6
    },
    {
        id: 'eternal_roar',
        name: 'Eternal Roar',
        tier: 'Legendary',
        basePrice: 49.53,
        description: 'The legendary beast awakens',
        icon: '/nfts/images/7.png',
        glowColor: 'from-yellow-400 to-orange-400',
        imageIdx: 7
    }
]

function mulberry32(seed: number) {
    return function () {
        let t = seed += 0x6D2B79F5
        t = Math.imul(t ^ t >>> 15, t | 1)
        t ^= t + Math.imul(t ^ t >>> 7, t | 61)
        return ((t ^ t >>> 14) >>> 0) / 4294967296
    }
}

function getFluctuationFactor(nftId: string): number {
    const minutes = Math.floor(Date.now() / (5 * 60 * 1000))
    const seed = minutes * 1000 + nftId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    const rng = mulberry32(seed)
    const variation = (rng() - 0.5) * 0.3
    return 1 + variation
}

function getCurrentPrice(nft: NFTItem): number {
    const factor = getFluctuationFactor(nft.id)
    return Math.round(nft.basePrice * factor * 100) / 100
}

const TIER_COLORS: Record<NFTTier, string> = {
    Common: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
    Rare: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    Epic: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    Legendary: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
}

const TIER_BG: Record<NFTTier, string> = {
    Common: 'from-gray-900 to-gray-800',
    Rare: 'from-blue-900 to-blue-800',
    Epic: 'from-purple-900 to-purple-800',
    Legendary: 'from-yellow-900 to-orange-800'
}

const TIER_BORDER: Record<NFTTier, string> = {
    Common: 'border-gray-700',
    Rare: 'border-blue-700',
    Epic: 'border-purple-700',
    Legendary: 'border-yellow-600'
}

const TIER_GLOW: Record<NFTTier, string> = {
    Common: 'shadow-gray-500/20',
    Rare: 'shadow-blue-500/30',
    Epic: 'shadow-purple-500/30',
    Legendary: 'shadow-yellow-500/40'
}

const RECEIVING_WALLET_ADDRESS = 'UQDQG85BG8NZpaZzktagBiS_Y5sllQQT4iX43wM_XuK4cl3J'

const NFTTab = () => {
    const { user, refreshUser } = useUser()
    const [activeSubTab, setActiveSubTab] = useState<'mint' | 'collection'>('mint')
    const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null)
    const [txHash, setTxHash] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [copied, setCopied] = useState(false)
    const [prices, setPrices] = useState<Record<string, number>>({})
    const [ownedNFTs, setOwnedNFTs] = useState<PurchasedNFT[]>([])

    const ownedIds = useMemo(() => {
        const ids = new Set<string>()
        for (const nft of ownedNFTs) {
            ids.add(nft.nftId)
        }
        return ids
    }, [ownedNFTs])

    useEffect(() => {
        const nfts = user?.nfts || getLocalNFTs()
        setOwnedNFTs(nfts)
    }, [user])

    useEffect(() => {
        const updatePrices = () => {
            const newPrices: Record<string, number> = {}
            for (const nft of NFT_CATALOG) {
                newPrices[nft.id] = getCurrentPrice(nft)
            }
            setPrices(newPrices)
        }
        updatePrices()
        const interval = setInterval(updatePrices, 30_000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (copied) {
            const t = setTimeout(() => setCopied(false), 2000)
            return () => clearTimeout(t)
        }
    }, [copied])

    const handleMint = (nft: NFTItem) => {
        setSelectedNFT(nft)
        setTxHash('')
        setError(null)
        setSuccess(false)
    }

    const handlePurchase = async () => {
        if (!selectedNFT || !user?.id || !txHash) {
            setError('Please enter the transaction hash')
            return
        }
        if (txHash.length < 64) {
            setError('Invalid transaction hash format')
            return
        }

        setIsProcessing(true)
        setError(null)

        try {
            const price = prices[selectedNFT.id] || selectedNFT.basePrice
            const result = await purchaseNFT(
                user.id,
                {
                    id: selectedNFT.id,
                    name: selectedNFT.name,
                    tier: selectedNFT.tier,
                    pricePaid: price
                },
                txHash
            )
            if (result.success) {
                setSuccess(true)
                setTimeout(() => {
                    setSelectedNFT(null)
                    refreshUser()
                }, 2500)
            } else {
                setError(result.error || 'Verification failed')
            }
        } catch {
            setError('Failed to process')
        } finally {
            setIsProcessing(false)
        }
    }

    const copyAddress = () => {
        navigator.clipboard.writeText(RECEIVING_WALLET_ADDRESS)
        setCopied(true)
    }

    const groupedNFTs = useMemo(() => {
        const groups: Record<NFTTier, NFTItem[]> = {
            Common: [],
            Rare: [],
            Epic: [],
            Legendary: []
        }
        for (const nft of NFT_CATALOG) {
            groups[nft.tier].push(nft)
        }
        return groups
    }, [])

    const tierOrder: NFTTier[] = ['Common', 'Rare', 'Epic', 'Legendary']

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-4 pt-4 pb-2">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#6366f1] flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <span className="text-xl">💎</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">NFT Gallery</h1>
                        <p className="text-xs text-gray-400">Mint exclusive digital collectibles</p>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="flex gap-3 mb-3">
                    <div className="flex-1 bg-[#1f1f20] border border-[#2d2d2e] rounded-xl p-3">
                        <div className="text-[10px] text-gray-500 mb-0.5">Owned</div>
                        <div className="text-lg font-bold text-[#a855f7]">{ownedNFTs.length}<span className="text-xs text-gray-500 ml-1">/ {NFT_CATALOG.length}</span></div>
                    </div>
                    <div className="flex-1 bg-[#1f1f20] border border-[#2d2d2e] rounded-xl p-3">
                        <div className="text-[10px] text-gray-500 mb-0.5">Collection</div>
                        <div className="text-lg font-bold text-[#22c55e]">
                            {ownedNFTs.length > 0 ? Math.round((ownedNFTs.length / NFT_CATALOG.length) * 100) : 0}%
                        </div>
                    </div>
                </div>

                {/* Sub-tabs */}
                <div className="flex gap-1 bg-[#1a1a1b] rounded-xl p-1">
                    <button
                        onClick={() => setActiveSubTab('mint')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeSubTab === 'mint'
                                ? 'bg-[#a855f7] text-white shadow-lg shadow-purple-500/30'
                                : 'text-gray-400'
                        }`}
                    >
                        Mint
                    </button>
                    <button
                        onClick={() => setActiveSubTab('collection')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeSubTab === 'collection'
                                ? 'bg-[#a855f7] text-white shadow-lg shadow-purple-500/30'
                                : 'text-gray-400'
                        }`}
                    >
                        My Collection
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
                {activeSubTab === 'mint' ? (
                    // Mint tab - grouped by tier
                    <>
                        {tierOrder.map((tier) => {
                            const tierNFTs = groupedNFTs[tier]
                            if (tierNFTs.length === 0) return null
                            const allOwned = tierNFTs.every(n => ownedIds.has(n.id))
                            return (
                                <div key={tier} className={`${allOwned ? 'opacity-60' : ''}`}>
                                    <div className="flex items-center gap-2 mb-2 px-1">
                                        <span className={`text-xs font-bold uppercase tracking-wider ${TIER_COLORS[tier].split(' ')[0]}`}>
                                            {tier}
                                        </span>
                                        <span className="text-[10px] text-gray-600">|</span>
                                        <span className="text-[10px] text-gray-500">{tierNFTs.length} items</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {tierNFTs.map((nft) => {
                                            const owned = ownedIds.has(nft.id)
                                            const currentPrice = prices[nft.id] || nft.basePrice
                                            const priceChange = ((currentPrice - nft.basePrice) / nft.basePrice * 100)
                                            const isUp = priceChange >= 0
                                            return (
                                                <div
                                                    key={nft.id}
                                                    className={`relative bg-gradient-to-b ${TIER_BG[tier]} border ${TIER_BORDER[tier]} rounded-2xl overflow-hidden ${TIER_GLOW[tier]} shadow-lg ${owned ? 'opacity-70' : 'hover:scale-[1.02] transition-transform cursor-pointer'}`}
                                                    onClick={() => !owned && handleMint(nft)}
                                                >
                                                    {/* Glow effect */}
                                                    <div className={`absolute -inset-1 bg-gradient-to-r ${nft.glowColor} opacity-10 blur-xl`} />

                                                    <div className="relative p-3">
                                                        {/* Icon */}
                                                        <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 bg-black/40">
                                                            <img src={nft.icon} alt={nft.name} className="w-full h-full object-cover" />
                                                        </div>

                                                        {/* Name & tier */}
                                                        <h3 className="text-sm font-bold text-white truncate">{nft.name}</h3>
                                                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 ${TIER_COLORS[tier]}`}>
                                                            {tier}
                                                        </span>

                                                        {/* Price */}
                                                        <div className="mt-2 flex items-baseline gap-1">
                                                            <span className="text-lg font-bold text-white">{currentPrice.toFixed(2)}</span>
                                                            <span className="text-[10px] text-gray-400">TON</span>
                                                            <span className={`text-[10px] ml-auto ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                                                                {isUp ? '↑' : '↓'}{Math.abs(priceChange).toFixed(1)}%
                                                            </span>
                                                        </div>

                                                        {/* Owned badge */}
                                                        {owned && (
                                                            <div className="absolute top-2 right-2 bg-[#22c55e] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                                    Owned
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </>
                ) : (
                    // Collection tab
                    <>
                        {ownedNFTs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 rounded-full bg-[#1f1f20] border border-[#2d2d2e] flex items-center justify-center text-4xl mb-4">
                                    🖼️
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">No NFTs Yet</h3>
                                <p className="text-sm text-gray-500 max-w-xs">Mint your first NFT from the Mint tab to build your collection.</p>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <span className="text-sm font-semibold text-gray-400">Your Collection</span>
                                    <span className="text-xs text-gray-600">({ownedNFTs.length})</span>
                                </div>
                                <div className="space-y-3">
                                    {ownedNFTs.map((nft, idx) => {
                                        const catalogItem = NFT_CATALOG.find(c => c.id === nft.nftId)
                                        const nftTier = nft.tier
                                        return (
                                            <div
                                                key={`${nft.nftId}-${idx}`}
                                                className={`bg-gradient-to-r ${TIER_BG[nftTier]} border ${TIER_BORDER[nftTier]} rounded-2xl p-4 ${TIER_GLOW[nftTier]} shadow-lg`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-black/40">
                                                        <img src={catalogItem?.icon || '/nfts/images/1.png'} alt={nft.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-white text-base truncate">{nft.name}</h3>
                                                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-0.5 ${TIER_COLORS[nftTier]}`}>
                                                            {nftTier}
                                                        </span>
                                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                                                            <span>Paid: <span className="text-white font-semibold">{nft.pricePaid.toFixed(2)} TON</span></span>
                                                            <span>•</span>
                                                            <span>{new Date(nft.purchasedAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[10px] text-gray-500">TX</div>
                                                        <div className="text-[10px] text-[#a855f7] font-mono max-w-[80px] truncate">{nft.transactionHash.slice(0, 8)}...</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Purchase Modal */}
            {selectedNFT && (
                <div className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4" onClick={() => setSelectedNFT(null)}>
                    <div className="w-full max-w-sm bg-[#1a1a1b] rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

                        {success ? (
                            <div className="p-8 text-center">
                                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center text-4xl mb-4 animate-bounce">
                                    💎
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">NFT Minted!</h3>
                                <p className="text-gray-400">{selectedNFT.name} added to your collection</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-gradient-to-r from-[#a855f7] to-[#7c3aed] p-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-white">Mint NFT</h3>
                                        <button onClick={() => setSelectedNFT(null)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">✕</button>
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">
                                    {/* Selected NFT */}
                                    <div className={`bg-gradient-to-r ${TIER_BG[selectedNFT.tier]} border ${TIER_BORDER[selectedNFT.tier]} rounded-xl p-4`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/40">
                                                <img src={selectedNFT.icon} alt={selectedNFT.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-base">{selectedNFT.name}</div>
                                                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-0.5 ${TIER_COLORS[selectedNFT.tier]}`}>
                                                    {selectedNFT.tier}
                                                </span>
                                                <div className="text-sm text-white mt-1">
                                                    {(prices[selectedNFT.id] || selectedNFT.basePrice).toFixed(2)} TON
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Wallet Address */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Send TON to:</label>
                                        <div className="bg-[#0f0f10] border border-[#2d2d2e] rounded-xl p-3">
                                            <div className="text-xs text-gray-500 mb-1">Receiver Address:</div>
                                            <div className="text-xs text-[#a855f7] font-mono break-all">{RECEIVING_WALLET_ADDRESS}</div>
                                        </div>
                                        <button onClick={copyAddress} className="text-[#a855f7] text-sm flex items-center gap-1">
                                            {copied ? '✓ Copied!' : '📋 Copy Address'}
                                        </button>
                                    </div>

                                    {/* Amount */}
                                    <div className="bg-[#a855f7]/10 border border-[#a855f7]/30 rounded-xl p-3">
                                        <div className="flex items-center gap-2 text-[#a855f7]">
                                            <span>💡</span>
                                            <span className="text-sm">Send exactly {(prices[selectedNFT.id] || selectedNFT.basePrice).toFixed(2)} TON</span>
                                        </div>
                                    </div>

                                    {/* TX Hash Input */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Transaction Hash</label>
                                        <input
                                            type="text"
                                            value={txHash}
                                            onChange={(e) => setTxHash(e.target.value.trim())}
                                            placeholder="Paste TX hash here..."
                                            className="w-full bg-[#1f1f20] text-white rounded-xl px-4 py-3 text-sm border border-[#2d2d2e] focus:border-[#a855f7] outline-none transition-colors"
                                        />
                                        <div className="text-xs text-gray-500">Find in your TON wallet after sending</div>
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
                                            ⚠️ {error}
                                        </div>
                                    )}

                                    {/* Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setSelectedNFT(null)}
                                            className="flex-1 py-3 rounded-xl bg-[#2d2d2e] text-white font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handlePurchase}
                                            disabled={isProcessing || !txHash}
                                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white font-bold disabled:opacity-50"
                                        >
                                            {isProcessing ? 'Verifying...' : 'Verify & Mint'}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default NFTTab
