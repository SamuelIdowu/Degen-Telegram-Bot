# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2024-12-XX - Railway Deployment Fix

### 🔧 Fixed
- **ES Module Compatibility**: Fixed `ERR_REQUIRE_ESM` error that occurred during Railway deployment
  - Updated `package.json` to include `"type": "module"`
  - Updated `tsconfig.json` to compile to ES modules (`"module": "ESNext"`)
  - Updated `server.js` to use ES module import syntax
  - Replaced `require()` with dynamic `import()` for runtime module loading

### ⚡ Improved
- **Build Process**: Added `postinstall` script for automatic build on deployment
- **Railway Configuration**: Enhanced `railway.json` with better default environment variables
- **Documentation**: Created comprehensive Railway deployment guides and troubleshooting

### 📚 Added
- `DEPLOY_RAILWAY.md` - Step-by-step Railway deployment guide  
- `CHECKLIST.md` - Pre-deployment verification checklist
- `setup-railway.ps1` - PowerShell setup script for Windows
- `setup-railway.sh` - Bash setup script for Linux/Mac
- `.env.example` - Environment variables template

### 🔐 Security
- Removed hardcoded API keys from configuration files
- All sensitive data now uses environment variables only

## [1.0.0] - 2024-12-XX - Initial Release

### ✨ Features
- **Token Monitoring**: Real-time detection of new tokens on Raydium DEX
- **Rug Analysis**: Integration with RugCheck API for risk assessment
- **Telegram Bot**: Interactive commands for monitoring and sniping
- **Risk Scoring**: Automatic classification (LOW/MEDIUM/HIGH/CRITICAL)
- **Snipe Mode**: Manual approval system for token purchases

### 🏗️ Architecture
- Modular TypeScript codebase
- Event-driven token monitoring
- RESTful health check endpoint
- Persistent data storage (JSON-based)

### 🤖 Telegram Commands
- `/start` - Welcome message and command list
- `/status` - Bot status and latest detected tokens
- `/snipe` - Start monitoring for next token to snipe  
- `/report <mint>` - Get detailed analysis for specific token
- `/stop` - Stop token monitoring

---

## Migration Notes

### v1.0.0 → v1.1.0

If you're upgrading from v1.0.0, the ES modules changes require a rebuild:

```bash
npm run build
```

No other changes needed - all functionality remains the same.
