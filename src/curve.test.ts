import { describe, expect, it } from "vitest";
import { CURVE_POLICY, recommendCurve } from "./curve.js";

describe("curve policy", () => {
  it("prefers R1 for online signing and requires r-filter only on K1", () => {
    expect(CURVE_POLICY.preferredOnline).toBe("R1");
    expect(CURVE_POLICY.requiresOfflineRFilter("K1")).toBe(true);
    expect(CURVE_POLICY.requiresOfflineRFilter("R1")).toBe(false);
  });

  it("falls back to K1 when legacy or EVM derivation is requested", () => {
    expect(recommendCurve()).toBe("R1");
    expect(recommendCurve({ needLegacyK1Explorers: true })).toBe("K1");
    expect(recommendCurve({ needEvmDerivation: true })).toBe("K1");
  });
});
