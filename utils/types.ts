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

export type NFTTier = 'Common' | 'Rare' | 'Epic' | 'Legendary';

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