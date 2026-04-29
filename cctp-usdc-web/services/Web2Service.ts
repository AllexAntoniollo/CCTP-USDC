import { BridgeChainType } from "@/lib/cctp.types";
import { CHAIN_CONFIG } from "@/lib/usdc.constants";

export async function getAttestation(
  chainOut: BridgeChainType,
  burnTxHash: string,
) {
  const chainOutConf = CHAIN_CONFIG[chainOut];

  if (!chainOutConf) {
    throw new Error(`Chain Out config not found for chain: ${chainOut}`);
  }
  console.log(chainOutConf.domain, burnTxHash);

  const res = await fetch(
    `https://iris-api.circle.com/v2/messages/${chainOutConf.domain}?transactionHash=${burnTxHash}`,
  );

  const data = await res.json();

  const msg = data?.messages?.[0];

  return msg;
}
