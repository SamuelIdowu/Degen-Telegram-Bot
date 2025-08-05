import { Connection, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';
import { BotConfig } from '../types';

// Load environment variables from the .env file
dotenv.config();

// Solana Configuration
const RPC_ENDPOINT = process.env.RPC_ENDPOINT ?? 'https://mainnet.helius-rpc.com/?api-key=cd716db1-6133-46b4-9f2f-59f5b72c329b';
const RPC_WEBSOCKET_ENDPOINT = process.env.RPC_WEBSOCKET_ENDPOINT ?? 'wss://mainnet.helius-rpc.com/?api-key=cd716db1-6133-46b4-9f2f-59f5b72c329b';

// Establish the Solana connection
export const solanaConnection = new Connection(RPC_ENDPOINT, {
  wsEndpoint: RPC_WEBSOCKET_ENDPOINT,
});

// The PublicKey for rayFee (Raydium fee address - trusted constant)
export const rayFee = new PublicKey('7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5');

// Telegram Bot Configuration
export const BOT_TOKEN = process.env.BOT_TOKEN;
export const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN environment variable is required');
}

// Bot configuration with defaults
export const botConfig: BotConfig = {
  maxRiskScore: parseInt(process.env.MAX_RISK_SCORE ?? '50000'),
  autoSnipeEnabled: process.env.AUTO_SNIPE_ENABLED === 'true',
  rugCheckDelayMs: parseInt(process.env.RUGCHECK_DELAY_MS ?? '1000'),
};

// Raydium LP owner address (used in token detection)
export const RAYDIUM_LP_OWNER = '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1';

// SOL mint address
export const SOL_MINT = 'So11111111111111111111111111111111111111112';

// Export configuration summary for logging
export const getConfigSummary = () => ({
  rpcEndpoint: RPC_ENDPOINT.replace(/api-key=[^&]+/, 'api-key=***'),
  botConfigured: !!BOT_TOKEN,
  adminConfigured: !!ADMIN_CHAT_ID,
  maxRiskScore: botConfig.maxRiskScore,
  autoSnipeEnabled: botConfig.autoSnipeEnabled,
});
