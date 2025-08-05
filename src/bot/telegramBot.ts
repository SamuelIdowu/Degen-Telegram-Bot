import TelegramBot from 'node-telegram-bot-api';
import { BOT_TOKEN } from '../core/config';
import { tokenMonitor } from '../modules/tokenMonitor';
import { formatTokenInfo, getLatestTokens } from '../core/utils';

// Initialize the Telegram Bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Command: /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '🤖 Welcome to the Solana Token Bot! You can monitor tokens and check their risk level here.');
});

// Command: /status
bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  if (tokenMonitor.isActive()) {
    bot.sendMessage(chatId, '🔍 Monitoring is active. Looking for new tokens...');
  } else {
    bot.sendMessage(chatId, '⏹️ Monitoring is not active. Please try again later.');
  }

  const latestTokens = getLatestTokens(tokenMonitor.getDataPath(), 5);

  if (latestTokens.length > 0) {
    bot.sendMessage(chatId, 'Here are the latest tokens detected:');
    latestTokens.forEach(token => {
      bot.sendMessage(chatId, formatTokenInfo(token));
    });
  } else {
    bot.sendMessage(chatId, 'No tokens detected yet.');
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

// Start monitoring tokens
tokenMonitor.startMonitoring();

console.log('✅ Telegram Bot is up and running!');
