import { describe, expect, it } from "vitest";
import { CHAINS } from "./digest.js";
import { createPolicy } from "./policy.js";
import {
  MockComputeTransactionClient,
  simulateAllowed,
  verdictFromTrace,
  buildFixtureTrace,
} from "./simulate.js";

const proposal = {
  chainId: CHAINS.waxTestnet,
  contract: "eosio.token",
  action: "transfer",
  alias: "wax-faucet",
  amountUnits: 1_000n,
  symbol: "WAX",
  memo: "sim",
  nowSec: 1_000,
  expiresAtSec: 1_060,
};

describe("offline compute_transaction fixtures", () => {
  it("clean-transfer is safe for co-sign path",
    () => {
      const client = new MockComputeTransactionClient("clean-transfer");
      const v = client.compute(proposal);
      expect(v.ok).toBe(true);
      expect(v.safeForCoSign).toBe(true);
    });

  it("inline-escalation catches updateauth",
    () => {
      const v = verdictFromTrace(buildFixtureTrace(proposal, "inline-escalation"), proposal);
      expect(v.ok).toBe(false);
      expect(v.reason).toMatch(/updateauth/);
      expect(v.safeForCoSign).toBe(false);
    });

  it("assert-revert is not safeForCoSign",
    () => {
      const v = verdictFromTrace(buildFixtureTrace(proposal, "assert-revert"), proposal);
      expect(v.ok).toBe(false);
      expect(v.safeForCoSign).toBe(false);
    });

  it("simulateAllowed wires policy + simulation",
    () => {
      const decision = createPolicy().propose(proposal);
      const sim = simulateAllowed(proposal, decision, { fixture: "clean-transfer" });
      expect(sim.policyOk).toBe(true);
      expect(sim.simulation.safeForCoSign).toBe(true);
      expect(sim.broadcastCandidate).toBe(true);

      const bad = simulateAllowed(proposal, decision, { fixture: "inline-escalation" });
      expect(bad.simulation.safeForCoSign).toBe(false);
    });
});
