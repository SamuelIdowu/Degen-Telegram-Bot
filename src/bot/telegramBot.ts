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

The bot monitors new tokens on Raydium and analyzes their rug pull risk.`;

  // Create inline keyboard with command buttons
  const keyboard = {
    inline_keyboard: [
      [
        { text: '📊 Status', callback_data: '/status' },
        { text: '🎯 Snipe', callback_data: '/snipe' }
      ],
      [
        { text: '🔍 Report', callback_data: '/report' },
        { text: '⏹️ Stop', callback_data: '/stop' }
      ]
    ]
  };

  bot.sendMessage(chatId, welcomeMessage, { 
    reply_markup: keyboard 
  });
});

// Command: /status
bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;

  // Check monitoring status
  const statusMessage = tokenMonitor.isActive() 
    ? '🔍 Monitoring is active. Looking for new tokens...'
    : '⏹️ Monitoring is not active.';

  bot.sendMessage(chatId, statusMessage);

  // Get latest tokens (only from last 2 days)
  const latestTokens = getLatestTokens(tokenMonitor.getDataPath(), 3, 2);

  if (latestTokens.length > 0) {
    bot.sendMessage(chatId, '📊 Latest tokens detected:');
    latestTokens.forEach(token => {
      bot.sendMessage(chatId, formatTokenInfo(token), { parse_mode: 'Markdown' });
    });
  } else {
    bot.sendMessage(chatId, 'No recent tokens detected.');
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
    const token = findTokenByMint(tokenMonitor.getDataPath(), mintAddress, 2); // Only from last 2 days
    
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
      bot.sendMessage(chatId, `❌ Token with mint address \`${mintAddress}\` not found in recent database (last 2 days).`, { parse_mode: 'Markdown' });
    }
  } catch (error) {
    console.error('Error in report handler:', error);
    bot.sendMessage(chatId, '❌ Error retrieving token report. Please try again.');
  }
});

// Handle callback queries (inline keyboard buttons)
bot.on('callback_query', async (query) => {
  const chatId = query.message!.chat.id;
  const data = query.data!;
  
  // Check if this is a command button (starts with /)
  if (data.startsWith('/')) {
    // Handle command buttons
    if (data === '/status') {
      // Simulate /status command
      const latestTokens = getLatestTokens(tokenMonitor.getDataPath(), 3, 2);

      if (latestTokens.length > 0) {
        bot.sendMessage(chatId, '📊 Latest tokens detected:');
        latestTokens.forEach(token => {
          bot.sendMessage(chatId, formatTokenInfo(token), { parse_mode: 'Markdown' });
        });
      } else {
        bot.sendMessage(chatId, 'No recent tokens detected.');
      }
    } else if (data === '/snipe') {
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
          const approvalKeyboard = {
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
            reply_markup: approvalKeyboard 
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
    } else if (data === '/report') {
      bot.sendMessage(chatId, '📋 To get a report for a specific token, please use the /report command followed by the token address. Example: /report <token_address>');
    } else if (data === '/stop') {
      bot.sendMessage(chatId, '⏹️ Stopping token monitoring...');
      tokenMonitor.stopMonitoring();
    }
    
    // Answer the callback query
    bot.answerCallbackQuery(query.id);
    return;
  }
  
  // Handle original approval/skip buttons
  const [action, mintAddress] = data.split(':');
  
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

// Additional command handler for /report when used without parameters
bot.onText(/\/report$/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '📋 Please provide a token address. Example: /report <token_address>');
});

// Command: /commands - Show command buttons again
bot.onText(/\/commands/, (msg) => {
  const chatId = msg.chat.id;
  const message = '📋 Here are the available commands:';
  
  // Create inline keyboard with command buttons
  const keyboard = {
    inline_keyboard: [
      [
        { text: '📊 Status', callback_data: '/status' },
        { text: '🎯 Snipe', callback_data: '/snipe' }
      ],
      [
        { text: '🔍 Report', callback_data: '/report' },
        { text: '⏹️ Stop', callback_data: '/stop' }
      ]
    ]
  };

  bot.sendMessage(chatId, message, { 
    reply_markup: keyboard 
  });
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
