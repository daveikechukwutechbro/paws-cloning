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

export type TabType = 'home' | 'leaderboard' | 'friends' | 'earn';

// Reward constants in PAWS
export const REWARDS = {
    AD_VIEW: 5000,
    MINING_PER_HOUR: 5000,
    WALLET_CONNECT: 100000,
    PARTNERS_TASK: 100000,
    DEFAULT_TASK: 5000
};