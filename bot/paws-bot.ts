// bot/paws-bot.ts
import { Bot, Context } from 'grammy'
import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../utils/firebaseClient'
import { processNewReferral } from '../utils/referralSystem'
import { getUserTier, getEstimatedRank } from '../utils/rankingSystem'
import { REFERRAL_REWARDS, User } from '../utils/userUtils'

// Initialize bot with token from environment
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || '')

/**
 * Handle /start command
 */
bot.command('start', async (ctx) => {
    const userId = ctx.from?.id
    const firstName = ctx.from?.first_name || 'User'
    
    if (!userId) {
        return ctx.reply('Unable to get user information.')
    }
    
    // Check if user is already registered
    const userRef = doc(db, 'users', userId.toString())
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
        return ctx.reply(`Welcome back, ${firstName}! 👋\nYou are already registered.`)
    }
    
    // Get referral code from start parameter
    const startPayload = ctx.message?.text?.replace('/start ', '') || ''
    const referredBy = startPayload ? startPayload : undefined
    
    // Create new user
    const newUser: User = {
        id: userId.toString(),
        username: firstName,
        balance: 50000,
        referralCode: userId.toString(),
        referredBy: referredBy && referredBy !== userId.toString() ? referredBy : undefined,
        referralCount: 0,
        premiumReferralCount: 0,
        referralEarnings: 0,
        tierLevel: 0,
        tierRewardsClaimed: [],
        friendsList: [],
        referralRewardClaimed: false,
        isPremium: ctx.from?.is_premium || false,
        created_at: new Date().toISOString()
    }
    
    await setDoc(userRef, newUser)
    
    // Process referral if exists
    if (referredBy && referredBy !== userId.toString()) {
        await processNewReferral(referredBy, userId.toString(), firstName, ctx.from?.is_premium || false)
    }
    
    // Send welcome message
    await ctx.reply(`🎉 Welcome to PAWS, ${firstName}! 🐾\n\nYour account has been created with 50,000 PAWS tokens!\n\nUse /balance to check your balance.\nUse /invite to get your referral link.`)
})

/**
 * Handle /balance command
 */
bot.command('balance', async (ctx) => {
    const userId = ctx.from?.id
    
    if (!userId) {
        return ctx.reply('Unable to get user information.')
    }
    
    const userRef = doc(db, 'users', userId.toString())
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
        return ctx.reply('You are not registered. Use /start to register.')
    }
    
    const userData = userSnap.data() as User
    const tier = getUserTier(userData.balance || 0)
    
    await ctx.reply(`💰 Your Balance: ${userData.balance?.toLocaleString() || '0'} PAWS\nTier: ${tier.icon} ${tier.label}\nRank: ${getEstimatedRank(userData.balance || 0)}`)
})

/**
 * Handle /invite command
 */
bot.command('invite', async (ctx) => {
    const userId = ctx.from?.id
    const firstName = ctx.from?.first_name || 'User'
    
    if (!userId) {
        return ctx.reply('Unable to get user information.')
    }
    
    const userRef = doc(db, 'users', userId.toString())
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
        return ctx.reply('You are not registered. Use /start to register.')
    }
    
    const userData = userSnap.data() as User
    const referralLink = `https://t.me/Pawscloudminebot?start=${userId}`
    
    await ctx.reply(`🐾 Invite Friends, ${firstName}!\n\nShare this link:\n${referralLink}\n\nYou earn ${REFERRAL_REWARDS.baseReward.toLocaleString()} PAWS per friend who joins!\nPremium friends earn you ${REFERRAL_REWARDS.premiumFriendBonus.toLocaleString()} PAWS!\n\nYour referrals: ${userData.referralCount || 0}`)
})

/**
 * Handle /leaderboard command
 */
