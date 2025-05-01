# TON Staking Bot

A Telegram bot for staking TON tokens with referral system and daily rewards.

## Features

- 🔐 Secure TON token staking
- 💰 Daily rewards distribution
- 👥 Multi-level referral system
- 📊 Real-time balance tracking
- 🔄 Automatic rewards calculation
- 👨‍💼 Admin panel for management

## Prerequisites

- Node.js v16 or higher
- MongoDB
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- TON wallet for handling transactions

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ton-staking-bot.git
cd ton-staking-bot
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment file and fill in your values:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```
BOT_TOKEN=your_bot_token_here
MONGODB_URI=your_mongodb_uri_here
TON_NETWORK=mainnet
TON_ENDPOINT=https://toncenter.com/api/v2/jsonRPC
MIN_STAKE_AMOUNT=100
MAX_STAKE_AMOUNT=10000
DAILY_REWARD_RATE=2
LOCK_PERIOD_DAYS=7
ADMIN_TELEGRAM_ID=your_telegram_id_here
JWT_SECRET=your_jwt_secret_here
```

## Development

Start the bot in development mode:
```bash
npm run dev
```

## Production

Build and start the bot in production:
```bash
npm run build
npm start
```

## Commands

- `/start` - Start the bot and get your referral link
- `/stake` - Stake TON tokens
- `/withdraw` - Withdraw tokens and rewards
- `/balance` - Check your current balance and rewards
- `/referral` - View your referral statistics
- `/help` - Show help information

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Security

If you discover any security-related issues, please email security@yourdomain.com instead of using the issue tracker.

## Support

For support, please join our [Telegram group](https://t.me/your_support_group) or create an issue in the repository. 