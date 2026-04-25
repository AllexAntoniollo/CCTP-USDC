/**
 * CCTP Bridge supported blockchains
 * Based on BridgeChain from @circle-fin/app-kit
 */

export type BridgeChainType =
  | "Arbitrum"
  | "Arbitrum_Sepolia"
  | "Avalanche"
  | "Avalanche_Fuji"
  | "Base"
  | "Base_Sepolia"
  | "Codex"
  | "Codex_Testnet"
  | "Edge"
  | "Edge_Testnet"
  | "Ethereum"
  | "Ethereum_Sepolia"
  | "HyperEVM"
  | "HyperEVM_Testnet"
  | "Ink"
  | "Ink_Testnet"
  | "Linea"
  | "Linea_Sepolia"
  | "Monad"
  | "Monad_Testnet"
  | "Morph"
  | "Morph_Testnet"
  | "Optimism"
  | "Optimism_Sepolia"
  | "Plume"
  | "Plume_Testnet"
  | "Polygon"
  | "Polygon_Amoy_Testnet"
  | "Sei"
  | "Sei_Testnet"
  | "Solana"
  | "Solana_Devnet"
  | "Sonic"
  | "Sonic_Testnet"
  | "Unichain"
  | "Unichain_Sepolia"
  | "World_Chain"
  | "World_Chain_Sepolia"
  | "XDC"
  | "XDC_Apothem";

export interface BlockchainNetwork {
  id: BridgeChainType;
  name: string;
  title: string;
  isTestnet: boolean;
  chainId?: number;
  color: string;
  icon?: string;
}

export interface BridgeConfig {
  from: {
    chain: BridgeChainType;
    amount: string;
  };
  to: {
    chain: BridgeChainType;
  };
}
