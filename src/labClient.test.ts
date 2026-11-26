import { describe, expect, it } from "vitest";
import { CHAINS } from "./digest.js";
import { fetchLabChainInfo, labClientPushSupported } from "./labClient.js";

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

  it("uses injected fetch when enableNetwork is true", async () => {
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

  it("does not support push", () => {
    expect(labClientPushSupported()).toBe(false);
  });
});
