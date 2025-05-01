import { config } from 'dotenv';
import { connectDatabase } from '../database';
import { rewardsService } from '../services/rewards';
import { logger } from '../utils/logger';

// Load environment variables
config();

async function main() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Connected to database');

    // Distribute rewards
    await rewardsService.distributeRewards();
    logger.info('Rewards distribution completed successfully');

    process.exit(0);
  } catch (error) {
    logger.error('Error in rewards distribution script:', error);
    process.exit(1);
  }
}

main(); 