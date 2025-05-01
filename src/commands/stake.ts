import { Context } from 'telegraf';
import { AppDataSource } from '../database';
import { User } from '../models/User';
import { Transaction, TransactionType, TransactionStatus } from '../models/Transaction';
import { rewardsService } from '../services/rewards';
import { logger } from '../utils/logger';

export const stakeCommand = async (ctx: Context): Promise<void> => {
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

    const minStake = 2; // 2 TON minimum stake
    const maxStake = 10000; // Maximum stake amount

    const stakeMessage = `
💰 *Stake TON Tokens*

Current staking parameters:
• Minimum stake: ${minStake} TON
• Maximum stake: ${maxStake} TON
• Lock period: 100 days
• Referral reward: 10%

*Reward Tiers:*
• Days 1-5: 1% daily
• Days 6-10: 1.5% daily
• Days 11-15: 2% daily
• Days 16-20: 2.5% daily
• Days 21+: 3% daily

Your current stake: ${user.stakedAmount.toFixed(2)} TON
Total earned: ${user.totalEarned.toFixed(2)} TON

To stake, please send the amount of TON you want to stake (between ${minStake} and ${maxStake} TON).

Example: \`/stake 100\`
`;

    // Check if the message has an amount parameter
    const messageText = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
    const args = messageText.split(' ');
    
    if (args.length > 1) {
      const amount = parseFloat(args[1]);
      
      if (isNaN(amount)) {
        await ctx.reply('Please provide a valid number.');
        return;
      }

      if (amount < minStake) {
        await ctx.reply(`Minimum stake amount is ${minStake} TON.`);
        return;
      }

      if (amount > maxStake) {
        await ctx.reply(`Maximum stake amount is ${maxStake} TON.`);
        return;
      }

      // Create transaction record
      const transactionRepository = AppDataSource.getRepository(Transaction);
      const transaction = new Transaction();
      transaction.user = user;
      transaction.type = TransactionType.STAKE;
      transaction.amount = amount;
      transaction.status = TransactionStatus.PENDING;
      await transactionRepository.save(transaction);

      // TODO: Implement actual staking logic with TON wallet integration
      // For now, just update the user's staked amount
      user.stakedAmount += amount;
      user.lastStakeDate = new Date();
      await userRepository.save(user);

      // Update transaction status
      transaction.status = TransactionStatus.COMPLETED;
      await transactionRepository.save(transaction);

      const lockEndDate = new Date(user.lastStakeDate);
      lockEndDate.setDate(lockEndDate.getDate() + 100);

      await ctx.reply(
        `✅ Successfully staked ${amount} TON!\n\n` +
        `Your tokens will be locked until ${lockEndDate.toLocaleDateString()}.\n` +
        `Use /balance to check your updated balance.`
      );
      return;
    }

    await ctx.reply(stakeMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: `${minStake} TON`, callback_data: `stake_${minStake}` },
            { text: `${maxStake} TON`, callback_data: `stake_${maxStake}` }
          ],
          [
            { text: '💎 Check Balance', callback_data: 'balance' },
            { text: '❓ Help', callback_data: 'help' }
          ]
        ]
      }
    });

  } catch (error) {
    logger.error('Error in stake command:', error);
    await ctx.reply('Sorry, something went wrong. Please try again later.');
  }
}; 