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
                if (config) {
                    total += config.bonusRate
                }
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
                if (config) {
                    total += config.bonusRate
                }
            }
        }
        
        return total
    }

    const handleSelectUpgrade = (upgradeId: string) => {
        setSelectedUpgrade(upgradeId)
        setShowConfirm(true)
        setError(null)
        setTxHash('')
        setSuccess(false)
    }

    const handlePurchase = async () => {
        if (!selectedUpgrade || !user?.id || !txHash) {
            setError('Please enter the transaction hash from your TON wallet')
            return
        }

        if (txHash.length < 64) {
            setError('Invalid transaction hash. TON transactions are 64+ characters')
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
                    setShowConfirm(false)
                    setSelectedUpgrade(null)
                    setTxHash('')
                    refreshUser()
                }, 2500)
            } else {
                setError(result.error || 'Transaction verification failed. Please check your TX hash')
            }
        } catch (err) {
            setError('Failed to process. Please try again or contact support')
        } finally {
            setIsProcessing(false)
        }
    }

    const activeUpgradesList = activeUpgrades.filter(
        u => new Date(u.expiryDate) > new Date()
    )

    const getUpgradeColor = (name: string) => {
        if (name.includes('Gold')) return { bg: 'from-[#ffd700] to-[#ffaa00]', border: 'border-[#ffd700]', glow: 'shadow-[#ffd700]/30', icon: '⭐' }
        if (name.includes('Silver')) return { bg: 'from-[#c0c0c0] to-[#a0a0a0]', border: 'border-[#c0c0c0]', glow: 'shadow-gray-400/30', icon: '🥈' }
        return { bg: 'from-[#cd7f32] to-[#b8860b]', border: 'border-[#cd7f32]', glow: 'shadow-amber-600/30', icon: '🥉' }
    }

    const copyAddress = () => {
        navigator.clipboard.writeText(RECEIVING_WALLET_ADDRESS)
        setCopied(true)
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-end justify-center">
            <div className="w-full max-w-md bg-gradient-to-b from-[#1a1a1b] to-[#0f0f10] border-t border-[#2d2d2e] rounded-t-3xl max-h-[92vh] overflow-hidden flex flex-col animate-slide-up">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#f59e0b] via-[#ef4444] to-[#f59e0b] p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl animate-pulse">
                                ⚡
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Mining Speed Shop</h2>
                                <p className="text-sm text-white/80">Exclusive Weekly Upgrades</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                            <span className="text-white text-lg">×</span>
                        </button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="px-4 py-3 bg-[#151516] border-b border-[#2d2d2e]">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Your Rate</div>
                                <div className="text-lg font-bold text-[#22c55e]">{getCurrentMiningRate().toLocaleString()}<span className="text-xs text-gray-400">/hr</span></div>
                            </div>
                            <div className="w-px h-8 bg-[#2d2d2e]" />
                            <div className="text-center">
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Bonus</div>
                                <div className="text-lg font-bold text-[#ffd700]">+{getBonusRate().toLocaleString()}</div>
                            </div>
                        </div>
                        <div className="bg-[#007aff]/20 px-3 py-1 rounded-full">
                            <span className="text-xs text-[#007aff] font-medium">{activeUpgradesList.length} Active</span>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Active Upgrades */}
                    {activeUpgradesList.length > 0 && (
                        <div className="p-4 border-b border-[#2d2d2e] bg-[#0f0f10]">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                                <h3 className="text-sm font-semibold text-white">Active Upgrades</h3>
                            </div>
                            <div className="space-y-2">
                                {activeUpgradesList.map((upgrade, idx) => {
                                    const config = MINING_UPGRADES.find(u => u.id === upgrade.upgradeId)
                                    if (!config) return null
                                    const colors = getUpgradeColor(config.name)
                                    const daysLeft = getUpgradeExpiryDays(upgrade.expiryDate)
                                    
                                    return (
                                        <div 
                                            key={idx}
                                            className={`bg-gradient-to-r ${colors.bg} bg-opacity-10 border ${colors.border} border-opacity-30 rounded-xl p-3 flex items-center justify-between`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors.bg} flex items-center justify-center text-lg shadow-lg ${colors.glow}`}>
                                                    {colors.icon}
                                                </div>
                                                <div>
                                                    <div className={`font-semibold ${colors.text}`}>{config.name}</div>
                                                    <div className="text-xs text-gray-400">+{config.bonusRate.toLocaleString()}/hr • 7 days</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-sm font-bold ${daysLeft <= 1 ? 'text-[#ff6b6b]' : 'text-[#ffd700]'}`}>
                                                    {daysLeft}d : {Math.floor((new Date(upgrade.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60))}h
                                                </div>
                                                <div className="text-[10px] text-gray-500">
                                                    {upgrade.autoRenewal ? '♻️ Auto-renew ON' : 'Auto-renew OFF'}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Available Upgrades */}
                    <div className="p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Choose Your Upgrade</h3>
                        
                        {MINING_UPGRADES.map((upgrade) => {
                            const colors = getUpgradeColor(upgrade.name)
                            const isActive = activeUpgradesList.some(u => u.upgradeId === upgrade.id)
                            const existingUpgrade = activeUpgrades.find(u => u.upgradeId === upgrade.id)
                            
                            return (
                                <div 
                                    key={upgrade.id}
                                    className={`relative bg-[#151516] border border-[#2d2d2e] rounded-2xl p-4 transition-all hover:border-[#3d3d3e] ${isActive ? 'opacity-70' : ''}`}
                                >
                                    {isActive && (
                                        <div className="absolute top-3 right-3">
                                            <span className="text-[10px] bg-[#22c55e] text-white px-2 py-0.5 rounded-full font-medium">ACTIVE</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-4">
                                        <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-3xl shadow-xl ${colors.glow} shadow-lg`}>
                                            {colors.icon}
                                            {upgrade.id === 'gold_miner' && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#ff0000] rounded-full flex items-center justify-center text-[10px]">🔥</div>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white text-lg">{upgrade.name}</span>
                                                {upgrade.id === 'gold_miner' && (
                                                    <span className="text-[10px] bg-gradient-to-r from-[#ffd700] to-[#ffaa00] text-black px-2 py-0.5 rounded-full font-bold">BEST VALUE</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[#22c55e] font-semibold">+{upgrade.bonusRate.toLocaleString()}</span>
                                                <span className="text-gray-500 text-sm">PAWS/hr</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                <span>⏱️ Weekly ({upgrade.durationDays} days)</span>
                                                <span>🔄 Auto-renew available</span>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            <div className="bg-gradient-to-r from-[#007aff] to-[#0056cc] px-3 py-1.5 rounded-xl">
                                                <div className="text-white font-bold text-lg">{upgrade.priceTon}</div>
                                                <div className="text-white/70 text-[10px]">TON</div>
                                            </div>
                                            {!isActive && (
                                                <button
                                                    onClick={() => handleSelectUpgrade(upgrade.id)}
                                                    className={`mt-2 w-full py-2 bg-gradient-to-r ${colors.bg} text-black rounded-xl text-sm font-bold hover:opacity-90 transition-opacity`}
                                                >
                                                    PURCHASE
                                                </button>
                                            )}
                                            {isActive && (
                                                <button
                                                    onClick={() => handleSelectUpgrade(upgrade.id)}
                                                    className="mt-2 w-full py-2 bg-[#2d2d2e] text-gray-400 rounded-xl text-sm font-medium"
                                                >
                                                    EXTEND
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Trust Badges */}
                    <div className="px-4 pb-4">
                        <div className="bg-[#151516] border border-[#2d2d2e] rounded-xl p-3">
                            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <span>🔒</span>
                                    <span>Secure</span>
                                </div>
                                <div className="w-px h-4 bg-[#2d2d2e]" />
                                <div className="flex items-center gap-1">
                                    <span>⚡</span>
                                    <span>Instant</span>
                                </div>
                                <div className="w-px h-4 bg-[#2d2d2e]" />
                                <div className="flex items-center gap-1">
                                    <span>🔄</span>
                                    <span>Weekly</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Purchase Confirmation Modal */}
                {showConfirm && selectedUpgrade && (
                    <div className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4">
                        <div className="w-full max-w-sm bg-[#1a1a1b] border border-[#2d2d2e] rounded-2xl overflow-hidden animate-scale-in">
                            {success ? (
                                <div className="p-8 text-center">
                                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center text-4xl mb-4 animate-bounce">
                                        ✓
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Payment Verified!</h3>
                                    <p className="text-gray-400 text-sm">Your mining speed has been upgraded. Redirecting...</p>
                                    <div className="mt-4 flex justify-center">
                                        <div className="w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-gradient-to-r from-[#f59e0b] to-[#ef4444] p-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-white">Complete Purchase</h3>
                                            <button 
                                                onClick={() => setShowConfirm(false)}
                                                className="text-white/80 hover:text-white"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="p-5">
                                        {(() => {
                                            const config = MINING_UPGRADES.find(u => u.id === selectedUpgrade)
                                            if (!config) return null
                                            const colors = getUpgradeColor(config.name)
                                            
                                            return (
                                                <div className={`bg-gradient-to-r ${colors.bg} bg-opacity-10 border ${colors.border} border-opacity-30 rounded-xl p-4 mb-4`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-2xl`}>
                                                            {colors.icon}
                                                        </div>
                                                        <div>
                                                            <div className={`font-bold ${colors.text}`}>{config.name}</div>
                                                            <div className="text-sm text-gray-400">+{config.bonusRate.toLocaleString()} PAWS/hr</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })()}

                                        <div className="mb-4">
                                            <label className="text-sm font-medium text-gray-400 block mb-2">Send exactly to this address:</label>
                                            <div className="bg-[#0f0f10] border border-[#2d2d2e] rounded-xl p-3">
                                                <div className="text-xs text-gray-500 mb-2">TON Receiver:</div>
                                                <div className="bg-[#2d2d2e] rounded-lg p-3 break-all text-sm text-[#22c55e] font-mono">
                                                    {RECEIVING_WALLET_ADDRESS}
                                                </div>
                                                <button 
                                                    onClick={copyAddress}
                                                    className="mt-2 text-[#007aff] text-sm flex items-center gap-1"
                                                >
                                                    {copied ? '✓ Copied!' : '📋 Copy Address'}
                                                </button>
                                            </div>
                                            
                                            <div className="mt-3 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg p-3">
                                                <div className="text-sm text-[#f59e0b]">
                                                    <span className="font-bold">Important:</span> Send exactly {MINING_UPGRADES.find(u => u.id === selectedUpgrade)?.priceTon} TON
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="text-sm font-medium text-gray-400 block mb-2">Enter your transaction hash (TX Hash)</label>
                                            <input
                                                type="text"
                                                value={txHash}
                                                onChange={(e) => setTxHash(e.target.value.trim())}
                                                placeholder="Example: 4a4c5e8b6a2d3f1e..."
                                                className="w-full bg-[#0f0f10] text-white rounded-xl px-4 py-3 text-sm border border-[#2d2d2e] focus:border-[#007aff] outline-none transition-colors placeholder-gray-600"
                                            />
                                            <div className="mt-2 text-xs text-gray-500">Find your TX hash in your TON wallet after sending</div>
                                        </div>

                                        <div className="flex items-center gap-3 mb-4 p-3 bg-[#151516] rounded-xl border border-[#2d2d2e]">
                                            <input
                                                type="checkbox"
                                                id="autoRenewal"
                                                checked={autoRenewal}
                                                onChange={(e) => setAutoRenewal(e.target.checked)}
                                                className="w-5 h-5 accent-[#007aff] rounded"
                                            />
                                            <div>
                                                <label htmlFor="autoRenewal" className="text-sm font-medium text-white">Enable Auto-Renewal</label>
                                                <div className="text-xs text-gray-500">Automatically renews weekly (you can cancel anytime)</div>
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="mb-4 p-3 bg-[#ef4444]/20 border border-[#ef4444]/50 rounded-xl">
                                                <div className="text-sm text-[#ff6b6b] flex items-center gap-2">
                                                    <span>⚠️</span>
                                                    {error}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setShowConfirm(false)}
                                                className="flex-1 py-3 rounded-xl bg-[#2d2d2e] text-white font-medium hover:bg-[#3d3d3e] transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handlePurchase}
                                                disabled={isProcessing || !txHash}
                                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-bold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Verifying...
                                                    </>
                                                ) : (
                                                    <>
                                                        ✓ Verify & Activate
                                                    </>
                                                )}
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