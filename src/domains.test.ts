import { describe, expect, it } from "vitest";
import { compareDomains, domainsSeparated } from "./domains.js";
import { adviseNext } from "./next.js";
import { callableToday, waxOnly } from "./opportunities.js";
import { runStrategy } from "./strategies.js";

describe("cross-chain domains", () => {
  const now = 1_700_000_000;

  it("separates a WAX lab tip from a Jungle tip", () => {
    const wax = runStrategy("wax-testnet-tip", "agent.pxj", now);
    const jungle = runStrategy("jungle-tip", "agent.pxj", now);
    expect(wax.handoff).toBeTruthy();
    expect(jungle.handoff).toBeTruthy();
    const report = compareDomains(wax.handoff!, jungle.handoff!);
    expect(report.sameChain).toBe(false);
    expect(report.wouldBeSameCeremony).toBe(false);
    expect(domainsSeparated(wax.handoff!, jungle.handoff!)).toBe(true);
  });
});

describe("next-step advice", () => {
  const now = 1_700_000_000;

  it("stops on a refused mainnet strategy", () => {
    const advice = adviseNext(runStrategy("wax-mainnet-tip", "agent.pxj", now));
    expect(advice.next).toBe("stop");
    expect(advice.pushFromModel).toBe(false);
    expect(advice.labSignatureIsNodeValid).toBe(false);
  });

  it("marks an allowed lab tip as lab-only, not pushable", () => {
    const advice = adviseNext(runStrategy("wax-testnet-tip", "agent.pxj", now));
    expect(advice.next).toBe("lab-only");
    expect(advice.labSignatureIsNodeValid).toBe(false);
    expect(advice.pushFromModel).toBe(false);
  });
});

describe("per-chain opportunities", () => {
  it("names what is callable today and what is WAX-only", () => {
    expect(callableToday().map((row) => row.id)).toEqual(["wax-transfer", "jungle-transfer"]);
    expect(waxOnly().map((row) => row.id)).toContain("orng-wax");
    expect(waxOnly().every((row) => row.callableToday === false)).toBe(true);
  });
});
