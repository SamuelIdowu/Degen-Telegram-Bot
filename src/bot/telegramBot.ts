import TelegramBot from 'node-telegram-bot-api';
import { BOT_TOKEN, ADMIN_CHAT_ID } from '../core/config.js';
import { tokenMonitor } from '../modules/tokenMonitor.js';
import { rugChecker } from '../modules/rugChecker.js';
import { formatTokenInfo, getLatestTokens, findTokenByMint } from '../core/utils.js';
import { TokenData } from '../types/index.js';
import chalk from 'chalk';

// Initialize the Telegram Bot
const bot = new TelegramBot(BOT_TOKEN!, { polling: true });

// Command: /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `🤖 Welcome to the Solana Token Bot!

Available commands:
/start - Show this help message
/status - Check bot status and latest tokens
/snipe - Start monitoring for next token to snipe
/report <mint> - Get detailed report for specific token
/stop - Stop token monitoring

The bot monitors new tokens on Raydium and analyzes their rug pull risk.`;

  bot.sendMessage(chatId, welcomeMessage);
});

// Command: /status
bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;

  // Check monitoring status
  const statusMessage = tokenMonitor.isActive() 
    ? '🔍 Monitoring is active. Looking for new tokens...'
    : '⏹️ Monitoring is not active.';

  bot.sendMessage(chatId, statusMessage);

  // Get latest tokens
  const latestTokens = getLatestTokens(tokenMonitor.getDataPath(), 3);

  if (latestTokens.length > 0) {
    bot.sendMessage(chatId, '📊 Latest tokens detected:');
    latestTokens.forEach(token => {
      bot.sendMessage(chatId, formatTokenInfo(token), { parse_mode: 'Markdown' });
    });
  } else {
    bot.sendMessage(chatId, 'No tokens detected yet.');
  }
});

// Command: /snipe
bot.onText(/\/snipe/, async (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, '🎯 Starting snipe mode... Waiting for next token...');
  
  // Set up one-time listener for next token
  const tokenHandler = async (tokenData: TokenData) => {
    try {
      // Remove the listener to avoid multiple triggers
      tokenMonitor.removeListener('newToken', tokenHandler);
      
      // Analyze the token
      const analyzedToken = await rugChecker.analyzeToken(tokenData);
      const riskAssessment = rugChecker.getRiskAssessment(analyzedToken.rugCheckResult || null);
      
      // Create inline keyboard for approval
      const keyboard = {
        inline_keyboard: [
          [
            { text: '✅ Approve Snipe', callback_data: `approve:${analyzedToken.baseInfo.baseAddress}` },
            { text: '❌ Skip', callback_data: `skip:${analyzedToken.baseInfo.baseAddress}` }
          ]
        ]
      };
      
      const snipeMessage = `🎯 **Token Ready for Snipe!**

${formatTokenInfo(analyzedToken)}

**Risk Assessment:**
🔄 Level: ${riskAssessment.level}
💡 Recommendation: ${riskAssessment.recommendation}
📝 Summary: ${riskAssessment.summary}

Would you like to proceed with the snipe?`;

      bot.sendMessage(chatId, snipeMessage, { 
        parse_mode: 'Markdown',
        reply_markup: keyboard 
      });
      
    } catch (error) {
      console.error('Error in snipe handler:', error);
      bot.sendMessage(chatId, '❌ Error analyzing token. Please try again.');
    }
  };
  
  // Add the listener
  tokenMonitor.on('newToken', tokenHandler);
  
  // Set timeout to remove listener if no token found
  setTimeout(() => {
    tokenMonitor.removeListener('newToken', tokenHandler);
    bot.sendMessage(chatId, '⏰ No new tokens detected within timeout period.');
  }, 60000); // 1 minute timeout
});

// Command: /report <mint>
bot.onText(/\/report (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const mintAddress = match![1].trim();
  
  try {
    const token = findTokenByMint(tokenMonitor.getDataPath(), mintAddress);
    
    if (token) {
      // If token doesn't have rug check result, analyze it
      let analyzedToken = token;
      if (!token.rugCheckResult) {
        bot.sendMessage(chatId, '🔍 Analyzing token... Please wait.');
        analyzedToken = await rugChecker.analyzeToken(token);
      }
      
      const riskAssessment = rugChecker.getRiskAssessment(analyzedToken.rugCheckResult || null);
      
      const reportMessage = `📊 **Token Report**

${formatTokenInfo(analyzedToken)}

**Risk Assessment:**
🔄 Level: ${riskAssessment.level}
💡 Recommendation: ${riskAssessment.recommendation}
📝 Summary: ${riskAssessment.summary}`;

      bot.sendMessage(chatId, reportMessage, { parse_mode: 'Markdown' });
    } else {
      bot.sendMessage(chatId, `❌ Token with mint address \`${mintAddress}\` not found in database.`, { parse_mode: 'Markdown' });
    }
  } catch (error) {
    console.error('Error in report handler:', error);
    bot.sendMessage(chatId, '❌ Error retrieving token report. Please try again.');
  }
});

// Handle callback queries (inline keyboard buttons)
bot.on('callback_query', async (query) => {
  const chatId = query.message!.chat.id;
  const [action, mintAddress] = query.data!.split(':');
  
  try {
    if (action === 'approve') {
      bot.sendMessage(chatId, `🚀 Executing snipe for token: \`${mintAddress}\``, { parse_mode: 'Markdown' });
      
      // TODO: Implement actual sniper module
      // await executeSnipe(mintAddress);
      
      bot.sendMessage(chatId, '✅ Snipe executed successfully! (Dry run mode)');
      
    } else if (action === 'skip') {
      bot.sendMessage(chatId, `⏭️ Skipped token: \`${mintAddress}\``, { parse_mode: 'Markdown' });
    }
    
    // Answer the callback query
    bot.answerCallbackQuery(query.id);
    
  } catch (error) {
    console.error('Error in callback handler:', error);
    bot.sendMessage(chatId, '❌ Error processing request. Please try again.');
    bot.answerCallbackQuery(query.id, { text: 'Error occurred' });
  }
});

// Command: /stop
bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '⏹️ Stopping token monitoring...');
  tokenMonitor.stopMonitoring();
});

// Log errors
bot.on('polling_error', (error) => {
  console.error(`Polling error: ${error?.message}`);
});

// Admin-only commands
if (ADMIN_CHAT_ID) {
  // Command: /admin - Admin panel
  bot.onText(/\/admin/, (msg) => {
    const chatId = msg.chat.id;
    
    if (chatId.toString() === ADMIN_CHAT_ID) {
      const adminMessage = `🔧 **Admin Panel**

Bot Status: ${tokenMonitor.isActive() ? '🟢 Active' : '🔴 Inactive'}
Monitoring: ${tokenMonitor.isActive() ? 'Running' : 'Stopped'}

Admin Commands:
/admin - Show this panel
/restart - Restart monitoring
/config - Show current configuration`;

      bot.sendMessage(chatId, adminMessage, { parse_mode: 'Markdown' });
    }
  });
}

console.log('✅ Telegram Bot is up and running!');
