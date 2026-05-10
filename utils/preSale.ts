export interface PreSalePackage {
    id: string
    name: string
    amount: number
    priceTon: number
}

export const PRESALE_PACKAGES: PreSalePackage[] = [
    { id: 'presale_250m', name: '250M PAWS', amount: 250_000_000, priceTon: 300 },
    { id: 'presale_500m', name: '500M PAWS', amount: 500_000_000, priceTon: 570 },
    { id: 'presale_750m', name: '750M PAWS', amount: 750_000_000, priceTon: 857 },
    { id: 'presale_1b', name: '1B PAWS', amount: 1_000_000_000, priceTon: 1140 },
]

export interface PreSalePurchase {
    id: string
    userId: string
    packageId: string
    amount: number
    priceTon: number
    transactionHash: string
    purchaseDate: string
    status: 'pending' | 'verified' | 'credited' | 'failed'
}

// Your TON receiving wallet for pre-sale
export const PRESALE_RECEIVING_WALLET = 'UQDQG85BG8NZpaZzktagBiS_Y5sllQQT4iX43wM_XuK4cl3J'

export function getPackageById(packageId: string): PreSalePackage | undefined {
    return PRESALE_PACKAGES.find(p => p.id === packageId)
}

export function getPackageByAmount(amount: number): PreSalePackage | undefined {
    return PRESALE_PACKAGES.find(p => p.amount === amount)
}

export function validateTransactionHash(txHash: string): { valid: boolean; error?: string } {
    if (!txHash || txHash.trim().length === 0) {
        return { valid: false, error: 'Transaction hash is required' }
    }
    
    const cleanHash = txHash.trim()
    
    // TON transaction hashes are typically 64 hex characters
    if (cleanHash.length < 64) {
        return { valid: false, error: 'Invalid transaction hash format (must be 64+ characters)' }
    }
    
    // Basic hex validation
    if (!/^[a-fA-F0-9]+$/.test(cleanHash)) {
        return { valid: false, error: 'Transaction hash must be hexadecimal' }
    }
    
    return { valid: true }
}

export function validateTonAmount(amount: string, expectedPrice: number): { valid: boolean; error?: string } {
    const numAmount = parseFloat(amount)
    
    if (isNaN(numAmount) || numAmount <= 0) {
        return { valid: false, error: 'Invalid TON amount' }
    }
    
    // Allow 1 TON tolerance for rounding
    const tolerance = 1
    if (Math.abs(numAmount - expectedPrice) > tolerance) {
        return { valid: false, error: `Amount must be exactly ${expectedPrice} TON` }
    }
    
    return { valid: true }
}

export function formatPresaleAmount(amount: number): string {
    if (amount >= 1_000_000_000) {
        return `${(amount / 1_000_000_000).toFixed(0)}B PAWS`
    }
    if (amount >= 1_000_000) {
        return `${(amount / 1_000_000).toFixed(0)}M PAWS`
    }
    return `${amount.toLocaleString()} PAWS`
}