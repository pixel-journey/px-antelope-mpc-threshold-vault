import { describe, expect, it } from "vitest";
import { CHAINS } from "./digest.js";
import {
  operatorOptInStrategies,
  runStrategy,
  runStrategyWithPolicy,
} from "./strategies.js";

describe("operator opt-in strategies", () => {
  const now = 1_700_000_000;

  it("lists telos and xpr testnet tips as operator-opt-in", () => {
    const ids = operatorOptInStrategies().map((s) => s.id).sort();
    expect(ids).toEqual(["telos-testnet-tip", "xpr-testnet-tip"].sort());
  });

  it("refuses telos-testnet-tip on the default gate", () => {
    const result = runStrategy("telos-testnet-tip", "agent.pxj", now);
    expect(result.decision.ok).toBe(false);
    expect(result.lab).toBeNull();
  });

  it("allows telos-testnet-tip when opted in, without lab signature", () => {
    const result = runStrategyWithPolicy("telos-testnet-tip", "agent.pxj", now, {
      extraLabChainIds: [CHAINS.telosTestnet],
    });
    expect(result.decision.ok).toBe(true);
    expect(result.handoff?.chainId).toBe(CHAINS.telosTestnet);
    // Lab signer is limited to built-in LAB_CHAIN_IDS
    expect(result.lab).toBeNull();
  });

  it("still refuses mainnet even with extras", () => {
    const result = runStrategyWithPolicy("wax-mainnet-tip", "agent.pxj", now, {
      extraLabChainIds: [CHAINS.waxMainnet, CHAINS.telosTestnet],
    });
    expect(result.decision.ok).toBe(false);
  });
});
