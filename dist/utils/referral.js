"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateReferralCode = void 0;
exports.generateReferralCode = generateReferralCode;
const database_1 = require("../database");
const User_1 = require("../entities/User");
const logger_1 = require("./logger");
const crypto_1 = require("crypto");
const REFERRAL_CODE_LENGTH = 8;
const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function generateReferralCode() {
    // Generate a random 8-character string
    return (0, crypto_1.randomBytes)(4).toString('hex').slice(0, 8);
}
const validateReferralCode = async (code) => {
    try {
        const user = await database_1.AppDataSource.manager.findOne(User_1.User, {
            where: { referralCode: code }
        });
        return !!user;
    }
    catch (error) {
        logger_1.logger.error('Error validating referral code:', error);
        return false;
    }
};
exports.validateReferralCode = validateReferralCode;
