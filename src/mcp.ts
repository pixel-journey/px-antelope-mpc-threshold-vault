/**
 * Model Context Protocol–shaped tools for agents.
 *
 * None of these hold a share. None return a threshold signature.
 * None broadcast. `lab_sign_allowed` is lab-only and must not accept a raw digest.
 */

import { evaluateBroadcast } from "./broadcast.js";
import { CHAINS, LAB_CHAIN_IDS } from "./digest.js";
import { handoff } from "./dryrun.js";
import { createLabKey, signAllowed, type LabSignature } from "./labsign.js";
import { PLAYBOOKS, defaultGateActions, playbookByChainId } from "./playbooks.js";
import {
  createPolicy,
  type Decision,
  type PolicyOptions,
  type Proposal,
} from "./policy.js";
import { simulateAllowed, type SimulateResult } from "./simulate.js";
import {
  listStrategyIds,
  runStrategy,
  runStrategyWithPolicy,
  strategiesByExpect,
  strategiesByTag,
  type StrategyResult,
} from "./strategies.js";

export type McpToolName =
  | "list_networks"
  | "list_strategies"
  | "inspect_playbook"
  | "propose_transfer"
  | "run_strategy"
  | "check_status"
  | "lab_sign_allowed"
  | "simulate_proposal"
  | "broadcast_status";

export interface McpToolSpec {
  name: McpToolName;
  description: string;
  canProduceLabSignature: boolean;
}

export const MCP_TOOL_SPECS: readonly McpToolSpec[] = [
  {
    name: "list_networks",
    description: "List Antelope networks in the playbook catalog and lab-allowable flags.",
    canProduceLabSignature: false,
  },
  {
    name: "list_strategies",
    description: "List named strategies, optionally filtered by expect or tag.",
    canProduceLabSignature: false,
  },
  {
    name: "inspect_playbook",
    description: "Return the playbook for one chain id.",
    canProduceLabSignature: false,
  },
  {
    name: "propose_transfer",
    description: "Submit a transfer proposal to the session policy gate. Does not sign or broadcast.",
    canProduceLabSignature: false,
  },
  {
    name: "run_strategy",
    description: "Run a named strategy; lab-signs only after allow. Does not broadcast.",
    canProduceLabSignature: true,
  },
  {
    name: "check_status",
    description: "Return session policy audit, killed flag, and effective lab chain ids.",
    canProduceLabSignature: false,
  },
  {
    name: "lab_sign_allowed",
    description: "Lab only: throwaway SIG_K1_ after allow. Not a threshold share. Not production MCP.",
    canProduceLabSignature: true,
  },
  {
    name: "simulate_proposal",
    description:
      "Local dry-run: policy decision + broadcast lock. Does not call nodeos compute_transaction.",
    canProduceLabSignature: false,
  },
  {
    name: "broadcast_status",
    description: "Whether a chain id is a broadcast candidate and why this course still refuses send.",
    canProduceLabSignature: false,
  },
];

export function listNetworks() {
  return PLAYBOOKS.map((book) => ({
    name: book.name,
    chainId: book.chainId,
    symbol: book.symbol,
    kind: book.kind,
    labAllowable: sessionPolicy.labChainIds.includes(book.chainId),
    broadcast: evaluateBroadcast(book.chainId),
    defaultGateActions: book.actions
      .filter((a) => a.allowedByDefaultGate)
      .map((a) => `${a.contract}::${a.action}`),
  }));
}

export function listStrategiesTool(filter?: { expect?: "allow" | "refuse"; tag?: string }) {
  if (filter?.tag) {
    return strategiesByTag(filter.tag).map((s) => ({
      id: s.id,
      title: s.title,
      expect: s.expect,
      tags: s.tags ?? [],
    }));
  }
  if (filter?.expect) {
    return strategiesByExpect(filter.expect).map((s) => ({
      id: s.id,
      title: s.title,
      expect: s.expect,
      tags: s.tags ?? [],
    }));
  }
  return listStrategyIds().map((id) => ({ id }));
}

export function inspectPlaybook(chainId: string) {
  const book = playbookByChainId(chainId);
  if (!book) return { ok: false as const, reason: "unknown chain id" };
  return { ok: true as const, playbook: book, broadcast: evaluateBroadcast(chainId) };
}

let sessionPolicy = createPolicy();
let sessionOptions: PolicyOptions = {};

export function resetSessionPolicy(options: PolicyOptions = {}): void {
  sessionOptions = options;
  sessionPolicy = createPolicy(options);
}

export function proposeTransfer(input: Proposal): Decision {
  return sessionPolicy.propose(input);
}

export function runStrategyTool(
  id: string,
  fromAccount: string,
  nowSec: number,
  options?: PolicyOptions,
): StrategyResult {
  if (options) return runStrategyWithPolicy(id, fromAccount, nowSec, options);
  return runStrategy(id, fromAccount, nowSec);
}

export function checkStatus() {
  return {
    killed: sessionPolicy.killed,
    audit: [...sessionPolicy.audit],
    labChainIds: [...sessionPolicy.labChainIds],
    defaultLabChainIds: [...LAB_CHAIN_IDS],
    defaultGateActionCount: defaultGateActions().length,
    sessionOptions,
    broadcasts: false as const,
  };
}

export function killPolicy(reason: string): void {
  sessionPolicy.kill(reason);
}

export function labSignAllowed(
  proposal: Proposal,
  decision: Decision,
  fromAccount: string,
): LabSignature {
  if (!decision.ok) throw new Error("lab_sign_allowed requires an allow decision");
  return signAllowed(createLabKey(), proposal, decision, fromAccount, {
    allowedChainIds: sessionPolicy.labChainIds,
  });
}

export function labHandoff(proposal: Proposal, decision: Decision, fromAccount: string) {
  return handoff(proposal, decision, fromAccount);
}

export function simulateProposal(proposal: Proposal, decision: Decision): SimulateResult {
  return simulateAllowed(proposal, decision);
}

export function broadcastStatus(chainId: string) {
  const decision = evaluateBroadcast(chainId);
  return {
    ...decision,
    courseBroadcasts: false as const,
    note: decision.ok
      ? "Candidate testnet only; refuseBroadcast still throws — no push_transaction in this course."
      : decision.reason,
  };
}

export const LAB_CHAIN_ID_MAP = {
  waxTestnet: CHAINS.waxTestnet,
  jungle4: CHAINS.jungle4,
} as const;
