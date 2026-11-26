import { describe, expect, it } from "vitest";
import { CHAINS } from "./digest.js";
import {
  checkStatus,
  inspectPlaybook,
  killPolicy,
  listNetworks,
  listStrategiesTool,
  MCP_TOOL_SPECS,
  proposeTransfer,
  resetSessionPolicy,
  runStrategyTool,
} from "./mcp.js";

describe("MCP-shaped tools", () => {
  it("advertises tools and none claim production threshold signing", () => {
    const names = MCP_TOOL_SPECS.map((t) => t.name);
    expect(names).toContain("propose_transfer");
    expect(names).toContain("run_strategy");
    expect(MCP_TOOL_SPECS.every((t) => typeof t.description === "string")).toBe(true);
  });

  it("lists networks and playbooks", () => {
    const nets = listNetworks();
    expect(nets.some((n) => n.labAllowable)).toBe(true);
    expect(nets.some((n) => n.kind === "mainnet" && !n.labAllowable)).toBe(true);
    const wax = inspectPlaybook(CHAINS.waxTestnet);
    expect(wax.ok).toBe(true);
  });

  it("lists strategies and runs a lab allow", () => {
    expect(listStrategiesTool({ expect: "allow" }).length).toBe(4);
    const result = runStrategyTool("wax-testnet-tip", "agent.pxj", 1_700_000_000);
    expect(result.decision.ok).toBe(true);
    expect(result.lab?.signature.startsWith("SIG_K1_")).toBe(true);
  });

  it("propose_transfer and check_status share session policy", () => {
    resetSessionPolicy();
    const ok = proposeTransfer({
      chainId: CHAINS.waxTestnet,
      contract: "eosio.token",
      action: "transfer",
      alias: "px-treasury",
      amountUnits: 1_000n,
      symbol: "WAX",
      memo: "mcp",
      nowSec: 100,
      expiresAtSec: 160,
    });
    expect(ok.ok).toBe(true);
    expect(checkStatus().audit.some((line) => line.startsWith("allow:"))).toBe(true);
    killPolicy("drill");
    expect(checkStatus().killed).toBe(true);
    expect(
      proposeTransfer({
        chainId: CHAINS.waxTestnet,
        contract: "eosio.token",
        action: "transfer",
        alias: "px-treasury",
        amountUnits: 1_000n,
        symbol: "WAX",
        memo: "mcp",
        nowSec: 100,
        expiresAtSec: 160,
      }).ok,
    ).toBe(false);
  });
});
