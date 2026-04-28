import { TonConnect } from '@tonconnect/sdk'

// Initialize TON Connect
const tonConnect = new TonConnect({
    manifestUrl: 'https://paws-clone.vercel.app/tonconnect-manifest.json'
})

export const tonConnector = tonConnect

export async function connectWallet(): Promise<boolean> {
    try {
        // Try to connect - this will open the wallet
        await tonConnect.connect()
        return tonConnect.connected
    } catch (error) {
        console.error('Connect error:', error)
        return false
    }
}

export function disconnectWallet() {
    tonConnect.disconnect()
}

export function getWalletAddress(): string | null {
    return tonConnect.account?.address || null
}

export function isConnected(): boolean {
    return tonConnect.connected
}

export { tonConnect }