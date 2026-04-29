/**
 * USDC Token Addresses and Constants
 * USDC is a stablecoin with 6 decimals
 */

export const USDC_DECIMALS = 6;

export interface ChainConfig {
  chainId: number;
  chainIdHex: string;
  blockExplorer: string;
  name: string;
  domain: number;
}

export const CHAIN_CONFIG: Record<string, ChainConfig> = {
  // Mainnet
  Ethereum: {
    chainId: 1,
    chainIdHex: "0x1",
    name: "Ethereum",
    blockExplorer: "https://etherscan.io",
    domain: 0,
  },
  Arbitrum: {
    chainId: 42161,
    chainIdHex: "0xa4b1",
    blockExplorer: "https://arbiscan.io",
    name: "Arbitrum",
    domain: 3,
  },
  Base: {
    chainId: 8453,
    chainIdHex: "0x2105",
    blockExplorer: "https://basescan.org",
    name: "Base",
    domain: 6,
  },
  Optimism: {
    chainId: 10,
    chainIdHex: "0xa",
    blockExplorer: "https://optimismscan.io",
    name: "Optimism",
    domain: 2,
  },
  Polygon: {
    chainId: 137,
    chainIdHex: "0x89",
    blockExplorer: "https://polygonscan.com",
    name: "Polygon",
    domain: 7,
  },
  Avalanche: {
    chainId: 43114,
    chainIdHex: "0xa86a",
    blockExplorer: "https://snowtrace.io",
    name: "Avalanche",
    domain: 1,
  },
  Linea: {
    chainId: 59144,
    chainIdHex: "0xe708",
    blockExplorer: "https://lineascan.build",
    name: "Linea",
    domain: 11,
  },

  Unichain: {
    chainId: 130,
    chainIdHex: "0x82",
    blockExplorer: "https://uniscan.xyz",
    name: "Unichain",
    domain: 10,
  },
};

export const USDC_ADDRESSES: Record<string, string> = {
  // Mainnet
  Ethereum: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  Arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC.e on Arbitrum
  Base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  Optimism: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  Polygon: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  Avalanche: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  Linea: "0x176211869ca2b568f2a7d4ee941e073a821ee1ff",
  Unichain: "0x078d782b760474a361dda0af3839290b0ef57ad6",
};

/**
 * Get USDC address for a specific chain
 */
export function getUSDCAddress(chainName: string): string | null {
  return USDC_ADDRESSES[chainName] || null;
}

/**
 * Get chain configuration for a specific chain
 */
export function getChainConfig(chainName: string): ChainConfig | null {
  return CHAIN_CONFIG[chainName] || null;
}
