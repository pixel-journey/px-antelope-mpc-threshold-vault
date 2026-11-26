import { describe, expect, it } from "vitest";
import { Chains } from "@wharfkit/session";
import { CHAINS } from "./digest.js";

describe("network map", () => {
  it("matches the chain ids this course already locked", () => {
    expect(Chains.WAX.id.toString()).toBe(CHAINS.waxMainnet);
    expect(Chains.WAXTestnet.id.toString()).toBe(CHAINS.waxTestnet);
    expect(Chains.Vaulta.id.toString()).toBe(CHAINS.vaulta);
    expect(Chains.Jungle4.id.toString()).toBe(CHAINS.jungle4);
    expect(Chains.Telos.id.toString()).toBe(CHAINS.telos);
  });

  it("includes the networks the blueprint OCR lost", () => {
    expect(Chains.TelosTestnet.id.toString()).toBe(
      "1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f",
    );
    expect(Chains.Proton.id.toString()).toBe(
      "384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0",
    );
    expect(Chains.XPR.id.toString()).toBe(Chains.Proton.id.toString());
    expect(Chains.ProtonTestnet.id.toString()).toBe(
      "71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd",
    );
    expect(Chains.UX.id.toString()).toBe(
      "8fc6dce7942189f842170de953932b1f66693ad3788f766e777b6f9d22335c02",
    );
  });
});