bot.command('leaderboard', async (ctx) => {
    const userId = ctx.from?.id
    
    if (!userId) {
        return ctx.reply('Unable to get user information.')
    }
    
    // Get top 10 users
    const usersRef = collection(db, 'users')
    const q = query(usersRef, orderBy('balance', 'desc'), limit(10))
    const snapshot = await getDocs(q)
    
    let leaderboardText = '🏆 PAWS Leaderboard - Top 10\n\n'
    
    snapshot.docs.forEach((docSnap, index) => {
        const userData = docSnap.data() as User
        const medal = index === 0 ? '👑' : index === 1 ? '💎' : index === 2 ? '💎' : '🐋'
        leaderboardText += `${medal} ${userData.username || 'Anonymous'}: ${userData.balance?.toLocaleString() || '0'} PAWS\n`
    })
    
    // Add user's position
    const userRef = doc(db, 'users', userId.toString())
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
        const userData = userSnap.data() as User
        const rank = getEstimatedRank(userData.balance || 0)
        leaderboardText += `\nYour position: ${rank} with ${userData.balance?.toLocaleString() || '0'} PAWS`
    }
    
    await ctx.reply(leaderboardText)
})

/**
 * Handle /tokenomics command
 */
bot.command('tokenomics', async (ctx) => {
    const tokenomicsText = `📊 PAWS Tokenomics\n\n` +
        `Total Supply: 100,000,000,000 PAWS\n` +
        `Community & Airdrop: 40B (40%) - 🐾 Distributed via airdrops\n` +
        `Mining & Rewards: 25B (25%) - ✅ In-game mining & tasks\n` +
        `Liquidity & CEX: 15B (15%) - 🌟 Exchange listings\n` +
        `Team & Dev: 8B (8%) - 💎 12 months vesting\n` +
        `Ecosystem & Partners: 7B (7%) - 💎 Partnerships\n` +
        `Treasury & Reserve: 5B (5%) - ✅ Future initiatives\n\n` +
        `TGE 1: 53B Done ✅\nTGE 2: 47B Coming 🪂`
    
    await ctx.reply(tokenomicsText)
})

/**
 * Handle /claim command
 */
bot.command('claim', async (ctx) => {
    const userId = ctx.from?.id
    
    if (!userId) {
        return ctx.reply('Unable to get user information.')
    }
    
    const userRef = doc(db, 'users', userId.toString())
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
        return ctx.reply('You are not registered. Use /start to register.')
    }
    
    const userData = userSnap.data() as User
    const lastClaim = userData.lastClaim || 0
    const now = Date.now()
    const cooldown = 3 * 60 * 1000 // 3 minutes
    
    if (now - lastClaim < cooldown) {
        const remaining = Math.ceil((cooldown - (now - lastClaim)) / 1000)
        const minutes = Math.floor(remaining / 60)
        const seconds = remaining % 60
        return ctx.reply(`⏳ Please wait ${minutes}:${seconds.toString().padStart(2, '0')} before claiming again.`)
    }
    
    const newBalance = (userData.balance || 50000) + 2000
    await setDoc(userRef, { ...userData, balance: newBalance, lastClaim: now }, { merge: true })
    
    await ctx.reply(`✅ Successfully claimed 2,000 PAWS!\nNew balance: ${newBalance.toLocaleString()} PAWS`)
})

/**
 * Handle /help command
 */
bot.command('help', async (ctx) => {
    const helpText = `🆘 PAWS Bot Commands\n\n` +
        `/start - Register or welcome back\n` +
        `/balance - Check your PAWS balance\n` +
        `/invite - Get your referral link\n` +
        `/leaderboard - View top holders\n` +
        `/tokenomics - View token distribution\n` +
        `/claim - Claim hourly reward (2,000 PAWS)\n` +
        `/help - Show this help message\n\n` +
        `🌐 Website: https://pawsclone.vercel.app`
    
    await ctx.reply(helpText)
})

/**
 * Start the bot
 */
bot.start()
console.log('PAWS Telegram bot started...')
