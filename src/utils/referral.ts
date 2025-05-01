import { AppDataSource } from '../database';
import { User } from '../entities/User';
import { logger } from './logger';
import { randomBytes } from 'crypto';

const REFERRAL_CODE_LENGTH = 8;
const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generateReferralCode(): string {
  // Generate a random 8-character string
  return randomBytes(4).toString('hex').slice(0, 8);
}

export const validateReferralCode = async (code: string): Promise<boolean> => {
  try {
    const user = await AppDataSource.manager.findOne(User, {
      where: { referralCode: code }
    });
    return !!user;
  } catch (error) {
    logger.error('Error validating referral code:', error);
    return false;
  }
}; 