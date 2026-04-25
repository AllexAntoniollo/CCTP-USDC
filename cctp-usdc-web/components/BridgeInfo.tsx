"use client";

interface BridgeInfoProps {
  amount: string;
  fromChain: string;
  toChain: string;
}

export function BridgeInfo({ amount, fromChain, toChain }: BridgeInfoProps) {
  if (!amount) return null;

  // Simulated fee calculation

  return (
    <div className="space-y-3 text-sm">
      {/* Amount breakdown */}

      {/* Route info */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <span>{fromChain}</span>
        <span className="flex items-center gap-1">
          <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
          <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
          <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
        </span>
        <span>{toChain}</span>
      </div>
    </div>
  );
}
