import { describe, expect, it } from "vitest";
import { CHAINS } from "./digest.js";
import {
  broadcastStatus,
  checkStatus,
  inspectPlaybook,
  killPolicy,
  listNetworks,
  listStrategiesTool,
  MCP_TOOL_SPECS,
  proposeTransfer,
  resetSessionPolicy,
  runStrategyTool,
  simulateProposal,
} from "./mcp.js";

describe("MCP-shaped tools", () => {
  it("advertises simulate and broadcast_status", () => {
    const names = MCP_TOOL_SPECS.map((t) => t.name);
    expect(names).toContain("simulate_proposal");
    expect(names).toContain("broadcast_status");
  });

  it("lists networks with broadcast evaluation", () => {
    const nets = listNetworks();
    expect(nets.some((n) => n.labAllowable)).toBe(true);
    expect(inspectPlaybook(CHAINS.waxTestnet).ok).toBe(true);
  });

  it("runs lab allow strategy", () => {
    expect(listStrategiesTool({ expect: "allow" }).length).toBe(4);
    const result = runStrategyTool("wax-testnet-tip", "agent.pxj", 1_700_000_000);
    expect(result.decision.ok).toBe(true);
    expect(result.lab?.signature.startsWith("SIG_K1_")).toBe(true);
  });

  it("simulate_proposal detects inline escalation", () => {
    resetSessionPolicy();
    const proposal = {
      chainId: CHAINS.waxTestnet,
      contract: "eosio.token",
      action: "transfer",
      alias: "px-treasury",
      amountUnits: 1_000n,
      symbol: "WAX",
      memo: "mcp",
      nowSec: 100,
      expiresAtSec: 160,
    };
    const ok = proposeTransfer(proposal);
    const clean = simulateProposal(proposal, ok, "clean-transfer");
    expect(clean.simulation.safeForCoSign).toBe(true);
    const bad = simulateProposal(proposal, ok, "inline-escalation");
    expect(bad.simulation.safeForCoSign).toBe(false);
    expect(checkStatus().httpPushImplemented).toBe(false);
    killPolicy("drill");
    expect(checkStatus().killed).toBe(true);
  });

  it("broadcast_status is readiness-oriented", () => {
    expect(broadcastStatus(CHAINS.waxMainnet).ok).toBe(false);
    expect(broadcastStatus(CHAINS.waxTestnet).httpPushImplemented).toBe(false);
  });
});
