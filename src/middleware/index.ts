import { Telegraf, Context } from 'telegraf';
import { logger } from '../utils/logger';

export const setupMiddleware = (bot: Telegraf<Context>): void => {
    // Log all updates
    bot.use(async (ctx, next) => {
        const start = Date.now();
        await next();
        const ms = Date.now() - start;
        logger.info(`${ctx.updateType} update processed in ${ms}ms`);
    });

    // Error handling
    bot.catch((err: unknown, ctx: Context) => {
        logger.error('Bot error:', err);
        ctx.reply('An error occurred while processing your request. Please try again later.');
    });
}; 