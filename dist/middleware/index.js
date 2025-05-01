"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMiddleware = void 0;
const logger_1 = require("../utils/logger");
const setupMiddleware = (bot) => {
    // Log all updates
    bot.use(async (ctx, next) => {
        const start = Date.now();
        await next();
        const ms = Date.now() - start;
        logger_1.logger.info(`${ctx.updateType} update processed in ${ms}ms`);
    });
    // Error handling
    bot.catch((err, ctx) => {
        logger_1.logger.error('Bot error:', err);
        ctx.reply('An error occurred while processing your request. Please try again later.');
    });
};
exports.setupMiddleware = setupMiddleware;
