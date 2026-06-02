import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock firebase/firestore
vi.mock('firebase/firestore', () => {
    const mockTimestamp = {
        now: () => ({ seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 }),
    }

    const mockTransaction = {
        get: vi.fn(),
        set: vi.fn(),
        update: vi.fn(),
    }

    return {
        getFirestore: vi.fn(() => ({})),
        doc: vi.fn((_db, _collection, _id) => ({ collection: _collection, id: _id })),
        getDoc: vi.fn(),
        setDoc: vi.fn(),
        updateDoc: vi.fn(),
        increment: vi.fn((val: number) => ({ __increment: val })),
        collection: vi.fn((_db, _name) => ({ name: _name })),
        query: vi.fn(),
        getDocs: vi.fn(),
        where: vi.fn(),
        arrayUnion: vi.fn((...args: any[]) => ({ __arrayUnion: args })),
        Timestamp: mockTimestamp,
        runTransaction: vi.fn(async (_db: any, cb: (t: any) => Promise<void>) => {
            await cb(mockTransaction)
        }),
    }
})

vi.mock('@/utils/firebaseClient', () => ({
    db: {},
}))

import {
    formatReferralLink,
    parseReferralCode,
    captureReferral,
    qualifyReferral,
    rejectReferral,
    checkAndQualify,
    REFERRAL_REWARDS,
    REFERRAL_TIERS,
} from '../utils/referralSystem'

import { doc, getDoc, runTransaction, Timestamp } from 'firebase/firestore'

describe('parseReferralCode', () => {
    it('returns empty string for empty input', () => {
        expect(parseReferralCode('')).toBe('')
        expect(parseReferralCode(null as any)).toBe('')
        expect(parseReferralCode(undefined as any)).toBe('')
    })

    it('returns code as-is if it starts with tg_', () => {
        expect(parseReferralCode('tg_12345')).toBe('tg_12345')
    })

    it('returns code as-is if it starts with user_', () => {
        expect(parseReferralCode('user_abc123')).toBe('user_abc123')
    })

    it('prefixes numeric codes with tg_', () => {
        expect(parseReferralCode('12345')).toBe('tg_12345')
        expect(parseReferralCode('0')).toBe('tg_0')
    })

    it('returns non-numeric, non-prefixed codes as-is', () => {
        expect(parseReferralCode('abc_def')).toBe('abc_def')
        expect(parseReferralCode('ref_code')).toBe('ref_code')
    })
})

describe('formatReferralLink', () => {
    it('formats link with tg_ prefix stripped', () => {
        const link = formatReferralLink('tg_12345', 'TestBot')
        expect(link).toBe('https://t.me/TestBot?start=12345')
    })

    it('formats link with user_ prefix stripped', () => {
        const link = formatReferralLink('user_abc', 'TestBot')
        expect(link).toBe('https://t.me/TestBot?start=abc')
    })

    it('uses default bot username', () => {
        const link = formatReferralLink('tg_12345')
        expect(link).toContain('Pawscloudminebot')
    })

    it('encodes special characters in userId', () => {
        const link = formatReferralLink('tg_123 456', 'Bot')
        expect(link).toContain(encodeURIComponent('123 456'))
    })
})

describe('captureReferral', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('rejects empty user IDs', async () => {
        const result = await captureReferral('', 'abc', 'user')
        expect(result.success).toBe(false)
        expect(result.error).toContain('Invalid')
    })

    it('rejects self-referral', async () => {
        const result = await captureReferral('same_id', 'same_id', 'user')
        expect(result.success).toBe(false)
        expect(result.error).toContain('refer yourself')
    })

    it('rejects if referrer does not exist', async () => {
        vi.mocked(getDoc).mockResolvedValueOnce({
            exists: () => false,
            data: () => null,
        } as any)

        const result = await captureReferral('nonexistent', 'new_user', 'new user')
        expect(result.success).toBe(false)
    })
})

describe('REFERRAL_REWARDS', () => {
    it('has expected values', () => {
        expect(REFERRAL_REWARDS.baseReward).toBe(5000)
        expect(REFERRAL_REWARDS.premiumFriendBonus).toBe(25000)
        expect(REFERRAL_REWARDS.referredSignupBonus).toBe(2000)
    })
})

describe('REFERRAL_TIERS', () => {
    it('has 5 tiers in ascending order', () => {
        expect(REFERRAL_TIERS).toHaveLength(5)
        expect(REFERRAL_TIERS[0].level).toBe(1)
        expect(REFERRAL_TIERS[4].level).toBe(5)

        for (let i = 1; i < REFERRAL_TIERS.length; i++) {
            expect(REFERRAL_TIERS[i].requiredFriends).toBeGreaterThan(REFERRAL_TIERS[i - 1].requiredFriends)
            expect(REFERRAL_TIERS[i].bonusReward).toBeGreaterThan(REFERRAL_TIERS[i - 1].bonusReward)
        }
    })

    it('first tier is Bronze with 3 friends required', () => {
        expect(REFERRAL_TIERS[0].label).toBe('Bronze')
        expect(REFERRAL_TIERS[0].requiredFriends).toBe(3)
        expect(REFERRAL_TIERS[0].bonusReward).toBe(5000)
    })

    it('last tier is Master with 100 friends required', () => {
        expect(REFERRAL_TIERS[4].label).toBe('Master')
        expect(REFERRAL_TIERS[4].requiredFriends).toBe(100)
        expect(REFERRAL_TIERS[4].bonusReward).toBe(500000)
    })
})
