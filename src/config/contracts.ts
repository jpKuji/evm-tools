import { MaxUint256 } from 'ethers';

/**
 * Contract addresses for Ethereum Mainnet
 */
export const CONTRACTS = {
  // Token contracts
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  VULT: '0xb788144DF611029C60b859DF47e79B7726C4DEBa',
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',

  // Uniswap V3 contracts
  UNISWAP_V3_POSITION_MANAGER: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  UNISWAP_V3_SWAP_ROUTER: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
  USDC_VULT_PAIR: '0x6Df52cC6E2E6f6531E4ceB4b083CF49864A89020',
} as const;

/**
 * Standard ERC20 ABI with approve function
 */
export const ERC20_ABI = [
  // Read functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',

  // Write functions
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
] as const;

/**
 * Maximum uint256 value for unlimited approvals (as BigInt)
 */
export { MaxUint256 as MAX_UINT256 };

/**
 * Maximum uint256 value as hex string for transactions
 */
export const MAX_UINT256_HEX = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
