"use client";
import { AppKit, TransferSpeed } from "@circle-fin/app-kit";

import { useCallback, useRef, useState } from "react";
import type { BridgeChainType, BridgeConfig } from "./cctp.types";
import {
  createViemAdapterFromProvider,
  resolveChainIdentifier,
} from "@circle-fin/adapter-viem-v2";

/**
 * Types for wallet adapter
 */
export interface WalletAccount {
  address: string;
  chainId: number;
}

export interface BridgeParams {
  from: {
    chain: BridgeChainType;
    adapter: any; // Will be initialized from viem
  };
  to: {
    chain: BridgeChainType;
    adapter: any; // Will be initialized from viem
  };
  amount: string;
}

export interface BridgeTransaction {
  hash: string;
  status: "pending" | "confirmed" | "failed";
  from: BridgeChainType;
  to: BridgeChainType;
  amount: string;
}

/**
 * Hook for managing CCTP bridge operations
 */

/**
 * Hook for wallet connection management
 */
declare global {
  interface Window {
    ethereum?: any;
  }
}

import { ethers } from "ethers";
import {
  getUSDCAddress,
  USDC_DECIMALS,
  getChainConfig,
} from "./usdc.constants";

export function useWalletConnection() {
  const [account, setAccount] = useState<string | null>(null);
  const [adapter, setAdapter] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChain, setCurrentChain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transaction, setTransaction] = useState<BridgeTransaction | null>(
    null,
  );
  const adapterRef = useRef<any>(null);

  /**
   * Recreate adapter to ensure it's always synced with wallet state
   */
  const recreateAdapter = useCallback(async () => {
    try {
      if (!window.ethereum) {
        console.error("No wallet provider");
        return;
      }

      const freshAdapter = await createViemAdapterFromProvider({
        provider: window.ethereum,
        capabilities: {
          addressContext: "user-controlled",
        },
      });

      if (freshAdapter) {
        setAdapter(freshAdapter);
        adapterRef.current = freshAdapter;
      }
    } catch (err) {
      console.error("Failed to recreate adapter:", err);
    }
  }, []);

  const switchNetwork = useCallback(
    async (chainName: BridgeChainType): Promise<void> => {
      if (!window.ethereum) {
        throw new Error("No wallet provider found");
      }

      try {
        const chainConfig = getChainConfig(chainName);
        if (!chainConfig) {
          throw new Error(`Network configuration not found for ${chainName}`);
        }

        // Request wallet to switch to the chain
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainConfig.chainIdHex }],
        });

        setCurrentChain(chainName);
      } catch (err: any) {
        // If the chain is not added, add it first
        if (err.code === 4902) {
          const chainConfig = getChainConfig(chainName);
          if (chainConfig) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: chainConfig.chainIdHex,
                    chainName: chainConfig.name,
                    rpcUrls: [chainConfig.rpcUrl],
                    blockExplorerUrls: [chainConfig.blockExplorer],
                    nativeCurrency: {
                      name: "ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                  },
                ],
              });
              setCurrentChain(chainName);
              console.log(`✅ Added and switched to ${chainName}`);

              // Recreate adapter after network add
              setTimeout(() => recreateAdapter(), 500);
            } catch (addErr) {
              throw new Error(`Failed to add network ${chainName}`);
            }
          }
        } else {
          throw err;
        }
      }
    },
    [recreateAdapter],
  );

  const bridgeTokens = useCallback(
    async (config: BridgeConfig) => {
      setIsLoading(true);
      setError(null);

      try {
        // Use ref as fallback if state is null
        const currentAdapter = adapter || adapterRef.current;

        if (!currentAdapter) {
          throw new Error("Adapter not initialized. Please reconnect wallet.");
        }

        console.log("Using adapter:", currentAdapter);

        // Recreate adapter to ensure it's up to date with current network
        if (!window.ethereum) {
          throw new Error("No wallet provider found");
        }

        const freshAdapter = await createViemAdapterFromProvider({
          provider: window.ethereum,
          capabilities: {
            addressContext: "user-controlled",
          },
        });

        if (!freshAdapter) {
          throw new Error("Failed to create fresh adapter");
        }

        // Use AppKit for bridge
        const kit = new AppKit();
        const result = await kit.bridge({
          from: { adapter: freshAdapter, chain: config.from.chain },
          to: { adapter: freshAdapter, chain: config.to.chain },
          amount: config.from.amount,
          config: {
            transferSpeed: TransferSpeed.SLOW,
          },
        });

        console.log("Bridge result:", result);

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Bridge transaction failed";
        setError(errorMessage);
        console.error("Bridge error:", errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [adapter],
  );

  /**
   * Fetch USDC balance for the current account using ethers
   */

  const fetchUSDCBalance = useCallback(
    async (chainName: BridgeChainType): Promise<string> => {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      try {
        // Switch to the target chain first
        await switchNetwork(chainName);

        const usdcAddress = getUSDCAddress(chainName);
        if (!usdcAddress) {
          throw new Error(`USDC not supported on ${chainName}`);
        }

        // Create provider from window.ethereum
        if (!window.ethereum) {
          throw new Error("No wallet provider found");
        }

        const provider = new ethers.BrowserProvider(window.ethereum);

        // ERC20 ABI - only need balanceOf function
        const ERC20_ABI = [
          "function balanceOf(address account) external view returns (uint256)",
        ];

        // Create contract instance
        const contract = new ethers.Contract(usdcAddress, ERC20_ABI, provider);

        // Call balanceOf

        const balance = await contract.balanceOf(account);

        // Format balance (USDC has 6 decimals)
        const formattedBalance = Number(
          ethers.formatUnits(balance, USDC_DECIMALS),
        );

        const floored = Math.floor(formattedBalance * 100) / 100;

        return floored.toFixed(2);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch USDC balance";
        console.error("Error fetching balance:", message);
        throw err;
      }
    },

    [account, switchNetwork],
  );

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!window.ethereum) {
        throw new Error("No wallet provider found");
      }

      // 🔹 conecta carteira
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // 🔹 ethers provider
      const provider = new ethers.BrowserProvider(window.ethereum);

      // 🔹 pega signer
      const signer = await provider.getSigner();

      // 🔹 pega address
      const address = await signer.getAddress();

      setAccount(address);

      // 🔹 cria adapter (continua usando viem)
      const viemAdapter = await createViemAdapterFromProvider({
        provider: window.ethereum,
        capabilities: {
          addressContext: "user-controlled",
        },
      });
      if (!viemAdapter) {
        throw Error("Failed to create adapter from provider");
      }

      setAdapter(viemAdapter);
      adapterRef.current = viemAdapter;

      // Add listeners for account and chain changes
      window.ethereum.on("accountsChanged", () => {
        console.log("Account changed - recreating adapter");
        recreateAdapter();
      });

      window.ethereum.on("chainChanged", () => {
        console.log("Chain changed - recreating adapter");
        recreateAdapter();
      });

      return address;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to connect wallet";

      setError(message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [recreateAdapter]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setAdapter(null);
    setError(null);
  }, []);

  return {
    account,
    adapter,
    connectWallet,
    disconnectWallet,
    isConnecting,
    error,
    fetchUSDCBalance,
    switchNetwork,
    currentChain,
    isLoading,
    bridgeTokens,
  };
}
