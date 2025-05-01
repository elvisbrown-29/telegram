import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

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
        console.error('Error validating Telegram WebApp data:', error);
        return false;
    }
};

export default function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate Telegram WebApp data
    const initData = req.headers['x-telegram-init-data'] as string;
    if (!initData || !validateTelegramWebAppData(initData)) {
        return res.status(401).json({ error: 'Invalid Telegram WebApp data' });
    }

    const { id } = req.query;

    res.json({
        userId: id,
        level: 1,
        balance: 0,
        miningRate: 0,
        stakedAmount: 0,
        totalEarned: 0,
        referralCount: 0,
        referralEarnings: 0
    });
} 