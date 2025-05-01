"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.balanceCommand = void 0;
const database_1 = require("../database");
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
const balanceCommand = async (ctx) => {
    try {
        const telegramId = ctx.from?.id;
        if (!telegramId) {
            await ctx.reply('Error: Could not identify user.');
            return;
        }
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepository.findOne({ where: { telegramId } });
        if (!user) {
            await ctx.reply('Please start the bot first using /start command.');
            return;
        }
        // Calculate days since last stake
        const daysSinceStake = user.lastStakeDate
            ? Math.floor((Date.now() - user.lastStakeDate.getTime()) / (1000 * 60 * 60 * 24))
            : 0;
        // Get current reward rate based on days staked
        let currentRate = 1.0; // Default rate
        if (daysSinceStake > 20)
            currentRate = 3.0;
        else if (daysSinceStake > 15)
            currentRate = 2.5;
        else if (daysSinceStake > 10)
            currentRate = 2.0;
        else if (daysSinceStake > 5)
            currentRate = 1.5;
        // Calculate estimated daily reward
        const estimatedDailyReward = user.stakedAmount * (currentRate / 100);
        const balanceMessage = `
💎 *Your Balance*

Current stake: ${user.stakedAmount.toFixed(2)} TON
Total earned: ${user.totalEarned.toFixed(2)} TON

📊 *Staking Details:*
• Current reward rate: ${currentRate}% daily
• Days staked: ${daysSinceStake}
• Estimated daily reward: ${estimatedDailyReward.toFixed(2)} TON

👥 *Referral Program:*
• Referral earnings: ${user.referralEarnings.toFixed(2)} TON
• Active referrals: ${user.referralCount}
• Your referral code: \`${user.referralCode}\`

Share link: https://t.me/${ctx.botInfo?.username}?start=${user.referralCode}
`;
        await ctx.reply(balanceMessage, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '💰 Stake More', callback_data: 'stake' },
                        { text: '💸 Withdraw', callback_data: 'withdraw' }
                    ],
                    [
                        { text: '👥 Referral Stats', callback_data: 'referral' }
                    ]
                ]
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error in balance command:', error);
        await ctx.reply('Sorry, something went wrong. Please try again later.');
    }
};
exports.balanceCommand = balanceCommand;
function getNextTierInfo(stakeDate) {
    const daysSinceStake = Math.floor((new Date().getTime() - stakeDate.getTime()) / (1000 * 60 * 60 * 24));
    const tiers = [
        { days: 5, rate: 1.5 },
        { days: 10, rate: 2.0 },
        { days: 15, rate: 2.5 },
        { days: 20, rate: 3.0 }
    ];
    for (const tier of tiers) {
        if (daysSinceStake < tier.days) {
            const daysToNext = tier.days - daysSinceStake;
            return `${tier.rate}% in ${daysToNext} days`;
        }
    }
    return 'Maximum rate reached (3%)';
}
