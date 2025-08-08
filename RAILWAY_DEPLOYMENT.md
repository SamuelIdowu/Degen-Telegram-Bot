# Railway Deployment Guide

## Prerequisites

1. Install Railway CLI: `npm install -g @railway/cli`
2. Create a Railway account at [railway.app](https://railway.app)

## Deployment Steps

### 1. Login to Railway

```bash
railway login
```

### 2. Initialize Railway Project

```bash
railway init
```

### 3. Set Environment Variables

```bash
# Set your bot token
railway variables set BOT_TOKEN=your_telegram_bot_token_here

# Set admin chat ID
railway variables set ADMIN_CHAT_ID=your_admin_chat_id_here

# Set other required environment variables
railway variables set NODE_ENV=production
```

### 4. Deploy to Railway

```bash
railway up
```

### 5. Open the Deployed Service

```bash
railway open
```

## Environment Variables Required

Make sure to set these environment variables in Railway:

- `BOT_TOKEN`: Your Telegram bot token from @BotFather
- `ADMIN_CHAT_ID`: Your Telegram chat ID for admin notifications
- `NODE_ENV`: Set to "production"
- Any other environment variables your bot requires

## Monitoring

- **Health Check**: Visit `/health` endpoint to check service status
- **Logs**: Use `railway logs` to view application logs
- **Status**: Use `railway status` to check deployment status

## Troubleshooting

### Common Issues:

1. **Build Failures**: Check that all dependencies are in `package.json`
2. **Port Issues**: Railway automatically sets the `PORT` environment variable
3. **Environment Variables**: Ensure all required variables are set in Railway dashboard
4. **Bot Not Responding**: Check logs for authentication errors

### Useful Commands:

```bash
# View logs
railway logs

# Check status
railway status

# Redeploy
railway up

# Open service
railway open

# View variables
railway variables
```

## Railway Advantages

- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments from Git
- ✅ Built-in monitoring
- ✅ Easy environment variable management
- ✅ Better support for background services
- ✅ No port binding issues
- ✅ TypeScript compilation support
- ✅ Automatic build process

## Recent Fixes Applied

✅ **TypeScript Errors Fixed:**

- Fixed undefined type issues in bot token initialization
- Fixed error handling in utility functions
- Fixed null/undefined type mismatches in rug checker
- Fixed transaction parsing null checks
- Updated all error handling to use proper type checking

✅ **Build Process:**

- Railway will automatically run `npm run railway:start`
- This builds TypeScript and starts the server
- Health check endpoint available at `/health`
