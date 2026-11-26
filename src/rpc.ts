/**
 * Antelope lab RPC helpers for a *later* dry-run client.
 *
 * This module catalogs public lab endpoints and builds request shapes for
 * compute_transaction / get_info / get_required_keys. It does not fetch by
 * default. `push_transaction` builders are omitted on purpose — use
 * broadcast.ts guards if a future module adds opt-in testnet send.
 */

import { CHAINS, LAB_CHAIN_IDS } from "./digest.js";
import { evaluateBroadcast } from "./broadcast.js";

export interface LabEndpoint {
  name: string;
  chainId: string;
  /** Public HTTP API root (no trailing slash required). */
  url: string;
  kind: "lab" | "testnet-opt-in";
}

/** Greymass-style public nodes used in docs. Not a reliability SLA. */
export const LAB_ENDPOINTS: readonly LabEndpoint[] = [
  {
    name: "WAX Testnet",
    chainId: CHAINS.waxTestnet,
    url: "https://waxtestnet.greymass.com",
    kind: "lab",
  },
  {
    name: "Jungle 4",
    chainId: CHAINS.jungle4,
    url: "https://jungle4.greymass.com",
    kind: "lab",
  },
  {
    name: "Telos Testnet",
    chainId: CHAINS.telosTestnet,
    url: "https://telostestnet.greymass.com",
    kind: "testnet-opt-in",
  },
  {
    name: "XPR Testnet",
    chainId: CHAINS.xprTestnet,
    url: "https://proton-testnet.greymass.com",
    kind: "testnet-opt-in",
  },
];

export function endpointsForChain(chainId: string): LabEndpoint[] {
  return LAB_ENDPOINTS.filter((e) => e.chainId === chainId);
}

export function isDefaultLabChain(chainId: string): boolean {
  return LAB_CHAIN_IDS.includes(chainId as (typeof LAB_CHAIN_IDS)[number]);
}

/** Paths an educational agent may eventually call on a lab node. */
export const LAB_RPC_PATHS = {
  getInfo: "/v1/chain/get_info",
  getRequiredKeys: "/v1/chain/get_required_keys",
  computeTransaction: "/v1/chain/compute_transaction",
  sendReadOnlyTransaction: "/v1/chain/send_read_only_transaction",
} as const;

/** Paths this course must never wrap as a default agent tool. */
export const FORBIDDEN_RPC_PATHS = {
  pushTransaction: "/v1/chain/push_transaction",
  sendTransaction2: "/v1/chain/send_transaction2",
} as const;

export interface ComputeTransactionBody {
  /** Packed signed or unsigned transaction object — opaque to this course. */
  transaction: unknown;
}

export function buildComputeTransactionRequest(
  endpoint: LabEndpoint,
  body: ComputeTransactionBody,
): { url: string; method: "POST"; body: ComputeTransactionBody; allowed: true } {
  const gate = evaluateBroadcast(endpoint.chainId);
  if (!gate.ok) {
    throw new Error(`compute_transaction blocked: ${gate.reason}`);
  }
  return {
    url: `${endpoint.url.replace(/\/$/, "")}${LAB_RPC_PATHS.computeTransaction}`,
    method: "POST",
    body,
    allowed: true,
  };
}

/** Always throws — documents that push is out of scope. */
export function buildPushTransactionRequest(_endpoint: LabEndpoint): never {
  throw new Error(
    "push_transaction is not offered by this educational course; see src/broadcast.ts",
  );
}

export function listLabRpcSummary() {
  return LAB_ENDPOINTS.map((e) => ({
    ...e,
    defaultLab: isDefaultLabChain(e.chainId),
    broadcastCandidate: evaluateBroadcast(e.chainId).ok,
    paths: { ...LAB_RPC_PATHS },
    forbidden: { ...FORBIDDEN_RPC_PATHS },
  }));
}
