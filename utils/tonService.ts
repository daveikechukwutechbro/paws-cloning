import { TonConnectUIProvider } from '@tonconnect/sdk-react'

export const tonConnectUI = new TonConnectUIProvider({
    manifestUrl: 'https://paws-clone.vercel.app/tonconnect-manifest.json'
})

export async function connectTonWallet(): Promise<boolean> {
    try {
        await tonConnectUI.connect()
        return true
    } catch (e) {
        console.error('Failed to connect:', e)
        return false
    }
}

export function disconnectTonWallet() {
    tonConnectUI.disconnect()
}

export function getTonWalletAddress(): string | null {
    return tonConnectUI.account?.address || null
}

export function isTonConnected(): boolean {
    return !!tonConnectUI.account
}