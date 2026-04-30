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
import { getAttestation } from "@/services/Web2Service";

type TabType = "bridge" | "status";

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

  const [activeTab, setActiveTab] = useState<TabType>("bridge");

  const [from, setFrom] = useState<BridgeChainType>("Ethereum");
  const [to, setTo] = useState<BridgeChainType>("Arbitrum");

  const [amount, setAmount] = useState("");
  const [usdcBalance, setUsdcBalance] = useState<string>("0.00");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isFreeTransaction, setIsFreeTransaction] = useState(true);
  const [destinationAddress, setDestinationAddress] = useState("");

  // STATUS CARD STATES
  const [statusChain, setStatusChain] = useState<BridgeChainType>("Ethereum");
  const [statusTxHash, setStatusTxHash] = useState("");

  useEffect(() => {
    if (account) {
      setDestinationAddress(account);
    }
  }, [account]);

  const calculateFee = () => {
    if (!amount || isFreeTransaction) return 0;

    const feePercent = getBridgeFeePercent(from);

    return (parseFloat(amount) * feePercent) / 100;
  };

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

      await fetchBalance();
    } catch (err) {
      console.error("Bridge failed:", err);
    }
  };

  const handleCheckBridgeStatus = async () => {
    try {
      console.log({
        chainIn: statusChain,
        txHash: statusTxHash,
      });

      const res = await getAttestation(statusChain, statusTxHash);
      if (res.attestation === "PENDING") {
        console.log("Attestation is still pending. Please check again later.");
      } else {
        console.log("Attestation found:");
        console.log(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const swapChains = () => {
    const temp = from;

    setFrom(to);
    setTo(temp);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-6">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl opacity-30" />

      <div className="relative w-full max-w-xl">
        <div className="backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/3 border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* HEADER */}
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

          {/* TABS */}
          <div className="mb-8 flex gap-3">
            <button
              onClick={() => setActiveTab("bridge")}
              className={`flex-1 py-3 rounded-xl border transition-all duration-200 font-medium ${
                activeTab === "bridge"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 border-purple-400 text-white"
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              Bridge
            </button>

            <button
              onClick={() => setActiveTab("status")}
              className={`flex-1 py-3 rounded-xl border transition-all duration-200 font-medium ${
                activeTab === "status"
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 border-pink-400 text-white"
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              Check Status
            </button>
          </div>

          {/* ERRORS */}
          {walletError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
              {walletError}
            </div>
          )}

          {/* ====================================================== */}
          {/* ===================== BRIDGE CARD ==================== */}
          {/* ====================================================== */}

          {activeTab === "bridge" && (
            <>
              {/* FROM */}
              <div className="mb-4">
                <NetworkSelector
                  networks={MAINNET_NETWORKS}
                  value={from}
                  onChange={(value) => setFrom(value as BridgeChainType)}
                  label="From"
                />
              </div>

              {/* BALANCE */}
              <div className="mb-6 text-right">
                <p className="text-xs text-gray-400">Available Balance</p>

                <p className="text-lg font-semibold text-white mt-1">
                  {isLoadingBalance ? "Loading..." : `${usdcBalance} USDC`}
                </p>
              </div>

              {/* AMOUNT */}
              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-2">Amount</p>

                <div className="bg-gradient-to-r from-white/5 to-white/10 border border-white/20 rounded-2xl p-4 flex items-center justify-between">
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

              {/* QUICK BUTTONS */}
              <div className="flex gap-2 mb-6">
                {[10, 50, 100].map((quick) => (
                  <button
                    key={quick}
                    onClick={() => setAmount(quick.toString())}
                    className="flex-1 px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
                  >
                    {quick}
                  </button>
                ))}

                <button
                  onClick={() => setAmount("0.00")}
                  className="flex-1 px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
                >
                  Clear
                </button>
              </div>

              {/* FAST/SLOW */}
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

              {/* INFO */}
              {amount && (
                <div className="mb-6 grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30">
                    <p className="text-xs text-gray-400 mb-1">Fee</p>

                    <p className="text-lg font-semibold text-white">
                      {isFreeTransaction ? "0.00" : calculateFee().toFixed(4)}{" "}
                      USDC
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-br from-pink-500/20 to-red-500/20 border border-pink-400/30">
                    <p className="text-xs text-gray-400 mb-1">Est. Time</p>

                    <p className="text-lg font-semibold text-white">
                      ~{getBridgeTime()}
                    </p>
                  </div>
                </div>
              )}

              {/* SWITCH */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={swapChains}
                  className="p-3 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 hover:scale-110 transition"
                >
                  ⇅
                </button>
              </div>

              {/* TO */}
              <div className="mb-8">
                <NetworkSelector
                  networks={MAINNET_NETWORKS}
                  value={to}
                  onChange={(value) => setTo(value as BridgeChainType)}
                  label="To"
                />
              </div>

              {/* DESTINATION */}
              <div className="mb-8">
                <p className="text-sm text-gray-400 mb-2">
                  Destination Address
                </p>

                <div className="bg-gradient-to-r from-white/5 to-white/10 border border-white/20 rounded-2xl p-4">
                  <input
                    type="text"
                    placeholder="0x..."
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                    className="bg-transparent outline-none text-sm w-full font-mono placeholder:text-gray-600"
                  />
                </div>
              </div>

              {/* SUMMARY */}
              {amount && (
                <div className="mb-6">
                  <BridgeInfo amount={amount} fromChain={from} toChain={to} />
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleBridge}
                disabled={!account || isLoading || !amount}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 font-semibold text-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {isLoading ? "Bridging..." : "Bridge USDC"}
              </button>
            </>
          )}

          {/* ====================================================== */}
          {/* ===================== STATUS CARD ==================== */}
          {/* ====================================================== */}

          {activeTab === "status" && (
            <div>
              {/* CHAIN */}
              <div className="mb-6">
                <NetworkSelector
                  networks={MAINNET_NETWORKS}
                  value={statusChain}
                  onChange={(value) => setStatusChain(value as BridgeChainType)}
                  label="Chain In"
                />
              </div>

              {/* TX HASH */}
              <div className="mb-8">
                <p className="text-sm text-gray-400 mb-2">
                  Burn Transaction Hash
                </p>

                <div className="bg-gradient-to-r from-white/5 to-white/10 border border-white/20 rounded-2xl p-4">
                  <input
                    type="text"
                    placeholder="0x..."
                    value={statusTxHash}
                    onChange={(e) => setStatusTxHash(e.target.value)}
                    className="bg-transparent outline-none text-sm w-full font-mono placeholder:text-gray-600"
                  />
                </div>
              </div>

              {/* BUTTON */}
              <button
                onClick={handleCheckBridgeStatus}
                disabled={!statusTxHash}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 font-semibold text-lg hover:opacity-90 transition disabled:opacity-50"
              >
                Check Bridge Status
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
