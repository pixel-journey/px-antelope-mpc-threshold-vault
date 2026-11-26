/**
 * Phase-W lab HTTP client.
 *
 * - get_info / push require `{ enableNetwork: true }`
 * - push also requires evaluatePushReadiness.ready (policy, real digest,
 *   dry-run, operator opt-in, senderImplemented)
 * - Mainnets never
 * - Lab proposal-id signatures are not valid packed-tx signatures — callers
 *   must set signedAntelopeDigest only when that is true
 */

import {
  evaluateBroadcast,
  evaluatePushReadiness,
  type PushReadinessInput,
} from "./broadcast.js";
import {
  endpointsForChain,
  LAB_RPC_PATHS,
  type LabEndpoint,
} from "./rpc.js";

export interface LabClientOptions {
  enableNetwork: boolean;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export interface ChainInfoLite {
  chain_id?: string;
  head_block_num?: number;
  head_block_time?: string;
  server_version?: string;
}

function requireNetwork(options: LabClientOptions): void {
  if (!options.enableNetwork) {
    throw new Error(
      "lab client network disabled — pass { enableNetwork: true } only on intentional lab runs",
    );
  }
}

function pickEndpoint(chainId: string): LabEndpoint {
  const gate = evaluateBroadcast(chainId);
  if (!gate.ok) throw new Error(`lab client blocked: ${gate.reason}`);
  const eps = endpointsForChain(chainId);
  if (!eps[0]) throw new Error("no lab endpoint configured for chain");
  return eps[0];
}

async function postJson(
  url: string,
  body: unknown,
  options: LabClientOptions,
): Promise<unknown> {
  const fetchFn = options.fetchImpl ?? globalThis.fetch;
  if (!fetchFn) throw new Error("fetch is not available in this runtime");
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), options.timeoutMs ?? 12_000);
  try {
    const res = await fetchFn(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`lab RPC HTTP ${res.status}${text ? `: ${text.slice(0, 200)}` : ""}`);
    }
    return res.json();
  } finally {
    clearTimeout(t);
  }
}

export async function fetchLabChainInfo(
  chainId: string,
  options: LabClientOptions,
): Promise<{ endpoint: LabEndpoint; info: ChainInfoLite }> {
  requireNetwork(options);
  const endpoint = pickEndpoint(chainId);
  const url = `${endpoint.url.replace(/\/$/, "")}${LAB_RPC_PATHS.getInfo}`;
  const info = (await postJson(url, {}, options)) as ChainInfoLite;
  return { endpoint, info };
}

export type PushLabInput = {
  chainId: string;
  /** Node-shaped signed transaction object (opaque to this course). */
  transaction: unknown;
  readiness: Omit<PushReadinessInput, "chainId" | "senderImplemented">;
};

export type PushLabResult =
  | { ok: true; endpoint: LabEndpoint; response: unknown }
  | { ok: false; readiness: ReturnType<typeof evaluatePushReadiness> };

/**
 * POST /v1/chain/push_transaction on a lab endpoint when readiness is green.
 * Sets senderImplemented=true because this function *is* the sender.
 */
export async function pushLabTransaction(
  input: PushLabInput,
  options: LabClientOptions,
): Promise<PushLabResult> {
  requireNetwork(options);
  const readiness = evaluatePushReadiness({
    chainId: input.chainId,
    policyAllowed: input.readiness.policyAllowed,
    signedAntelopeDigest: input.readiness.signedAntelopeDigest,
    dryRunOk: input.readiness.dryRunOk,
    operatorOptsIntoPush: input.readiness.operatorOptsIntoPush,
    senderImplemented: true,
  });
  if (!readiness.ready) return { ok: false, readiness };

  const endpoint = pickEndpoint(input.chainId);
  const url = `${endpoint.url.replace(/\/$/, "")}${LAB_RPC_PATHS.pushTransaction}`;
  const response = await postJson(url, { transaction: input.transaction }, options);
  return { ok: true, endpoint, response };
}

/** True: a gated push path exists. Still not a default agent action. */
export function labClientPushSupported(): true {
  return true;
}
