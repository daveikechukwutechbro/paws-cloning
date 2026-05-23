// utils/types.ts

/**
 * This project was developed by Nikandr Surkov.
 * 
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * GitHub: https://github.com/nikandr-surkov
 */

export type IconProps = {
    size?: number;
    className?: string;
}

export type TabType = 'home' | 'leaderboard' | 'friends' | 'earn' | 'nft';

export type NFTTier = 'Common' | 'Rare' | 'Epic' | 'Legendary'

// Reward constants in PAWS
export const REWARDS = {
    AD_VIEW: 5000,
    MINING_PER_HOUR: 5000,
    WALLET_CONNECT: 100000,
    PARTNERS_TASK: 100000,
    DEFAULT_TASK: 5000
};

export type NFTItem = {
    id: string;
    name: string;
    tier: NFTTier;
    basePrice: number;
    description: string;
    icon: string;
    glowColor: string;
};

export type PurchasedNFT = {
    nftId: string;
    name: string;
    tier: NFTTier;
    pricePaid: number;
    purchasedAt: string;
    transactionHash: string;
};