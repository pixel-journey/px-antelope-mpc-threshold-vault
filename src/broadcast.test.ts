import { describe, expect, it } from "vitest";
import { CHAINS } from "./digest.js";
import {
  assertBroadcastAllowed,
  evaluateBroadcast,
  refuseBroadcast,
} from "./broadcast.js";

describe("broadcast lock", () => {
  it("allows candidate testnets at the policy layer only", () => {
    expect(evaluateBroadcast(CHAINS.waxTestnet).ok).toBe(true);
    expect(evaluateBroadcast(CHAINS.jungle4).ok).toBe(true);
    expect(evaluateBroadcast(CHAINS.telosTestnet).ok).toBe(true);
  });

  it("locks every mainnet", () => {
    for (const id of [CHAINS.waxMainnet, CHAINS.vaulta, CHAINS.telos, CHAINS.xpr, CHAINS.ux]) {
      expect(evaluateBroadcast(id).ok).toBe(false);
      expect(() => assertBroadcastAllowed(id)).toThrow(/mainnet/);
    }
  });

  it("never sends even on a candidate testnet", () => {
    expect(() => refuseBroadcast(CHAINS.waxTestnet)).toThrow(/does not broadcast/);
  });
});
