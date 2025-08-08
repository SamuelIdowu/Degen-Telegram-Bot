import { Connection } from '@solana/web3.js';
import chalk from 'chalk';
import path from 'path';
import { rayFee, solanaConnection, RAYDIUM_LP_OWNER, SOL_MINT } from '../core/config.js';
import { storeData, logError } from '../core/utils.js';
import { TokenData } from '../types/index.js';
import { EventEmitter } from 'events';

export class TokenMonitor extends EventEmitter {
  private connection: Connection;
  private dataPath: string;
  private isMonitoring: boolean = false;

  constructor(connection: Connection = solanaConnection) {
    super();
    this.connection = connection;
    this.dataPath = path.join(process.cwd(), 'data', 'tokens.json');
  }

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log(chalk.yellow('Token monitoring is already active'));
      return;
    }

    console.log(chalk.green('🔍 Starting Solana token monitoring...'));
    this.isMonitoring = true;

    try {
      this.connection.onLogs(
        rayFee,
        async ({ logs, err, signature }) => {
          try {
            if (err) {
              console.error(`Connection error: ${err}`);
              return;
            }

            console.log(chalk.bgGreen(`🆕 Found new token signature: ${signature}`));

            const tokenData = await this.parseTransaction(signature, logs);
            if (tokenData) {
              // Store the token data
              await storeData(this.dataPath, tokenData);
              
              // Emit event for other modules to handle
              this.emit('newToken', tokenData);
              
              console.log(chalk.green(`✅ Token processed: ${tokenData.baseInfo.baseAddress}`));
            }
          } catch (error) {
            logError(error, 'Token monitor callback');
          }
        },
        'confirmed'
      );

      this.emit('monitoringStarted');
      console.log(chalk.green('✅ Token monitoring started successfully'));
    } catch (error) {
      this.isMonitoring = false;
      logError(error, 'Starting token monitor');
      this.emit('monitoringError', error);
      throw error;
    }
  }

  private async parseTransaction(signature: string, logs: string[]): Promise<TokenData | null> {
    try {
      let signer = '';
      let baseAddress = '';
      let baseDecimals = 0;
      let baseLpAmount = 0;
      let quoteAddress = '';
      let quoteDecimals = 0;
      let quoteLpAmount = 0;

      const parsedTransaction = await this.connection.getParsedTransaction(
        signature,
        {
          maxSupportedTransactionVersion: 0,
          commitment: 'confirmed',
        }
      );

      if (parsedTransaction && parsedTransaction.meta && parsedTransaction.meta.err == null) {
        console.log(chalk.cyan(`📊 Successfully parsed transaction: ${signature}`));

        signer = parsedTransaction.transaction.message.accountKeys[0].pubkey.toString();
        console.log(chalk.blue(`👤 Creator: ${signer}`));

        const postTokenBalances = parsedTransaction.meta.postTokenBalances;

        // Find base token info (non-SOL token)
        const baseInfo = postTokenBalances?.find(
          (balance) =>
            balance.owner === RAYDIUM_LP_OWNER &&
            balance.mint !== SOL_MINT
        );

        if (baseInfo) {
          baseAddress = baseInfo.mint;
          baseDecimals = baseInfo.uiTokenAmount.decimals;
          baseLpAmount = baseInfo.uiTokenAmount.uiAmount || 0;
        }

        // Find quote token info (SOL)
        const quoteInfo = postTokenBalances?.find(
          (balance) =>
            balance.owner === RAYDIUM_LP_OWNER &&
            balance.mint === SOL_MINT
        );

        if (quoteInfo) {
          quoteAddress = quoteInfo.mint;
          quoteDecimals = quoteInfo.uiTokenAmount.decimals;
          quoteLpAmount = quoteInfo.uiTokenAmount.uiAmount || 0;
        }

        // Only return valid token data if we have both base and quote info
        if (baseAddress && quoteAddress) {
          const tokenData: TokenData = {
            lpSignature: signature,
            creator: signer,
            timestamp: new Date().toISOString(),
            baseInfo: {
              baseAddress,
              baseDecimals,
              baseLpAmount,
            },
            quoteInfo: {
              quoteAddress,
              quoteDecimals,
              quoteLpAmount,
            },
            logs: logs,
            rugCheckResult: null, // Will be populated by RugChecker
          };

          return tokenData;
        } else {
          console.log(chalk.yellow(`⚠️ Incomplete token data for ${signature}`));
        }
      } else {
        console.log(chalk.red(`❌ Failed to parse transaction: ${signature}`));
      }

      return null;
    } catch (error) {
      logError(error, `Parsing transaction ${signature}`);
      return null;
    }
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log(chalk.yellow('⏹️ Token monitoring stopped'));
    this.emit('monitoringStopped');
  }

  isActive(): boolean {
    return this.isMonitoring;
  }

  getDataPath(): string {
    return this.dataPath;
  }
}

// Export singleton instance
export const tokenMonitor = new TokenMonitor();
