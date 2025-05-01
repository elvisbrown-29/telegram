"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const cron_1 = require("cron");
const database_1 = require("../database");
const rewards_1 = require("../services/rewards");
const logger_1 = require("../utils/logger");
// Load environment variables
(0, dotenv_1.config)();
// Connect to database
(0, database_1.connectDatabase)()
    .then(() => {
    logger_1.logger.info('Connected to database');
    setupCronJobs();
})
    .catch((error) => {
    logger_1.logger.error('Error connecting to database:', error);
    process.exit(1);
});
function setupCronJobs() {
    // Distribute rewards daily at 00:00 UTC
    const distributeRewardsJob = new cron_1.CronJob('0 0 * * *', async () => {
        try {
            logger_1.logger.info('Starting scheduled rewards distribution');
            await rewards_1.rewardsService.distributeRewards();
            logger_1.logger.info('Scheduled rewards distribution completed');
        }
        catch (error) {
            logger_1.logger.error('Error in scheduled rewards distribution:', error);
        }
    }, null, true, 'UTC');
    // Start jobs
    distributeRewardsJob.start();
    logger_1.logger.info('Cron jobs started successfully');
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        distributeRewardsJob.stop();
        logger_1.logger.info('Cron jobs stopped');
        process.exit(0);
    });
    process.on('SIGTERM', () => {
        distributeRewardsJob.stop();
        logger_1.logger.info('Cron jobs stopped');
        process.exit(0);
    });
}
