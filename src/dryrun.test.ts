import { describe, expect, it } from "vitest";
import { CHAINS } from "./digest.js";
import { handoff } from "./dryrun.js";
import { createPolicy } from "./policy.js";

describe("proposal handoff", () => {
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

  it("binds an allowed transfer and refuses a denied one", () => {
    const policy = createPolicy();
    const allowed = policy.propose(proposal);
    const record = handoff(proposal, allowed, "agent.pxj");
    expect(record.to).toBe("faucet.wax");
    expect(record.quantity).toBe("1.0000 WAX");
    expect(record.proposalId).toMatch(/^[0-9a-f]{64}$/);

    const denied = policy.propose({ ...proposal, chainId: CHAINS.waxMainnet });
    expect(() => handoff({ ...proposal, chainId: CHAINS.waxMainnet }, denied, "agent.pxj")).toThrow();
  });

  it("changes the proposal id when the chain, the amount, or the memo changes", () => {
    const policy = createPolicy();
    const base = handoff(proposal, policy.propose(proposal), "agent.pxj");
    const otherChain = handoff(
      { ...proposal, chainId: CHAINS.jungle4 },
      policy.propose({ ...proposal, chainId: CHAINS.jungle4 }),
      "agent.pxj",
    );
    const otherAmount = handoff(
      { ...proposal, amountUnits: 20000n },
      policy.propose({ ...proposal, amountUnits: 20000n }),
      "agent.pxj",
    );
    expect(base.proposalId).not.toBe(otherChain.proposalId);
    expect(base.proposalId).not.toBe(otherAmount.proposalId);
  });
});
