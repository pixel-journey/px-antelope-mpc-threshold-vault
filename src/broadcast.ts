/**
 * Broadcast guardrails for a *later* testnet sender.
 *
 * This course does not open a network socket and does not push transactions.
 * When a future module adds optional testnet broadcast, it must call
 * `assertBroadcastAllowed` first. Mainnets are never allowed here.
 */

import { CHAINS, LAB_CHAIN_IDS } from "./digest.js";
import { MAINNET_CHAIN_IDS } from "./policy.js";

/** Chains that may eventually receive an opt-in educational broadcast. */
export const BROADCAST_CANDIDATE_CHAIN_IDS: readonly string[] = [
  ...LAB_CHAIN_IDS,
  CHAINS.telosTestnet,
  CHAINS.xprTestnet,
];

export type BroadcastDecision =
  | { ok: true; chainId: string }
  | { ok: false; reason: string };

/**
 * Pure policy check. Does not send anything.
 * Mainnets always fail. Non-candidate testnets fail unless listed.
 */
export function evaluateBroadcast(chainId: string): BroadcastDecision {
  if (MAINNET_CHAIN_IDS.includes(chainId)) {
    return { ok: false, reason: "mainnet broadcast is locked" };
  }
  if (!BROADCAST_CANDIDATE_CHAIN_IDS.includes(chainId)) {
    return { ok: false, reason: "chain is not a broadcast candidate testnet" };
  }
  return { ok: true, chainId };
}

/**
 * Throws on any mainnet or non-candidate chain.
 * Even on a candidate testnet, this course still does not implement send.
 */
export function assertBroadcastAllowed(chainId: string): void {
  const decision = evaluateBroadcast(chainId);
  if (!decision.ok) throw new Error(decision.reason);
}

/**
 * Educational posture: broadcast is not implemented.
 * Call sites that “would send” must hit this and stop.
 */
export function refuseBroadcast(chainId: string): never {
  assertBroadcastAllowed(chainId);
  throw new Error(
    "educational course does not broadcast; compute_transaction / push_transaction are out of scope",
  );
}
