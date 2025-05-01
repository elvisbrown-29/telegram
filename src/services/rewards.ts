import { AppDataSource } from '../database';
import { User } from '../models/User';
import { Transaction, TransactionType, TransactionStatus } from '../models/Transaction';
import { RewardHistory } from '../models/RewardHistory';
import { Settings } from '../entities/Settings';
import { logger } from '../utils/logger';
import { config } from 'dotenv';

// Load environment variables
config();

interface RewardTier {
    days: number;
    rate: number;
}

export class RewardsService {
    private readonly MIN_STAKE_AMOUNT = 2; // 2 TON
    private readonly LOCK_PERIOD_DAYS = 100; // 100 days
    private readonly REFERRAL_REWARD_RATE = 10; // 10%
    private readonly REWARD_TIERS: RewardTier[] = [
        { days: 5, rate: 1.0 },    // 1% for first 5 days
        { days: 5, rate: 1.5 },    // 1.5% for next 5 days
        { days: 5, rate: 2.0 },    // 2% for next 5 days
        { days: 5, rate: 2.5 },    // 2.5% for next 5 days
        { days: Infinity, rate: 3.0 } // 3% for remaining days
    ];

    constructor() {
        this.initializeSettings();
    }

    private async initializeSettings(): Promise<void> {
        const settings = [
            { key: 'MIN_STAKE_AMOUNT', value: this.MIN_STAKE_AMOUNT.toString(), description: 'Minimum stake amount in TON' },
            { key: 'LOCK_PERIOD_DAYS', value: this.LOCK_PERIOD_DAYS.toString(), description: 'Lock period for staked tokens in days' },
            { key: 'REFERRAL_REWARD', value: this.REFERRAL_REWARD_RATE.toString(), description: 'Referral reward rate in percentage' }
        ];

        for (const setting of settings) {
            await this.updateSettings(setting.key, setting.value, setting.description);
        }
    }

    private getRewardRate(lastStakeDate: Date | null): number {
        if (!lastStakeDate) return 1.0;

        const daysSinceStake = Math.floor((Date.now() - lastStakeDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceStake > 20) return 3.0;
        if (daysSinceStake > 15) return 2.5;
        if (daysSinceStake > 10) return 2.0;
        if (daysSinceStake > 5) return 1.5;
        return 1.0;
    }

    async calculateDailyRewards(user: User): Promise<number> {
        try {
            if (user.stakedAmount <= 0 || !user.lastStakeDate) {
                return 0;
            }

            // Check if user is still in lock period
            const lockEndDate = new Date(user.lastStakeDate);
            lockEndDate.setDate(lockEndDate.getDate() + this.LOCK_PERIOD_DAYS);
            
            if (new Date() < lockEndDate) {
                return 0;
            }

            // Get current reward rate based on stake duration
            const currentRate = this.getRewardRate(user.lastStakeDate);
            const dailyReward = (user.stakedAmount * currentRate) / 100;

            // Update user's total earned
            user.totalEarned += dailyReward;
            user.lastRewardDate = new Date();
            await AppDataSource.manager.save(user);

            // Create reward history entry
            const rewardHistory = new RewardHistory();
            rewardHistory.user = user;
            rewardHistory.amount = dailyReward;
            rewardHistory.rewardDate = new Date();
            await AppDataSource.manager.save(rewardHistory);

            // Create transaction record
            const transaction = new Transaction();
            transaction.user = user;
            transaction.type = TransactionType.REWARD;
            transaction.amount = dailyReward;
            transaction.status = TransactionStatus.COMPLETED;
            await AppDataSource.manager.save(transaction);

            // Process referral rewards if user was referred
            if (user.referredBy) {
                await this.processReferralReward(user.id, dailyReward);
            }

            return dailyReward;
        } catch (error) {
            logger.error('Error calculating daily rewards:', error);
            throw error;
        }
    }

    private async processReferralReward(userId: number, baseReward: number): Promise<void> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const transactionRepository = AppDataSource.getRepository(Transaction);

            const user = await userRepository.findOne({ where: { id: userId } });
            if (!user || !user.referredBy) return;

            const referrer = await userRepository.findOne({ where: { referralCode: user.referredBy } });
            if (!referrer) return;

            const referralReward = baseReward * 0.1; // 10% referral reward

            // Update referrer's earnings
            referrer.referralEarnings += referralReward;
            referrer.totalEarned += referralReward;
            await userRepository.save(referrer);

            // Create referral reward transaction
            const transaction = new Transaction();
            transaction.user = referrer;
            transaction.type = TransactionType.REFERRAL_REWARD;
            transaction.amount = referralReward;
            transaction.status = TransactionStatus.COMPLETED;
            await transactionRepository.save(transaction);

            logger.info(`Processed referral reward: ${referralReward} TON for user ${referrer.telegramId}`);
        } catch (error) {
            logger.error('Error processing referral reward:', error);
        }
    }

    public async distributeRewards(): Promise<void> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const transactionRepository = AppDataSource.getRepository(Transaction);
            const rewardHistoryRepository = AppDataSource.getRepository(RewardHistory);

            // Get all users with active stakes
            const users = await userRepository.find({
                where: {
                    stakedAmount: 0,
                    isActive: true
                }
            });

            for (const user of users) {
                if (!user.lastStakeDate) continue;

                const rewardRate = this.getRewardRate(user.lastStakeDate);
                const dailyReward = user.stakedAmount * (rewardRate / 100);

                // Update user's earnings
                user.totalEarned += dailyReward;
                user.lastRewardDate = new Date();
                await userRepository.save(user);

                // Create reward transaction
                const transaction = new Transaction();
                transaction.user = user;
                transaction.type = TransactionType.REWARD;
                transaction.amount = dailyReward;
                transaction.status = TransactionStatus.COMPLETED;
                await transactionRepository.save(transaction);

                // Create reward history record
                const rewardHistory = new RewardHistory();
                rewardHistory.user = user;
                rewardHistory.amount = dailyReward;
                rewardHistory.rewardDate = new Date();
                await rewardHistoryRepository.save(rewardHistory);

                // Process referral reward
                await this.processReferralReward(user.id, dailyReward);

                logger.info(`Distributed ${dailyReward} TON reward to user ${user.telegramId}`);
            }

            logger.info('Completed rewards distribution');
        } catch (error) {
            logger.error('Error distributing rewards:', error);
            throw error;
        }
    }

    async getEstimatedDailyReward(stakedAmount: number, stakeDate: Date): Promise<number> {
        const currentRate = this.getRewardRate(stakeDate);
        return (stakedAmount * currentRate) / 100;
    }

    async getEstimatedReferralReward(referralStakedAmount: number, stakeDate: Date): Promise<number> {
        const baseReward = await this.getEstimatedDailyReward(referralStakedAmount, stakeDate);
        return (baseReward * this.REFERRAL_REWARD_RATE) / 100;
    }

    async updateSettings(key: string, value: string, description?: string): Promise<void> {
        try {
            const settings = await AppDataSource.manager.findOne(Settings, {
                where: { keyName: key }
            });

            if (settings) {
                settings.value = value;
                if (description) {
                    settings.description = description;
                }
                await AppDataSource.manager.save(settings);
            } else {
                const newSettings = new Settings();
                newSettings.keyName = key;
                newSettings.value = value;
                if (description) {
                    newSettings.description = description;
                }
                await AppDataSource.manager.save(newSettings);
            }
        } catch (error) {
            logger.error('Error updating settings:', error);
            throw error;
        }
    }
}

// Create singleton instance
export const rewardsService = new RewardsService(); 