"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCommands = void 0;
const start_1 = require("./start");
const stake_1 = require("./stake");
const withdraw_1 = require("./withdraw");
const balance_1 = require("./balance");
const referral_1 = require("./referral");
const help_1 = require("./help");
const setupCommands = (bot) => {
    // Basic commands
    bot.command('start', start_1.startCommand);
    bot.command('stake', stake_1.stakeCommand);
    bot.command('withdraw', withdraw_1.withdrawCommand);
    bot.command('balance', balance_1.balanceCommand);
    bot.command('referral', referral_1.referralCommand);
    bot.command('help', help_1.helpCommand);
    // Admin commands
    if (process.env.ADMIN_TELEGRAM_ID) {
        bot.command('admin', (ctx) => {
            if (ctx.from?.id.toString() === process.env.ADMIN_TELEGRAM_ID) {
                // TODO: Implement admin panel
                ctx.reply('Admin panel coming soon!');
            }
        });
    }
};
exports.setupCommands = setupCommands;
