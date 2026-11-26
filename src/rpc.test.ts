import { describe, expect, it } from "vitest";
import { CHAINS } from "./digest.js";
import {
  buildComputeTransactionRequest,
  buildPushTransactionRequest,
  endpointsForChain,
  LAB_RPC_PATHS,
  listLabRpcSummary,
} from "./rpc.js";

describe("lab RPC catalog and push end-stage", () => {
  it("builds compute_transaction for candidate chains", () => {
    const [wax] = endpointsForChain(CHAINS.waxTestnet);
    const req = buildComputeTransactionRequest(wax!, { transaction: { id: "demo" } });
    expect(req.url).toContain(LAB_RPC_PATHS.computeTransaction);
  });

  it("refuses push when checklist incomplete", () => {
    const [wax] = endpointsForChain(CHAINS.waxTestnet);
    const result = buildPushTransactionRequest(
      wax!,
      { transaction: {} },
      {
        policyAllowed: true,
        signedAntelopeDigest: false,
        dryRunOk: false,
        operatorOptsIntoPush: false,
      },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.readiness.blockers.length).toBeGreaterThan(0);
    }
  });

  it("builds push URL when checklist passes but still does not HTTP-send", () => {
    const [wax] = endpointsForChain(CHAINS.waxTestnet);
    const result = buildPushTransactionRequest(
      wax!,
      { transaction: { signed: true } },
      {
        policyAllowed: true,
        signedAntelopeDigest: true,
        dryRunOk: true,
        operatorOptsIntoPush: true,
        senderImplemented: true,
      },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.url).toContain(LAB_RPC_PATHS.pushTransaction);
      expect(result.httpSendImplemented).toBe(false);
    }
  });

  it("summarizes paths including push as end-stage", () => {
    const rows = listLabRpcSummary();
    expect(rows.every((r) => r.pushIsEndStage)).toBe(true);
  });
});
