import { describe, expect, it } from "vitest";
import { CHAINS } from "./digest.js";
import { createLabKey, recoverLab, signAllowed } from "./labsign.js";
import { createPolicy } from "./policy.js";

describe("lab signer", () => {
  const now = 1_700_000_000;
  const proposal = {
    chainId: CHAINS.waxTestnet,
    contract: "eosio.token",
    action: "transfer",
    alias: "wax-faucet",
    amountUnits: 10000n,
    symbol: "WAX",
    memo: "agent tip",
    nowSec: now,
    expiresAtSec: now + 60,
  };

  it("signs an allowed lab proposal and recovers the same key", () => {
    const policy = createPolicy();
    const key = createLabKey();
    const signed = signAllowed(key, proposal, policy.propose(proposal), "agent.pxj");
    expect(signed.signature.startsWith("SIG_K1_")).toBe(true);
    expect(recoverLab(signed)).toBe(signed.publicKey);
  });

  it("refuses a mainnet proposal even if someone forces an allow", () => {
    const key = createLabKey();
    const forced = { ok: true, reason: "forced", account: "faucet.wax" };
    expect(() =>
      signAllowed(key, { ...proposal, chainId: CHAINS.waxMainnet }, forced, "agent.pxj"),
    ).toThrow(/lab/);
  });

  it("refuses a denied proposal", () => {
    const policy = createPolicy();
    const key = createLabKey();
    const denied = policy.propose({ ...proposal, chainId: CHAINS.waxMainnet });
    expect(() => signAllowed(key, proposal, denied, "agent.pxj")).toThrow();
  });
});
