import { HDNodeWallet, Mnemonic, Wallet, JsonRpcProvider } from 'ethers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Loads all mnemonics from environment variables
 * Looks for MNEMONIC_1, MNEMONIC_2, etc.
 * @returns Array of mnemonic phrases
 * @throws Error if no mnemonics are found
 */
export function loadMnemonics(): string[] {
  const mnemonics: string[] = [];
  let index = 1;

  // Keep checking for MNEMONIC_1, MNEMONIC_2, etc. until we find a gap
  while (true) {
    const mnemonicKey = `MNEMONIC_${index}`;
    const mnemonicPhrase = process.env[mnemonicKey];

    if (!mnemonicPhrase) {
      break; // Stop when we hit the first missing mnemonic
    }

    mnemonics.push(mnemonicPhrase);
    index++;
  }

  if (mnemonics.length === 0) {
    throw new Error(
      'No mnemonics found in environment variables. Please add MNEMONIC_1, MNEMONIC_2, etc. to your .env file.'
    );
  }

  return mnemonics;
}

/**
 * Derives wallets from a single mnemonic phrase
 * @param provider JsonRpcProvider instance to connect wallets to
 * @param mnemonicPhrase The mnemonic phrase to derive from
 * @param numWallets Number of wallets to derive from this mnemonic
 * @returns Array of connected Wallet instances
 */
export function deriveWalletsFromMnemonic(
  provider: JsonRpcProvider,
  mnemonicPhrase: string,
  numWallets: number = 1
): Wallet[] {
  // Validate mnemonic
  const mnemonic = Mnemonic.fromPhrase(mnemonicPhrase);

  const wallets: Wallet[] = [];

  // Derive wallets using standard Ethereum derivation path: m/44'/60'/0'/0/index
  for (let i = 0; i < numWallets; i++) {
    const path = `m/44'/60'/0'/0/${i}`;
    const hdNode = HDNodeWallet.fromMnemonic(mnemonic, path);
    const wallet = new Wallet(hdNode.privateKey, provider);
    wallets.push(wallet);
  }

  return wallets;
}

/**
 * Derives wallets from all configured mnemonics
 * @param provider JsonRpcProvider instance to connect wallets to
 * @param walletsPerMnemonic Number of wallets to derive from each mnemonic (default: 1)
 * @returns Array of all connected Wallet instances
 */
export function deriveAllWallets(
  provider: JsonRpcProvider,
  walletsPerMnemonic?: number
): Wallet[] {
  const mnemonics = loadMnemonics();
  const numWalletsPerMnemonic = walletsPerMnemonic ?? getWalletsPerMnemonic();

  const allWallets: Wallet[] = [];

  for (const mnemonic of mnemonics) {
    const wallets = deriveWalletsFromMnemonic(provider, mnemonic, numWalletsPerMnemonic);
    allWallets.push(...wallets);
  }

  return allWallets;
}

/**
 * Displays wallet information with mnemonic grouping
 * @param wallets Array of Wallet instances
 */
export async function displayWalletInfo(wallets: Wallet[]): Promise<void> {
  const walletsPerMnemonic = getWalletsPerMnemonic();
  const numMnemonics = Math.ceil(wallets.length / walletsPerMnemonic);

  console.log(`\n${'='.repeat(70)}`);
  console.log('WALLET INFORMATION');
  console.log('='.repeat(70));

  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];
    const balance = await wallet.provider?.getBalance(wallet.address);
    const ethBalance = balance ? (Number(balance) / 1e18).toFixed(6) : '0';

    // Calculate which mnemonic this wallet belongs to
    const mnemonicIndex = Math.floor(i / walletsPerMnemonic) + 1;
    const walletIndexInMnemonic = (i % walletsPerMnemonic) + 1;

    // Add separator between different mnemonics
    if (i > 0 && i % walletsPerMnemonic === 0) {
      console.log(''); // Extra spacing between mnemonic groups
    }

    console.log(`\nWallet ${i + 1} (MNEMONIC_${mnemonicIndex}, Derivation Index: ${walletIndexInMnemonic - 1}):`);
    console.log(`  Address: ${wallet.address}`);
    console.log(`  Balance: ${ethBalance} ETH`);
  }

  console.log(`\n${'='.repeat(70)}\n`);
}

/**
 * Gets the number of wallets to derive per mnemonic from environment variable
 * @returns Number of wallets per mnemonic (default: 1)
 */
export function getWalletsPerMnemonic(): number {
  const walletsPerMnemonicEnv = process.env.WALLETS_PER_MNEMONIC;
  if (walletsPerMnemonicEnv) {
    const parsed = parseInt(walletsPerMnemonicEnv, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return 1; // Default to 1 wallet per mnemonic
}

/**
 * Gets information about all configured mnemonics
 * @returns Object with count and list status
 */
export function getMnemonicInfo(): { count: number; mnemonics: string[] } {
  const mnemonics = loadMnemonics();
  return {
    count: mnemonics.length,
    mnemonics: mnemonics.map((m, i) => {
      const words = m.split(' ');
      return `MNEMONIC_${i + 1} (${words.length} words)`;
    }),
  };
}
