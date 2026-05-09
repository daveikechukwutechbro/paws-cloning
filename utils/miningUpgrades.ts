export interface MiningUpgrade {
    id: string
    name: string
    bonusRate: number // Extra tokens per hour
    priceTon: number
    durationDays: number
}

export const MINING_UPGRADES: MiningUpgrade[] = [
    {
        id: 'bronze_miner',
        name: 'Bronze Miner',
        bonusRate: 25000,
        priceTon: 2.03,
        durationDays: 7,
    },
    {
        id: 'silver_miner',
        name: 'Silver Miner',
        bonusRate: 50000,
        priceTon: 4.03,
        durationDays: 7,
    },
    {
        id: 'gold_miner',
        name: 'Gold Miner',
        bonusRate: 100000,
        priceTon: 8.03,
        durationDays: 7,
    },
]

export interface ActiveMiningUpgrade {
    upgradeId: string
    purchaseDate: string
    expiryDate: string
    autoRenewal: boolean
    transactionHash?: string
}

export const DEFAULT_MINING_RATE = 2000 // Base tokens per hour

export function getMiningBonusRate(activeUpgrades: ActiveMiningUpgrade[]): number {
    let totalBonus = 0
    const now = new Date()

    for (const upgrade of activeUpgrades) {
        const expiry = new Date(upgrade.expiryDate)
        if (expiry > now) {
            const upgradeConfig = MINING_UPGRADES.find(u => u.id === upgrade.upgradeId)
            if (upgradeConfig) {
                totalBonus += upgradeConfig.bonusRate
            }
        }
    }

    return totalBonus
}

export function isUpgradeActive(upgrade: ActiveMiningUpgrade): boolean {
    return new Date(upgrade.expiryDate) > new Date()
}

export function getUpgradeExpiryDays(expiryDate: string): number {
    const now = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
}

export function calculateNextExpiry(currentExpiry: string, durationDays: number): string {
    const expiry = new Date(currentExpiry)
    expiry.setDate(expiry.getDate() + durationDays)
    return expiry.toISOString()
}