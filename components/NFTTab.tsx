// components/NFTTab.tsx

/**
 * This project was developed by Nikandr Surkov.
 *
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * GitHub: https://github.com/nikandr-surkov
 */

'use client'

import Image from 'next/image'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useUser } from '@/contexts/UserContext'
import { purchaseNFT, getLocalNFTs } from '@/utils/userUtils'
import { PurchasedNFT, NFTTier } from '@/utils/types'

const TOTAL_NFTS = 5700
const ITEMS_PER_PAGE = 24

const TIER_NAMES = ['Astral', 'Nebula', 'Void', 'Phantom', 'Crimson', 'Storm', 'Frost', 'Obsidian', 'Solar', 'Umbra']
const ADJECTIVES = ['Ancient', 'Blazing', 'Celestial', 'Dark', 'Ethereal', 'Frozen', 'Golden', 'Hidden', 'Iron', 'Jade', 'Karmic', 'Lunar', 'Mystic', 'Night', 'Omega', 'Primal', 'Quantum', 'Royal', 'Shadow', 'Thunder']

type GeneratedNFT = {
    id: string
    name: string
    tier: NFTTier
    basePrice: number
    icon: string
    fullImage: string
    imageIdx: number
}

function getTier(index: number): NFTTier {
    if (index <= 1425) return 'Common'
    if (index <= 2850) return 'Rare'
    if (index <= 4275) return 'Epic'
    return 'Legendary'
}

function getBasePrice(index: number): number {
    const tier = getTier(index)
    const basePrices = { Common: 15.67, Rare: 21.00, Epic: 37.00, Legendary: 49.53 }
    const variation = ((index % 100) / 100) * 6
    return Math.round((basePrices[tier] + variation) * 100) / 100
}

function nftThumbUrl(index: number): string {
    return `/nfts/thumbs/${index}.webp`
}

function nftFullUrl(index: number): string {
    // Use the available high-resolution PNG asset for full preview
    return `/nfts/images/${index}.png`
}

function getSuggestedBackgrounds(index: number): string[] {
    const offsets = [3, 7, 13, 21]
    return offsets.map((offset) => {
        let candidate = index + offset
        if (candidate > TOTAL_NFTS) candidate = ((candidate - 1) % TOTAL_NFTS) + 1
        return `/nfts/images/${candidate}.png`
    })
}

function getRecommendedNFTs(baseNFT: GeneratedNFT, count = 3): GeneratedNFT[] {
    const offsets = [5, 11, 17, 23, 29]
    return offsets.slice(0, count).map((offset) => {
        let candidate = baseNFT.imageIdx + offset
        if (candidate > TOTAL_NFTS) candidate = ((candidate - 1) % TOTAL_NFTS) + 1
        return generateNFT(candidate)
    })
}

