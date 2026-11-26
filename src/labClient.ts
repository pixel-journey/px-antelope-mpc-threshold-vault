/**
 * Phase-W-light lab HTTP client.
 *
 * Opt-in only: callers must pass `{ enableNetwork: true }`.
 * Supports get_info on broadcast-candidate testnets.
 * Does not implement push_transaction (use evaluatePushReadiness + deliberate sender).
 */

import { evaluateBroadcast } from "./broadcast.js";
import {
  endpointsForChain,
  LAB_RPC_PATHS,
  type LabEndpoint,
} from "./rpc.js";

export interface LabClientOptions {
  /** Must be true to open a socket. Default false. */
  enableNetwork: boolean;
  /** Optional fetch implementation (tests can inject). */
  fetchImpl?: typeof fetch;
  /** Request timeout ms (best-effort via AbortSignal). */
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

/**
 * GET-equivalent POST /v1/chain/get_info against a lab endpoint.
 * Never called unless enableNetwork is true.
 */
export async function fetchLabChainInfo(
  chainId: string,
  options: LabClientOptions,
): Promise<{ endpoint: LabEndpoint; info: ChainInfoLite }> {
  requireNetwork(options);
  const endpoint = pickEndpoint(chainId);
  const url = `${endpoint.url.replace(/\/$/, "")}${LAB_RPC_PATHS.getInfo}`;
  const fetchFn = options.fetchImpl ?? globalThis.fetch;
  if (!fetchFn) throw new Error("fetch is not available in this runtime");

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), options.timeoutMs ?? 12_000);
  try {
    const res = await fetchFn(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`get_info HTTP ${res.status}`);
    const info = (await res.json()) as ChainInfoLite;
    return { endpoint, info };
  } finally {
    clearTimeout(t);
  }
}

/**
 * Documents that push is not offered on this client.
 */
export function labClientPushSupported(): false {
  return false;
}
