import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { RewardHistory } from '../models/RewardHistory';
import { Settings } from '../entities/Settings';
import { logger } from '../utils/logger';
import { config } from 'dotenv';

// Load environment variables
config();

// Create and export the TypeORM data source
export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ton_staking_bot',
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    entities: [User, Transaction, RewardHistory, Settings],
    migrations: [],
    subscribers: [],
    charset: 'utf8mb4',
    timezone: 'Z',
    extra: {
        connectionLimit: 10
    }
});

export const connectDatabase = async (): Promise<void> => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            logger.info('Connected to MySQL database');

            // Initialize default settings if they don't exist
            await initializeDefaultSettings();
        }
    } catch (error) {
        logger.error('Error connecting to database:', error);
        throw error;
    }
};

async function initializeDefaultSettings(): Promise<void> {
    try {
        const settingsRepository = AppDataSource.getRepository(Settings);
        
        const defaultSettings = [
            {
                keyName: 'MIN_STAKE_AMOUNT',
                value: '2',
                description: 'Minimum stake amount in TON'
            },
            {
                keyName: 'LOCK_PERIOD_DAYS',
                value: '100',
                description: 'Lock period for staked tokens in days'
            },
            {
                keyName: 'REFERRAL_REWARD',
                value: '10',
                description: 'Referral reward rate in percentage'
            },
            {
                keyName: 'REWARD_TIER_1',
                value: '1.0',
                description: 'Daily reward rate for days 1-5'
            },
            {
                keyName: 'REWARD_TIER_2',
                value: '1.5',
                description: 'Daily reward rate for days 6-10'
            },
            {
                keyName: 'REWARD_TIER_3',
                value: '2.0',
                description: 'Daily reward rate for days 11-15'
            },
            {
                keyName: 'REWARD_TIER_4',
                value: '2.5',
                description: 'Daily reward rate for days 16-20'
            },
            {
                keyName: 'REWARD_TIER_5',
                value: '3.0',
                description: 'Daily reward rate for days 21+'
            }
        ];

        for (const setting of defaultSettings) {
            const existingSetting = await settingsRepository.findOne({
                where: { keyName: setting.keyName }
            });

            if (!existingSetting) {
                await settingsRepository.save(setting);
                logger.info(`Initialized setting: ${setting.keyName}`);
            }
        }
    } catch (error) {
        logger.error('Error initializing default settings:', error);
        throw error;
    }
} 