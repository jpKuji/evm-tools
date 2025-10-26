import { Contract, Wallet, formatUnits, parseUnits } from 'ethers';
import { ERC20_ABI, MAX_UINT256 } from '../config/contracts.js';

/**
 * Represents the result of an approval operation
 */
export interface ApprovalResult {
  success: boolean;
  skipped: boolean;
  txHash?: string;
  error?: string;
  walletAddress: string;
  tokenAddress: string;
  spenderAddress: string;
}

/**
 * Checks the current allowance for a token
 * @param wallet Wallet instance
 * @param tokenAddress ERC20 token contract address
 * @param spenderAddress Address that will be approved to spend tokens
 * @returns Current allowance as bigint
 */
export async function checkAllowance(
  wallet: Wallet,
  tokenAddress: string,
  spenderAddress: string
): Promise<bigint> {
  const tokenContract = new Contract(tokenAddress, ERC20_ABI, wallet);
  const allowance = await tokenContract.allowance(wallet.address, spenderAddress);
  return allowance;
}

/**
 * Approves unlimited token spending for a spender
 * @param wallet Wallet instance to approve from
 * @param tokenAddress ERC20 token contract address
 * @param spenderAddress Address to approve for spending
 * @param waitForConfirmation Whether to wait for transaction confirmation (default: true)
 * @returns ApprovalResult with transaction details
 */
export async function approveToken(
  wallet: Wallet,
  tokenAddress: string,
  spenderAddress: string,
  waitForConfirmation: boolean = true
): Promise<ApprovalResult> {
  const result: ApprovalResult = {
    success: false,
    skipped: false,
    walletAddress: wallet.address,
    tokenAddress,
    spenderAddress,
  };

  try {
    // Create contract instance
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, wallet);

    // Get token info
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();

    console.log(`\n  → Approving ${symbol}...`);

    // Check current allowance
    const currentAllowance = await checkAllowance(wallet, tokenAddress, spenderAddress);

    if (currentAllowance >= MAX_UINT256) {
      console.log(`    ✓ ${symbol} already has unlimited approval - skipping`);
      result.success = true;
      result.skipped = true;
      return result;
    }

    // Send approval transaction (use MAX_UINT256 directly as it's now a BigInt)
    const tx = await tokenContract.approve(spenderAddress, MAX_UINT256);
    result.txHash = tx.hash;

    console.log(`    ⏳ Transaction sent: ${tx.hash}`);

    if (waitForConfirmation) {
      // Wait for transaction confirmation
      const receipt = await tx.wait();

      if (receipt && receipt.status === 1) {
        console.log(`    ✓ ${symbol} approval confirmed (Block: ${receipt.blockNumber})`);
        result.success = true;
      } else {
        console.log(`    ✗ ${symbol} approval failed`);
        result.error = 'Transaction failed';
      }
    } else {
      result.success = true;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`    ✗ Approval failed: ${errorMessage}`);
    result.error = errorMessage;
  }

  return result;
}

/**
 * Approves multiple tokens for a single wallet
 * @param wallet Wallet instance
 * @param tokenAddresses Array of token addresses to approve
 * @param spenderAddress Address to approve for spending
 * @param waitForConfirmation Whether to wait for confirmations
 * @returns Array of ApprovalResult
 */
export async function approveMultipleTokens(
  wallet: Wallet,
  tokenAddresses: string[],
  spenderAddress: string,
  waitForConfirmation: boolean = true
): Promise<ApprovalResult[]> {
  const results: ApprovalResult[] = [];

  for (const tokenAddress of tokenAddresses) {
    const result = await approveToken(
      wallet,
      tokenAddress,
      spenderAddress,
      waitForConfirmation
    );
    results.push(result);
  }

  return results;
}

/**
 * Approves tokens for multiple wallets
 * @param wallets Array of Wallet instances
 * @param tokenAddresses Array of token addresses to approve
 * @param spenderAddress Address to approve for spending
 * @param waitForConfirmation Whether to wait for confirmations
 * @returns Array of all ApprovalResults
 */
export async function approveForMultipleWallets(
  wallets: Wallet[],
  tokenAddresses: string[],
  spenderAddress: string,
  waitForConfirmation: boolean = true
): Promise<ApprovalResult[]> {
  const allResults: ApprovalResult[] = [];

  console.log(`\n${'='.repeat(70)}`);
  console.log('STARTING APPROVAL PROCESS');
  console.log('='.repeat(70));
  console.log(`Tokens to approve: ${tokenAddresses.length}`);
  console.log(`Wallets: ${wallets.length}`);
  console.log(`Spender: ${spenderAddress}`);

  for (let i = 0; i < wallets.length; i++) {
    console.log(`\n[Wallet ${i + 1}/${wallets.length}] ${wallets[i].address}`);

    const results = await approveMultipleTokens(
      wallets[i],
      tokenAddresses,
      spenderAddress,
      waitForConfirmation
    );

    allResults.push(...results);
  }

  return allResults;
}

/**
 * Displays a summary of approval results
 * @param results Array of ApprovalResult
 */
export function displayApprovalSummary(results: ApprovalResult[]): void {
  const successful = results.filter((r) => r.success && !r.skipped).length;
  const skipped = results.filter((r) => r.skipped).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`\n${'='.repeat(70)}`);
  console.log('APPROVAL SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total approvals processed: ${results.length}`);
  console.log(`✓ Successful: ${successful}`);
  console.log(`⏭ Already Approved (Skipped): ${skipped}`);
  console.log(`✗ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed approvals:');
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - ${r.walletAddress} → ${r.tokenAddress}`);
        if (r.error) {
          console.log(`    Error: ${r.error}`);
        }
      });
  }

  console.log('='.repeat(70));
}
