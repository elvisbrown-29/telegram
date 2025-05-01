import { Context } from 'telegraf';
import { AppDataSource } from '../database';
import { User } from '../models/User';
import { Transaction, TransactionType, TransactionStatus } from '../models/Transaction';
import { logger } from '../utils/logger';

export const withdrawCommand = async (ctx: Context): Promise<void> => {
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

    if (user.stakedAmount <= 0) {
      await ctx.reply('You have no staked tokens to withdraw.');
      return;
    }

    // Check lock period
    if (user.lastStakeDate) {
      const lockEndDate = new Date(user.lastStakeDate);
      lockEndDate.setDate(lockEndDate.getDate() + 100); // 100 days lock period
      const now = new Date();

      if (now < lockEndDate) {
        const daysLeft = Math.ceil((lockEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        await ctx.reply(
          `⚠️ Your tokens are still locked!\n\n` +
          `Lock end date: ${lockEndDate.toLocaleDateString()}\n` +
          `Days remaining: ${daysLeft}\n\n` +
          `You cannot withdraw until the lock period ends.`
        );
        return;
      }
    }

    // Check if the message has an amount parameter
    const messageText = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
    const args = messageText.split(' ');
    
    if (args.length > 1) {
      const amount = parseFloat(args[1]);
      
      if (isNaN(amount)) {
        await ctx.reply('Please provide a valid number.');
        return;
      }

      if (amount <= 0) {
        await ctx.reply('Please provide a positive amount.');
        return;
      }

      if (amount > user.stakedAmount) {
        await ctx.reply(`You can only withdraw up to ${user.stakedAmount.toFixed(2)} TON.`);
        return;
      }

      // Create transaction record
      const transactionRepository = AppDataSource.getRepository(Transaction);
      const transaction = new Transaction();
      transaction.user = user;
      transaction.type = TransactionType.WITHDRAW;
      transaction.amount = amount;
      transaction.status = TransactionStatus.PENDING;
      await transactionRepository.save(transaction);

      // TODO: Implement actual withdrawal logic with TON wallet integration
      // For now, just update the user's staked amount
      user.stakedAmount -= amount;
      await userRepository.save(user);

      // Update transaction status
      transaction.status = TransactionStatus.COMPLETED;
      await transactionRepository.save(transaction);

      await ctx.reply(
        `✅ Successfully withdrawn ${amount} TON!\n\n` +
        `Remaining stake: ${user.stakedAmount.toFixed(2)} TON\n` +
        `Use /balance to check your updated balance.`
      );
      return;
    }

    const withdrawMessage = `
💸 *Withdraw TON Tokens*

Available to withdraw: ${user.stakedAmount.toFixed(2)} TON
Total earned: ${user.totalEarned.toFixed(2)} TON

To withdraw, please send the amount of TON you want to withdraw.

Example: \`/withdraw 100\`
`;

    await ctx.reply(withdrawMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '💎 Check Balance', callback_data: 'balance' },
            { text: '❓ Help', callback_data: 'help' }
          ]
        ]
      }
    });

  } catch (error) {
    logger.error('Error in withdraw command:', error);
    await ctx.reply('Sorry, something went wrong. Please try again later.');
  }
}; 