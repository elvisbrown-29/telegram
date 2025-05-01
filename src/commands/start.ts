import { Context } from 'telegraf';
import { AppDataSource } from '../database';
import { User } from '../models/User';
import { generateReferralCode } from '../utils/referral';
import { logger } from '../utils/logger';

// Get webapp URL based on environment
const getWebappUrl = () => {
  return 'https://tg-nine-orcin.vercel.app';
};

export const startCommand = async (ctx: Context): Promise<void> => {
  try {
    const telegramId = ctx.from?.id;
    if (!telegramId) {
      await ctx.reply('Error: Could not identify user.');
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    let user = await userRepository.findOne({ where: { telegramId } });

    if (!user) {
      user = new User();
      user.telegramId = telegramId;
      user.username = ctx.from.username || '';
      user.firstName = ctx.from.first_name || '';
      user.lastName = ctx.from.last_name || '';
      user.referralCode = generateReferralCode();
      
      // Check for referral code in start parameter
      const startParam = (ctx.message && 'text' in ctx.message) ? 
        ctx.message.text.split(' ')[1] : undefined;
      
      if (startParam) {
        user.referredBy = startParam;
      }

      await userRepository.save(user);
      logger.info(`New user registered: ${telegramId}`);
    }

    const welcomeMessage = `
👋 *Welcome to TONVault Staking Bot!*

Your personal TON staking platform with:
• Daily rewards up to 3%
• 10% referral bonuses
• Secure smart contracts
• 24/7 support

Your referral code: \`${user.referralCode}\`
Share link: https://t.me/${ctx.botInfo?.username}?start=${user.referralCode}

Click the button below to access the staking dashboard:
`;

    await ctx.reply(welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🚀 Open Staking Dashboard',
              web_app: { url: getWebappUrl() }
            }
          ]
        ]
      }
    });

  } catch (error) {
    logger.error('Error in start command:', error);
    await ctx.reply('Sorry, something went wrong. Please try again later.');
  }
}; 