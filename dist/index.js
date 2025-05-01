"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const dotenv_1 = require("dotenv");
const commands_1 = require("./commands");
const middleware_1 = require("./middleware");
const database_1 = require("./database");
const logger_1 = require("./utils/logger");
// Load environment variables
(0, dotenv_1.config)();
// Initialize bot
const bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
// Setup middleware
(0, middleware_1.setupMiddleware)(bot);
// Setup commands
(0, commands_1.setupCommands)(bot);
// Connect to database
(0, database_1.connectDatabase)()
    .then(() => {
    logger_1.logger.info('Connected to database');
    // Start bot
    bot.launch()
        .then(() => {
        logger_1.logger.info('Bot started successfully');
    })
        .catch((error) => {
        logger_1.logger.error('Failed to start bot:', error);
        process.exit(1);
    });
})
    .catch((error) => {
    logger_1.logger.error('Failed to connect to database:', error);
    process.exit(1);
});
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
