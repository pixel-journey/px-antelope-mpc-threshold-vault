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
  it("advertises integrated tools including simulate and broadcast_status", () => {
    const names = MCP_TOOL_SPECS.map((t) => t.name);
    expect(names).toContain("propose_transfer");
    expect(names).toContain("run_strategy");
    expect(names).toContain("simulate_proposal");
    expect(names).toContain("broadcast_status");
    expect(MCP_TOOL_SPECS.every((t) => typeof t.description === "string")).toBe(true);
  });

  it("lists networks with broadcast evaluation", () => {
    const nets = listNetworks();
    expect(nets.some((n) => n.labAllowable)).toBe(true);
    expect(nets.some((n) => n.kind === "mainnet" && !n.labAllowable)).toBe(true);
    const main = nets.find((n) => n.chainId === CHAINS.waxMainnet);
    expect(main?.broadcast.ok).toBe(false);
    const wax = inspectPlaybook(CHAINS.waxTestnet);
    expect(wax.ok).toBe(true);
  });

  it("lists strategies and runs a lab allow", () => {
    expect(listStrategiesTool({ expect: "allow" }).length).toBe(4);
    const result = runStrategyTool("wax-testnet-tip", "agent.pxj", 1_700_000_000);
    expect(result.decision.ok).toBe(true);
    expect(result.lab?.signature.startsWith("SIG_K1_")).toBe(true);
  });

  it("runs operator-opted strategy through runStrategyTool options", () => {
    const result = runStrategyTool("telos-testnet-tip", "agent.pxj", 1_700_000_000, {
      extraLabChainIds: [CHAINS.telosTestnet],
    });
    expect(result.decision.ok).toBe(true);
    expect(result.lab?.signature.startsWith("SIG_K1_")).toBe(true);
  });

  it("propose_transfer, simulate, and check_status share session policy", () => {
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
    expect(ok.ok).toBe(true);
    const sim = simulateProposal(proposal, ok);
    expect(sim.policyOk).toBe(true);
    expect(sim.wouldBroadcast).toBe(false);
    expect(checkStatus().broadcasts).toBe(false);
    expect(checkStatus().audit.some((line) => line.startsWith("allow:"))).toBe(true);
    killPolicy("drill");
    expect(checkStatus().killed).toBe(true);
  });

  it("broadcast_status locks mainnet", () => {
    expect(broadcastStatus(CHAINS.waxMainnet).ok).toBe(false);
    expect(broadcastStatus(CHAINS.waxTestnet).courseBroadcasts).toBe(false);
  });
});
