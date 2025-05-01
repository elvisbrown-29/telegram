import { Telegraf } from 'telegraf';
import { AppDataSource } from './database';
import { setupCommands } from './commands';
import { logger } from './utils/logger';
import app from './server';
import { config } from 'dotenv';

// Load environment variables
config();

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  logger.error('BOT_TOKEN is not set in environment variables');
  process.exit(1);
}

// Initialize bot
const bot = new Telegraf(BOT_TOKEN);

// Setup commands
setupCommands(bot);

// Start the application
const start = async () => {
  try {
    // Initialize database connection first
    if (!AppDataSource.isInitialized) {
      logger.info('Initializing database connection...');
      await AppDataSource.initialize();
      logger.info('Database connection initialized successfully');
    }

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });

    // Start bot last, after everything is ready
    await bot.launch();
    logger.info('Bot started successfully');

    // Enable graceful stop
    process.once('SIGINT', () => {
      logger.info('Received SIGINT signal, shutting down...');
      bot.stop('SIGINT');
      AppDataSource.destroy();
    });
    process.once('SIGTERM', () => {
      logger.info('Received SIGTERM signal, shutting down...');
      bot.stop('SIGTERM');
      AppDataSource.destroy();
    });

  } catch (error) {
    logger.error('Error starting application:', error);
    process.exit(1);
  }
};

// Start the application
start().catch((error) => {
  logger.error('Fatal error during startup:', error);
  process.exit(1);
}); 
