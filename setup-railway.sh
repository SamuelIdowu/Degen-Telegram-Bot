#!/bin/bash

echo "🚂 Railway Deployment Setup Script"
echo "=================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
else
    echo "✅ Railway CLI found"
fi

# Login to Railway
echo ""
echo "🔐 Please login to Railway..."
railway login

# Initialize Railway project
echo ""
echo "🚀 Initializing Railway project..."
railway init

echo ""
echo "⚙️ Setting up environment variables..."
echo "Please provide the following values:"

# Get Bot Token
read -p "Enter your Telegram Bot Token: " BOT_TOKEN
railway variables set BOT_TOKEN="$BOT_TOKEN"

# Get Admin Chat ID
read -p "Enter your Admin Chat ID: " ADMIN_CHAT_ID
railway variables set ADMIN_CHAT_ID="$ADMIN_CHAT_ID"

# Get RPC Endpoint
echo ""
echo "For Solana RPC endpoints, you can:"
echo "1. Use free Helius (recommended): https://helius.xyz"
echo "2. Use default Solana RPC (rate limited)"
echo ""
read -p "Enter your RPC endpoint (or press Enter for default): " RPC_ENDPOINT
if [ -z "$RPC_ENDPOINT" ]; then
    RPC_ENDPOINT="https://api.mainnet-beta.solana.com"
fi
railway variables set RPC_ENDPOINT="$RPC_ENDPOINT"

# WebSocket endpoint
WS_ENDPOINT="${RPC_ENDPOINT/https:/wss:}"
railway variables set RPC_WEBSOCKET_ENDPOINT="$WS_ENDPOINT"

# Set default environment variables
echo ""
echo "🔧 Setting default configuration..."
railway variables set NODE_ENV="production"
railway variables set MAX_RISK_SCORE="50000"
railway variables set AUTO_SNIPE_ENABLED="false"
railway variables set RUGCHECK_DELAY_MS="1000"

echo ""
echo "✅ Environment variables configured!"
echo ""
echo "📋 Current variables:"
railway variables

echo ""
echo "🚀 Ready to deploy! Run:"
echo "   railway up"
echo ""
echo "📊 After deployment, check:"
echo "   railway logs    # View logs"
echo "   railway open    # Open in browser"
echo "   railway status  # Check status"
echo ""
echo "🎉 Your Solana Telegram bot will be running 24/7 on Railway!"
