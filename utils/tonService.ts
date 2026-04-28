// TON Wallet Service
// Users can send TON to your wallet address

export const YOUR_TON_ADDRESS = 'UQDQG85BG8NZpaZzktagBiS_Y5sllQQT4iX43wM_XuK4cl3J'

export function getWalletAddress(): string {
    return YOUR_TON_ADDRESS
}

export async function connectWallet(): Promise<boolean> {
    // Open Tonkeeper transfer page
    const walletUrl = `https://tonkeeper.com/transfer/${YOUR_TON_ADDRESS}`
    window.open(walletUrl, '_blank')
    localStorage.setItem('ton_wallet_connected', 'true')
    return true
}

export function disconnectWallet() {
    localStorage.removeItem('ton_wallet_connected')
}

export function isConnected(): boolean {
    return localStorage.getItem('ton_wallet_connected') === 'true'
}