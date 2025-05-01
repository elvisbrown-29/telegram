import { Telegraf, Context } from 'telegraf';
import { startCommand } from './start';
import { stakeCommand } from './stake';
import { withdrawCommand } from './withdraw';
import { balanceCommand } from './balance';
import { referralCommand } from './referral';
import { helpCommand } from './help';
import { logger } from '../utils/logger';

export const setupCommands = (bot: Telegraf): void => {
  // Basic commands
  bot.command('start', startCommand);
  bot.command('stake', stakeCommand);
  bot.command('withdraw', withdrawCommand);
  bot.command('balance', balanceCommand);
  bot.command('referral', referralCommand);
  bot.command('help', helpCommand);

  // Menu handlers
  bot.action('menu_staking', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const stakingMenu = `
💰 *Staking Menu*

*Current Staking Parameters:*
• Minimum stake: 2 TON
• Maximum stake: 10000 TON
• Lock period: 100 days
• Referral reward: 10%

*Reward Tiers:*
• Days 1-5: 1% daily
• Days 6-10: 1.5% daily
• Days 11-15: 2% daily
• Days 16-20: 2.5% daily
• Days 21+: 3% daily

Select an option:
`;
      await ctx.editMessageText(stakingMenu, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📥 Stake TON', callback_data: 'stake' },
              { text: '📤 Withdraw', callback_data: 'withdraw' }
            ],
            [
              { text: '📊 View Stats', callback_data: 'menu_stats' },
              { text: '❓ Help', callback_data: 'menu_help' }
            ],
            [
              { text: '🔙 Back to Main Menu', callback_data: 'menu_main' }
            ]
          ]
        }
      });
    } catch (error) {
      logger.error('Error in staking menu:', error);
      await ctx.answerCbQuery('Error occurred. Please try again.');
    }
  });

  bot.action('menu_balance', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      await ctx.reply('/balance');
    } catch (error) {
      logger.error('Error in balance menu:', error);
      await ctx.answerCbQuery('Error occurred. Please try again.');
    }
  });

  bot.action('menu_referrals', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      await ctx.reply('/referral');
    } catch (error) {
      logger.error('Error in referrals menu:', error);
      await ctx.answerCbQuery('Error occurred. Please try again.');
    }
  });

  bot.action('menu_stats', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const statsMenu = `
📊 *Statistics Menu*

*Platform Stats:*
• Total users: 1,234
• Total staked: 567,890 TON
• Total rewards: 12,345 TON
• Active referrals: 789

*Your Stats:*
• Staked: 100 TON
• Earned: 10 TON
• Referrals: 5
• Referral earnings: 2 TON

Select an option:
`;
      await ctx.editMessageText(statsMenu, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📈 Daily Stats', callback_data: 'stats_daily' },
              { text: '📉 Weekly Stats', callback_data: 'stats_weekly' }
            ],
            [
              { text: '📊 Monthly Stats', callback_data: 'stats_monthly' },
              { text: '📅 All Time', callback_data: 'stats_alltime' }
            ],
            [
              { text: '🔙 Back to Main Menu', callback_data: 'menu_main' }
            ]
          ]
        }
      });
    } catch (error) {
      logger.error('Error in stats menu:', error);
      await ctx.answerCbQuery('Error occurred. Please try again.');
    }
  });

  bot.action('menu_help', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      await ctx.reply('/help');
    } catch (error) {
      logger.error('Error in help menu:', error);
      await ctx.answerCbQuery('Error occurred. Please try again.');
    }
  });

  bot.action('menu_settings', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const settingsMenu = `
⚙️ *Settings Menu*

*Your Settings:*
• Language: English
• Notifications: Enabled
• Auto-stake: Disabled
• Theme: Dark

Select an option:
`;
      await ctx.editMessageText(settingsMenu, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🌐 Language', callback_data: 'settings_language' },
              { text: '🔔 Notifications', callback_data: 'settings_notifications' }
            ],
            [
              { text: '🔄 Auto-stake', callback_data: 'settings_autostake' },
              { text: '🎨 Theme', callback_data: 'settings_theme' }
            ],
            [
              { text: '🔙 Back to Main Menu', callback_data: 'menu_main' }
            ]
          ]
        }
      });
    } catch (error) {
      logger.error('Error in settings menu:', error);
      await ctx.answerCbQuery('Error occurred. Please try again.');
    }
  });

  bot.action('menu_main', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      await startCommand(ctx);
    } catch (error) {
      logger.error('Error in main menu:', error);
      await ctx.answerCbQuery('Error occurred. Please try again.');
    }
  });

  // Original callback handlers
  bot.action('stake', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      await ctx.reply('/stake');
    } catch (error) {
      logger.error('Error in stake callback:', error);
      await ctx.answerCbQuery('Error occurred. Please try again.');
    }
  });

  bot.action(/^stake_(\d+)$/, async (ctx) => {
    try {
      const amount = parseInt(ctx.match[1]);
      await ctx.answerCbQuery();
      await ctx.reply(`/stake ${amount}`);
    } catch (error) {
      logger.error('Error in stake amount callback:', error);
      await ctx.answerCbQuery('Error occurred. Please try again.');
    }
  });

  bot.action('withdraw', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      await ctx.reply('/withdraw');
    } catch (error) {
      logger.error('Error in withdraw callback:', error);
      await ctx.answerCbQuery('Error occurred. Please try again.');
    }
  });

  // Admin commands
  if (process.env.ADMIN_TELEGRAM_ID) {
    bot.command('admin', (ctx) => {
      if (ctx.from?.id.toString() === process.env.ADMIN_TELEGRAM_ID) {
        // TODO: Implement admin panel
        ctx.reply('Admin panel coming soon!');
      }
    });
  }
}; 