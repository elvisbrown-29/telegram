"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCommand = void 0;
const database_1 = require("../database");
const User_1 = require("../models/User");
const referral_1 = require("../utils/referral");
const logger_1 = require("../utils/logger");
const startCommand = async (ctx) => {
    try {
        const telegramId = ctx.from?.id;
        if (!telegramId) {
            await ctx.reply('Error: Could not identify user.');
            return;
        }
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        let user = await userRepository.findOne({ where: { telegramId } });
        if (!user) {
            user = new User_1.User();
            user.telegramId = telegramId;
            user.username = ctx.from.username || '';
            user.firstName = ctx.from.first_name || '';
            user.lastName = ctx.from.last_name || '';
            user.referralCode = (0, referral_1.generateReferralCode)();
            // Check for referral code in start parameter
            const startParam = (ctx.message && 'text' in ctx.message) ?
                ctx.message.text.split(' ')[1] : undefined;
            if (startParam) {
                user.referredBy = startParam;
            }
            await userRepository.save(user);
            logger_1.logger.info(`New user registered: ${telegramId}`);
        }
        const welcomeMessage = `
👋 Welcome to TONVault Staking Bot!

💰 *Staking Features:*
• Minimum stake: 2 TON
• Lock period: 100 days
• Referral reward: 10%

*Reward Tiers:*
• Days 1-5: 1% daily
• Days 6-10: 1.5% daily
• Days 11-15: 2% daily
• Days 16-20: 2.5% daily
• Days 21+: 3% daily

Your referral code: \`${user.referralCode}\`

Use /help to see all available commands.
`;
        await ctx.reply(welcomeMessage, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '💰 Stake TON', callback_data: 'stake' },
                        { text: '💎 Check Balance', callback_data: 'balance' }
                    ],
                    [
                        { text: '👥 Referral Program', callback_data: 'referral' },
                        { text: '❓ Help', callback_data: 'help' }
                    ]
                ]
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error in start command:', error);
        await ctx.reply('Sorry, something went wrong. Please try again later.');
    }
};
exports.startCommand = startCommand;
