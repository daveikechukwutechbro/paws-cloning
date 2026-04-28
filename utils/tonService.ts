import { TonConnectUI, TonConnect } from '@tonconnect/sdk'

let tonConnect: TonConnect | null = null

export function initTonConnect() {
    if (typeof window !== 'undefined' && !tonConnect) {
        tonConnect = new TonConnect({
            manifestUrl: 'https://your-app.vercel.app/tonconnect-manifest.json'
        })
    }
    return tonConnect
}

export async function connectWallet(): Promise<string | null> {
    try {
        const connector = initTonConnect()
        if (!connector) return null
        
        const result = await connector.connect()
        if (result) {
            return result.account.address
        }
        return null
    } catch (error) {
        console.error('Connect error:', error)
        return null
    }
}

export function disconnectWallet() {
    if (tonConnect) {
        tonConnect.disconnect()
    }
}

export function isWalletConnected(): boolean {
    return tonConnect?.isConnected || false
}

export function getWalletAddress(): string | null {
    return tonConnect?.account?.address || null
}