function generateNFT(index: number) {
    const tier = getTier(index)
    const adj = ADJECTIVES[index % ADJECTIVES.length]
    const tierName = TIER_NAMES[index % TIER_NAMES.length]
    const name = `${adj} ${tierName}`
    return {
        id: `nft_${index}`,
        name,
        tier,
        basePrice: getBasePrice(index),
        icon: nftThumbUrl(index),
        fullImage: nftFullUrl(index),
        imageIdx: index
    }
}

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
    const [selectedNFT, setSelectedNFT] = useState<GeneratedNFT | null>(null)
    const [txHash, setTxHash] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [copied, setCopied] = useState(false)
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
    const [prices, setPrices] = useState<Record<string, number>>({})
    const [ownedNFTs, setOwnedNFTs] = useState<PurchasedNFT[]>([])
    const [backgroundSuggestions, setBackgroundSuggestions] = useState<string[]>([])
    const [backgroundRotationIndex, setBackgroundRotationIndex] = useState(0)
    const [selectedTierFilter, setSelectedTierFilter] = useState<NFTTier | 'all'>('all')
    const sentinelRef = useRef<HTMLDivElement>(null)

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
            for (let i = 1; i <= TOTAL_NFTS; i++) {
                const nft = generateNFT(i)
                const factor = getFluctuationFactor(nft.id)
                newPrices[nft.id] = Math.round(nft.basePrice * factor * 100) / 100
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

    // Infinite scroll observer
    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel) return
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && visibleCount < TOTAL_NFTS) {
                    setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, TOTAL_NFTS))
                }
            },
            { rootMargin: '200px' }
        )
        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [visibleCount])

    const filteredNFTs = useMemo(() => {
        const nfts = []
        const end = Math.min(visibleCount, TOTAL_NFTS)
        for (let i = 1; i <= end; i++) {
            const nft = generateNFT(i)
            if (selectedTierFilter !== 'all' && nft.tier !== selectedTierFilter) continue
            nfts.push(nft)
        }
        return nfts
    }, [visibleCount, selectedTierFilter])

    const tierCounts = useMemo(() => {
        const counts = { Common: 0, Rare: 0, Epic: 0, Legendary: 0 } as Record<NFTTier, number>
        for (let i = 1; i <= TOTAL_NFTS; i++) {
            const tier = getTier(i)
            counts[tier]++
        }
        return counts
    }, [])

    const handleMint = (nft: GeneratedNFT) => {
        setSelectedNFT(nft)
        setTxHash('')
        setError(null)
        setSuccess(false)
        setBackgroundSuggestions(getSuggestedBackgrounds(nft.imageIdx || parseInt(nft.id.replace('nft_', ''))))
        setBackgroundRotationIndex(0)
    }

    const recommendedNFTs = useMemo(() => {
        return selectedNFT ? getRecommendedNFTs(selectedNFT) : []
    }, [selectedNFT])

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

    useEffect(() => {
        if (!selectedNFT) return
        const visibleSuggestions = backgroundSuggestions.length ? backgroundSuggestions : [selectedNFT.fullImage || selectedNFT.icon]
        setBackgroundRotationIndex(0)
        const rotation = setInterval(() => {
            setBackgroundRotationIndex((prev) => (prev + 1) % visibleSuggestions.length)
        }, 3500)
        return () => clearInterval(rotation)
    }, [selectedNFT, backgroundSuggestions])

    const handleBackToMint = () => {
        setSelectedNFT(null)
        setActiveSubTab('mint')
    }

    const tierOrder: NFTTier[] = ['Common', 'Rare', 'Epic', 'Legendary']

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-4 pt-4 pb-2 shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#6366f1] flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <span className="text-xl">💎</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">NFT Gallery</h1>
                            <p className="text-xs text-gray-400">{TOTAL_NFTS} unique HashLips NFTs</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setActiveSubTab(activeSubTab === 'mint' ? 'collection' : 'mint')}
                        className="text-xs text-[#a855f7] bg-[#a855f7]/10 px-3 py-2 rounded-lg font-medium"
                    >
                        {activeSubTab === 'mint' ? `My NFTs (${ownedNFTs.length})` : 'Mint'}
                    </button>
                </div>

                {/* Stats bar */}
                <div className="flex gap-3 mb-3">
                    <div className="flex-1 bg-[#1f1f20] border border-[#2d2d2e] rounded-xl p-3">
                        <div className="text-[10px] text-gray-500 mb-0.5">Owned</div>
                        <div className="text-lg font-bold text-[#a855f7]">{ownedNFTs.length}<span className="text-xs text-gray-500 ml-1">/ {TOTAL_NFTS}</span></div>
                    </div>
                    <div className="flex-1 bg-[#1f1f20] border border-[#2d2d2e] rounded-xl p-3">
                        <div className="text-[10px] text-gray-500 mb-0.5">Collection</div>
                        <div className="text-lg font-bold text-[#22c55e]">
                            {ownedNFTs.length > 0 ? Math.round((ownedNFTs.length / TOTAL_NFTS) * 10000) / 100 : 0}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-6">
                {activeSubTab === 'mint' ? (
                    <>
                        {/* Tier Filter */}
                        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-none">
                            <button
                                onClick={() => setSelectedTierFilter('all')}
                                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    selectedTierFilter === 'all'
                                        ? 'bg-[#a855f7] text-white'
                                        : 'bg-[#1f1f20] text-gray-400 border border-[#2d2d2e]'
                                }`}
                            >
                                All ({TOTAL_NFTS})
                            </button>
                            {tierOrder.map(tier => (
                                <button
                                    key={tier}
                                    onClick={() => setSelectedTierFilter(tier)}
                                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        selectedTierFilter === tier
                                            ? `${TIER_COLORS[tier].split(' ')[0]} bg-[${TIER_COLORS[tier].split(' ')[1].split('/')[0]}]`
                                            : 'bg-[#1f1f20] text-gray-400 border border-[#2d2d2e]'
                                    } ${
                                        selectedTierFilter === tier
                                            ? 'bg-opacity-20 border-0'
                                            : ''
                                    }`}
                                >
                                    {tier} ({tierCounts[tier]})
                                </button>
                            ))}
                        </div>

                        {/* NFT Grid */}
                        <div className="grid grid-cols-3 gap-2.5">
                            {filteredNFTs.map((nft) => {
                                const owned = ownedIds.has(nft.id)
                                const currentPrice = prices[nft.id] || nft.basePrice
                                const priceChange = ((currentPrice - nft.basePrice) / nft.basePrice * 100)
                                const isUp = priceChange >= 0
                                const tier = nft.tier
                                return (
                                    <div
                                        key={nft.id}
                                        className={`relative bg-gradient-to-b ${TIER_BG[tier]} border ${TIER_BORDER[tier]} rounded-xl overflow-hidden ${TIER_GLOW[tier]} shadow-lg ${owned ? 'opacity-60' : 'hover:scale-[1.02] active:scale-95 transition-all cursor-pointer'}`}
                                        onClick={() => !owned && handleMint(nft)}
                                    >
                                        <div className="relative">
                                            <div className={`absolute -inset-1 bg-gradient-to-r ${tier === 'Common' ? 'from-gray-400 to-gray-600' : tier === 'Rare' ? 'from-blue-400 to-cyan-400' : tier === 'Epic' ? 'from-purple-400 to-pink-400' : 'from-yellow-400 to-orange-400'} opacity-10 blur-xl`} />
                                            <div className="relative w-full aspect-square overflow-hidden flex items-center justify-center bg-black/10">
                                                <Image
                                                    src={nft.icon}
                                                    alt={nft.name}
                                                    fill
                                                    className="object-contain object-center"
                                                    sizes="120px"
                                                />
                                            </div>
                                            <div className="p-2">
                                                <h3 className="text-xs font-bold text-white truncate leading-tight">{nft.name}</h3>
                                                <span className={`inline-block text-[8px] font-semibold px-1.5 py-0.5 rounded-full border mt-0.5 ${TIER_COLORS[tier]}`}>
                                                    {tier}
                                                </span>
                                                <div className="mt-1 flex items-center gap-0.5">
                                                    <span className="text-xs font-bold text-white">{currentPrice.toFixed(2)}</span>
                                                    <span className="text-[7px] text-gray-400">TON</span>
                                                    <span className={`text-[8px] ml-auto ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                                                        {isUp ? '↑' : '↓'}{Math.abs(priceChange).toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                            {owned && (
                                                <div className="absolute top-1.5 right-1.5 bg-[#22c55e] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Load more sentinel */}
                        <div ref={sentinelRef} className="h-10 flex items-center justify-center mt-4">
                            {visibleCount < TOTAL_NFTS ? (
                                <span className="text-xs text-gray-500 animate-pulse">Loading more...</span>
                            ) : (
                                <span className="text-xs text-gray-500">Showing all {TOTAL_NFTS} NFTs</span>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {ownedNFTs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 rounded-full bg-[#1f1f20] border border-[#2d2d2e] flex items-center justify-center text-4xl mb-4">
                                    🖼️
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">No NFTs Yet</h3>
                                <p className="text-sm text-gray-500 max-w-xs">Mint your first NFT from the Mint tab to build your collection.</p>
                                <button
                                    onClick={() => setActiveSubTab('mint')}
                                    className="mt-4 px-6 py-3 bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white font-bold rounded-xl"
                                >
                                    Go Mint
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <span className="text-sm font-semibold text-gray-400">Your Collection</span>
                                    <span className="text-xs text-gray-500">{ownedNFTs.length} NFT{ownedNFTs.length > 1 ? 's' : ''}</span>
                                </div>
                                <div className="space-y-3">
                                    {ownedNFTs.map((nft, idx) => {
                                        const nftTier = nft.tier
                                        const imageIdx = parseInt(nft.nftId.replace('nft_', ''))
                                        const imageSrc = imageIdx ? nftThumbUrl(imageIdx) : nftThumbUrl(1)
                                        return (
                                            <div
                                                key={`${nft.nftId}-${idx}`}
                                                className={`bg-gradient-to-r ${TIER_BG[nftTier]} border ${TIER_BORDER[nftTier]} rounded-2xl p-4 ${TIER_GLOW[nftTier]} shadow-lg`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-black/40 flex items-center justify-center">
                                                        <Image
                                                            src={imageSrc}
                                                            alt={nft.name}
                                                            fill
                                                            className="object-contain object-center"
                                                            sizes="64px"
                                                        />
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
                                                        <div className="text-[10px] text-[#a855f7] font-mono max-w-[70px] truncate">{nft.transactionHash.slice(0, 8)}...</div>
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
                <div className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4" onClick={handleBackToMint}>
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
                                        <button onClick={handleBackToMint} className="flex items-center gap-1 text-white/80 text-sm">
                                            ← Back
                                        </button>
                                        <button onClick={handleBackToMint} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">✕</button>
                                    </div>
                                </div>

                                <div className="p-5 space-y-5">
                                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f10]">
                                        <div className="relative w-full h-80">
                                            <Image
                                                src={selectedNFT.fullImage || selectedNFT.icon}
                                                alt={selectedNFT.name}
                                                fill
                                                className="object-contain bg-black"
                                                sizes="600px"
                                            />
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 bg-black/50 p-3 text-xs text-gray-300">
                                            Full PNG preview — high-quality, immersive view for collectors.
                                        </div>
                                    </div>
                                    <div className={`relative overflow-hidden rounded-3xl border ${TIER_BORDER[selectedNFT.tier]} bg-gradient-to-br ${TIER_BG[selectedNFT.tier]} p-4`}>
                                        <div className="absolute inset-0 opacity-40 blur-2xl" style={{ backgroundImage: `url(${backgroundSuggestions[backgroundRotationIndex] || selectedNFT.fullImage || selectedNFT.icon})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                        <div className="absolute inset-0 bg-black/45" />
                                        <div className="relative flex flex-col gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-20 h-20 rounded-3xl overflow-hidden bg-black/30 shrink-0 flex items-center justify-center border border-white/10">
                                                    <div className="relative w-full h-full">
                                                    <Image
                                                        src={selectedNFT.fullImage || selectedNFT.icon}
                                                        alt={selectedNFT.name}
                                                        fill
                                                        className="object-contain object-center"
                                                        sizes="80px"
                                                    />
                                                </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-base">{selectedNFT.name}</div>
                                                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-0.5 ${TIER_COLORS[selectedNFT.tier]}`}>
                                                        {selectedNFT.tier}
                                                    </span>
                                                    <div className="text-lg font-bold text-white mt-1">
                                                        {(prices[selectedNFT.id] || selectedNFT.basePrice).toFixed(2)} TON
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="rounded-3xl border border-white/10 bg-black/30 p-3">
                                                <div className="text-xs text-gray-300">Full-view PNG preview</div>
                                                <div className="text-sm font-medium text-white mt-1">High resolution artwork shown for strong purchase appeal and collector engagement.</div>
                                            </div>
                                        </div>
                                    </div>

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

                                    <div className="bg-[#a855f7]/10 border border-[#a855f7]/30 rounded-xl p-3">
                                        <div className="flex items-center gap-2 text-[#a855f7]">
                                            <span>💡</span>
                                            <span className="text-sm">Send exactly {(prices[selectedNFT.id] || selectedNFT.basePrice).toFixed(2)} TON</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm font-semibold text-white">
                                            <span>Recommended for you</span>
                                            <span className="text-xs text-gray-400">Similar collector favorites</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {recommendedNFTs.map((nft) => (
                                                <button
                                                    key={nft.id}
                                                    type="button"
                                                    onClick={() => handleMint(nft)}
                                                    className="group bg-[#151516] rounded-2xl border border-[#2d2d2e] overflow-hidden text-left transition hover:border-[#a855f7] focus:outline-none focus:ring-2 focus:ring-[#a855f7]/50"
                                                >
                                                    <div className="relative w-full h-20 bg-black/20">
                                                        <Image
                                                            src={nft.icon}
                                                            alt={nft.name}
                                                            fill
                                                            className="object-contain object-center"
                                                            sizes="80px"
                                                        />
                                                    </div>
                                                    <div className="p-2">
                                                        <div className="text-[10px] text-gray-400 leading-tight truncate group-hover:text-white">{nft.name}</div>
                                                        <div className={`mt-1 text-[9px] font-semibold px-2 py-0.5 rounded-full ${TIER_COLORS[nft.tier]}`}>{nft.tier}</div>
                                                        <div className="mt-2 text-xs text-white font-semibold">{(prices[nft.id] || nft.basePrice).toFixed(2)} TON</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs text-gray-300">
                                            <span>Suggested rotating backgrounds</span>
                                            <span>{backgroundSuggestions.length} options</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {backgroundSuggestions.map((src, idx) => (
                                                <button
                                                    key={src}
                                                    onClick={() => setBackgroundRotationIndex(idx)}
                                                    className={`rounded-2xl overflow-hidden border transition ${idx === backgroundRotationIndex ? 'border-white/70' : 'border-white/10'}`}
                                                >
                                                    <div className="relative w-full h-16">
                                                        <Image
                                                            src={src}
                                                            alt={`Suggested background ${idx + 1}`}
                                                            fill
                                                            className="object-cover"
                                                            sizes="64px"
                                                        />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

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

                                    {error && (
                                        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
                                            ⚠️ {error}
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleBackToMint}
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
