import { JsonRpcProvider } from 'ethers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Creates and returns an Alchemy provider for Ethereum Mainnet
 * @returns JsonRpcProvider instance configured for Alchemy
 * @throws Error if ALCHEMY_API_KEY is not set in environment variables
 */
export function getProvider(): JsonRpcProvider {
  const alchemyApiKey = process.env.ALCHEMY_API_KEY;

  if (!alchemyApiKey) {
    throw new Error(
      'ALCHEMY_API_KEY is not set in environment variables. Please check your .env file.'
    );
  }

  // Construct Alchemy URL for Ethereum Mainnet
  const alchemyUrl = `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;

  return new JsonRpcProvider(alchemyUrl);
}

/**
 * Tests the provider connection
 * @param provider JsonRpcProvider instance
 * @returns Promise<boolean> true if connection is successful
 */
export async function testProviderConnection(provider: JsonRpcProvider): Promise<boolean> {
  try {
    const network = await provider.getNetwork();
    console.log(`✓ Connected to network: ${network.name} (chainId: ${network.chainId})`);

    const blockNumber = await provider.getBlockNumber();
    console.log(`✓ Current block number: ${blockNumber}`);

    return true;
  } catch (error) {
    console.error('✗ Provider connection failed:', error);
    return false;
  }
}
