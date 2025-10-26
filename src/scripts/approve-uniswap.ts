#!/usr/bin/env node

/**
 * Uniswap Approval Script
 *
 * This script approves unlimited USDC and VULT token spending for the Uniswap V3 Position Manager
 * across multiple wallets derived from multiple mnemonic phrases.
 *
 * Usage:
 *   pnpm approve
 */

import prompts from 'prompts';
import { getProvider, testProviderConnection } from '../utils/provider.js';
import {
  deriveAllWallets,
  displayWalletInfo,
  getMnemonicInfo,
  getWalletsPerMnemonic,
} from '../utils/wallet.js';
import {
  approveForMultipleWallets,
  displayApprovalSummary,
  ApprovalResult,
} from '../tools/approve.js';
import { CONTRACTS } from '../config/contracts.js';

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║           UNISWAP V3 APPROVAL TOOL - ERC20 Token Approvals        ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  try {
    // Step 1: Initialize provider
    console.log('📡 Initializing Alchemy provider...\n');
    const provider = getProvider();

    // Test connection
    const isConnected = await testProviderConnection(provider);
    if (!isConnected) {
      throw new Error('Failed to connect to Ethereum network');
    }

    // Step 2: Load and display mnemonic information
    const mnemonicInfo = getMnemonicInfo();
    const walletsPerMnemonic = getWalletsPerMnemonic();
    const totalWallets = mnemonicInfo.count * walletsPerMnemonic;

    console.log(`\n🔑 Mnemonic Configuration:`);
    console.log(`   - Mnemonics found: ${mnemonicInfo.count}`);
    mnemonicInfo.mnemonics.forEach((info) => {
      console.log(`   - ${info}`);
    });
    console.log(`   - Wallets per mnemonic: ${walletsPerMnemonic}`);
    console.log(`   - Total wallets: ${totalWallets}\n`);

    // Step 3: Derive all wallets
    console.log('🔐 Deriving wallets from all mnemonics...\n');
    const wallets = deriveAllWallets(provider);

    // Display wallet information
    await displayWalletInfo(wallets);

    // Step 4: Ask for confirmation before proceeding
    console.log('⚠️  Please review the wallet addresses and balances above.\n');

    const response = await prompts({
      type: 'confirm',
      name: 'proceed',
      message: 'Do you want to proceed with the approval process?',
      initial: false,
    });

    // Handle user cancellation (Ctrl+C or 'No')
    if (response.proceed === undefined || !response.proceed) {
      console.log('\n❌ Approval process cancelled by user.\n');
      process.exit(0);
    }

    // Step 5: Prepare token addresses and spenders to approve
    const tokensToApprove = [CONTRACTS.USDC, CONTRACTS.VULT];
    const spenders = [
      { name: 'Uniswap V3 Position Manager', address: CONTRACTS.UNISWAP_V3_POSITION_MANAGER },
      { name: 'Uniswap V3 Swap Router', address: CONTRACTS.UNISWAP_V3_SWAP_ROUTER },
    ];

    console.log('\n📋 Approval Configuration:');
    console.log(`   - Tokens: USDC, VULT`);
    console.log(`   - Spenders:`);
    spenders.forEach((spender) => {
      console.log(`     • ${spender.name}: ${spender.address}`);
    });
    console.log(`   - Approval Amount: Unlimited (max uint256)`);
    console.log(`   - Total approvals per wallet: ${tokensToApprove.length * spenders.length}\n`);

    // Warning
    console.log('⚠️  WARNING: This will send transactions from your wallets.');
    console.log('   Make sure you have sufficient ETH for gas fees.\n');

    // Step 6: Execute approvals for all spenders
    const allResults: ApprovalResult[] = [];

    for (const spender of spenders) {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`APPROVING FOR: ${spender.name.toUpperCase()}`);
      console.log('='.repeat(70));

      const results = await approveForMultipleWallets(
        wallets,
        tokensToApprove,
        spender.address,
        true // Wait for confirmations
      );

      allResults.push(...results);
    }

    // Step 7: Display summary
    displayApprovalSummary(allResults);

    console.log('\n✅ Approval process completed!\n');
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the script
main();
