// TON Wallet Service
// For now, simplified - users copy your address to pay
// Wallet connection can be added later with proper TON SDK setup

export const WALLET_ADDRESS = 'UQDQG85BG8NZpaZzktagBiS_Y5sllQQT4iX43wM_XuK4cl3J'
export const YOUR_TON_ADDRESS = WALLET_ADDRESS

export function getWalletAddress(): string {
    return WALLET_ADDRESS
}

export async function connectWallet(): Promise<boolean> {
    // Open TON wallet link
    const walletUrl = `https://tonkeeper.com/transfer/${WALLET_ADDRESS}`
    window.open(walletUrl, '_blank')
    return true
}

export function disconnectWallet() {
    // Simplified - just refresh to disconnect
    localStorage.removeItem('ton_wallet_connected')
}

export function isConnected(): boolean {
    return localStorage.getItem('ton_wallet_connected') === 'true'
}