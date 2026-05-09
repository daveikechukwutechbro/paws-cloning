'use client'

import { useState, useEffect } from 'react'
import { MINING_UPGRADES, DEFAULT_MINING_RATE, ActiveMiningUpgrade, getUpgradeExpiryDays } from '@/utils/miningUpgrades'
import { useUser } from '@/contexts/UserContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/utils/firebaseClient'
import { addMiningUpgrade } from '@/utils/userUtils'

interface MiningUpgradeShopProps {
    onClose: () => void
    onPurchaseComplete: () => void
}

const MiningUpgradeShop = ({ onClose, onPurchaseComplete }: MiningUpgradeShopProps) => {
    const { user } = useUser()
    const [activeUpgrades, setActiveUpgrades] = useState<ActiveMiningUpgrade[]>([])
    const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null)
    const [autoRenewal, setAutoRenewal] = useState(true)
    const [txHash, setTxHash] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showConfirm, setShowConfirm] = useState(false)
    
    // Your TON receiving wallet address
    const RECEIVING_WALLET_ADDRESS = 'UQDQG85BG8NZpaZzktagBiS_Y5sllQQT4iX43wM_XuK4cl3J'

    useEffect(() => {
        if (user?.miningUpgrades) {
            setActiveUpgrades(user.miningUpgrades)
        }
    }, [user])

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

    const handleSelectUpgrade = (upgradeId: string) => {
        setSelectedUpgrade(upgradeId)
        setShowConfirm(true)
        setError(null)
        setTxHash('')
    }

    const handlePurchase = async () => {
        if (!selectedUpgrade || !user?.id || !txHash) {
            setError('Please enter the transaction hash')
            return
        }

        // Basic transaction hash validation (TON tx hashes are typically 64 hex characters)
        if (txHash.length < 64) {
            setError('Invalid transaction hash format')
            return
        }

        setIsProcessing(true)
        setError(null)

        try {
            const result = await addMiningUpgrade(user.id, selectedUpgrade, txHash, autoRenewal)
            
            if (result.success) {
                onPurchaseComplete()
                setShowConfirm(false)
                setSelectedUpgrade(null)
                setTxHash('')
            } else {
                setError(result.error || 'Purchase failed')
            }
        } catch (err) {
            setError('Failed to process purchase')
        } finally {
            setIsProcessing(false)
        }
    }

    const activeUpgradesList = activeUpgrades.filter(
        u => new Date(u.expiryDate) > new Date()
    )

    const getUpgradeColor = (name: string) => {
        if (name.includes('Gold')) return { bg: 'from-[#ffd700] to-[#b8860b]', text: 'text-[#ffd700]' }
        if (name.includes('Silver')) return { bg: 'from-[#c0c0c0] to-[#808080]', text: 'text-[#c0c0c0]' }
        return { bg: 'from-[#cd7f32] to-[#8b4513]', text: 'text-[#cd7f32]' }
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-end justify-center">
            <div className="w-full max-w-md bg-[#151516] border-t border-[#2d2d2e] rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
                <div className="sticky top-0 bg-[#151516] p-4 border-b border-[#2d2d2e]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">⚡ Mining Speed Shop</h2>
                            <p className="text-sm text-gray-400">Boost your hourly earnings</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-[#2d2d2e] flex items-center justify-center"
                        >
                            <span className="text-gray-400">✕</span>
                        </button>
                    </div>
                    
                    <div className="mt-3 bg-gradient-to-r from-[#22c55e]/20 to-[#007aff]/20 rounded-lg p-3 flex justify-between">
                        <div>
                            <div className="text-xs text-gray-400">Current Mining Rate</div>
                            <div className="text-lg font-bold text-white">{getCurrentMiningRate().toLocaleString()}/hr</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-400">Base Rate</div>
                            <div className="text-sm text-gray-400">{DEFAULT_MINING_RATE.toLocaleString()}/hr</div>
                        </div>
                    </div>
                </div>

                {/* Active Upgrades */}
                {activeUpgradesList.length > 0 && (
                    <div className="p-4 border-b border-[#2d2d2e]">
                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Active Upgrades</h3>
                        <div className="space-y-2">
                            {activeUpgradesList.map((upgrade, idx) => {
                                const config = MINING_UPGRADES.find(u => u.id === upgrade.upgradeId)
                                if (!config) return null
                                const colors = getUpgradeColor(config.name)
                                const daysLeft = getUpgradeExpiryDays(upgrade.expiryDate)
                                
                                return (
                                    <div 
                                        key={idx}
                                        className={`bg-gradient-to-r ${colors.bg} bg-opacity-20 rounded-lg p-3 flex items-center justify-between`}
                                    >
                                        <div>
                                            <div className={`font-semibold ${colors.text}`}>{config.name}</div>
                                            <div className="text-xs text-gray-400">+{config.bonusRate.toLocaleString()}/hr</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-xs font-semibold ${daysLeft <= 1 ? 'text-[#ff6b6b]' : 'text-[#ffd700]'}`}>
                                                {daysLeft}d left
                                            </div>
                                            {upgrade.autoRenewal && (
                                                <div className="text-[10px] text-gray-400">Auto-renew: ON</div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Upgrade Options */}
                <div className="p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-400">Available Upgrades</h3>
                    
                    {MINING_UPGRADES.map((upgrade) => {
                        const colors = getUpgradeColor(upgrade.name)
                        const isActive = activeUpgradesList.some(u => u.upgradeId === upgrade.id)
                        
                        return (
                            <div 
                                key={upgrade.id}
                                className={`bg-[#1a1a1b] border border-[#2d2d2e] rounded-xl p-4 ${isActive ? 'opacity-60' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
                                        <span className="text-2xl">⚡</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-white">{upgrade.name}</span>
                                            {isActive && (
                                                <span className="text-[10px] bg-[#22c55e] text-white px-2 py-0.5 rounded-full">ACTIVE</span>
                                            )}
                                        </div>
                                        <div className="text-sm text-[#22c55e]">+{upgrade.bonusRate.toLocaleString()} PAWS/hr</div>
                                        <div className="text-xs text-gray-400">Duration: {upgrade.durationDays} days</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-white">{upgrade.priceTon} TON</div>
                                        {!isActive && (
                                            <button
                                                onClick={() => handleSelectUpgrade(upgrade.id)}
                                                className="mt-2 px-4 py-1.5 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200"
                                            >
                                                Buy
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Purchase Confirmation Modal */}
                {showConfirm && selectedUpgrade && (
                    <div className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-4">
                        <div className="w-full max-w-sm bg-[#1a1a1b] border border-[#2d2d2e] rounded-2xl p-5">
                            <h3 className="text-lg font-bold text-white mb-4">Confirm Purchase</h3>
                            
                            {(() => {
                                const config = MINING_UPGRADES.find(u => u.id === selectedUpgrade)
                                if (!config) return null
                                const colors = getUpgradeColor(config.name)
                                
                                return (
                                    <div className={`bg-gradient-to-r ${colors.bg} bg-opacity-20 rounded-xl p-4 mb-4`}>
                                        <div className={`font-semibold ${colors.text}`}>{config.name}</div>
                                        <div className="text-sm text-gray-400">+{config.bonusRate.toLocaleString()} PAWS/hr</div>
                                        <div className="text-xs text-gray-500 mt-1">{config.durationDays} days • Auto-renew: {autoRenewal ? 'ON' : 'OFF'}</div>
                                    </div>
                                )
                            })()}

                            <div className="mb-4">
                                <label className="text-sm text-gray-400 block mb-2">Send exact amount to:</label>
                                <div className="bg-[#2d2d2e] rounded-lg p-3 break-all text-xs text-white">
                                    {RECEIVING_WALLET_ADDRESS}
                                </div>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(RECEIVING_WALLET_ADDRESS)}
                                    className="text-[#007aff] text-sm mt-2"
                                >
                                    Copy Address
                                </button>
                            </div>

                            <div className="mb-4">
                                <label className="text-sm text-gray-400 block mb-2">Transaction Hash (TX Hash)</label>
                                <input
                                    type="text"
                                    value={txHash}
                                    onChange={(e) => setTxHash(e.target.value)}
                                    placeholder="Enter TON transaction hash"
                                    className="w-full bg-[#2d2d2e] text-white rounded-lg px-4 py-3 text-sm border border-[#3d3d3e] focus:border-[#007aff] outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <input
                                    type="checkbox"
                                    id="autoRenewal"
                                    checked={autoRenewal}
                                    onChange={(e) => setAutoRenewal(e.target.checked)}
                                    className="w-4 h-4 accent-[#007aff]"
                                />
                                <label htmlFor="autoRenewal" className="text-sm text-gray-400">
                                    Enable auto-renewal (charges weekly)
                                </label>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-[#ff4444]/20 border border-[#ff4444] rounded-lg text-sm text-[#ff6b6b]">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 py-3 rounded-lg bg-[#2d2d2e] text-white font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePurchase}
                                    disabled={isProcessing}
                                    className="flex-1 py-3 rounded-lg bg-[#007aff] text-white font-medium disabled:opacity-50"
                                >
                                    {isProcessing ? 'Processing...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="h-8" />
            </div>
        </div>
    )
}

export default MiningUpgradeShop