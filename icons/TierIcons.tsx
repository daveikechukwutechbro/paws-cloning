import React from 'react';

interface TierIconProps {
  tier: string;
  size?: number;
  className?: string;
}

const TierIcon: React.FC<TierIconProps> = ({ tier, size = 16, className = '' }) => {
  const s = `${size}px`;

  switch (tier) {
    case 'Legend':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path d="M10 1.5l2.2 5.3L18 7.5l-4 3.4 1.3 5.8L10 13.2l-5.3 3.5L6 10.9 2 7.5l5.8-.7z"/>
          <circle cx="10" cy="9" r="1.5" fill="white" opacity="0.4"/>
        </svg>
      );
    case 'Elite':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path d="M10 2l3 3 5 1-3 4 1 5-4-2-4 2 1-5-3-4 5-1z"/>
          <circle cx="10" cy="10" r="1.5" fill="white" opacity="0.3"/>
        </svg>
      );
    case 'Whale':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
          <path d="M2 13Q6 7 10 12Q14 17 18 11" strokeLinecap="round"/>
          <path d="M18 11v4M16 12l2 1" strokeLinecap="round"/>
          <circle cx="14" cy="10" r="1" fill="currentColor" stroke="none"/>
        </svg>
      );
    case 'Influencer':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path d="M10 2l1.3 5.7L17 9l-4.7 2.3L10 17l-2.3-5.7L3 9l5.7-1.3z"/>
        </svg>
      );
    case 'Trusted':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path d="M10 2l6 2.5v5.5c0 3.5-2.5 6-6 7.5-3.5-1.5-6-4-6-7.5V4.5z"/>
          <path d="M7 10.5l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'Active':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path d="M12 2L5 11h4.5L8 18l7-9h-4.5z"/>
        </svg>
      );
    case 'Newcomer':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 16V8M6 11c0-3 4-5 4-5s4 2 4 5"/>
        </svg>
      );
    default:
      return <span className="text-xs">?</span>;
  }
};

export default TierIcon;
