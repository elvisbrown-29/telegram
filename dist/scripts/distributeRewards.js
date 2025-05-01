"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const database_1 = require("../database");
const rewards_1 = require("../services/rewards");
const logger_1 = require("../utils/logger");
// Load environment variables
(0, dotenv_1.config)();
async function main() {
    try {
        // Connect to database
        await (0, database_1.connectDatabase)();
        logger_1.logger.info('Connected to database');
        // Distribute rewards
        await rewards_1.rewardsService.distributeRewards();
        logger_1.logger.info('Rewards distribution completed successfully');
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error('Error in rewards distribution script:', error);
        process.exit(1);
    }
}
main();
