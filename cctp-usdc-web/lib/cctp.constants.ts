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
    icon: "�",
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
    id: "Solana",
    name: "Solana",
    title: "Solana Mainnet",
    isTestnet: false,
    color: "from-green-500 to-cyan-400",
    icon: "◎",
  },
  {
    id: "Sonic",
    name: "Sonic",
    title: "Sonic Mainnet",
    isTestnet: false,
    color: "from-yellow-500 to-orange-400",
    icon: "⚡",
  },
  {
    id: "Unichain",
    name: "Unichain",
    title: "Unichain Mainnet",
    isTestnet: false,
    color: "from-pink-500 to-red-400",
    icon: "🦄",
  },
  {
    id: "Morph",
    name: "Morph",
    title: "Morph Mainnet",
    isTestnet: false,
    color: "from-indigo-500 to-purple-400",
    icon: "🌀",
  },
  {
    id: "XDC",
    name: "XDC",
    title: "XDC Mainnet",
    isTestnet: false,
    color: "from-green-600 to-green-400",
    icon: "✕",
  },
  {
    id: "Sei",
    name: "Sei",
    title: "Sei Mainnet",
    isTestnet: false,
    color: "from-orange-500 to-red-400",
    icon: "◈",
  },
];
export const MAINNET_NETWORKS = BRIDGE_NETWORKS.filter((n) => !n.isTestnet);

export function getNetworkById(id: string): BlockchainNetwork | undefined {
  return BRIDGE_NETWORKS.find((n) => n.id === id);
}
