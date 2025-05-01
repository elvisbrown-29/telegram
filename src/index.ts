import { Telegraf } from 'telegraf';
import { AppDataSource } from './database';
import { setupCommands } from './commands';
import { logger } from './utils/logger';
import app from './server';

const PORT = process.env.PORT || 3000;

// Initialize bot
const bot = new Telegraf(process.env.BOT_TOKEN || '');

// Setup commands
setupCommands(bot);

const startServer = async () => {
    try {
        // Initialize database connection
        await AppDataSource.initialize();
        logger.info('Database connection initialized');

        // Start Express server
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Error starting server:', error);
        process.exit(1);
    }
};

// Start the application
const start = async () => {
  try {
    // Start bot
    await bot.launch();
    logger.info('Bot started');

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

    // Start Express server
    startServer();
  } catch (error) {
    logger.error('Error starting application:', error);
    process.exit(1);
  }
};

start(); 