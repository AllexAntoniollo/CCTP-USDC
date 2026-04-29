import type { BlockchainNetwork } from "./cctp.types";

/**
 * CCTP Bridge supported networks
 * Mainnet chains first, then testnets
 */
export const BRIDGE_NETWORKS: BlockchainNetwork[] = [
  // Mainnet
  {
    id: "Ethereum",
    name: "Ethereum",
    title: "Ethereum Mainnet",
    isTestnet: false,
    chainId: 1,
    color: "from-blue-500 to-cyan-400",
    icon: "⟠",
  },
  {
    id: "Arbitrum",
    name: "Arbitrum",
    title: "Arbitrum Mainnet",
    isTestnet: false,
    chainId: 42161,
    color: "from-blue-600 to-blue-400",
    icon: "🔵",
  },
  {
    id: "Base",
    name: "Base",
    title: "Base Mainnet",
    isTestnet: false,
    chainId: 8453,
    color: "from-blue-600 to-purple-400",
    icon: "🔵",
  },
  {
    id: "Optimism",
    name: "Optimism",
    title: "Optimism Mainnet",
    isTestnet: false,
    chainId: 10,
    color: "from-red-500 to-red-400",
    icon: "🔴",
  },
  {
    id: "Polygon",
    name: "Polygon",
    title: "Polygon Mainnet",
    isTestnet: false,
    chainId: 137,
    color: "from-purple-600 to-pink-400",
    icon: "💜",
  },
  {
    id: "Avalanche",
    name: "Avalanche",
    title: "Avalanche Mainnet",
    isTestnet: false,
    chainId: 43114,
    color: "from-red-500 to-orange-400",
    icon: "❄️",
  },
  {
    id: "Linea",
    name: "Linea",
    title: "Linea Mainnet",
    isTestnet: false,
    chainId: 59144,
    color: "from-purple-500 to-pink-500",
    icon: "〰️",
  },

  {
    id: "Unichain",
    name: "Unichain",
    title: "Unichain Mainnet",
    isTestnet: false,
    color: "from-pink-500 to-red-400",
    icon: "🦄",
  },
];
export const MAINNET_NETWORKS = BRIDGE_NETWORKS.filter((n) => !n.isTestnet);

export function getNetworkById(id: string): BlockchainNetwork | undefined {
  return BRIDGE_NETWORKS.find((n) => n.id === id);
}

/**
 * Get chain ID from network name (normalizes the name format)
 */
export function getChainIdFromName(chainName: string): number | undefined {
  // Normalize the name by replacing hyphens with underscores and handling case sensitivity
  const normalized = chainName.replace("-", "_");
  const network = BRIDGE_NETWORKS.find(
    (n) => n.id.toLowerCase() === normalized.toLowerCase(),
  );
  return network?.chainId;
}

/**
 * Bridge transaction fees (in percentage)
 */
export const BRIDGE_FEES_PERCENT: Record<string, number> = {
  Ethereum: 0.5,
  Arbitrum: 0.3,
  Base: 0.3,
  Optimism: 0.3,
  Polygon: 0.4,
  Avalanche: 0.4,
  Linea: 0.3,
  Unichain: 0.3,
};

/**
 * Bridge time estimates for paid transactions (in minutes)
 */
export const BRIDGE_TIME_ESTIMATES_PAID: Record<string, string> = {
  Ethereum: "20 Seconds",
  Arbitrum: "8 Seconds",
  Base: "8 Seconds",
  Optimism: "8 Seconds",
  Polygon: "8 Seconds",
  Avalanche: "8 Seconds",
  Linea: "8 Seconds",
  Unichain: "8 Seconds",
};

/**
 * Bridge time estimates for free transactions (in minutes)
 */
export const BRIDGE_TIME_ESTIMATES_FREE: Record<string, string> = {
  Ethereum: "15-19 Minutes",
  Arbitrum: "15-19 Minutes",
  Base: "15-19 Minutes",
  Optimism: "15-19 Minutes",
  Polygon: "8 Seconds",
  Avalanche: "8 Seconds",
  Linea: "6-32 Hours",
  Unichain: "15-19 Minutes",
};

/**
 * Get bridge fee percentage for a network
 */
export function getBridgeFeePercent(network: string): number {
  return BRIDGE_FEES_PERCENT[network] || 0.3;
}

/**
 * Get bridge time estimate for a network (in minutes)
 * @param network - The network name
 * @param isFree - Whether it's a free transaction (slower) or paid (faster)
 */
export function getBridgeTimeEstimate(
  network: string,
  isFree: boolean = false,
): string {
  if (isFree) {
    return BRIDGE_TIME_ESTIMATES_FREE[network];
  }
  return BRIDGE_TIME_ESTIMATES_PAID[network];
}
