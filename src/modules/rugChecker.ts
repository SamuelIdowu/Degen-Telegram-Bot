import axios from 'axios';
import chalk from 'chalk';
import { EventEmitter } from 'events';
import { RugCheckResult, TokenData } from '../types/index.js';
import { botConfig } from '../core/config.js';
import { logError, sleep } from '../core/utils.js';

export class RugChecker extends EventEmitter {
  private apiBaseUrl = 'https://api.rugcheck.xyz/v1';

  constructor() {
    super();
  }

  /**
   * Check rug risk for a specific token mint address
   */
  async checkRug(mint: string): Promise<RugCheckResult | null> {
    try {
      console.log(chalk.cyan(`🔍 Checking rug risk for token: ${mint}`));

      // Rate limiting to avoid overwhelming the API
      await sleep(botConfig.rugCheckDelayMs);

      const response = await axios.get(
        `${this.apiBaseUrl}/tokens/${mint}/report/summary`,
        {
          timeout: 10000, // 10 second timeout
          headers: {
            'User-Agent': 'Solana-Token-Bot/1.0',
          },
        }
      );

      if (response.data) {
        console.log(chalk.green(`✅ RugCheck result for ${mint}: Score ${response.data.score}`));
        return response.data as RugCheckResult;
      }

      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          console.log(chalk.yellow(`⚠️ Token ${mint} not found in RugCheck database`));
        } else if (error.response?.status === 429) {
          console.log(chalk.yellow(`⚠️ Rate limited by RugCheck API, retrying later...`));
        } else {
          logError(error, `RugCheck API error for ${mint}`);
        }
      } else {
        logError(error, `RugCheck request failed for ${mint}`);
      }
      return null;
    }
  }

  /**
   * Analyze token data and add rug check results
   */
  async analyzeToken(tokenData: TokenData): Promise<TokenData> {
    try {
      const rugCheckResult = await this.checkRug(tokenData.baseInfo.baseAddress);
      
      const analyzedToken: TokenData = {
        ...tokenData,
        rugCheckResult,
      };

      // Emit analysis complete event
      this.emit('analysisComplete', analyzedToken);

      return analyzedToken;
    } catch (error) {
      logError(error, `Analyzing token ${tokenData.baseInfo.baseAddress}`);
      return tokenData; // Return original token data if analysis fails
    }
  }

  /**
   * Batch analyze multiple tokens
   */
  async analyzeTokens(tokens: TokenData[]): Promise<TokenData[]> {
    const analyzedTokens: TokenData[] = [];

    for (const token of tokens) {
      try {
        const analyzed = await this.analyzeToken(token);
        analyzedTokens.push(analyzed);
        
        // Emit progress event
        this.emit('progress', analyzedTokens.length, tokens.length);
        
        // Rate limiting between requests
        if (analyzedTokens.length < tokens.length) {
          await sleep(botConfig.rugCheckDelayMs);
        }
      } catch (error) {
        logError(error, `Batch analysis failed for token ${token.baseInfo.baseAddress}`);
        analyzedTokens.push(token); // Add original token if analysis fails
      }
    }

    this.emit('batchComplete', analyzedTokens);
    return analyzedTokens;
  }

  /**
   * Get risk assessment based on rug check result
   */
  getRiskAssessment(rugCheckResult: RugCheckResult | null): {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    recommendation: 'BUY' | 'HOLD' | 'AVOID';
    summary: string;
  } {
    if (!rugCheckResult) {
      return {
        level: 'MEDIUM',
        recommendation: 'HOLD',
        summary: 'Unable to assess risk - proceed with caution',
      };
    }

    const score = rugCheckResult.score;
    const dangerRisks = rugCheckResult.risks.filter(risk => risk.level === 'danger').length;
    const warnRisks = rugCheckResult.risks.filter(risk => risk.level === 'warn').length;

    let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    let recommendation: 'BUY' | 'HOLD' | 'AVOID';
    let summary: string;

    if (score < 10000 && dangerRisks === 0) {
      level = 'LOW';
      recommendation = 'BUY';
      summary = `Low risk token with score ${score.toLocaleString()}. Generally safe for investment.`;
    } else if (score < 30000 && dangerRisks <= 1) {
      level = 'MEDIUM';
      recommendation = 'HOLD';
      summary = `Medium risk token with score ${score.toLocaleString()}. Consider carefully before investing.`;
    } else if (score < 50000 || dangerRisks <= 3) {
      level = 'HIGH';
      recommendation = 'AVOID';
      summary = `High risk token with score ${score.toLocaleString()} and ${dangerRisks} danger risks. Investment not recommended.`;
    } else {
      level = 'CRITICAL';
      recommendation = 'AVOID';
      summary = `Critical risk token with score ${score.toLocaleString()} and ${dangerRisks} danger risks. Avoid at all costs!`;
    }

    return { level, recommendation, summary };
  }

  /**
   * Check if token passes safety filters based on configuration
   */
  passesSecurityCheck(rugCheckResult: RugCheckResult | null): boolean {
    if (!rugCheckResult) {
      return false; // Fail safe if we can't get rug check results
    }

    const riskAssessment = this.getRiskAssessment(rugCheckResult);
    return riskAssessment.level === 'LOW' && rugCheckResult.score <= botConfig.maxRiskScore;
  }
}

// Export singleton instance
export const rugChecker = new RugChecker();
