"use client";

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
export function useCCTPBridge() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<BridgeTransaction | null>(
    null,
  );
  const adapterCacheRef = useRef<Map<BridgeChainType, any>>(new Map());

  /**
   * Initialize adapter for a specific chain
   * In production, this would use the viem adapter from the SDK
   */
  const initializeAdapter = useCallback(
    async (chain: BridgeChainType, privateKey?: string) => {
      if (adapterCacheRef.current.has(chain)) {
        return adapterCacheRef.current.get(chain);
      }

      try {
        // Note: In production, this would be:
        // import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";
        // const adapter = createViemAdapterFromPrivateKey({
        //   privateKey: privateKey || process.env.NEXT_PUBLIC_PRIVATE_KEY,
        // });

        // For now, we'll create a placeholder adapter
        const adapter = {
          chain,
          initialized: true,
          getAddress: async () => "0x...", // Would get from wallet
          signTransaction: async (tx: any) => ({ ...tx, signed: true }),
        };

        adapterCacheRef.current.set(chain, adapter);
        return adapter;
      } catch (err) {
        setError(`Failed to initialize adapter for ${chain}`);
        throw err;
      }
    },
    [],
  );

  /**
   * Bridge tokens between chains
   */
  const bridgeTokens = useCallback(
    async (config: BridgeConfig, privateKey?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Initialize adapters for both chains
        const fromAdapter = await initializeAdapter(
          config.from.chain,
          privateKey,
        );
        const toAdapter = await initializeAdapter(config.to.chain, privateKey);

        // In production, this would use:
        // import { AppKit } from "@circle-fin/app-kit";
        // const kit = new AppKit();
        // const result = await kit.bridge({
        //   from: { adapter: fromAdapter, chain: config.from.chain },
        //   to: { adapter: toAdapter, chain: config.to.chain },
        //   amount: config.from.amount,
        // });

        // Simulate bridge transaction
        const tx: BridgeTransaction = {
          hash: `0x${Math.random().toString(16).slice(2)}`,
          status: "pending",
          from: config.from.chain,
          to: config.to.chain,
          amount: config.from.amount,
        };

        setTransaction(tx);
        return tx;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Bridge transaction failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [initializeAdapter],
  );

  /**
   * Clear transaction state
   */
  const clearTransaction = useCallback(() => {
    setTransaction(null);
    setError(null);
  }, []);

  return {
    bridgeTokens,
    initializeAdapter,
    clearTransaction,
    isLoading,
    error,
    transaction,
  };
}

/**
 * Hook for wallet connection management
 */
declare global {
  interface Window {
    ethereum?: any;
  }
}

import { ethers } from "ethers";

export function useWalletConnection() {
  const [account, setAccount] = useState<string | null>(null);
  const [adapter, setAdapter] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  };
}
