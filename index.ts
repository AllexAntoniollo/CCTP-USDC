// Import App Kit and its dependencies
import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";
import { inspect } from "util";
import dotenv from "dotenv";
dotenv.config();
// Initialize the SDK
const kit = new AppKit();

const bridgeUSDC = async (): Promise<void> => {
  try {
    // Initialize the adapter which lets you bridge tokens from your wallet on any EVM-compatible chain
    const adapter = createViemAdapterFromPrivateKey({
      privateKey: process.env.PRIVATE_KEY as string,
    });

    console.log("---------------Starting Bridging---------------");

    // Use the same adapter for the source and destination blockchains
    const result = await kit.bridge({
      from: { adapter, chain: "Polygon" },
      to: { adapter, chain: "Linea" },
      amount: "0.01",
    });

    console.log("RESULT", inspect(result, false, null, true));
  } catch (err) {
    console.log("ERROR", inspect(err, false, null, true));
  }
};

void bridgeUSDC();
