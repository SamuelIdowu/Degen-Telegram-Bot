// Core token data structure
export interface TokenInfo {
  baseAddress: string;
  baseDecimals: number;
  baseLpAmount: number;
}

export interface QuoteInfo {
  quoteAddress: string;
  quoteDecimals: number;
  quoteLpAmount: number;
}

// Risk assessment from RugCheck API
export interface RugRisk {
  name: string;
  value: string;
  description: string;
  score: number;
  level: 'warn' | 'danger' | 'info';
}

export interface RugCheckResult {
  tokenProgram: string;
  tokenType: string;
  risks: RugRisk[];
  score: number;
}

// Complete token data structure
export interface TokenData {
  lpSignature: string;
  creator: string;
  timestamp: string;
  baseInfo: TokenInfo;
  quoteInfo: QuoteInfo;
  logs: string[];
  rugCheckResult?: RugCheckResult | null;
}

// Telegram bot specific interfaces
export interface BotCommand {
  command: string;
  description: string;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
}

export interface BotMessage {
  message_id: number;
  from: TelegramUser;
  chat: {
    id: number;
    type: string;
  };
  text: string;
}

// Analysis results for bot responses
export interface TokenAnalysis {
  token: TokenData;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: 'BUY' | 'HOLD' | 'AVOID';
  summary: string;
}

// Bot configuration
export interface BotConfig {
  maxRiskScore: number;
  autoSnipeEnabled: boolean;
  rugCheckDelayMs: number;
}
