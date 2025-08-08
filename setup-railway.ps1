#!/usr/bin/env powershell

Write-Host "🚂 Railway Deployment Setup Script" -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue

# Check if Railway CLI is installed
$railwayExists = Get-Command railway -ErrorAction SilentlyContinue
if (-not $railwayExists) {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Red
    npm install -g @railway/cli
} else {
    Write-Host "✅ Railway CLI found" -ForegroundColor Green
}

# Login to Railway
Write-Host ""
Write-Host "🔐 Please login to Railway..." -ForegroundColor Yellow
railway login

# Initialize Railway project
Write-Host ""
Write-Host "🚀 Initializing Railway project..." -ForegroundColor Cyan
railway init

Write-Host ""
Write-Host "⚙️ Setting up environment variables..." -ForegroundColor Magenta
Write-Host "Please provide the following values:" -ForegroundColor Yellow

# Get Bot Token
$BOT_TOKEN = Read-Host "Enter your Telegram Bot Token"
railway variables set BOT_TOKEN="$BOT_TOKEN"

# Get Admin Chat ID
$ADMIN_CHAT_ID = Read-Host "Enter your Admin Chat ID"
railway variables set ADMIN_CHAT_ID="$ADMIN_CHAT_ID"

# Get RPC Endpoint
Write-Host ""
Write-Host "For Solana RPC endpoints, you can:" -ForegroundColor Yellow
Write-Host "1. Use free Helius (recommended): https://helius.xyz" -ForegroundColor Green
Write-Host "2. Use default Solana RPC (rate limited)" -ForegroundColor Yellow
Write-Host ""
$RPC_ENDPOINT = Read-Host "Enter your RPC endpoint (or press Enter for default)"
if ([string]::IsNullOrEmpty($RPC_ENDPOINT)) {
    $RPC_ENDPOINT = "https://api.mainnet-beta.solana.com"
}
railway variables set RPC_ENDPOINT="$RPC_ENDPOINT"

# WebSocket endpoint
$WS_ENDPOINT = $RPC_ENDPOINT -replace "https:", "wss:"
railway variables set RPC_WEBSOCKET_ENDPOINT="$WS_ENDPOINT"

# Set default environment variables
Write-Host ""
Write-Host "🔧 Setting default configuration..." -ForegroundColor Cyan
railway variables set NODE_ENV="production"
railway variables set MAX_RISK_SCORE="50000"
railway variables set AUTO_SNIPE_ENABLED="false"
railway variables set RUGCHECK_DELAY_MS="1000"

Write-Host ""
Write-Host "✅ Environment variables configured!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Current variables:" -ForegroundColor Cyan
railway variables

Write-Host ""
Write-Host "🚀 Ready to deploy! Run:" -ForegroundColor Green
Write-Host "   railway up" -ForegroundColor White
Write-Host ""
Write-Host "📊 After deployment, check:" -ForegroundColor Cyan
Write-Host "   railway logs    # View logs" -ForegroundColor White
Write-Host "   railway open    # Open in browser" -ForegroundColor White
Write-Host "   railway status  # Check status" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Your Solana Telegram bot will be running 24/7 on Railway!" -ForegroundColor Green
