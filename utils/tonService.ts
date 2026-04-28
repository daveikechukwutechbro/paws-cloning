import { TonConnect } from '@tonconnect/sdk'

// Initialize TON Connect
const tonConnect = new TonConnect({
    manifestUrl: 'https://paws-clone.vercel.app/tonconnect-manifest.json'
})

export const tonConnector = tonConnect

export async function connectWallet(): Promise<boolean> {
    try {
        const isSupported = tonConnect.isWalletSupported()
        if (!isSupported) {
            console.log('Wallet not supported')
            return false
        }
        
        await tonConnect.connect()
        return true
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