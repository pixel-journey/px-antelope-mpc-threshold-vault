import { describe, expect, it } from "vitest";
import { recoverLab } from "./labsign.js";
import {
  listStrategyIds,
  runStrategy,
  STRATEGIES,
  strategiesByExpect,
  strategiesByTag,
} from "./strategies.js";

describe("named agent strategies", () => {
  const now = 1_700_000_000;

  it("allows the lab tips and signs them", () => {
    for (const id of ["wax-testnet-tip", "jungle-tip", "treasury-tip", "peer-tip"]) {
      const result = runStrategy(id, "agent.pxj", now);
      expect(result.decision.ok, id).toBe(true);
      expect(result.lab?.signature.startsWith("SIG_K1_")).toBe(true);
      expect(recoverLab(result.lab!)).toBe(result.lab!.publicKey);
    }
  });

  it("refuses mainnets, NFTs, RAM, blocked actions, over-cap, and memo injection", () => {
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

  it("lists ids and filters by expect / tag", () => {
    const ids = listStrategyIds();
    expect(ids).toContain("wax-testnet-tip");
    expect(ids).toContain("nft-mintasset");
    expect(ids).toContain("updateauth-agent");
    expect(strategiesByExpect("allow").every((s) => s.expect === "allow")).toBe(true);
    expect(strategiesByExpect("refuse").length).toBeGreaterThan(8);
    expect(strategiesByTag("nft").some((s) => s.id === "nft-transfer")).toBe(true);
    expect(strategiesByTag("lab").some((s) => s.expect === "allow")).toBe(true);
  });

  it("keeps allow count small and explicit", () => {
    expect(strategiesByExpect("allow").map((s) => s.id).sort()).toEqual(
      ["jungle-tip", "peer-tip", "treasury-tip", "wax-testnet-tip"].sort(),
    );
  });
});
