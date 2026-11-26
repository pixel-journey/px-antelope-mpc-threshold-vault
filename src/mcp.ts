/**
 * Model Context Protocol–shaped tools for agents.
 *
 * None of these hold a share. None return a threshold signature.
 * `lab_sign_allowed` is explicitly a lab-only helper and must not be exposed
 * as a production MCP tool that accepts a raw digest.
 *
 * This module is the callable form of docs/MCP-TOOLS.md.
 */

import { CHAINS, LAB_CHAIN_IDS } from "./digest.js";
import { handoff } from "./dryrun.js";
import { createLabKey, signAllowed, type LabSignature } from "./labsign.js";
import { PLAYBOOKS, defaultGateActions, playbookByChainId } from "./playbooks.js";
import { createPolicy, type Decision, type Proposal } from "./policy.js";
import {
  listStrategyIds,
  runStrategy,
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
  | "lab_sign_allowed";

export interface McpToolSpec {
  name: McpToolName;
  description: string;
  /** True if this tool may ever produce a SIG_* (lab only). */
  canProduceLabSignature: boolean;
}

export const MCP_TOOL_SPECS: readonly McpToolSpec[] = [
  {
    name: "list_networks",
    description: "List Antelope networks in the playbook catalog and which are lab-allowable today.",
    canProduceLabSignature: false,
  },
  {
    name: "list_strategies",
    description: "List named strategies, optionally filtered by expect or tag.",
    canProduceLabSignature: false,
  },
  {
    name: "inspect_playbook",
    description: "Return the playbook for one chain id, including actions the default gate refuses.",
    canProduceLabSignature: false,
  },
  {
    name: "propose_transfer",
    description: "Submit a transfer proposal to the policy gate. Does not sign.",
    canProduceLabSignature: false,
  },
  {
    name: "run_strategy",
    description: "Run a named strategy through the gate; lab-signs only after allow.",
    canProduceLabSignature: true,
  },
  {
    name: "check_status",
    description: "Return the policy audit log and killed flag.",
    canProduceLabSignature: false,
  },
  {
    name: "lab_sign_allowed",
    description:
      "Lab only: sign an already-allowed proposal with a throwaway key. Not a threshold share. Not for production MCP.",
    canProduceLabSignature: true,
  },
];

export function listNetworks() {
  return PLAYBOOKS.map((book) => ({
    name: book.name,
    chainId: book.chainId,
    symbol: book.symbol,
    kind: book.kind,
    labAllowable: LAB_CHAIN_IDS.includes(book.chainId as (typeof LAB_CHAIN_IDS)[number]),
    defaultGateActions: book.actions.filter((a) => a.allowedByDefaultGate).map((a) => `${a.contract}::${a.action}`),
  }));
}

export function listStrategiesTool(filter?: { expect?: "allow" | "refuse"; tag?: string }) {
  let rows = filter?.expect ? strategiesByExpect(filter.expect) : [...listStrategyIds().map((id) => ({ id }))];
  if (filter?.tag) {
    const tagged = strategiesByTag(filter.tag);
    return tagged.map((s) => ({
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
  return { ok: true as const, playbook: book };
}

/** Shared policy instance for check_status in a single process. */
let sessionPolicy = createPolicy();

export function resetSessionPolicy(): void {
  sessionPolicy = createPolicy();
}

export function proposeTransfer(input: Proposal): Decision {
  return sessionPolicy.propose(input);
}

export function runStrategyTool(id: string, fromAccount: string, nowSec: number): StrategyResult {
  return runStrategy(id, fromAccount, nowSec);
}

export function checkStatus() {
  return {
    killed: sessionPolicy.killed,
    audit: [...sessionPolicy.audit],
    labChainIds: [...LAB_CHAIN_IDS],
    defaultGateActionCount: defaultGateActions().length,
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
  return signAllowed(createLabKey(), proposal, decision, fromAccount);
}

export function labHandoff(proposal: Proposal, decision: Decision, fromAccount: string) {
  return handoff(proposal, decision, fromAccount);
}

export const LAB_CHAIN_ID_MAP = {
  waxTestnet: CHAINS.waxTestnet,
  jungle4: CHAINS.jungle4,
} as const;
