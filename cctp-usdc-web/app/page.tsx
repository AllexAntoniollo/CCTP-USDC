"use client";

import { useEffect, useState } from "react";
import type { BridgeChainType } from "@/lib/cctp.types";
import {
  MAINNET_NETWORKS,
  getBridgeFeePercent,
  getBridgeTimeEstimate,
} from "@/lib/cctp.constants";
import { useWalletConnection } from "@/lib/useCCTPBridge";
import { NetworkSelector } from "@/components/NetworkSelector";
import { BridgeInfo } from "@/components/BridgeInfo";

export default function Home() {
  const {
    account,
    connectWallet,
    disconnectWallet,
    isConnecting,
    error: walletError,
    adapter,
    fetchUSDCBalance,
    currentChain,
    bridgeTokens,
    isLoading,
  } = useWalletConnection();

  const [from, setFrom] = useState<BridgeChainType>("Ethereum");
  const [to, setTo] = useState<BridgeChainType>("Arbitrum");
  const [amount, setAmount] = useState("");
  const [usdcBalance, setUsdcBalance] = useState<string>("0.00");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isFreeTransaction, setIsFreeTransaction] = useState(true);
  const [destinationAddress, setDestinationAddress] = useState("");

  useEffect(() => {
    if (account) {
      setDestinationAddress(account);
    }
  }, [account]);

  // Calculate bridge fee
  const calculateFee = () => {
    if (!amount || isFreeTransaction) return 0;
    const feePercent = getBridgeFeePercent(from);
    return (parseFloat(amount) * feePercent) / 100;
  };

  // Get bridge time estimate
  const getBridgeTime = () => {
    return getBridgeTimeEstimate(from, isFreeTransaction);
  };

  const fetchBalance = async () => {
    if (!adapter || !account) return;

    setIsLoadingBalance(true);
    try {
      const balance = await fetchUSDCBalance(from);
      setUsdcBalance(balance);
    } catch (err) {
      console.error("Error fetching USDC balance:", err);
      setUsdcBalance("0.00");
    } finally {
      setIsLoadingBalance(false);
    }
  };
  useEffect(() => {
    fetchBalance();
  }, [adapter, account, from, fetchUSDCBalance, bridgeTokens]);

  const handleBridge = async () => {
    if (!amount || !account) return;

    try {
      await bridgeTokens({
        from: { chain: from, amount },
        to: { chain: to },
        destinationAddress: destinationAddress,
        isFast: !isFreeTransaction,
      });
      await fetchBalance(); // Refresh balance after bridging
    } catch (err) {
      console.error("Bridge failed:", err);
    }
  };

  const swapChains = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-tl from-pink-500/5 via-transparent to-transparent blur-3xl opacity-20" />

      <div className="relative w-full max-w-xl">
        {/* Card */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/3 border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                CCTP Bridge
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Cross-Chain Transfer Protocol
              </p>
            </div>
            {account ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Connected to</p>
                  <p className="text-sm font-mono text-white">
                    {currentChain || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Account</p>
                  <p className="text-sm font-mono text-white">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </p>
                </div>

                <button
                  onClick={disconnectWallet}
                  className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition text-sm font-medium border border-red-500/50"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition disabled:opacity-50 font-medium text-sm border border-white/20 shadow-lg hover:shadow-purple-500/50"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>

          {/* Error messages */}
          {walletError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{walletError}</span>
              </div>
            </div>
          )}

          {/* FROM Section */}
          <div className="mb-4">
            <NetworkSelector
              networks={MAINNET_NETWORKS}
              value={from}
              onChange={(value) => setFrom(value as BridgeChainType)}
              label="From"
            />
          </div>

          {/* Balance indicator */}
          <div className="mb-6 text-right">
            <p className="text-xs text-gray-400">Available Balance</p>
            <p className="text-lg font-semibold text-white mt-1 flex items-center justify-end gap-2">
              {isLoadingBalance ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span className="text-gray-400">Loading...</span>
                </>
              ) : (
                <>{usdcBalance} USDC</>
              )}
            </p>
          </div>

          {/* INPUT */}
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-2">Amount</p>
            <div className="bg-gradient-to-r from-white/5 to-white/10 border border-white/20 hover:border-white/40 rounded-2xl p-4 flex items-center justify-between transition-all duration-200">
              <input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent outline-none text-4xl w-full font-medium placeholder:text-gray-600"
              />
              <span className="text-gray-400 ml-4 font-semibold">USDC</span>
            </div>
          </div>

          {/* Quick amount buttons */}
          <div className="flex gap-2 mb-6">
            {[10, 50, 100].map((quick) => (
              <button
                key={quick}
                onClick={() => setAmount(quick.toString())}
                className="flex-1 px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition text-gray-300 font-medium"
              >
                {quick}
              </button>
            ))}
            <button
              onClick={() => setAmount("0.00")}
              className="flex-1 px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition text-gray-300 font-medium"
            >
              Clear
            </button>
          </div>

          {/* Transaction Type Checkbox */}
          <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="freeTransaction"
                checked={isFreeTransaction}
                onChange={(e) => setIsFreeTransaction(e.target.checked)}
                className="w-5 h-5 rounded accent-purple-500 cursor-pointer"
              />
              <label
                htmlFor="freeTransaction"
                className="cursor-pointer flex-1"
              >
                <p className="text-sm font-medium text-white">
                  {isFreeTransaction
                    ? "Free Transaction"
                    : "Pay Transaction Fee"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isFreeTransaction
                    ? "Slower confirmation time"
                    : "Faster confirmation time"}
                </p>
              </label>
            </div>
          </div>

          {/* Fee and Time Info */}
          {amount && (
            <div className="mb-6 grid grid-cols-2 gap-3">
              {/* Fee Info */}
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30">
                <p className="text-xs text-gray-400 mb-1">
                  {isFreeTransaction ? "No Fee" : "Transaction Fee"}
                </p>
                <p className="text-lg font-semibold text-white">
                  {isFreeTransaction ? "0.00" : calculateFee().toFixed(4)} USDC
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {isFreeTransaction ? "-" : `${getBridgeFeePercent(from)}%`}
                </p>
              </div>

              {/* Time Info */}
              <div className="p-3 rounded-lg bg-gradient-to-br from-pink-500/20 to-red-500/20 border border-pink-400/30">
                <p className="text-xs text-gray-400 mb-1">Est. Time</p>
                <p className="text-lg font-semibold text-white">
                  ~{getBridgeTime()}
                </p>
                <p className="text-xs text-gray-500 mt-1">to {to}</p>
              </div>
            </div>
          )}

          {/* SWITCH */}
          <div className="flex justify-center mb-6">
            <button
              onClick={swapChains}
              className="p-3 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 hover:from-blue-500/50 hover:to-purple-500/50 border border-blue-400/50 transition-all duration-300 hover:scale-110 shadow-lg group"
            >
              <svg
                className="w-5 h-5 text-blue-300 group-hover:text-blue-200 transition-transform duration-300 group-hover:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m0 0l4 4m10-4v12m0 0l4-4m0 0l-4-4"
                />
              </svg>
            </button>
          </div>

          {/* TO Section */}
          <div className="mb-8">
            <NetworkSelector
              networks={MAINNET_NETWORKS}
              value={to}
              onChange={(value) => setTo(value as BridgeChainType)}
              label="To"
            />
          </div>

          {/* Destination Address */}
          <div className="mb-8">
            <p className="text-sm text-gray-400 mb-2">Destination Address</p>
            <div className="bg-gradient-to-r from-white/5 to-white/10 border border-white/20 hover:border-white/40 rounded-2xl p-4 flex items-center justify-between transition-all duration-200">
              <input
                type="text"
                placeholder="0x..."
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                className="bg-transparent outline-none text-sm w-full font-mono placeholder:text-gray-600"
              />
              {destinationAddress && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(destinationAddress);
                  }}
                  className="ml-2 text-gray-400 hover:text-white transition"
                  title="Copy address"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              )}
            </div>
            {account && destinationAddress === account && (
              <p className="text-xs text-gray-500 mt-2">
                Connected wallet address
              </p>
            )}
          </div>

          {/* Summary card */}
          {amount && (
            <div className="mb-6">
              <BridgeInfo amount={amount} fromChain={from} toChain={to} />
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleBridge}
            disabled={!account || isLoading || !amount}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 font-semibold text-lg hover:from-blue-400 hover:via-purple-400 hover:to-pink-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/50 border border-white/10 disabled:border-white/5"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Bridging...
              </span>
            ) : (
              "Bridge USDC"
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
