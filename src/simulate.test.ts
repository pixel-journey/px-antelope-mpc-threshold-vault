import { describe, expect, it } from "vitest";
import { CHAINS } from "./digest.js";
import { createPolicy } from "./policy.js";
import { simulateAllowed } from "./simulate.js";

describe("simulateAllowed", () => {
  it("reports policy allow and still wouldBroadcast false", () => {
    const now = 1_000;
    const proposal = {
      chainId: CHAINS.waxTestnet,
      contract: "eosio.token",
      action: "transfer",
      alias: "wax-faucet",
      amountUnits: 1_000n,
      symbol: "WAX",
      memo: "sim",
      nowSec: now,
      expiresAtSec: now + 60,
    };
    const decision = createPolicy().propose(proposal);
    const sim = simulateAllowed(proposal, decision);
    expect(sim.policyOk).toBe(true);
    expect(sim.wouldBroadcast).toBe(false);
    expect(sim.recommendedRpc).toBe("/v1/chain/compute_transaction");
  });

  it("carries policy refusal reason", () => {
    const now = 1_000;
    const proposal = {
      chainId: CHAINS.waxMainnet,
      contract: "eosio.token",
      action: "transfer",
      alias: "wax-faucet",
      amountUnits: 1_000n,
      symbol: "WAX",
      memo: "sim",
      nowSec: now,
      expiresAtSec: now + 60,
    };
    const decision = createPolicy().propose(proposal);
    const sim = simulateAllowed(proposal, decision);
    expect(sim.policyOk).toBe(false);
    expect(sim.wouldBroadcast).toBe(false);
  });
});
