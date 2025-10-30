import fs from 'fs';
import path from 'path';
import { TokenData, RugCheckResult } from '../types/index.js';

// Function to store data in a JSON file
export async function storeData(filePath: string, data: any): Promise<void> {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Check if file exists
    const fileExists = fs.existsSync(filePath);
    
    let currentData = [];
    
    // If the file exists, load the current data
    if (fileExists) {
      const rawData = fs.readFileSync(filePath, 'utf-8');
      try {
        currentData = JSON.parse(rawData);
      } catch (parseError) {
        console.warn(`Warning: Could not parse existing data in ${filePath}, starting fresh`);
        currentData = [];
      }
    }
    
    // Append the new data
    currentData.push(data);
    
    // Save the updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));
    console.log(`Data stored successfully at ${filePath}`);
  } catch (error) {
    console.error(`Error storing data: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

// Function to read stored token data
export function readTokenData(filePath: string): TokenData[] {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error reading token data: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

// Function to get tokens from the last specified number of days
export function getLatestTokens(filePath: string, limit: number = 10, maxDays: number = 2): TokenData[] {
  const tokens = readTokenData(filePath);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxDays);
  
  return tokens
    .filter(token => new Date(token.timestamp) >= cutoffDate)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

// Function to find token by mint address (only from recent tokens)
export function findTokenByMint(filePath: string, mintAddress: string, maxDays: number = 2): TokenData | null {
  const tokens = readTokenData(filePath);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxDays);
  
  return tokens
    .filter(token => new Date(token.timestamp) >= cutoffDate)
    .find(token => token.baseInfo.baseAddress === mintAddress) || null;
}

// Format risk level based on rug check score
export function formatRiskLevel(rugCheckResult: RugCheckResult | null | undefined): string {
  if (!rugCheckResult) return '❓ Unknown';
  
  const score = rugCheckResult.score;
  
  if (score < 10000) return '🟢 Low Risk';
  if (score < 30000) return '🟡 Medium Risk';
  if (score < 50000) return '🟠 High Risk';
  return '🔴 Critical Risk';
}

// Format token info for display
export function formatTokenInfo(token: TokenData): string {
  const riskLevel = formatRiskLevel(token.rugCheckResult);
  const timestamp = new Date(token.timestamp).toLocaleString();
  
  let message = `🪙 **Token Detected**\n`;
  message += `📍 Mint: \`${token.baseInfo.baseAddress}\`\n`;
  message += `👤 Creator: \`${token.creator}\`\n`;
  message += `⏰ Time: ${timestamp}\n`;
  message += `💧 LP Amount: ${token.baseInfo.baseLpAmount.toLocaleString()}\n`;
  message += `💰 Quote Amount: ${token.quoteInfo.quoteLpAmount} SOL\n`;
  message += `🔍 Risk Level: ${riskLevel}\n`;
  
  if (token.rugCheckResult) {
    message += `📊 Risk Score: ${token.rugCheckResult.score.toLocaleString()}\n`;
    
    // Show top 3 risks
    const topRisks = token.rugCheckResult.risks
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    if (topRisks.length > 0) {
      message += `\n⚠️ **Top Risks:**\n`;
      topRisks.forEach((risk, index) => {
        const emoji = risk.level === 'danger' ? '🔴' : risk.level === 'warn' ? '🟡' : '🔵';
        message += `${index + 1}. ${emoji} ${risk.name} (${risk.score.toLocaleString()})\n`;
      });
    }
  }
  
  return message;
}

// Sleep utility for rate limiting
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Error logging utility
export function logError(error: any, context: string): void {
  const timestamp = new Date().toISOString();
  const errorMessage = `[${timestamp}] ${context}: ${error instanceof Error ? error.message : String(error)}\n`;
  
  console.error(errorMessage);
  
  // Append to error log file
  const errorLogPath = path.join(process.cwd(), 'data', 'error.log');
  fs.appendFileSync(errorLogPath, errorMessage);
}

// Format number with commas
export function formatNumber(num: number): string {
  return num.toLocaleString();
}
