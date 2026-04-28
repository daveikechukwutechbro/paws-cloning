import { TonConnect } from '@tonconnect/sdk'

let tonConnect: TonConnect | null = null

export function initTonConnect() {
    if (!tonConnect) {
        tonConnect = new TonConnect({
            manifestUrl: 'https://paws-cloning.vercel.app/tonconnect-manifest.json'
        })
    }
    return tonConnect
}

export async function connectWallet(): Promise<{ success: boolean; error?: string }> {
    try {
        const connector = initTonConnect()
        
        // Check if already connected
        if (connector.connected) {
            return { success: true }
        }
        
        // Use the restored connection if available
        if (connector.account) {
            localStorage.setItem('ton_wallet_connected', 'true')
            localStorage.setItem('ton_wallet_address', connector.account.address || '')
            return { success: true }
        }
        
        return { success: false, error: 'No wallet found. Please open in Telegram.' }
    } catch (error: any) {
        console.error('Wallet connect error:', error)
        return { success: false, error: error.message || 'Failed to connect' }
    }
}

export function disconnectWallet() {
    if (tonConnect) {
        tonConnect.disconnect()
    }
    localStorage.removeItem('ton_wallet_connected')
    localStorage.removeItem('ton_wallet_address')
}

export function getWalletAddress(): string | null {
    return tonConnect?.account?.address || localStorage.getItem('ton_wallet_address')
}

export function isWalletConnected(): boolean {
    return tonConnect?.connected || localStorage.getItem('ton_wallet_connected') === 'true'
}

export { tonConnect }