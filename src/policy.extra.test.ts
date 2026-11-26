import { describe, expect, it } from "vitest";
import { CHAINS } from "./digest.js";
import { createPolicy, MAINNET_CHAIN_IDS } from "./policy.js";

const base = {
  contract: "eosio.token" as const,
  action: "transfer" as const,
  alias: "px-treasury",
  amountUnits: 1_000n,
  memo: "lab",
  nowSec: 1_000,
  expiresAtSec: 1_060,
};

describe("operator-gated extra lab chains", () => {
  it("allows Telos Testnet only when opted in", () => {
    const closed = createPolicy();
    expect(
      closed.propose({ ...base, chainId: CHAINS.telosTestnet, symbol: "TLOS" }).ok,
    ).toBe(false);

    const open = createPolicy({ extraLabChainIds: [CHAINS.telosTestnet] });
    expect(open.labChainIds).toContain(CHAINS.telosTestnet);
    const decision = open.propose({ ...base, chainId: CHAINS.telosTestnet, symbol: "TLOS" });
    expect(decision.ok).toBe(true);
    expect(decision.account).toBe("treasury.pxj");
  });

  it("strips mainnet ids even if an operator lists them as extra", () => {
    const policy = createPolicy({
      extraLabChainIds: [CHAINS.waxMainnet, CHAINS.telos, CHAINS.telosTestnet],
    });
    for (const id of MAINNET_CHAIN_IDS) {
      expect(policy.labChainIds).not.toContain(id);
    }
    expect(policy.labChainIds).toContain(CHAINS.telosTestnet);
    expect(policy.propose({ ...base, chainId: CHAINS.waxMainnet, symbol: "WAX" }).ok).toBe(
      false,
    );
    expect(policy.propose({ ...base, chainId: CHAINS.waxMainnet, symbol: "WAX" }).reason).toMatch(
      /mainnet/,
    );
  });
});
