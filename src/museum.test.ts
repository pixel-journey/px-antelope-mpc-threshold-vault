import { describe, expect, it } from "vitest";
import {
  dollarDelimiterCollides,
  MUSEUM_CARDS,
  recoverFromReusedNonce,
  smashedHash,
  taggedHash,
} from "./museum.js";

describe("attack museum demos", () => {
  it("recovers x from reused nonce on throwaway scalars", () => {
    const x = 0x1111n;
    const k = 0xabcden;
    const { recoveredX, recoveredK } = recoverFromReusedNonce({
      x,
      k,
      m1: 0x101n,
      m2: 0x202n,
    });
    expect(recoveredX).toBe(x);
    expect(recoveredK).toBe(k);
  });

  it("shows smashed concat collision class vs length prefix", () => {
    expect(smashedHash(["ab", "c"])).toBe(smashedHash(["a", "bc"]));
    expect(taggedHash(["ab", "c"])).not.toBe(taggedHash(["a", "bc"]));
  });

  it("shows dollar-delimiter ambiguity (TSSHOCK-style)", () => {
    expect(dollarDelimiterCollides()).toBe(true);
  });

  it("exports structured cards including 2025 CVEs", () => {
    const ids = MUSEUM_CARDS.map((c) => c.id);
    expect(ids).toContain("cggmp-66016");
    expect(ids).toContain("nonce-reuse");
    expect(MUSEUM_CARDS.every((c) => c.mandatoryFix && c.repoInvariant)).toBe(true);
  });
});
