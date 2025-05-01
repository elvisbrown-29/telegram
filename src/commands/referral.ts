import { Context } from 'telegraf';
import { AppDataSource } from '../database';
import { User } from '../models/User';
import { logger } from '../utils/logger';

export const referralCommand = async (ctx: Context): Promise<void> => {
  try {
    const telegramId = ctx.from?.id;
    if (!telegramId) {
      await ctx.reply('Error: Could not identify user.');
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
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

  } catch (error) {
    logger.error('Error in referral command:', error);
    await ctx.reply('Sorry, something went wrong. Please try again later.');
  }
}; 