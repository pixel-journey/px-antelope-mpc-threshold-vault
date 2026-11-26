import { describe, expect, it } from "vitest";
import { CHAINS } from "./digest.js";
import {
  fetchLabChainInfo,
  labClientPushSupported,
  pushLabTransaction,
} from "./labClient.js";

describe("labClient", () => {
  it("refuses network without enableNetwork", async () => {
    await expect(
      fetchLabChainInfo(CHAINS.waxTestnet, { enableNetwork: false }),
    ).rejects.toThrow(/disabled/);
  });

  it("refuses mainnet even with network enabled", async () => {
    await expect(
      fetchLabChainInfo(CHAINS.waxMainnet, { enableNetwork: true }),
    ).rejects.toThrow(/mainnet|locked/);
  });

  it("uses injected fetch for get_info", async () => {
    const fake = async () =>
      new Response(JSON.stringify({ chain_id: CHAINS.waxTestnet, head_block_num: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    const { info } = await fetchLabChainInfo(CHAINS.waxTestnet, {
      enableNetwork: true,
      fetchImpl: fake as unknown as typeof fetch,
    });
    expect(info.head_block_num).toBe(1);
  });

  it("push refuses incomplete readiness", async () => {
    const result = await pushLabTransaction(
      {
        chainId: CHAINS.waxTestnet,
        transaction: { id: "demo" },
        readiness: {
          policyAllowed: true,
          signedAntelopeDigest: false,
          dryRunOk: false,
          operatorOptsIntoPush: false,
        },
      },
      { enableNetwork: true },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.readiness.blockers.length).toBeGreaterThan(0);
  });

  it("push posts when readiness is green and fetch is injected", async () => {
    const fake = async () =>
      new Response(JSON.stringify({ transaction_id: "abc" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    const result = await pushLabTransaction(
      {
        chainId: CHAINS.waxTestnet,
        transaction: { signed: true },
        readiness: {
          policyAllowed: true,
          signedAntelopeDigest: true,
          dryRunOk: true,
          operatorOptsIntoPush: true,
        },
      },
      { enableNetwork: true, fetchImpl: fake as unknown as typeof fetch },
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.response).toEqual({ transaction_id: "abc" });
  });

  it("documents that a gated push path exists", () => {
    expect(labClientPushSupported()).toBe(true);
  });
});
