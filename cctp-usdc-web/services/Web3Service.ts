import { ethers } from "ethers";
import {
  CHAIN_CONFIG,
  getUSDCAddress,
  USDC_DECIMALS,
} from "@/lib/usdc.constants";
import type { BridgeChainType } from "@/lib/cctp.types";
import ERC20_ABI from "./abis/usdc.abi.json";
import TOKEN_MESSENGER_ABI from "./abis/tokenMessenger.abi.json";
import MESSENGER_TRANSMITER_ABI from "./abis/messengerTransmiter.abi.json";

import { get } from "http";

/**
 * CCTP Circle TokenMessenger contract addresses by chain
 * These are the addresses for the TokenMessenger contract used for bridging
 */
export const TOKEN_MESSENGER_ADDRESSES =
  "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d";
export const MESSENGER_TRANSMITER_ADDRESS =
  "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64";

export async function approveUSDC(
  chain: BridgeChainType,
  amount: string,
  signer: ethers.Signer,
): Promise<string> {
  try {
    // Get chain configuration

    // Get USDC address
    const usdcAddress = getUSDCAddress(chain);
    if (!usdcAddress) {
      throw new Error(`USDC address not found for chain: ${chain}`);
    }

    const usdcContract = new ethers.Contract(usdcAddress, ERC20_ABI, signer);

    // Convert amount to wei (USDC has 6 decimals)
    const amountInWei = ethers.parseUnits(amount, USDC_DECIMALS);

    // Send approve transaction
    const tx = await usdcContract.approve(
      TOKEN_MESSENGER_ADDRESSES,
      amountInWei,
    );

    console.log(`Approve transaction sent: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error("Transaction receipt not found");
    }

    console.log(`Approve transaction confirmed: ${receipt.hash}`);

    return receipt.hash;
  } catch (error) {
    console.error("Error approving USDC:", error);
    throw new Error(
      `Failed to approve USDC: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function burn(
  chainIn: BridgeChainType,
  chainOut: BridgeChainType,
  amount: string,
  destinationAddress: string,
  signer: ethers.Signer,
  isFast: boolean,
): Promise<string> {
  try {
    // Get USDC address
    const usdcAddress = getUSDCAddress(chainIn);
    const chainOutConf = CHAIN_CONFIG[chainOut];

    if (!usdcAddress) {
      throw new Error(`USDC address not found for chain: ${chainIn}`);
    }
    if (!chainOutConf) {
      throw new Error(`Chain Out config not found for chain: ${chainOut}`);
    }

    const tokenMessenger = new ethers.Contract(
      TOKEN_MESSENGER_ADDRESSES,
      TOKEN_MESSENGER_ABI,
      signer,
    );
    const destinationCaller = ethers.ZeroHash; //Anyone can call

    // Send approve transaction
    const mintRecipient = ethers.zeroPadValue(destinationAddress, 32);
    const tx = await tokenMessenger.depositForBurn(
      ethers.parseUnits(amount, USDC_DECIMALS),
      chainOutConf.domain,
      mintRecipient,
      usdcAddress,
      destinationCaller,
      0,
      isFast ? 1000 : 2000,
    );

    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error("Transaction receipt not found");
    }

    console.log(`Burn transaction confirmed: ${receipt.hash}`);

    return receipt.hash;
  } catch (error) {
    console.error("Error Burning USDC:", error);
    throw new Error(
      `Failed to burn USDC: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function mintUsdc(
  message: string,
  attestation: string,
  signer: ethers.Signer,
): Promise<string> {
  try {
    const messagerTransmiter = new ethers.Contract(
      MESSENGER_TRANSMITER_ADDRESS,
      MESSENGER_TRANSMITER_ABI,
      signer,
    );

    // Send approve transaction
    const tx = await messagerTransmiter.receiveMessage(message, attestation);

    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error("Transaction receipt not found");
    }

    console.log(`Mint transaction confirmed: ${receipt.hash}`);

    return receipt.hash;
  } catch (error) {
    console.error("Error Minting USDC:", error);
    throw new Error(
      `Failed to mint USDC: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
