# EVM Tools

A TypeScript toolkit for Ethereum and EVM-compatible chains, featuring utilities for ERC20 token management, Uniswap interactions, and wallet operations.

## Features

- **Token Approval Tool**: Easily approve unlimited token spending for Uniswap and other protocols
- **Multi-Mnemonic Support**: Configure and manage wallets from multiple mnemonic phrases
- **Multi-wallet Support**: Derive multiple wallets from each mnemonic
- **TypeScript**: Fully typed for better development experience
- **Modular Architecture**: Easy to extend with additional tools and utilities

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd evm_tools
```

2. Install dependencies using pnpm:
```bash
pnpm install
```

3. Set up your environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` and add your configuration:
```env
ALCHEMY_API_KEY=your_alchemy_api_key_here
MNEMONIC_1=your first twelve word mnemonic phrase goes here
MNEMONIC_2=your second twelve word mnemonic phrase goes here
MNEMONIC_3=your third twelve word mnemonic phrase goes here
WALLETS_PER_MNEMONIC=1
```

## Usage

### Approve Tokens for Uniswap

The approval tool allows you to pre-approve USDC and VULT tokens for the Uniswap V3 Position Manager across multiple wallets from multiple mnemonics. This is useful for setting up sniper bots or preparing wallets for trading.

```bash
pnpm approve
```

This command will:
1. Connect to Ethereum Mainnet via Alchemy
2. Load all configured mnemonics (MNEMONIC_1, MNEMONIC_2, etc.)
3. Derive wallets from each mnemonic (configurable via `WALLETS_PER_MNEMONIC`)
4. Display wallet addresses and balances
5. Approve unlimited USDC and VULT spending for Uniswap V3 Position Manager
6. Wait for transaction confirmations
7. Display a summary of all approvals

**Example**: With 3 mnemonics and `WALLETS_PER_MNEMONIC=1`, you'll have 3 total wallets (1 from each mnemonic).

### Build the Project

Compile TypeScript to JavaScript:

```bash
pnpm build
```

## Project Structure

```
evm_tools/
├── src/
│   ├── config/
│   │   └── contracts.ts          # Contract addresses and ABIs
│   ├── utils/
│   │   ├── wallet.ts              # Wallet derivation utilities
│   │   └── provider.ts            # Alchemy provider setup
│   ├── tools/
│   │   └── approve.ts             # Token approval functionality
│   ├── scripts/
│   │   └── approve-uniswap.ts     # Executable approval script
│   └── index.ts                   # Main entry point & exports
├── .env.example                   # Example environment variables
├── .gitignore                     # Git ignore rules
├── package.json                   # Project dependencies
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

## Configuration

### Contract Addresses (Ethereum Mainnet)

The following contracts are pre-configured in [src/config/contracts.ts](src/config/contracts.ts):

- **USDC**: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- **VULT**: `0xb788144DF611029C60b859DF47e79B7726C4DEBa`
- **Uniswap V3 Position Manager**: `0xC36442b4a4522E871399CD717aBDD847Ab11FE88`
- **USDC/VULT Pair**: `0x6Df52cC6E2E6f6531E4ceB4b083CF49864A89020`

### Environment Variables

- `ALCHEMY_API_KEY` (required): Your Alchemy API key for Ethereum Mainnet
- `MNEMONIC_1`, `MNEMONIC_2`, `MNEMONIC_3`, etc. (required): Your 12 or 24-word mnemonic phrases
  - Add as many as you need, numbered sequentially starting from 1
  - The tool will automatically detect all mnemonics (stops at the first gap)
- `WALLETS_PER_MNEMONIC` (optional): Number of wallets to derive from each mnemonic (default: 1)

#### Multi-Mnemonic Configuration Examples

**Example 1: Three separate wallets (one from each mnemonic)**
```env
MNEMONIC_1=first mnemonic phrase here...
MNEMONIC_2=second mnemonic phrase here...
MNEMONIC_3=third mnemonic phrase here...
WALLETS_PER_MNEMONIC=1
```
Result: 3 total wallets

**Example 2: Six wallets total (two from each of three mnemonics)**
```env
MNEMONIC_1=first mnemonic phrase here...
MNEMONIC_2=second mnemonic phrase here...
MNEMONIC_3=third mnemonic phrase here...
WALLETS_PER_MNEMONIC=2
```
Result: 6 total wallets

**Example 3: Single mnemonic with multiple wallets**
```env
MNEMONIC_1=your mnemonic phrase here...
WALLETS_PER_MNEMONIC=5
```
Result: 5 total wallets (all from the same mnemonic)

## Extending the Repository

This repository is designed to be easily extensible. Here's how to add new tools:

### Adding a New Tool

1. Create a new file in `src/tools/your-tool.ts`
2. Implement your tool's functionality
3. Export it from `src/index.ts`
4. Create a script in `src/scripts/` if needed
5. Add a new script command to `package.json`

Example structure for a new tool:

```typescript
// src/tools/swap.ts
import { Wallet, Contract } from 'ethers';

export async function swapTokens(
  wallet: Wallet,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint
) {
  // Your implementation here
}
```

### Adding New Contract Configurations

Edit [src/config/contracts.ts](src/config/contracts.ts) to add new contract addresses:

```typescript
export const CONTRACTS = {
  // Existing contracts...
  YOUR_TOKEN: '0x...',
  YOUR_CONTRACT: '0x...',
} as const;
```

## Security Notes

- **Never commit your `.env` file** - it contains sensitive information
- **Keep your mnemonic phrase secure** - anyone with access can control your wallets
- **Test with small amounts first** - especially when trying new features
- **Review transactions** - always verify what you're approving or signing

## Requirements

- Node.js >= 18
- pnpm >= 8
- Alchemy API key
- ETH for gas fees in your wallets

## Common Issues

### "ALCHEMY_API_KEY is not set"
Make sure you've created a `.env` file and added your Alchemy API key.

### "No mnemonics found in environment variables"
Add at least one mnemonic to your `.env` file as `MNEMONIC_1`. Make sure it's a valid 12 or 24-word phrase. You can add more as `MNEMONIC_2`, `MNEMONIC_3`, etc.

### "Insufficient funds for gas"
Ensure your wallets have enough ETH to cover gas fees for the approval transactions.

### Wrong number of wallets derived
Check your `WALLETS_PER_MNEMONIC` setting. The total number of wallets = (number of mnemonics) × (wallets per mnemonic).

## License

MIT

## Disclaimer

This software is provided "as is" without warranty of any kind. Use at your own risk. Always verify transactions before confirming them on the blockchain.
