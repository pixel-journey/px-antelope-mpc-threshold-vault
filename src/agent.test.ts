import { describe, expect, it } from "vitest";
import { createPolicy } from "./policy.js";
import { CHAINS } from "./digest.js";

describe("agent proposal across networks", () => {
  it("allows a small transfer on the two lab testnets", () => {
    const policy = createPolicy();
    const now = 1_700_000_000;
    for (const chainId of [CHAINS.waxTestnet, CHAINS.jungle4]) {
      const decision = policy.propose({
        chainId,
        contract: "eosio.token",
        action: "transfer",
        alias: "wax-faucet",
        amountUnits: 10000n,
        symbol: "WAX",
        memo: "agent tip",
        nowSec: now,
        expiresAtSec: now + 60,
      });
      expect(decision.ok).toBe(true);
    }
  });

  it("refuses the same transfer on mainnets", () => {
    const policy = createPolicy();
    const now = 1_700_000_000;
    for (const chainId of [CHAINS.waxMainnet, CHAINS.vaulta, CHAINS.telos]) {
      const decision = policy.propose({
        chainId,
        contract: "eosio.token",
        action: "transfer",
        alias: "wax-faucet",
        amountUnits: 10000n,
        symbol: "WAX",
        memo: "agent tip",
        nowSec: now,
        expiresAtSec: now + 60,
      });
      expect(decision.ok).toBe(false);
    }
  });

  it("refuses a free-typed recipient even on a lab chain", () => {
    const policy = createPolicy();
    const now = 1_700_000_000;
    const decision = policy.propose({
      chainId: CHAINS.waxTestnet,
      contract: "eosio.token",
      action: "transfer",
      alias: "some.account",
      amountUnits: 10000n,
      symbol: "WAX",
      memo: "hi",
      nowSec: now,
      expiresAtSec: now + 60,
    });
    expect(decision.ok).toBe(false);
  });
});
