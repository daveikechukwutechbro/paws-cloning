import { TonConnect } from '@tonconnect/sdk'

let tonConnect: TonConnect | null = null

export type SupportedWallet = 'telegram-wallet' | 'tonkeeper' | 'mytonwallet'

export function initTonConnect() {
    if (!tonConnect) {
        tonConnect = new TonConnect({
            manifestUrl: 'https://paws-cloning.vercel.app/tonconnect-manifest.json'
        })
    }
    return tonConnect
}

export async function restoreWalletConnection() {
    const connector = initTonConnect()
    try {
        await connector.restoreConnection()

        if (connector.connected && connector.account?.address) {
            localStorage.setItem('ton_wallet_connected', 'true')
            localStorage.setItem('ton_wallet_address', connector.account.address)
            return true
        }
    } catch (error) {
        console.error('Wallet restore error:', error)
    }

    return false
}

function getWalletUniversalLink(wallet: SupportedWallet) {
    const connector = initTonConnect()
    const wallets = connector.getWallets()

    const universalLinks: Record<SupportedWallet, string[]> = {
        'telegram-wallet': ['telegram-wallet', 'wallet in telegram', 'ton space', 'tonhub'],
        tonkeeper: ['tonkeeper'],
        mytonwallet: ['mytonwallet']
    }

    const targetWallet = wallets.find((w: any) => {
        const name = (w?.name || '').toLowerCase()
        return universalLinks[wallet].some((keyword) => name.includes(keyword))
    })

    if (!targetWallet) {
        return null
    }

    if ('universalLink' in targetWallet && 'bridgeUrl' in targetWallet) {
        return connector.connect({
            universalLink: targetWallet.universalLink,
            bridgeUrl: targetWallet.bridgeUrl
        })
    }

    return null
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

export async function connectWalletWithProvider(
    wallet: SupportedWallet
): Promise<{ success: boolean; error?: string; connectUrl?: string }> {
    try {
        const connector = initTonConnect()

        if (connector.connected && connector.account?.address) {
            localStorage.setItem('ton_wallet_connected', 'true')
            localStorage.setItem('ton_wallet_address', connector.account.address)
            return { success: true }
        }

        const connectUrl = getWalletUniversalLink(wallet)

        if (!connectUrl) {
            return {
                success: false,
                error: 'Selected wallet is not available on this device.'
            }
        }

        return { success: true, connectUrl }
    } catch (error: any) {
        console.error('Wallet provider connect error:', error)
        return { success: false, error: error.message || 'Failed to prepare wallet connection' }
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