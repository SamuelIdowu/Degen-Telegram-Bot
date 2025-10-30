# Unified Solana Telegram Bot

A comprehensive Solana token monitoring and sniping bot with rug pull detection, accessible via Telegram.

## Features

- 🔍 **Real-time Token Monitoring** - Monitors new tokens on Raydium DEX
- 🛡️ **Rug Pull Detection** - Integrates with RugCheck API for risk analysis
- 🤖 **Telegram Bot Interface** - Easy-to-use commands for monitoring and sniping
- 📊 **Risk Assessment** - Automatic scoring and recommendations
- ⚡ **Sniper Module** - Automated trading execution (placeholder implementation)
- ⭕ **Render Deployment Ready** - Pre-configured for free deployment with keep-alive mechanism

## Architecture

```
unified-solana-telegram-bot/
├── src/
│   ├── core/           # Shared configuration and utilities
│   ├── modules/        # Core functionality modules
│   │   ├── tokenMonitor.ts
│   │   ├── rugChecker.ts
│   │   └── sniper.ts
│   ├── bot/           # Telegram bot interface
│   └── types/         # TypeScript type definitions
├── data/              # Token data storage
├── dist/              # Compiled JavaScript output
├── RENDER_DEPLOYMENT.md    # Deployment instructions for Render
├── server.js          # HTTP server with keep-alive mechanism
└── package.json       # Project dependencies and scripts
```

## Quick Start

### 1. Prerequisites

- Node.js 18+
- TypeScript
- Telegram Bot Token (from @BotFather)
- Solana RPC endpoint (Helius recommended)

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd unified-solana-telegram-bot

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### 3. Configuration

Edit `.env` file with your credentials:

```env
# Telegram Bot Configuration
BOT_TOKEN=your_telegram_bot_token_here
ADMIN_CHAT_ID=your_chat_id_here

# Solana RPC Configuration
RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=your_api_key_here
RPC_WEBSOCKET_ENDPOINT=wss://mainnet.helius-rpc.com/?api-key=your_api_key_here

# Bot Settings
MAX_RISK_SCORE=50000
AUTO_SNIPE_ENABLED=false
RUGCHECK_DELAY_MS=1000
NODE_ENV=production
```

### 4. Running the Bot

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start

# Run only the bot
npm run bot

# Run only monitoring
npm run monitor
```

## Deployment to Render (Free Tier)

This bot is configured for free deployment on Render with a built-in keep-alive mechanism to prevent the service from sleeping. See `RENDER_DEPLOYMENT.md` for complete deployment instructions.

### Render Deployment Features:
- Built-in keep-alive ping mechanism (every 14 minutes)
- Health check endpoint at `/health`
- Automatic compilation during build
- Environment variable support
- Continuous operation capabilities

## Telegram Commands

| Command          | Description                                 |
| ---------------- | ------------------------------------------- |
| `/start`         | Show welcome message and available commands |
| `/status`        | Check bot status and latest detected tokens |
| `/snipe`         | Start monitoring for next token to snipe    |
| `/report <mint>` | Get detailed report for specific token      |
| `/stop`          | Stop token monitoring                       |

### Snipe Flow

1. Send `/snipe` command
2. Bot waits for next new token
3. Token is automatically analyzed for rug risk
4. Bot presents token info with inline keyboard
5. Choose "Approve Snipe" or "Skip"

## Configuration Options

### Environment Variables

- `BOT_TOKEN` - Your Telegram bot token
- `ADMIN_CHAT_ID` - Admin chat ID for admin commands
- `RPC_ENDPOINT` - Solana RPC endpoint
- `MAX_RISK_SCORE` - Maximum risk score for auto-sniping (default: 50000)
- `AUTO_SNIPE_ENABLED` - Enable automatic sniping (default: false)
- `RUGCHECK_DELAY_MS` - Delay between rug check API calls (default: 1000)

### Risk Assessment Levels

- **LOW** (Score < 10,000) - Generally safe for investment
- **MEDIUM** (Score < 30,000) - Consider carefully before investing
- **HIGH** (Score < 50,000) - Investment not recommended
- **CRITICAL** (Score ≥ 50,000) - Avoid at all costs

## Development

### Project Structure

- **TokenMonitor** - Monitors Solana blockchain for new tokens
- **RugChecker** - Analyzes tokens using RugCheck API
- **Sniper** - Handles trading execution (placeholder)
- **TelegramBot** - User interface and command handling

### Adding New Features

1. **New Analysis Provider**: Extend `RugChecker` class
2. **New Trading Strategy**: Implement in `Sniper` class
3. **New Commands**: Add to `telegramBot.ts`

### Testing

```bash
# Test token monitoring
npm run monitor

# Test bot commands
npm run bot

# Full integration test
npm run dev
```

## Data Storage

Token data is stored in `data/tokens.json` with the following structure:

```json
{
  "lpSignature": "transaction_signature",
  "creator": "wallet_address",
  "timestamp": "2024-12-02T10:05:50.984Z",
  "baseInfo": {
    "baseAddress": "token_mint_address",
    "baseDecimals": 9,
    "baseLpAmount": 6700000000
  },
  "quoteInfo": {
    "quoteAddress": "So11111111111111111111111111111111111111112",
    "quoteDecimals": 9,
    "quoteLpAmount": 702
  },
  "logs": ["transaction_logs_array"],
  "rugCheckResult": {
    "tokenProgram": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    "risks": [...],
    "score": 28038
  }
}
```

## Troubleshooting

### Common Issues

1. **Bot not responding**: Check `BOT_TOKEN` in `.env`
2. **No tokens detected**: Verify RPC endpoint connectivity
3. **RugCheck API errors**: Check rate limiting and API key
4. **Build errors**: Ensure TypeScript is installed globally
5. **Service sleeping on Render**: Verify keep-alive mechanism is working

### Logs

- Console logs show real-time monitoring status
- Error logs are saved to `data/error.log`
- Token data is stored in `data/tokens.json`

## Keep-Alive Mechanism

This bot includes a built-in keep-alive mechanism that pings its own health endpoint every 14 minutes to prevent free tier services like Render from sleeping. This ensures continuous monitoring of Solana for new tokens.

## Security Considerations

- ⚠️ **Never share your `.env` file**
- 🔐 **Use secure RPC endpoints**
- 💰 **Test with small amounts first**
- 🛡️ **Review risk assessments before trading**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Disclaimer

This bot is for educational purposes. Trading cryptocurrencies involves significant risk. Always do your own research and never invest more than you can afford to lose.
