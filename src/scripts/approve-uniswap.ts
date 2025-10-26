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

    // Step 4: Prepare token addresses to approve
    const tokensToApprove = [CONTRACTS.USDC, CONTRACTS.VULT];

    const spender = CONTRACTS.UNISWAP_V3_POSITION_MANAGER;

    console.log('📋 Approval Configuration:');
    console.log(`   - USDC: ${CONTRACTS.USDC}`);
    console.log(`   - VULT: ${CONTRACTS.VULT}`);
    console.log(`   - Spender: ${spender}`);
    console.log(`   - Approval Amount: Unlimited (max uint256)\n`);

    // Confirmation prompt
    console.log('⚠️  WARNING: This will send transactions from your wallets.');
    console.log('   Make sure you have sufficient ETH for gas fees.\n');

    // Step 5: Execute approvals
    const results = await approveForMultipleWallets(
      wallets,
      tokensToApprove,
      spender,
      true // Wait for confirmations
    );

    // Step 6: Display summary
    displayApprovalSummary(results);

    console.log('\n✅ Approval process completed!\n');
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the script
main();
