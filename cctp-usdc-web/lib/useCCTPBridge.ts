"use client";
import { AppKit, TransferSpeed } from "@circle-fin/app-kit";

import { useCallback, useRef, useState } from "react";
import type { BridgeChainType, BridgeConfig } from "./cctp.types";
import {
  createViemAdapterFromProvider,
  resolveChainIdentifier,
} from "@circle-fin/adapter-viem-v2";
import ERC20_ABI from "../services/abis/usdc.abi.json";
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
import {
  allowanceUSDC,
  approveUSDC,
  burn,
  mintUsdc,
} from "@/services/Web3Service";
import { getAttestation } from "@/services/Web2Service";

export function useWalletConnection() {
  const [account, setAccount] = useState<string | null>(null);
  const [adapter, setAdapter] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChain, setCurrentChain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Switch wallet to a specific network
   */
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
            } catch (addErr) {
              throw new Error(`Failed to add network ${chainName}`);
            }
          }
        } else {
          throw err;
        }
      }
    },
    [],
  );

  const bridgeTokens = useCallback(
    async (config: BridgeConfig) => {
      setIsLoading(true);
      setError(null);

      try {
        // Initialize adapters for both chains

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const allowance = await allowanceUSDC(config.from.chain, signer);
        if (
          BigInt(allowance) <
          BigInt(ethers.parseUnits(config.from.amount, USDC_DECIMALS))
        ) {
          await approveUSDC(config.from.chain, config.from.amount, signer);
        }
        const txHashBurn = await burn(
          config.from.chain,
          config.to.chain,
          config.from.amount,
          config.destinationAddress,
          signer,
          config.isFast,
        );
        let res = await getAttestation(config.from.chain, txHashBurn);
        console.log(res);

        while (!res || res.attestation == "PENDING") {
          await new Promise((resolve) => setTimeout(resolve, 10000));
          const updatedRes = await getAttestation(
            config.from.chain,
            txHashBurn,
          );
          res = updatedRes;
          console.log(res);
        }
        switchNetwork(config.to.chain);
        const txHashMint = await mintUsdc(res.message, res.attestation, signer);
        switchNetwork(config.from.chain);
        return;
      } catch (err) {
        switchNetwork(config.from.chain);
        const errorMessage =
          err instanceof Error ? err.message : "Bridge transaction failed";
        setError(errorMessage);
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

        // Create contract instance
        const contract = new ethers.Contract(usdcAddress, ERC20_ABI, provider);

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

      setAdapter(viemAdapter);

      return address;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to connect wallet";

      setError(message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

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
