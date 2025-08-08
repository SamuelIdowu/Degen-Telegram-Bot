# 🚂 Railway Deployment Guide

This guide will help you deploy the Unified Solana Telegram Bot to Railway.

## 📋 Prerequisites

1. **Telegram Bot**: Create a bot via [@BotFather](https://t.me/BotFather) and get your `BOT_TOKEN`
2. **Railway Account**: Sign up at [railway.app](https://railway.app)
3. **Helius RPC** (recommended): Get a free API key from [helius.xyz](https://helius.xyz)
4. **Admin Chat ID**: Get your Telegram chat ID from [@userinfobot](https://t.me/userinfobot)

## 🚀 Quick Deploy

### Option 1: Deploy via GitHub (Recommended)

1. **Fork this repository** to your GitHub account

2. **Connect to Railway**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your forked repository

3. **Set Environment Variables** in Railway dashboard:
   ```
   BOT_TOKEN=your_telegram_bot_token_here
   ADMIN_CHAT_ID=your_admin_chat_id_here
   RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=your_api_key
   RPC_WEBSOCKET_ENDPOINT=wss://mainnet.helius-rpc.com/?api-key=your_api_key
   NODE_ENV=production
   MAX_RISK_SCORE=50000
   AUTO_SNIPE_ENABLED=false
   RUGCHECK_DELAY_MS=1000
   ```

4. **Deploy**: Railway will automatically build and deploy your bot!

### Option 2: Deploy via Railway CLI

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize Project**:
   ```bash
   railway init
   ```

4. **Set Environment Variables**:
   ```bash
   railway variables set BOT_TOKEN=your_telegram_bot_token_here
   railway variables set ADMIN_CHAT_ID=your_admin_chat_id_here
   railway variables set RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=your_api_key
   railway variables set RPC_WEBSOCKET_ENDPOINT=wss://mainnet.helius-rpc.com/?api-key=your_api_key
   railway variables set NODE_ENV=production
   railway variables set MAX_RISK_SCORE=50000
   railway variables set AUTO_SNIPE_ENABLED=false
   railway variables set RUGCHECK_DELAY_MS=1000
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

## 🔧 Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `BOT_TOKEN` | Telegram bot token from @BotFather | `123456789:ABCdefGhIjKlMnOpQrStUvWxYz` |
| `ADMIN_CHAT_ID` | Your Telegram user/chat ID | `123456789` |
| `RPC_ENDPOINT` | Solana RPC endpoint | `https://mainnet.helius-rpc.com/?api-key=xxx` |
| `RPC_WEBSOCKET_ENDPOINT` | Solana WebSocket endpoint | `wss://mainnet.helius-rpc.com/?api-key=xxx` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MAX_RISK_SCORE` | Maximum risk score for auto-sniping | `50000` |
| `AUTO_SNIPE_ENABLED` | Enable automatic sniping | `false` |
| `RUGCHECK_DELAY_MS` | Delay between RugCheck API calls | `1000` |
| `NODE_ENV` | Environment mode | `production` |

## 🔍 How to Get Required Values

### 1. Telegram Bot Token
1. Message [@BotFather](https://t.me/BotFather)
2. Send `/newbot`
3. Follow the prompts to create your bot
4. Copy the token provided

### 2. Admin Chat ID
1. Message [@userinfobot](https://t.me/userinfobot)
2. Copy your user ID

### 3. Helius RPC API Key
1. Go to [helius.xyz](https://helius.xyz)
2. Create a free account
3. Create a new API key
4. Use in the RPC endpoints above

## 📊 Monitoring

### Health Check
- Your deployed service will have a health check at `/health`
- Railway automatically monitors this endpoint

### Viewing Logs
```bash
railway logs
```

### Service Status
```bash
railway status
```

## 🐛 Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check if `BOT_TOKEN` is correctly set
   - Verify bot is not already running elsewhere
   - Check Railway logs for errors

2. **Build failures**
   - Ensure all dependencies are in `package.json`
   - Check TypeScript compilation errors in logs

3. **Connection issues**
   - Verify RPC endpoints are accessible
   - Check Helius API key validity

4. **ES Module errors** (FIXED ✅)
   - Project now uses ES modules (`"type": "module"` in package.json)
   - TypeScript compiles to ES modules instead of CommonJS
   - All imports use modern `import` syntax

### Useful Railway Commands

```bash
# View environment variables
railway variables

# Restart service
railway redeploy

# Open service in browser
railway open

# Connect to service shell
railway shell
```

## 🔐 Security Best Practices

- ✅ Never commit `.env` files to Git
- ✅ Use environment variables for all secrets
- ✅ Regularly rotate API keys
- ✅ Monitor logs for unusual activity
- ✅ Start with small amounts when testing sniping

## ✨ Features After Deployment

Your bot will support these Telegram commands:

- `/start` - Welcome message and commands
- `/status` - Bot status and latest tokens
- `/snipe` - Start monitoring for sniping opportunities
- `/report <mint>` - Get detailed token analysis
- `/stop` - Stop token monitoring

## 🚀 Post-Deployment

1. **Test the bot**: Send `/start` to your deployed bot
2. **Monitor logs**: Use `railway logs` to watch activity
3. **Set up monitoring**: Railway provides built-in monitoring
4. **Scale if needed**: Railway auto-scales based on usage

## 📞 Support

If you encounter issues:
1. Check Railway logs: `railway logs`
2. Verify all environment variables are set
3. Test RPC endpoints manually
4. Check Telegram bot permissions

---

**🎉 Congratulations!** Your Solana Telegram bot is now running 24/7 on Railway!
