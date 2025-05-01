import express from 'express';
import path from 'path';
import cors from 'cors';
import { logger } from './utils/logger';
import fetch from 'node-fetch';
import crypto from 'crypto';

const app = express();

// Enable CORS for Telegram WebApp
app.use(cors({
    origin: ['https://tg-nine-orcin.vercel.app', 'https://web.telegram.org'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Telegram-Init-Data'],
    credentials: true
}));

// Serve static files from webapp directory
app.use(express.static(path.join(__dirname, 'webapp')));

// Validate Telegram WebApp data
const validateTelegramWebAppData = (initData: string): boolean => {
    try {
        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get('hash');
        urlParams.delete('hash');
        
        const dataCheckString = Array.from(urlParams.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');
            
        const secretKey = crypto.createHmac('sha256', 'WebAppData')
            .update(process.env.BOT_TOKEN || '')
            .digest();
            
        const calculatedHash = crypto.createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');
            
        return calculatedHash === hash;
    } catch (error) {
        logger.error('Error validating Telegram WebApp data:', error);
        return false;
    }
};

// CoinGecko proxy endpoint
app.get('/api/price/ton', async (req, res) => {
    try {
        // Validate Telegram WebApp data
        const initData = req.headers['x-telegram-init-data'] as string;
        if (!initData || !validateTelegramWebAppData(initData)) {
            return res.status(401).json({ error: 'Invalid Telegram WebApp data' });
        }

        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd&include_24hr_change=true',
            {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`CoinGecko API request failed: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        logger.error('Error fetching TON price:', error);
        res.status(500).json({ error: 'Failed to fetch TON price' });
    }
});

// API endpoints
app.get('/api/user/:id', (req, res) => {
    // Validate Telegram WebApp data
    const initData = req.headers['x-telegram-init-data'] as string;
    if (!initData || !validateTelegramWebAppData(initData)) {
        return res.status(401).json({ error: 'Invalid Telegram WebApp data' });
    }

    res.json({
        userId: req.params.id,
        level: 1,
        balance: 0,
        miningRate: 0,
        stakedAmount: 0,
        totalEarned: 0,
        referralCount: 0,
        referralEarnings: 0
    });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'webapp', 'index.html'));
});

// Export the Express API
export default app;

// For Vercel serverless functions
export const handler = app; 