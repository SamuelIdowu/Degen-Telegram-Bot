import { tokenMonitor } from './modules/tokenMonitor';
import { rugChecker } from './modules/rugChecker';
import { botConfig } from './core/config';
import { logError } from './core/utils';
import chalk from 'chalk';

// Import the telegram bot to start it
import './bot/telegramBot';

console.log(chalk.blue('🚀 Starting Unified Solana Telegram Bot...'));

// Set up event listeners for token monitoring
tokenMonitor.on('newToken', async (tokenData) => {
  try {
    console.log(chalk.cyan(`🔍 New token detected: ${tokenData.baseInfo.baseAddress}`));
    
    // Analyze the token with rug checker
    const analyzedToken = await rugChecker.analyzeToken(tokenData);
    
    // Check if token passes security filters
    const isSafe = rugChecker.passesSecurityCheck(analyzedToken.rugCheckResult);
    
    if (isSafe && botConfig.autoSnipeEnabled) {
      console.log(chalk.green(`✅ Token ${analyzedToken.baseInfo.baseAddress} passed security check - ready for snipe!`));
      // TODO: Implement sniper module
    } else {
      console.log(chalk.yellow(`⚠️ Token ${analyzedToken.baseInfo.baseAddress} did not pass security check`));
    }
    
  } catch (error) {
    logError(error, 'Processing new token');
  }
});

tokenMonitor.on('monitoringStarted', () => {
  console.log(chalk.green('✅ Token monitoring started successfully'));
});

tokenMonitor.on('monitoringError', (error) => {
  console.error(chalk.red('❌ Token monitoring error:'), error);
});

// Set up event listeners for rug checker
rugChecker.on('analysisComplete', (analyzedToken) => {
  console.log(chalk.green(`✅ Rug analysis completed for ${analyzedToken.baseInfo.baseAddress}`));
});

rugChecker.on('progress', (completed, total) => {
  console.log(chalk.blue(`📊 Analysis progress: ${completed}/${total}`));
});

// Start the token monitoring
async function startBot() {
  try {
    await tokenMonitor.startMonitoring();
    console.log(chalk.green('🎯 Bot is ready and monitoring for new tokens!'));
  } catch (error) {
    logError(error, 'Starting bot');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n🛑 Shutting down bot...'));
  tokenMonitor.stopMonitoring();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n🛑 Shutting down bot...'));
  tokenMonitor.stopMonitoring();
  process.exit(0);
});

// Start the bot
startBot(); 