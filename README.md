# TON Vault - Telegram Staking Bot Web Interface

A modern web interface for the TON Vault staking bot, built with vanilla JavaScript and deployed on Vercel.

## Features

### Price Tracking
- Real-time TON price updates from CoinGecko
- Price change percentage display
- Animated price updates

### Staking Management
- Current stake display
- Daily reward rate
- Total earned tracking
- Next reward countdown
- APY display
- Stake more functionality

### Network Statistics
- Total staked TON
- Validator count
- Network share percentage
- Mainnet status indicator

### Referral System
- Total referrals tracking
- Referral earnings display
- Referral link sharing
- Referral history with timestamps
- Network level progression

### User Interface
- Dark theme optimized for Telegram
- Responsive design for mobile devices
- Material Icons integration
- Animated transitions
- Real-time data updates

## Project Structure

```
/
├── api/                # Serverless API functions
│   ├── price.ts       # TON price endpoint
│   └── user/          # User-related endpoints
├── public/            # Static web files
│   ├── index.html    # Main HTML file
│   ├── styles.css    # Stylesheet
│   ├── app.js        # Application logic
│   └── assets/       # Images and icons
└── vercel.json       # Vercel deployment config
```

## Technology Stack

- Frontend: Vanilla JavaScript
- API: Vercel Serverless Functions
- Price Data: CoinGecko API
- Hosting: Vercel
- Blockchain: TON (The Open Network)

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd ton-vault
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with:
```
BOT_TOKEN=your_telegram_bot_token
```

4. Run locally:
```bash
npm run dev
```

## Deployment

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## API Endpoints

### GET /api/price
- Returns current TON price and 24h change
- No authentication required
- Data from CoinGecko

### GET /api/user/[id]
- Returns user data and staking information
- Requires Telegram WebApp authentication
- Protected endpoint

## Environment Variables

- `BOT_TOKEN`: Telegram bot token (required)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Contact

For support or inquiries, contact through the Telegram bot. 
