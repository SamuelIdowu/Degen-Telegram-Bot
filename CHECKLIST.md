# 🚂 Railway Deployment Checklist

Before deploying your Solana Telegram Bot to Railway, ensure you have completed all these steps:

## 📋 Pre-Deployment Requirements

### ✅ Telegram Bot Setup
- [ ] Created bot via [@BotFather](https://t.me/BotFather)
- [ ] Obtained `BOT_TOKEN`
- [ ] Got your chat ID from [@userinfobot](https://t.me/userinfobot)
- [ ] Tested bot responds to messages

### ✅ RPC Configuration
- [ ] Obtained Helius API key (recommended) from [helius.xyz](https://helius.xyz)
- [ ] OR confirmed using default Solana RPC (rate limited)
- [ ] Tested RPC endpoint accessibility

### ✅ Railway Account
- [ ] Signed up at [railway.app](https://railway.app)
- [ ] Installed Railway CLI: `npm install -g @railway/cli`
- [ ] Logged in: `railway login`

## 🚀 Deployment Steps

### Option A: Quick Setup (Automated)
```powershell
# For Windows
.\setup-railway.ps1

# For Linux/Mac
./setup-railway.sh
```

### Option B: Manual Setup

1. **Initialize Railway Project**
   ```bash
   railway init
   ```

2. **Set Required Environment Variables**
   ```bash
   railway variables set BOT_TOKEN="your_bot_token_here"
   railway variables set ADMIN_CHAT_ID="your_chat_id_here"
   railway variables set RPC_ENDPOINT="your_rpc_endpoint"
   railway variables set RPC_WEBSOCKET_ENDPOINT="your_websocket_endpoint"
   ```

3. **Set Optional Variables**
   ```bash
   railway variables set NODE_ENV="production"
   railway variables set MAX_RISK_SCORE="50000"
   railway variables set AUTO_SNIPE_ENABLED="false"
   railway variables set RUGCHECK_DELAY_MS="1000"
   ```

4. **Deploy**
   ```bash
   railway up
   ```

## 🔍 Post-Deployment Verification

### ✅ Deployment Health
- [ ] Check health endpoint: `/health` returns 200 OK
- [ ] View logs: `railway logs` shows no errors
- [ ] Service status: `railway status` shows "Active"

### ✅ Bot Functionality
- [ ] Send `/start` to your bot - receives welcome message
- [ ] Send `/status` - shows monitoring status
- [ ] Check logs show "✅ Telegram Bot is up and running!"
- [ ] Check logs show "✅ Token monitoring started successfully"

### ✅ Monitoring Setup
- [ ] Bot responds to commands within 5 seconds
- [ ] No error messages in Railway logs
- [ ] Health check passing in Railway dashboard

## 🛠️ Troubleshooting

### Common Issues & Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| Bot not responding | No response to `/start` | Check `BOT_TOKEN` is correctly set |
| Build failure | TypeScript errors in logs | Run `npm run build` locally first |
| RPC errors | Connection timeout messages | Verify RPC endpoint is accessible |
| Health check failing | Service marked as unhealthy | Check server.js is running properly |

### Debug Commands
```bash
# View all environment variables
railway variables

# Watch logs in real-time
railway logs --follow

# Restart the service
railway redeploy

# Open service in browser
railway open

# Connect to service shell
railway shell
```

## 📊 Expected Behavior

After successful deployment, your bot should:

1. **Start up sequence** (visible in logs):
   ```
   🚀 HTTP server listening on port 3000
   📊 Health check available at: http://localhost:3000
   🚂 Railway deployment ready
   ✅ Bot application started successfully
   🚀 Starting Unified Solana Telegram Bot...
   ✅ Telegram Bot is up and running!
   ✅ Token monitoring started successfully
   🎯 Bot is ready and monitoring for new tokens!
   ```

2. **Respond to commands**:
   - `/start` → Welcome message with command list
   - `/status` → Current monitoring status
   - `/snipe` → Start snipe mode waiting for next token

3. **Monitor for new tokens** (visible in logs):
   ```
   🔍 New token detected: [mint_address]
   ✅ Rug analysis completed for [mint_address]
   ```

## 🔐 Security Checklist

- [ ] No sensitive data in source code
- [ ] All secrets stored as environment variables
- [ ] `.env` files not committed to Git
- [ ] API keys properly masked in logs
- [ ] Auto-sniping disabled for testing

## 🎉 Success Indicators

Your deployment is successful when:

- ✅ Railway dashboard shows service as "Active"
- ✅ Health check at `/health` returns service info
- ✅ Bot responds to `/start` command
- ✅ Logs show monitoring started successfully
- ✅ No error messages in the logs

---

**🚂 Ready for Railway!** 

Your Solana Telegram Bot is now configured for Railway deployment and will run 24/7 monitoring new tokens and providing rug pull analysis.
