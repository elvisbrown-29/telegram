"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database");
const User_1 = require("../models/User");
const rewards_1 = require("../services/rewards");
describe('Rewards Service', () => {
    beforeAll(async () => {
        await database_1.AppDataSource.initialize();
    });
    afterAll(async () => {
        await database_1.AppDataSource.destroy();
    });
    beforeEach(async () => {
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        await userRepository.clear();
    });
    describe('distributeRewards', () => {
        it('should distribute rewards correctly for a single user', async () => {
            const userRepository = database_1.AppDataSource.getRepository(User_1.User);
            // Create test user
            const user = new User_1.User();
            user.telegramId = 123456789;
            user.username = 'testuser';
            user.firstName = 'Test';
            user.lastName = 'User';
            user.stakedAmount = 100;
            user.totalEarned = 0;
            user.referralCode = 'TEST1234';
            user.lastStakeDate = new Date();
            await userRepository.save(user);
            // Distribute rewards
            await rewards_1.rewardsService.distributeRewards();
            // Check updated user
            const updatedUser = await userRepository.findOne({ where: { telegramId: user.telegramId } });
            expect(updatedUser).toBeDefined();
            expect(updatedUser.totalEarned).toBeGreaterThan(0);
        });
        it('should process referral rewards correctly', async () => {
            const userRepository = database_1.AppDataSource.getRepository(User_1.User);
            // Create referrer
            const referrer = new User_1.User();
            referrer.telegramId = 123456789;
            referrer.username = 'referrer';
            referrer.firstName = 'Test';
            referrer.lastName = 'Referrer';
            referrer.stakedAmount = 0;
            referrer.totalEarned = 0;
            referrer.referralCode = 'REF12345';
            await userRepository.save(referrer);
            // Create referred user
            const referred = new User_1.User();
            referred.telegramId = 987654321;
            referred.username = 'referred';
            referred.firstName = 'Test';
            referred.lastName = 'Referred';
            referred.stakedAmount = 100;
            referred.totalEarned = 0;
            referred.referralCode = 'REF67890';
            referred.referredBy = referrer.referralCode;
            referred.lastStakeDate = new Date();
            await userRepository.save(referred);
            // Distribute rewards
            await rewards_1.rewardsService.distributeRewards();
            // Check referrer's earnings
            const updatedReferrer = await userRepository.findOne({ where: { telegramId: referrer.telegramId } });
            expect(updatedReferrer).toBeDefined();
            expect(updatedReferrer.referralEarnings).toBeGreaterThan(0);
        });
    });
});
