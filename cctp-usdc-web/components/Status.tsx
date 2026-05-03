"use client";

import { useState } from "react";
import type { BridgeChainType } from "@/lib/cctp.types";
import { MAINNET_NETWORKS } from "@/lib/cctp.constants";
import { NetworkSelector } from "@/components/NetworkSelector";
import { getAttestation } from "@/services/Web2Service";
import { mintUsdc } from "@/services/Web3Service";
import { ethers } from "ethers";
import { CHAIN_CONFIG } from "@/lib/usdc.constants";
import { useWalletConnection } from "@/lib/useCCTPBridge";

export function Status() {
  const [statusChain, setStatusChain] = useState<BridgeChainType>("Ethereum");
  const [destinationChain, setDestinationChain] =
    useState<BridgeChainType>("Ethereum");
  const { switchNetwork } = useWalletConnection();
  const [statusTxHash, setStatusTxHash] = useState("");

  const [statusMessage, setStatusMessage] = useState("");
  const [attestation, setAttestation] = useState("");
  const [messageBytes, setMessageBytes] = useState("");

  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const handleCheckBridgeStatus = async () => {
    try {
      setIsCheckingStatus(true);

      setStatusMessage("");
      setAttestation("");
      setMessageBytes("");

      const res = await getAttestation(statusChain, statusTxHash);
      console.log(res);

      if (res.attestation === "PENDING") {
        setStatusMessage(
          "⏳ Attestation is still pending. Please check again later.",
        );

        return;
      }

      setStatusMessage("✅ Attestation found successfully!");

      setAttestation(res.attestation || "");
      setMessageBytes(res.message || "");
      const destinationDomain = Number(res.decodedMessage.destinationDomain);

      const destinationNetwork = Object.values(CHAIN_CONFIG).find(
        (chain) => chain.domain === destinationDomain,
      );

      if (destinationNetwork) {
        setDestinationChain(destinationNetwork.name as BridgeChainType);
      } else {
        console.log("Domínio não encontrado");
      }
    } catch (err) {
      console.error(err);

      setStatusMessage("❌ Failed to fetch attestation.");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleMint = async () => {
    try {
      setIsMinting(true);

      setStatusMessage("⏳ Minting USDC...");

      const provider = new ethers.BrowserProvider(window.ethereum);

      const signer = await provider.getSigner();
      switchNetwork(destinationChain);
      await mintUsdc(messageBytes, attestation, signer);

      setStatusMessage("✅ USDC minted successfully!");
    } catch (err) {
      console.error(err);

      setStatusMessage("❌ Failed to mint USDC.");
    } finally {
      setIsMinting(false);
      switchNetwork(statusChain);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* NETWORK */}
      <div className="mb-6">
        <NetworkSelector
          networks={MAINNET_NETWORKS}
          value={statusChain}
          onChange={(value) => setStatusChain(value as BridgeChainType)}
          label="Source Chain"
        />
      </div>

      {/* TX HASH */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-400">Burn Transaction Hash</p>

          {statusTxHash && (
            <button
              onClick={() => setStatusTxHash("")}
              className="text-xs text-red-400 hover:text-red-300 transition"
            >
              Clear
            </button>
          )}
        </div>

        <div className="bg-gradient-to-r from-white/5 to-white/10 border border-white/20 rounded-2xl p-4 focus-within:border-purple-400 transition">
          <input
            type="text"
            placeholder="0x..."
            value={statusTxHash}
            onChange={(e) => setStatusTxHash(e.target.value)}
            className="bg-transparent outline-none text-sm w-full font-mono placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* CHECK BUTTON */}
      <button
        onClick={handleCheckBridgeStatus}
        disabled={!statusTxHash || isCheckingStatus}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 font-semibold text-lg hover:scale-[1.01] hover:opacity-90 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-purple-500/20"
      >
        {isCheckingStatus ? "Checking..." : "Check Bridge Status"}
      </button>

      {/* STATUS */}
      {statusMessage && (
        <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <p className="text-sm text-white break-words">{statusMessage}</p>
        </div>
      )}

      {/* RESULTS */}
      {(attestation || messageBytes) && (
        <div className="mt-6 space-y-6">
          {/* ATTESTATION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">Attestation</p>

              {attestation && (
                <button
                  onClick={() => navigator.clipboard.writeText(attestation)}
                  className="text-xs text-purple-400 hover:text-purple-300 transition"
                >
                  Copy
                </button>
              )}
            </div>

            <div className="bg-gradient-to-r from-white/5 to-white/10 border border-white/20 rounded-2xl p-4">
              <textarea
                value={attestation}
                onChange={(e) => setAttestation(e.target.value)}
                rows={6}
                className="bg-transparent outline-none text-xs w-full font-mono placeholder:text-gray-600 resize-none"
                placeholder="Attestation..."
              />
            </div>
          </div>

          {/* MESSAGE */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">Message Bytes</p>

              {messageBytes && (
                <button
                  onClick={() => navigator.clipboard.writeText(messageBytes)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition"
                >
                  Copy
                </button>
              )}
            </div>

            <div className="bg-gradient-to-r from-white/5 to-white/10 border border-white/20 rounded-2xl p-4">
              <textarea
                value={messageBytes}
                onChange={(e) => setMessageBytes(e.target.value)}
                rows={6}
                className="bg-transparent outline-none text-xs w-full font-mono placeholder:text-gray-600 resize-none"
                placeholder="Message..."
              />
            </div>
          </div>

          {/* MINT BUTTON */}
          <button
            onClick={handleMint}
            disabled={!attestation || !messageBytes || isMinting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 font-semibold text-lg hover:scale-[1.01] hover:opacity-90 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-emerald-500/20"
          >
            {isMinting ? "Minting..." : "Mint USDC"}
          </button>
        </div>
      )}
    </div>
  );
}
