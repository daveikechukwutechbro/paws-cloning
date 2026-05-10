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
    const [success, setSuccess] = useState(false)
    const [copied, setCopied] = useState(false)
    
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
            <div className="w-full max-w-lg bg-[#151516] rounded-t-3xl max-h-[95vh] overflow-hidden flex flex-col">
                
                {/* Header - Fixed position for easy mobile access */}
                <div className="sticky top-0 z-10 bg-[#151516] p-4 pb-3">
                    <div className="flex items-center justify-between">
                        {/* Close button on LEFT for mobile accessibility */}
                        <button 
                            onClick={onClose} 
                            className="w-12 h-12 rounded-full bg-[#2d2d2e] flex items-center justify-center hover:bg-[#3d3d3e] transition-colors"
                        >
                            <span className="text-gray-300 text-2xl leading-none">←</span>
                        </button>
                        
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#007aff] to-[#0056cc] flex items-center justify-center shadow-lg">
                                <span className="text-xl">⚡</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Mining Speed</h2>
                                <p className="text-xs text-gray-400">Boost your earnings</p>
                            </div>
                        </div>
                        
                        <div className="w-12" /> {/* Spacer for alignment */}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-3 mt-4">
                        <div className="flex-1 bg-[#1f1f20] border border-[#2d2d2e] rounded-xl p-3">
                            <div className="text-[10px] text-gray-500 mb-0.5">Current Rate</div>
                            <div className="text-lg font-bold text-[#007aff]">{getCurrentMiningRate().toLocaleString()}<span className="text-xs text-gray-500 ml-1">/hr</span></div>
                        </div>
                        <div className="flex-1 bg-[#1f1f20] border border-[#2d2d2e] rounded-xl p-3">
                            <div className="text-[10px] text-gray-500 mb-0.5">Bonus</div>
                            <div className="text-lg font-bold text-[#22c55e]">+{getBonusRate().toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
                    
                    {/* Active Upgrades */}
                    {activeUpgradesList.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 px-1">
                                <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                                <span className="text-xs font-semibold text-gray-400">Active Upgrades</span>
                            </div>
                            {activeUpgradesList.map((upgrade, idx) => {
                                const config = getUpgradeConfig(upgrade.upgradeId)
                                if (!config) return null
                                const daysLeft = getUpgradeExpiryDays(upgrade.expiryDate)
                                const hoursLeft = Math.floor((new Date(upgrade.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60))
                                
                                return (
                                    <div key={idx} className="bg-[#1f1f20] border border-[#22c55e]/30 rounded-xl p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-[#007aff]/20 flex items-center justify-center text-lg">
                                                    ⚡
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white text-sm">{config.name}</div>
                                                    <div className="text-xs text-[#22c55e]">+{config.bonusRate.toLocaleString()}/hr</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-[#ffd700]">{daysLeft}d {hoursLeft % 24}h</div>
                                                {upgrade.autoRenewal && <div className="text-[10px] text-gray-500">♻️ Auto</div>}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Upgrade Cards */}
                    <div className="space-y-3 pt-2">
                        <span className="text-sm font-semibold text-gray-400 px-1">Select Plan</span>
                        
                        {MINING_UPGRADES.map((upgrade) => {
                            const isActive = activeUpgradesList.some(u => u.upgradeId === upgrade.id)
                            const isGold = upgrade.id === 'gold_miner'
                            const isSilver = upgrade.id === 'silver_miner'
                            
                            return (
                                <div 
                                    key={upgrade.id}
                                    onClick={() => !isActive && setSelectedUpgrade(upgrade.id)}
                                    className={`
                                        relative overflow-hidden rounded-2xl p-4 transition-all duration-200 cursor-pointer border
                                        ${isGold ? 'bg-gradient-to-br from-[#1a1a2e] to-[#151516] border-[#ffd700]/40' : ''}
                                        ${isSilver ? 'bg-gradient-to-br from-[#1a1a2e] to-[#151516] border-[#c0c0c0]/40' : ''}
                                        ${!isGold && !isSilver ? 'bg-[#1a1a1b] border-[#2d2d2e]' : ''}
                                        ${isActive ? 'opacity-60' : ''}
                                        ${selectedUpgrade === upgrade.id ? 'border-[#007aff] ring-2 ring-[#007aff]/30' : ''}
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Icon */}
                                        <div className={`
                                            w-14 h-14 rounded-xl flex items-center justify-center text-2xl
                                            ${isGold ? 'bg-gradient-to-br from-[#ffd700] to-[#b8860b]' : ''}
                                            ${isSilver ? 'bg-gradient-to-br from-[#c0c0c0] to-[#808080]' : ''}
                                            ${!isGold && !isSilver ? 'bg-gradient-to-br from-[#cd7f32] to-[#b8860b]' : ''}
                                        `}>
                                            {isGold ? '👑' : isSilver ? '🥈' : '🥉'}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-white text-base">{upgrade.name}</span>
                                                {isGold && (
                                                    <span className="text-[10px] bg-[#007aff] text-white px-2 py-0.5 rounded-full font-bold">POPULAR</span>
                                                )}
                                            </div>
                                            <div className="text-[#22c55e] text-sm font-semibold">
                                                +{upgrade.bonusRate.toLocaleString()} PAWS<span className="text-gray-500">/hr</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                <span>⏱ 7 Days</span>
                                                <span>•</span>
                                                <span>Weekly</span>
                                            </div>
                                        </div>

                                        {/* Price & Action */}
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-white">{upgrade.priceTon}</div>
                                            <div className="text-xs text-gray-500 mb-2">TON</div>
                                            {isActive ? (
                                                <div className="px-3 py-1.5 bg-[#22c55e]/20 text-[#22c55e] rounded-lg text-xs font-semibold">
                                                    Active
                                                </div>
                                            ) : (
                                                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                                                    selectedUpgrade === upgrade.id 
                                                        ? 'bg-[#007aff] text-white' 
                                                        : 'bg-[#2d2d2e] text-white'
                                                }`}>
                                                    Select
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Trust Section */}
                    <div className="flex justify-center gap-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                            <span>🔒</span>
                            <span>Secure</span>
                        </div>
                        <div className="w-px h-4 bg-gray-700" />
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                            <span>⚡</span>
                            <span>Instant</span>
                        </div>
                        <div className="w-px h-4 bg-gray-700" />
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                            <span>✅</span>
                            <span>Verified</span>
                        </div>
                    </div>
                </div>

                {/* Purchase Modal */}
                {selectedUpgrade && (
                    <div className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4" onClick={() => setSelectedUpgrade(null)}>
                        <div className="w-full max-w-sm bg-[#1a1a1b] rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            
                            {success ? (
                                <div className="p-8 text-center">
                                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center text-4xl mb-4 animate-bounce">
                                        ✓
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Activated!</h3>
                                    <p className="text-gray-400">Mining speed upgraded</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-gradient-to-r from-[#007aff] to-[#0056cc] p-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-white">Complete Payment</h3>
                                            <button onClick={() => setSelectedUpgrade(null)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">✕</button>
                                        </div>
                                    </div>

                                    <div className="p-5 space-y-4">
                                        {/* Selected Plan */}
                                        {(() => {
                                            const config = getUpgradeConfig(selectedUpgrade)
                                            if (!config) return null
                                            return (
                                                <div className="bg-[#1f1f20] border border-[#007aff]/30 rounded-xl p-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ffd700] to-[#b8860b] flex items-center justify-center text-xl">
                                                            {config.id === 'gold_miner' ? '👑' : config.id === 'silver_miner' ? '🥈' : '🥉'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white">{config.name}</div>
                                                            <div className="text-[#22c55e] text-sm">+{config.bonusRate.toLocaleString()}/hr • 7 days</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })()}

                                        {/* Wallet Address */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Send TON to:</label>
                                            <div className="bg-[#0f0f10] border border-[#2d2d2e] rounded-xl p-3">
                                                <div className="text-xs text-gray-500 mb-1">Receiver Address:</div>
                                                <div className="text-xs text-[#22c55e] font-mono break-all">{RECEIVING_WALLET_ADDRESS}</div>
                                            </div>
                                            <button onClick={copyAddress} className="text-[#007aff] text-sm flex items-center gap-1">
                                                {copied ? '✓ Copied!' : '📋 Copy Address'}
                                            </button>
                                        </div>

                                        {/* Amount Reminder */}
                                        <div className="bg-[#007aff]/10 border border-[#007aff]/30 rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-[#007aff]">
                                                <span>💡</span>
                                                <span className="text-sm">Send exactly {getUpgradeConfig(selectedUpgrade)?.priceTon} TON</span>
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
                                                className="w-full bg-[#1f1f20] text-white rounded-xl px-4 py-3 text-sm border border-[#2d2d2e] focus:border-[#007aff] outline-none transition-colors"
                                            />
                                            <div className="text-xs text-gray-500">Find in your TON wallet after sending</div>
                                        </div>

                                        {/* Auto-renewal */}
                                        <div className="flex items-center gap-3 p-3 bg-[#1f1f20] rounded-xl border border-[#2d2d2e]">
                                            <input
                                                type="checkbox"
                                                id="autoRenewal"
                                                checked={autoRenewal}
                                                onChange={(e) => setAutoRenewal(e.target.checked)}
                                                className="w-5 h-5 accent-[#007aff] rounded"
                                            />
                                            <label htmlFor="autoRenewal" className="flex-1">
                                                <div className="text-sm font-medium text-white">Auto-Renewal</div>
                                                <div className="text-xs text-gray-500">Weekly renewal</div>
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
                                                className="flex-1 py-3 rounded-xl bg-[#2d2d2e] text-white font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handlePurchase}
                                                disabled={isProcessing || !txHash}
                                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-bold disabled:opacity-50"
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