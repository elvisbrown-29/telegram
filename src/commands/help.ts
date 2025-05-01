import { Context } from 'telegraf';

export const helpCommand = async (ctx: Context): Promise<void> => {
    const helpMessage = `
🤖 *TONVault Staking Bot Help*

*Available Commands:*
• /start - Start the bot and get your referral link
• /stake - Stake TON tokens
• /withdraw - Withdraw tokens and rewards
• /balance - Check your current balance and rewards
• /referral - View your referral statistics
• /help - Show this help message

*Staking Rules:*
• Minimum stake: 2 TON
• Lock period: 100 days
• Referral reward: 10% of referred users' rewards

*Reward Tiers:*
• Days 1-5: 1% daily
• Days 6-10: 1.5% daily
• Days 11-15: 2% daily
• Days 16-20: 2.5% daily
• Days 21+: 3% daily

*How to Stake:*
1. Use /stake command followed by the amount
2. Example: \`/stake 100\`
3. Your tokens will be locked for 100 days
4. Earn daily rewards based on your tier

*Referral Program:*
• Share your referral link with others
• Earn 10% of your referrals' rewards
• No limit on number of referrals
• Track your earnings in /referral

*Need Support?*
Contact our support team at @tonvault_support
`;

    await ctx.reply(helpMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '💰 Start Staking', callback_data: 'stake' },
                    { text: '💎 Check Balance', callback_data: 'balance' }
                ],
                [
                    { text: '📊 Referral Program', callback_data: 'referrals' }
                ]
            ]
        }
    });
}; 