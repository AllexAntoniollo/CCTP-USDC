# CCTP Bridge Integration Guide

## Overview

This document explains the CCTP (Cross-Chain Transfer Protocol) bridge integration in the frontend, including supported blockchains, adapter setup, and usage.

## Supported Blockchains

### Mainnet Networks

- **Ethereum** - Ethereum Mainnet
- **Arbitrum** - Arbitrum Mainnet (42161)
- **Base** - Base Mainnet (8453)
- **Optimism** - Optimism Mainnet (10)
- **Polygon** - Polygon Mainnet (137)
- **Avalanche** - Avalanche Mainnet (43114)
- **Linea** - Linea Mainnet (59144)
- **Solana** - Solana Mainnet
- **Sonic** - Sonic Mainnet
- **Unichain** - Unichain Mainnet
- **Morph** - Morph Mainnet
- **XDC** - XDC Mainnet
- **Sei** - Sei Mainnet

### Testnet Networks

- **Ethereum Sepolia** - Ethereum Sepolia Testnet (11155111)
- **Arbitrum Sepolia** - Arbitrum Sepolia Testnet (421614)
- **Base Sepolia** - Base Sepolia Testnet (84532)
- **Optimism Sepolia** - Optimism Sepolia Testnet (11155420)
- **Polygon Amoy** - Polygon Amoy Testnet (80002)
- **Avalanche Fuji** - Avalanche Fuji Testnet (43113)
- **Linea Sepolia** - Linea Sepolia Testnet (59141)

## File Structure

```
cctp-usdc-web/
├── lib/
│   ├── cctp.types.ts       # Type definitions for CCTP
│   ├── cctp.constants.ts   # Blockchain networks configuration
│   └── useCCTPBridge.ts    # React hooks for bridge operations
├── app/
│   └── page.tsx            # Main bridge component
└── tsconfig.json           # TypeScript configuration
```

## Key Components

### 1. Types (`cctp.types.ts`)

```typescript
type BridgeChainType =
  | "Arbitrum" | "Avalanche" | "Base" | "Ethereum" | ... // All supported chains

interface BlockchainNetwork {
  id: BridgeChainType;
  name: string;
  title: string;
  isTestnet: boolean;
  chainId?: number;
  color: string;
  icon?: string;
}

interface BridgeConfig {
  from: { chain: BridgeChainType; amount: string };
  to: { chain: BridgeChainType };
}
```

### 2. Constants (`cctp.constants.ts`)

Exports:

- `BRIDGE_NETWORKS` - All supported networks
- `MAINNET_NETWORKS` - Only mainnet chains
- `TESTNET_NETWORKS` - Only testnet chains
- `getNetworkById(id)` - Get network by ID

### 3. Hooks (`useCCTPBridge.ts`)

#### `useCCTPBridge()`

Manages bridge operations:

```typescript
const {
  bridgeTokens, // Async function to bridge tokens
  initializeAdapter, // Initialize viem adapter for a chain
  clearTransaction, // Clear transaction state
  isLoading, // Loading state
  error, // Error message
  transaction, // Current transaction
} = useCCTPBridge();

// Usage
await bridgeTokens({
  from: { chain: "Ethereum", amount: "10" },
  to: { chain: "Arbitrum" },
});
```

#### `useWalletConnection()`

Manages wallet connections:

```typescript
const {
  account, // Connected wallet account
  connectWallet, // Connect wallet function
  disconnectWallet, // Disconnect wallet function
  isConnecting, // Connection state
  error, // Error message
} = useWalletConnection();
```

## SDK Integration

### Current Implementation

The hooks provide placeholder implementations ready for SDK integration:

```typescript
// Replace with actual SDK imports:
import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";

// In useCCTPBridge.ts:
const initializeAdapter = async (
  chain: BridgeChainType,
  privateKey?: string,
) => {
  const adapter = createViemAdapterFromPrivateKey({
    privateKey: privateKey || process.env.NEXT_PUBLIC_PRIVATE_KEY,
  });
  return adapter;
};

const result = await kit.bridge({
  from: { adapter: fromAdapter, chain: config.from.chain },
  to: { adapter: toAdapter, chain: config.to.chain },
  amount: config.from.amount,
});
```

### Wallet Connection

For production wallet connection:

```typescript
// Replace with ethers.js or web3.js
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const address = await signer.getAddress();
```

## Component Usage

The main bridge component (`page.tsx`) includes:

- **Network Selection**: Toggle between mainnet/testnet and select chains
- **Amount Input**: Enter USDC amount to bridge
- **Wallet Connection**: Connect/disconnect wallet
- **Bridge Execution**: Execute bridge transaction with error handling
- **Transaction Tracking**: Display transaction status

### Features

```typescript
// Toggle between mainnet and testnet
<button onClick={() => setShowTestnets(!showTestnets)}>
  {showTestnets ? 'Testnet' : 'Mainnet'}
</button>

// Switch source and destination chains
const swapChains = () => {
  const temp = from;
  setFrom(to);
  setTo(temp);
};

// Execute bridge
const handleBridge = async () => {
  await bridgeTokens({
    from: { chain: from, amount },
    to: { chain: to },
  });
};
```

## Configuration

### Environment Variables

Create `.env.local` in `cctp-usdc-web/`:

```
NEXT_PUBLIC_PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_INFURA_KEY=your_infura_key
NEXT_PUBLIC_ALCHEMY_KEY=your_alchemy_key
```

### TypeScript Path Aliases

Already configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

This allows imports like:

```typescript
import { BRIDGE_NETWORKS } from "@/lib/cctp.constants";
```

## Development

### Install Dependencies

```bash
cd cctp-usdc-web
npm install
# Add Circle SDK dependencies when ready:
# npm install @circle-fin/app-kit @circle-fin/adapter-viem-v2
```

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the bridge UI.

### Build

```bash
npm run build
npm start
```

## Integration Steps

To integrate the actual Circle SDK:

1. **Install Dependencies**

   ```bash
   npm install @circle-fin/app-kit @circle-fin/adapter-viem-v2 viem ethers
   ```

2. **Update `useCCTPBridge.ts`**
   - Uncomment SDK imports
   - Replace mock adapter initialization with real SDK calls
   - Implement actual bridge transaction logic

3. **Update `useWalletConnection.ts`**
   - Replace mock account with real wallet connection
   - Use ethers.js or web3.js for wallet connection

4. **Environment Setup**
   - Set up Circle API keys if required
   - Configure RPC endpoints for each network

5. **Error Handling**
   - Implement proper error messages for failed transactions
   - Add transaction monitoring/confirmation logic

## Type Safety

All blockchain identifiers are type-safe:

```typescript
// ✅ Type-safe - only valid chains allowed
const from: BridgeChainType = "Ethereum";

// ❌ TypeScript error - invalid chain
const to: BridgeChainType = "InvalidChain"; // Error!
```

## References

- [Circle SDK Documentation](https://developers.circle.com/)
- [CCTP Protocol](https://www.circle.com/en/cross-chain-transfer-protocol)
- [Viem Documentation](https://viem.sh/)
- [Next.js Documentation](https://nextjs.org/docs)
