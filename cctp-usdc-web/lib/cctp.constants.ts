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
