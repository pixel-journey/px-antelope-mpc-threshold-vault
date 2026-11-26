import { describe, expect, it } from "vitest";
import { CHAINS } from "./digest.js";
import {
  buildComputeTransactionRequest,
  buildPushTransactionRequest,
  endpointsForChain,
  FORBIDDEN_RPC_PATHS,
  LAB_ENDPOINTS,
  listLabRpcSummary,
} from "./rpc.js";

describe("lab RPC catalog", () => {
  it("lists default labs and opt-in testnets", () => {
    expect(LAB_ENDPOINTS.some((e) => e.chainId === CHAINS.waxTestnet)).toBe(true);
    expect(LAB_ENDPOINTS.some((e) => e.kind === "testnet-opt-in")).toBe(true);
    expect(endpointsForChain(CHAINS.jungle4).length).toBeGreaterThan(0);
  });

  it("builds compute_transaction only for broadcast-candidate chains", () => {
    const [wax] = endpointsForChain(CHAINS.waxTestnet);
    const req = buildComputeTransactionRequest(wax!, { transaction: { id: "demo" } });
    expect(req.url).toContain("/v1/chain/compute_transaction");
    expect(req.method).toBe("POST");
  });

  it("never builds push_transaction", () => {
    const [wax] = endpointsForChain(CHAINS.waxTestnet);
    expect(() => buildPushTransactionRequest(wax!)).toThrow(/not offered/);
    expect(FORBIDDEN_RPC_PATHS.pushTransaction).toBe("/v1/chain/push_transaction");
  });

  it("summarizes paths without enabling send", () => {
    const rows = listLabRpcSummary();
    expect(rows.every((r) => r.forbidden.pushTransaction)).toBeTruthy();
  });
});
