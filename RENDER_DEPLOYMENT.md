# Deploying Solana Telegram Bot on Render

This guide explains how to deploy your Solana Telegram bot on Render with continuous operation.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. Your bot's source code on GitHub, GitLab, or Bitbucket
3. Required environment variables prepared

## Deployment Steps

### 1. Prepare Your Repository

Make sure your repository contains:
- All source code in the `src/` directory
- `package.json` and `package-lock.json`
- `tsconfig.json`
- `server.js` (with keep-alive logic)
- `.gitignore`

### 2. Connect Your Repository to Render

1. Log in to your Render dashboard
2. Click "New +" and select "Web Service"
3. Connect your GitHub/GitLab/Bitbucket account
4. Select your bot repository
5. Choose the branch to deploy (typically `main` or `master`)

### 3. Configure the Web Service

- **Environment**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Region**: Select your preferred region (e.g., Oregon, Frankfurt, etc.)

### 4. Set Environment Variables

Add the following environment variables in the Render dashboard:

```
BOT_TOKEN=your_telegram_bot_token_here
ADMIN_CHAT_ID=your_admin_chat_id_here
RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=your_api_key_here
RPC_WEBSOCKET_ENDPOINT=wss://mainnet.helius-rpc.com/?api-key=your_api_key_here
MAX_RISK_SCORE=50000
AUTO_SNIPE_ENABLED=false
RUGCHECK_DELAY_MS=1000
NODE_ENV=production
```

### 5. Review and Deploy

1. Set the instance type to "Free" to use the free tier
2. Click "Create Web Service"
3. Render will automatically build and deploy your bot

## Keep-Alive Configuration

The bot includes a built-in keep-alive mechanism that periodically pings its own health endpoint to prevent the free service from sleeping. This runs every 14 minutes to stay under timeout thresholds.

## Monitoring Your Deployment

1. Check the Render dashboard for deployment logs
2. Verify the bot is responding by visiting your service's health endpoint
3. Test your bot by sending `/start` command to your Telegram bot

## Important Notes

- Render's free tier has 750 free hours per month per account
- The keep-alive ping mechanism helps prevent the service from sleeping
- The bot monitors Solana for new tokens and processes them continuously
- Make sure to monitor your usage to stay within Render's free limits

## Troubleshooting

### If the bot stops responding:
1. Check the Render logs in your dashboard
2. Verify all environment variables are set correctly
3. Confirm your RPC endpoint is accessible

### To restart the service:
1. Go to your service in the Render dashboard
2. Click "Manual Deploy" to restart the service

### Monitoring Solana connections:
The Solana WebSocket connection might disconnect occasionally. The bot is designed to continue operating and will reconnect when needed.

## Scaling Up

When your bot becomes more popular and usage increases:
1. Consider upgrading to a paid plan for increased uptime
2. Add a load balancer if you need higher availability
3. Consider using Render's dedicated instances for better performance