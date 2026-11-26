/**
 * Antelope lab RPC helpers.
 *
 * Builds request shapes for get_info, compute_transaction, and — when the
 * push readiness checklist passes — push_transaction. Does not fetch by
 * default. Teaching push is intentional; shipping an unsafe sender is not.
 */

import {
  evaluateBroadcast,
  evaluatePushReadiness,
  type PushReadinessInput,
} from "./broadcast.js";
import { CHAINS, LAB_CHAIN_IDS } from "./digest.js";

export interface LabEndpoint {
  name: string;
  chainId: string;
  url: string;
  kind: "lab" | "testnet-opt-in";
}

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

export const LAB_RPC_PATHS = {
  getInfo: "/v1/chain/get_info",
  getRequiredKeys: "/v1/chain/get_required_keys",
  computeTransaction: "/v1/chain/compute_transaction",
  sendReadOnlyTransaction: "/v1/chain/send_read_only_transaction",
  /** Final stage — only after evaluatePushReadiness.ready */
  pushTransaction: "/v1/chain/push_transaction",
  sendTransaction2: "/v1/chain/send_transaction2",
} as const;

export interface ComputeTransactionBody {
  transaction: unknown;
}

export interface PushTransactionBody {
  /** Signed packed transaction as the node expects. */
  transaction: unknown;
}

function root(endpoint: LabEndpoint): string {
  return endpoint.url.replace(/\/$/, "");
}

export function buildComputeTransactionRequest(
  endpoint: LabEndpoint,
  body: ComputeTransactionBody,
): { url: string; method: "POST"; body: ComputeTransactionBody; allowed: true } {
  const gate = evaluateBroadcast(endpoint.chainId);
  if (!gate.ok) throw new Error(`compute_transaction blocked: ${gate.reason}`);
  return {
    url: `${root(endpoint)}${LAB_RPC_PATHS.computeTransaction}`,
    method: "POST",
    body,
    allowed: true,
  };
}

export type PushBuildResult =
  | {
      ok: true;
      url: string;
      method: "POST";
      body: PushTransactionBody;
      /** Still false in this package — no fetch is performed here. */
      httpSendImplemented: false;
      note: string;
    }
  | { ok: false; readiness: ReturnType<typeof evaluatePushReadiness> };

/**
 * Build a push_transaction request **shape** when the curriculum checklist passes.
 * Does not HTTP-send. Phase W can fetch(url) only after this returns ok: true
 * and an operator-controlled sender is wired.
 */
export function buildPushTransactionRequest(
  endpoint: LabEndpoint,
  body: PushTransactionBody,
  readinessInput: Omit<PushReadinessInput, "chainId" | "senderImplemented"> & {
    /** Defaults false in this course. */
    senderImplemented?: boolean;
  },
): PushBuildResult {
  const readiness = evaluatePushReadiness({
    chainId: endpoint.chainId,
    policyAllowed: readinessInput.policyAllowed,
    signedAntelopeDigest: readinessInput.signedAntelopeDigest,
    dryRunOk: readinessInput.dryRunOk,
    operatorOptsIntoPush: readinessInput.operatorOptsIntoPush,
    senderImplemented: readinessInput.senderImplemented ?? false,
  });

  if (!readiness.ready) {
    return { ok: false, readiness };
  }

  return {
    ok: true,
    url: `${root(endpoint)}${LAB_RPC_PATHS.pushTransaction}`,
    method: "POST",
    body,
    httpSendImplemented: false,
    note: "Checklist passed and URL built; this package still does not fetch. Wire Phase W sender deliberately.",
  };
}

export function listLabRpcSummary() {
  return LAB_ENDPOINTS.map((e) => ({
    ...e,
    defaultLab: isDefaultLabChain(e.chainId),
    broadcastCandidate: evaluateBroadcast(e.chainId).ok,
    paths: { ...LAB_RPC_PATHS },
    pushIsEndStage: true as const,
  }));
}
