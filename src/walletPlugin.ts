/**
 * Educational shape of a WharfKit WalletPlugin for MPC.
 *
 * Blueprint: extend AbstractWalletPlugin, implement login + sign, pass the
 * full serialized transaction and chain id to every co-signer, never accept
 * a pre-hashed digest from the model.
 *
 * This module does **not** import AbstractWalletPlugin or open a session.
 * It documents the contract and refuses to sign until a reviewed engine exists.
 */

import { LAB_CHAIN_IDS } from "./digest.js";
import type { Decision, Proposal } from "./policy.js";

export const WALLET_PLUGIN_ID = "wallet-plugin-px-mpc" as const;

export interface WalletPluginMetadata {
  name: string;
  description: string;
  /** Always true in this course — educational / testnet posture. */
  educationalOnly: true;
}

export const WALLET_PLUGIN_METADATA: WalletPluginMetadata = {
  name: "Pixel Journey MPC (educational)",
  description:
    "Stub plugin shape. Does not hold shares. Does not run DKLs23 or CGGMP24. Refuses sign until a reviewed engine is wired.",
  educationalOnly: true,
};

export interface LoginRequest {
  chainId: string;
  account: string;
  permission: string;
}

export interface LoginResult {
  chainId: string;
  /** Permission level string account@permission */
  permissionLevel: string;
  pluginId: typeof WALLET_PLUGIN_ID;
}

export interface SignRequest {
  chainId: string;
  /** Full packed transaction hex — co-signers must hash this themselves. */
  packedTransactionHex: string;
  /** Optional: model-supplied digest. Must be ignored for signing. */
  claimedDigestHex?: string;
  proposal?: Proposal;
  decision?: Decision;
}

export type SignResult =
  | { ok: false; reason: string }
  | { ok: true; signatures: string[] };

/**
 * Login only records intent for lab chains. No network, no key.
 */
export function pluginLogin(req: LoginRequest): LoginResult {
  if (!LAB_CHAIN_IDS.includes(req.chainId as (typeof LAB_CHAIN_IDS)[number])) {
    throw new Error("educational plugin login is limited to lab chain ids");
  }
  if (!/^[a-z1-5.]{1,12}$/.test(req.account)) {
    throw new Error("invalid account");
  }
  return {
    chainId: req.chainId,
    permissionLevel: `${req.account}@${req.permission || "active"}`,
    pluginId: WALLET_PLUGIN_ID,
  };
}

/**
 * Sign always refuses in this course.
 * A later wiring would: verify decision.ok, re-hash packed tx + chain id,
 * run threshold online round, return SIG_K1_/SIG_R1_.
 */
export function pluginSign(req: SignRequest): SignResult {
  if (req.claimedDigestHex) {
    return {
      ok: false,
      reason: "refusing model-supplied digest; co-signers must hash packed tx themselves",
    };
  }
  if (!req.packedTransactionHex || req.packedTransactionHex.length < 2) {
    return { ok: false, reason: "packed transaction required" };
  }
  if (!LAB_CHAIN_IDS.includes(req.chainId as (typeof LAB_CHAIN_IDS)[number])) {
    return { ok: false, reason: "chain is not a lab testnet" };
  }
  if (req.decision && !req.decision.ok) {
    return { ok: false, reason: "policy gate did not allow this proposal" };
  }
  return {
    ok: false,
    reason:
      "educational WalletPluginMPC does not threshold-sign; wire a reviewed engine before any testnet broadcast",
  };
}

export function pluginConfig() {
  return {
    id: WALLET_PLUGIN_ID,
    metadata: WALLET_PLUGIN_METADATA,
    requiresReviewedEngine: true,
    acceptsPrehashedDigest: false,
  };
}
