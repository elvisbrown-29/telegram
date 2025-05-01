import { config } from 'dotenv';
import { CronJob } from 'cron';
import { connectDatabase } from '../database';
import { rewardsService } from '../services/rewards';
import { logger } from '../utils/logger';

// Load environment variables
config();

// Connect to database
connectDatabase()
  .then(() => {
    logger.info('Connected to database');
    setupCronJobs();
  })
  .catch((error) => {
    logger.error('Error connecting to database:', error);
    process.exit(1);
  });

function setupCronJobs() {
  // Distribute rewards daily at 00:00 UTC
  const distributeRewardsJob = new CronJob(
    '0 0 * * *',
    async () => {
      try {
        logger.info('Starting scheduled rewards distribution');
        await rewardsService.distributeRewards();
        logger.info('Scheduled rewards distribution completed');
      } catch (error) {
        logger.error('Error in scheduled rewards distribution:', error);
      }
    },
    null,
    true,
    'UTC'
  );

  // Start jobs
  distributeRewardsJob.start();
  logger.info('Cron jobs started successfully');

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    distributeRewardsJob.stop();
    logger.info('Cron jobs stopped');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    distributeRewardsJob.stop();
    logger.info('Cron jobs stopped');
    process.exit(0);
  });
} 