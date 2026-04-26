/**
 * USDC Token Addresses and Constants
 * USDC is a stablecoin with 6 decimals
 */

export const USDC_DECIMALS = 6;

export interface ChainConfig {
  chainId: number;
  chainIdHex: string;
  rpcUrl: string;
  blockExplorer: string;
  name: string;
}

export const CHAIN_CONFIG: Record<string, ChainConfig> = {
  // Mainnet
  Ethereum: {
    chainId: 1,
    chainIdHex: "0x1",
    rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/demo",
    blockExplorer: "https://etherscan.io",
    name: "Ethereum",
  },
  Arbitrum: {
    chainId: 42161,
    chainIdHex: "0xa4b1",
    rpcUrl: "https://arb-mainnet.g.alchemy.com/v2/demo",
    blockExplorer: "https://arbiscan.io",
    name: "Arbitrum",
  },
  Base: {
    chainId: 8453,
    chainIdHex: "0x2105",
    rpcUrl: "https://base-mainnet.g.alchemy.com/v2/demo",
    blockExplorer: "https://basescan.org",
    name: "Base",
  },
  Optimism: {
    chainId: 10,
    chainIdHex: "0xa",
    rpcUrl: "https://opt-mainnet.g.alchemy.com/v2/demo",
    blockExplorer: "https://optimismscan.io",
    name: "Optimism",
  },
  Polygon: {
    chainId: 137,
    chainIdHex: "0x89",
    rpcUrl: "https://polygon-mainnet.g.alchemy.com/v2/demo",
    blockExplorer: "https://polygonscan.com",
    name: "Polygon",
  },
  Avalanche: {
    chainId: 43114,
    chainIdHex: "0xa86a",
    rpcUrl: "https://avax-mainnet.g.alchemy.com/v2/demo",
    blockExplorer: "https://snowtrace.io",
    name: "Avalanche",
  },
  Linea: {
    chainId: 59144,
    chainIdHex: "0xe708",
    rpcUrl: "https://linea-mainnet.infura.io/v3/YOUR-API-KEY",
    blockExplorer: "https://lineascan.build",
    name: "Linea",
  },

  Unichain: {
    chainId: 130,
    chainIdHex: "0x82",
    rpcUrl: "https://unichain-mainnet.g.alchemy.com/v2/demo",
    blockExplorer: "https://uniscan.xyz",
    name: "Unichain",
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
 * ERC20 ABI for balanceOf function
 */
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
] as const;

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
