"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralCommand = void 0;
const database_1 = require("../database");
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
const referralCommand = async (ctx) => {
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
        // Get referrer info if user was referred
        let referrerInfo = '';
        if (user.referredBy) {
            const referrer = await userRepository.findOne({ where: { referralCode: user.referredBy } });
            if (referrer) {
                referrerInfo = `\n\nYou were referred by: @${referrer.username || 'Anonymous'}`;
            }
        }
        // Get user's referrals
        const referrals = await userRepository.find({ where: { referredBy: user.referralCode } });
        const activeReferrals = referrals.filter(ref => ref.stakedAmount > 0);
        const referralMessage = `
👥 *Referral Program*

Share your referral code with friends and earn 10% of their daily rewards!

Your referral code: \`${user.referralCode}\`
Share link: https://t.me/${ctx.botInfo?.username}?start=${user.referralCode}

📊 *Statistics:*
• Total referrals: ${referrals.length}
• Active referrals: ${activeReferrals.length}
• Total earnings: ${user.referralEarnings.toFixed(2)} TON

${referrals.length > 0 ? '\n*Your Referrals:*\n' +
            referrals.slice(0, 5).map(ref => `• @${ref.username || 'Anonymous'} - ${ref.stakedAmount.toFixed(2)} TON staked`).join('\n') : ''}
${referrals.length > 5 ? '\n...and ' + (referrals.length - 5) + ' more' : ''}${referrerInfo}
`;
        await ctx.reply(referralMessage, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '💰 Stake TON', callback_data: 'stake' },
                        { text: '💎 Check Balance', callback_data: 'balance' }
                    ]
                ]
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error in referral command:', error);
        await ctx.reply('Sorry, something went wrong. Please try again later.');
    }
};
exports.referralCommand = referralCommand;
