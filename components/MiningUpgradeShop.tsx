'use client'

import { useState, useEffect } from 'react'
import { MINING_UPGRADES, DEFAULT_MINING_RATE, ActiveMiningUpgrade, getUpgradeExpiryDays } from '@/utils/miningUpgrades'
import { useUser } from '@/contexts/UserContext'
import { addMiningUpgrade } from '@/utils/userUtils'

interface MiningUpgradeShopProps {
    onClose: () => void
    onPurchaseComplete: () => void
}

const MiningUpgradeShop = ({ onClose, onPurchaseComplete }: MiningUpgradeShopProps) => {
    const { user, refreshUser } = useUser()
    const [activeUpgrades, setActiveUpgrades] = useState<ActiveMiningUpgrade[]>([])
    const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null)
    const [autoRenewal, setAutoRenewal] = useState(true)
    const [txHash, setTxHash] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showConfirm, setShowConfirm] = useState(false)
    const [success, setSuccess] = useState(false)
    const [copied, setCopied] = useState(false)
    const [hoveredCard, setHoveredCard] = useState<string | null>(null)
    
    const RECEIVING_WALLET_ADDRESS = 'UQDQG85BG8NZpaZzktagBiS_Y5sllQQT4iX43wM_XuK4cl3J'

    useEffect(() => {
        if (user?.miningUpgrades) {
            setActiveUpgrades(user.miningUpgrades)
        }
    }, [user])

    useEffect(() => {
        if (copied) {
            setTimeout(() => setCopied(false), 2000)
        }
    }, [copied])

    const getCurrentMiningRate = () => {
        let total = DEFAULT_MINING_RATE
        const now = new Date()
        for (const upgrade of activeUpgrades) {
            if (new Date(upgrade.expiryDate) > now) {
                const config = MINING_UPGRADES.find(u => u.id === upgrade.upgradeId)
                if (config) total += config.bonusRate
            }
        }
        return total
    }

    const getBonusRate = () => {
        let total = 0
        const now = new Date()
        for (const upgrade of activeUpgrades) {
            if (new Date(upgrade.expiryDate) > now) {
                const config = MINING_UPGRADES.find(u => u.id === upgrade.upgradeId)
                if (config) total += config.bonusRate
            }
        }
        return total
    }

    const activeUpgradesList = activeUpgrades.filter(u => new Date(u.expiryDate) > new Date())

    const handlePurchase = async () => {
        if (!selectedUpgrade || !user?.id || !txHash) {
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
            const result = await addMiningUpgrade(user.id, selectedUpgrade, txHash, autoRenewal)
            if (result.success) {
                setSuccess(true)
                setTimeout(() => {
                    onPurchaseComplete()
                    refreshUser()
                }, 2500)
            } else {
                setError(result.error || 'Verification failed')
            }
        } catch (err) {
            setError('Failed to process')
        } finally {
            setIsProcessing(false)
        }
    }

    const copyAddress = () => {
        navigator.clipboard.writeText(RECEIVING_WALLET_ADDRESS)
        setCopied(true)
    }

    const getUpgradeConfig = (upgradeId: string) => {
        return MINING_UPGRADES.find(u => u.id === upgradeId)
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-end justify-center">
            <div className="w-full max-w-lg bg-gradient-to-b from-[#1e1e20] to-[#121214] rounded-t-3xl max-h-[95vh] overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="relative p-6 pb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/10" />
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Mining Speed</h2>
                                <p className="text-sm text-gray-400">Boost your earnings</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                            <span className="text-gray-400 text-xl">×</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-3 mt-5">
                        <div className="flex-1 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-4">
                            <div className="text-xs text-gray-400 mb-1">Current Rate</div>
                            <div className="text-xl font-bold text-emerald-400">{getCurrentMiningRate().toLocaleString()}<span className="text-xs text-gray-500 ml-1">/hr</span></div>
                        </div>
                        <div className="flex-1 bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-2xl p-4">
                            <div className="text-xs text-gray-400 mb-1">Bonus Earned</div>
                            <div className="text-xl font-bold text-amber-400">+{getBonusRate().toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-4">
                    
                    {/* Active Upgrades */}
                    {activeUpgradesList.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-semibold text-gray-300">Active Upgrades</span>
                            </div>
                            {activeUpgradesList.map((upgrade, idx) => {
                                const config = getUpgradeConfig(upgrade.upgradeId)
                                if (!config) return null
                                const daysLeft = getUpgradeExpiryDays(upgrade.expiryDate)
                                const hoursLeft = Math.floor((new Date(upgrade.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60))
                                
                                return (
                                    <div key={idx} className="relative bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/30 rounded-2xl p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xl shadow-lg">
                                                    ⚡
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white">{config.name}</div>
                                                    <div className="text-sm text-emerald-400">+{config.bonusRate.toLocaleString()} PAWS/hr</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-amber-400">{daysLeft}d {hoursLeft % 24}h left</div>
                                                {upgrade.autoRenewal && <div className="text-xs text-gray-500">♻️ Auto-renew</div>}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Upgrade Cards */}
                    <div className="space-y-3 pt-2">
                        <span className="text-sm font-semibold text-gray-300">Select Plan</span>
                        
                        {MINING_UPGRADES.map((upgrade) => {
                            const isActive = activeUpgradesList.some(u => u.upgradeId === upgrade.id)
                            const isGold = upgrade.id === 'gold_miner'
                            const isSilver = upgrade.id === 'silver_miner'
                            const isBronze = upgrade.id === 'bronze_miner'
                            
                            return (
                                <div 
                                    key={upgrade.id}
                                    onClick={() => !isActive && setSelectedUpgrade(upgrade.id)}
                                    onMouseEnter={() => setHoveredCard(upgrade.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    className={`
                                        relative overflow-hidden rounded-3xl p-5 transition-all duration-300 cursor-pointer
                                        ${isGold ? 'bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500' : ''}
                                        ${isSilver ? 'bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500' : ''}
                                        ${isBronze ? 'bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600' : ''}
                                        ${hoveredCard === upgrade.id && !isActive ? 'scale-[1.02] shadow-xl' : ''}
                                        ${isActive ? 'opacity-60' : ''}
                                    `}
                                >
                                    {/* Card Background Pattern */}
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 blur-3xl" />
                                        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
                                    </div>

                                    <div className="relative flex items-center gap-5">
                                        {/* Icon */}
                                        <div className={`
                                            w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg
                                            ${isGold ? 'bg-white/30' : 'bg-white/20'}
                                        `}>
                                            {isGold ? '👑' : isSilver ? '🥈' : '🥉'}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-white text-lg">{upgrade.name}</span>
                                                {isGold && (
                                                    <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">POPULAR</span>
                                                )}
                                            </div>
                                            <div className="text-white/90 text-sm font-medium">
                                                +{upgrade.bonusRate.toLocaleString()} PAWS<span className="text-white/60">/hr</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-white/60">
                                                <span>⏱ 7 Days</span>
                                                <span>•</span>
                                                <span>Weekly</span>
                                            </div>
                                        </div>

                                        {/* Price & Action */}
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-white">{upgrade.priceTon}</div>
                                            <div className="text-xs text-white/60 mb-2">TON</div>
                                            {isActive ? (
                                                <div className="px-4 py-2 bg-white/30 rounded-xl">
                                                    <span className="text-sm font-semibold text-white">Active</span>
                                                </div>
                                            ) : (
                                                <div className="px-4 py-2 bg-white rounded-xl hover:bg-white/90 transition-colors">
                                                    <span className="text-sm font-bold text-gray-800">Select</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Trust Section */}
                    <div className="flex justify-center gap-8 py-4">
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <span className="text-lg">🔒</span>
                            <span>Secure</span>
                        </div>
                        <div className="w-px h-4 bg-gray-700" />
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <span className="text-lg">⚡</span>
                            <span>Instant</span>
                        </div>
                        <div className="w-px h-4 bg-gray-700" />
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <span className="text-lg">✅</span>
                            <span>Verified</span>
                        </div>
                    </div>
                </div>

                {/* Purchase Modal */}
                {selectedUpgrade && (
                    <div className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4" onClick={() => setSelectedUpgrade(null)}>
                        <div className="w-full max-w-md bg-[#1a1a1b] rounded-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            
                            {success ? (
                                <div className="p-10 text-center">
                                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-5xl mb-6 animate-bounce">
                                        ✓
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Activated!</h3>
                                    <p className="text-gray-400">Mining speed upgraded successfully</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-white">Complete Payment</h3>
                                            <button onClick={() => setSelectedUpgrade(null)} className="text-white/80 hover:text-white">✕</button>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        {/* Selected Plan */}
                                        {(() => {
                                            const config = getUpgradeConfig(selectedUpgrade)
                                            if (!config) return null
                                            return (
                                                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl">
                                                            {config.id === 'gold_miner' ? '👑' : config.id === 'silver_miner' ? '🥈' : '🥉'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white text-lg">{config.name}</div>
                                                            <div className="text-amber-400">+{config.bonusRate.toLocaleString()} PAWS/hr • 7 days</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })()}

                                        {/* Wallet Address */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Send TON to:</label>
                                            <div className="bg-[#252528] rounded-xl p-4 break-all">
                                                <div className="text-xs text-gray-500 mb-2">Receiver Address:</div>
                                                <div className="text-sm text-emerald-400 font-mono">{RECEIVING_WALLET_ADDRESS}</div>
                                            </div>
                                            <button onClick={copyAddress} className="text-blue-400 text-sm flex items-center gap-2">
                                                {copied ? '✓ Copied!' : '📋 Copy Address'}
                                            </button>
                                        </div>

                                        {/* Amount Reminder */}
                                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-amber-400">
                                                <span>💡</span>
                                                <span className="text-sm font-medium">Send exactly {getUpgradeConfig(selectedUpgrade)?.priceTon} TON</span>
                                            </div>
                                        </div>

                                        {/* TX Hash Input */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Transaction Hash (TX Hash)</label>
                                            <input
                                                type="text"
                                                value={txHash}
                                                onChange={(e) => setTxHash(e.target.value.trim())}
                                                placeholder="Paste your transaction hash here..."
                                                className="w-full bg-[#252528] text-white rounded-xl px-4 py-3 text-sm border border-[#3d3d3e] focus:border-blue-500 outline-none transition-colors"
                                            />
                                            <div className="text-xs text-gray-500">Find in your TON wallet after sending</div>
                                        </div>

                                        {/* Auto-renewal */}
                                        <div className="flex items-center gap-3 p-4 bg-[#252528] rounded-xl">
                                            <input
                                                type="checkbox"
                                                id="autoRenewal"
                                                checked={autoRenewal}
                                                onChange={(e) => setAutoRenewal(e.target.checked)}
                                                className="w-5 h-5 accent-blue-500 rounded"
                                            />
                                            <label htmlFor="autoRenewal" className="flex-1">
                                                <div className="text-sm font-medium text-white">Auto-Renewal</div>
                                                <div className="text-xs text-gray-500">Automatically renews weekly</div>
                                            </label>
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
                                                onClick={() => setSelectedUpgrade(null)}
                                                className="flex-1 py-4 rounded-xl bg-[#252528] text-white font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handlePurchase}
                                                disabled={isProcessing || !txHash}
                                                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold disabled:opacity-50"
                                            >
                                                {isProcessing ? 'Verifying...' : 'Verify & Activate'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MiningUpgradeShop