"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewardsService = exports.RewardsService = void 0;
const database_1 = require("../database");
const User_1 = require("../models/User");
const Transaction_1 = require("../models/Transaction");
const RewardHistory_1 = require("../models/RewardHistory");
const Settings_1 = require("../entities/Settings");
const logger_1 = require("../utils/logger");
const dotenv_1 = require("dotenv");
// Load environment variables
(0, dotenv_1.config)();
class RewardsService {
    constructor() {
        this.MIN_STAKE_AMOUNT = 2; // 2 TON
        this.LOCK_PERIOD_DAYS = 100; // 100 days
        this.REFERRAL_REWARD_RATE = 10; // 10%
        this.REWARD_TIERS = [
            { days: 5, rate: 1.0 }, // 1% for first 5 days
            { days: 5, rate: 1.5 }, // 1.5% for next 5 days
            { days: 5, rate: 2.0 }, // 2% for next 5 days
            { days: 5, rate: 2.5 }, // 2.5% for next 5 days
            { days: Infinity, rate: 3.0 } // 3% for remaining days
        ];
        this.initializeSettings();
    }
    async initializeSettings() {
        const settings = [
            { key: 'MIN_STAKE_AMOUNT', value: this.MIN_STAKE_AMOUNT.toString(), description: 'Minimum stake amount in TON' },
            { key: 'LOCK_PERIOD_DAYS', value: this.LOCK_PERIOD_DAYS.toString(), description: 'Lock period for staked tokens in days' },
            { key: 'REFERRAL_REWARD', value: this.REFERRAL_REWARD_RATE.toString(), description: 'Referral reward rate in percentage' }
        ];
        for (const setting of settings) {
            await this.updateSettings(setting.key, setting.value, setting.description);
        }
    }
    getRewardRate(lastStakeDate) {
        if (!lastStakeDate)
            return 1.0;
        const daysSinceStake = Math.floor((Date.now() - lastStakeDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceStake > 20)
            return 3.0;
        if (daysSinceStake > 15)
            return 2.5;
        if (daysSinceStake > 10)
            return 2.0;
        if (daysSinceStake > 5)
            return 1.5;
        return 1.0;
    }
    async calculateDailyRewards(user) {
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
            await database_1.AppDataSource.manager.save(user);
            // Create reward history entry
            const rewardHistory = new RewardHistory_1.RewardHistory();
            rewardHistory.user = user;
            rewardHistory.amount = dailyReward;
            rewardHistory.rewardDate = new Date();
            await database_1.AppDataSource.manager.save(rewardHistory);
            // Create transaction record
            const transaction = new Transaction_1.Transaction();
            transaction.user = user;
            transaction.type = Transaction_1.TransactionType.REWARD;
            transaction.amount = dailyReward;
            transaction.status = Transaction_1.TransactionStatus.COMPLETED;
            await database_1.AppDataSource.manager.save(transaction);
            // Process referral rewards if user was referred
            if (user.referredBy) {
                await this.processReferralReward(user.id, dailyReward);
            }
            return dailyReward;
        }
        catch (error) {
            logger_1.logger.error('Error calculating daily rewards:', error);
            throw error;
        }
    }
    async processReferralReward(userId, baseReward) {
        try {
            const userRepository = database_1.AppDataSource.getRepository(User_1.User);
            const transactionRepository = database_1.AppDataSource.getRepository(Transaction_1.Transaction);
            const user = await userRepository.findOne({ where: { id: userId } });
            if (!user || !user.referredBy)
                return;
            const referrer = await userRepository.findOne({ where: { referralCode: user.referredBy } });
            if (!referrer)
                return;
            const referralReward = baseReward * 0.1; // 10% referral reward
            // Update referrer's earnings
            referrer.referralEarnings += referralReward;
            referrer.totalEarned += referralReward;
            await userRepository.save(referrer);
            // Create referral reward transaction
            const transaction = new Transaction_1.Transaction();
            transaction.user = referrer;
            transaction.type = Transaction_1.TransactionType.REFERRAL_REWARD;
            transaction.amount = referralReward;
            transaction.status = Transaction_1.TransactionStatus.COMPLETED;
            await transactionRepository.save(transaction);
            logger_1.logger.info(`Processed referral reward: ${referralReward} TON for user ${referrer.telegramId}`);
        }
        catch (error) {
            logger_1.logger.error('Error processing referral reward:', error);
        }
    }
    async distributeRewards() {
        try {
            const userRepository = database_1.AppDataSource.getRepository(User_1.User);
            const transactionRepository = database_1.AppDataSource.getRepository(Transaction_1.Transaction);
            const rewardHistoryRepository = database_1.AppDataSource.getRepository(RewardHistory_1.RewardHistory);
            // Get all users with active stakes
            const users = await userRepository.find({
                where: {
                    stakedAmount: 0,
                    isActive: true
                }
            });
            for (const user of users) {
                if (!user.lastStakeDate)
                    continue;
                const rewardRate = this.getRewardRate(user.lastStakeDate);
                const dailyReward = user.stakedAmount * (rewardRate / 100);
                // Update user's earnings
                user.totalEarned += dailyReward;
                user.lastRewardDate = new Date();
                await userRepository.save(user);
                // Create reward transaction
                const transaction = new Transaction_1.Transaction();
                transaction.user = user;
                transaction.type = Transaction_1.TransactionType.REWARD;
                transaction.amount = dailyReward;
                transaction.status = Transaction_1.TransactionStatus.COMPLETED;
                await transactionRepository.save(transaction);
                // Create reward history record
                const rewardHistory = new RewardHistory_1.RewardHistory();
                rewardHistory.user = user;
                rewardHistory.amount = dailyReward;
                rewardHistory.rewardDate = new Date();
                await rewardHistoryRepository.save(rewardHistory);
                // Process referral reward
                await this.processReferralReward(user.id, dailyReward);
                logger_1.logger.info(`Distributed ${dailyReward} TON reward to user ${user.telegramId}`);
            }
            logger_1.logger.info('Completed rewards distribution');
        }
        catch (error) {
            logger_1.logger.error('Error distributing rewards:', error);
            throw error;
        }
    }
    async getEstimatedDailyReward(stakedAmount, stakeDate) {
        const currentRate = this.getRewardRate(stakeDate);
        return (stakedAmount * currentRate) / 100;
    }
    async getEstimatedReferralReward(referralStakedAmount, stakeDate) {
        const baseReward = await this.getEstimatedDailyReward(referralStakedAmount, stakeDate);
        return (baseReward * this.REFERRAL_REWARD_RATE) / 100;
    }
    async updateSettings(key, value, description) {
        try {
            const settings = await database_1.AppDataSource.manager.findOne(Settings_1.Settings, {
                where: { keyName: key }
            });
            if (settings) {
                settings.value = value;
                if (description) {
                    settings.description = description;
                }
                await database_1.AppDataSource.manager.save(settings);
            }
            else {
                const newSettings = new Settings_1.Settings();
                newSettings.keyName = key;
                newSettings.value = value;
                if (description) {
                    newSettings.description = description;
                }
                await database_1.AppDataSource.manager.save(newSettings);
            }
        }
        catch (error) {
            logger_1.logger.error('Error updating settings:', error);
            throw error;
        }
    }
}
exports.RewardsService = RewardsService;
// Create singleton instance
exports.rewardsService = new RewardsService();
