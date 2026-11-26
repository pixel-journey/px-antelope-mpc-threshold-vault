import { describe, expect, it } from "vitest";
import { recoverLab } from "./labsign.js";
import { runStrategy, STRATEGIES } from "./strategies.js";

describe("named agent strategies", () => {
  const now = 1_700_000_000;

  it("allows the two lab tips and signs them", () => {
    for (const id of ["wax-testnet-tip", "jungle-tip"]) {
      const result = runStrategy(id, "agent.pxj", now);
      expect(result.decision.ok, id).toBe(true);
      expect(result.lab?.signature.startsWith("SIG_K1_")).toBe(true);
      expect(recoverLab(result.lab!)).toBe(result.lab!.publicKey);
    }
  });

  it("refuses mainnets, NFTs, RAM, and a memo that names an account", () => {
    for (const strategy of STRATEGIES.filter((entry) => entry.expect === "refuse")) {
      const result = runStrategy(strategy.id, "agent.pxj", now);
      expect(result.decision.ok, strategy.id).toBe(false);
      expect(result.lab).toBeNull();
    }
  });

  it("does not reuse a proposal id across chains", () => {
    const wax = runStrategy("wax-testnet-tip", "agent.pxj", now);
    const jungle = runStrategy("jungle-tip", "agent.pxj", now);
    expect(wax.handoff?.proposalId).not.toBe(jungle.handoff?.proposalId);
  });
});
