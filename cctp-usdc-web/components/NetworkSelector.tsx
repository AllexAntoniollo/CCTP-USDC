"use client";

import { useState, useRef, useEffect } from "react";
import type { BlockchainNetwork } from "@/lib/cctp.types";

interface NetworkSelectorProps {
  networks: BlockchainNetwork[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function NetworkSelector({
  networks,
  value,
  onChange,
  label,
}: NetworkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedNetwork = networks.find((n) => n.id === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative w-full">
      {label && (
        <p className="text-sm text-zinc-400 mb-2 font-medium">{label}</p>
      )}

      <div ref={dropdownRef} className="relative">
        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 rounded-xl p-4 flex items-center justify-between transition-all duration-200 group shadow-xs"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl drop-shadow-xs">
              {selectedNetwork?.icon}
            </span>
            <div className="text-left">
              <p className="text-zinc-100 font-medium">
                {selectedNetwork?.name}
              </p>
              <p className="text-xs text-zinc-500 font-medium">
                {selectedNetwork?.isTestnet ? "Testnet" : "Mainnet"}
              </p>
            </div>
          </div>

          {/* Chevron */}
          <svg
            className={`w-5 h-5 text-zinc-500 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-96 overflow-y-auto">
              {/* Group by mainnet/testnet */}
              {networks.filter((n) => !n.isTestnet).length > 0 && (
                <div>
                  <div className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider bg-zinc-900 border-b border-zinc-800/50 sticky top-0 z-10">
                    Mainnet
                  </div>
                  {networks
                    .filter((n) => !n.isTestnet)
                    .map((network) => (
                      <button
                        key={network.id}
                        onClick={() => {
                          onChange(network.id);
                          setIsOpen(false);
                        }}
                        className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-150 ${
                          value === network.id
                            ? "bg-zinc-800/80 border-l-2 border-blue-500"
                            : "hover:bg-zinc-800/50 border-l-2 border-transparent"
                        }`}
                      >
                        <span className="text-xl drop-shadow-xs">
                          {network.icon}
                        </span>
                        <div className="flex-1 text-left">
                          <p
                            className={`text-sm font-medium ${value === network.id ? "text-blue-400" : "text-zinc-200"}`}
                          >
                            {network.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {network.chainId
                              ? `Chain ID: ${network.chainId}`
                              : network.title}
                          </p>
                        </div>
                        {value === network.id && (
                          <svg
                            className="w-4 h-4 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                </div>
              )}

              {/* Testnet section */}
              {networks.filter((n) => n.isTestnet).length > 0 && (
                <div>
                  <div className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider bg-zinc-900 border-y border-zinc-800/50 sticky top-0 z-10">
                    Testnet
                  </div>
                  {networks
                    .filter((n) => n.isTestnet)
                    .map((network) => (
                      <button
                        key={network.id}
                        onClick={() => {
                          onChange(network.id);
                          setIsOpen(false);
                        }}
                        className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-150 ${
                          value === network.id
                            ? "bg-zinc-800/80 border-l-2 border-blue-500"
                            : "hover:bg-zinc-800/50 border-l-2 border-transparent"
                        }`}
                      >
                        <span className="text-xl drop-shadow-xs">
                          {network.icon}
                        </span>
                        <div className="flex-1 text-left">
                          <p
                            className={`text-sm font-medium ${value === network.id ? "text-blue-400" : "text-zinc-200"}`}
                          >
                            {network.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {network.chainId
                              ? `Chain ID: ${network.chainId}`
                              : network.title}
                          </p>
                        </div>
                        {value === network.id && (
                          <svg
                            className="w-4 h-4 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
