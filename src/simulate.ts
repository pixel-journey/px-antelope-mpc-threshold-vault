/**
 * Offline stand-in for POST /v1/chain/compute_transaction.
 *
 * Phase W can swap MockComputeTransactionClient for a real APIClient without
 * changing policy/MCP call sites — both implement TransactionSimulator.
 *
 * Simulation is necessary but never sufficient: state can change between dry-run
 * and inclusion. Always pair with linkauth caps and short expirations.
 */

import { evaluateBroadcast } from "./broadcast.js";
import type { Decision, Proposal } from "./policy.js";

export type SimulateFixtureId =
  | "clean-transfer"
  | "inline-escalation"
  | "assert-revert"
  | "context-free-or-deferred";

export interface ActionTrace {
  receiver: string;
  act: { account: string; name: string };
  inline_traces?: ActionTrace[];
}

export interface ComputeTrace {
  fixture: SimulateFixtureId;
  transaction_id: string;
  except: string | null;
  action_traces: ActionTrace[];
}

export interface SimulatorVerdict {
  ok: boolean;
  reason: string;
  trace: ComputeTrace;
  /** Policy layer should refuse when false. */
  safeForCoSign: boolean;
}

export interface TransactionSimulator {
  compute(proposal: Proposal, fixture?: SimulateFixtureId): Promise<SimulatorVerdict> | SimulatorVerdict;
}

const BLOCKED_INLINE = new Set([
  "eosio::updateauth",
  "eosio::deleteauth",
  "eosio::linkauth",
  "eosio::unlinkauth",
  "eosio::setcode",
  "eosio::setabi",
]);

function txIdFor(proposal: Proposal, fixture: SimulateFixtureId): string {
  // Deterministic fake id for offline labs — not a chain tx id.
  const raw = `${proposal.chainId}:${proposal.contract}::${proposal.action}:${proposal.alias}:${fixture}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (h * 33 + raw.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, "0").repeat(8).slice(0, 64);
}

export function buildFixtureTrace(
  proposal: Proposal,
  fixture: SimulateFixtureId = "clean-transfer",
): ComputeTrace {
  const id = txIdFor(proposal, fixture);
  if (fixture === "assert-revert") {
    return {
      fixture,
      transaction_id: id,
      except: "eosio_assert_message: assertion failure",
      action_traces: [],
    };
  }
  if (fixture === "context-free-or-deferred") {
    return {
      fixture,
      transaction_id: id,
      except: "unexpected context_free_actions or deferred transaction pattern",
      action_traces: [
        {
          receiver: proposal.contract,
          act: { account: proposal.contract, name: proposal.action },
        },
      ],
    };
  }
  if (fixture === "inline-escalation") {
    return {
      fixture,
      transaction_id: id,
      except: null,
      action_traces: [
        {
          receiver: proposal.contract,
          act: { account: proposal.contract, name: proposal.action },
          inline_traces: [
            {
              receiver: "eosio",
              act: { account: "eosio", name: "updateauth" },
            },
          ],
        },
      ],
    };
  }
  // clean-transfer
  return {
    fixture: "clean-transfer",
    transaction_id: id,
    except: null,
    action_traces: [
      {
        receiver: proposal.contract,
        act: { account: proposal.contract, name: proposal.action },
        inline_traces: [],
      },
    ],
  };
}

function walkBlocked(traces: ActionTrace[]): string | null {
  for (const t of traces) {
    const key = `${t.act.account}::${t.act.name}`;
    if (BLOCKED_INLINE.has(key)) return key;
    if (t.inline_traces?.length) {
      const inner = walkBlocked(t.inline_traces);
      if (inner) return inner;
    }
  }
  return null;
}

export function verdictFromTrace(trace: ComputeTrace, proposal: Proposal): SimulatorVerdict {
  if (trace.except) {
    return {
      ok: false,
      reason: `simulation except: ${trace.except}`,
      trace,
      safeForCoSign: false,
    };
  }
  const blocked = walkBlocked(trace.action_traces);
  if (blocked) {
    return {
      ok: false,
      reason: `hidden inline escalation: ${blocked}`,
      trace,
      safeForCoSign: false,
    };
  }
  const top = trace.action_traces[0];
  if (
    !top ||
    top.act.account !== proposal.contract ||
    top.act.name !== proposal.action
  ) {
    return {
      ok: false,
      reason: "top-level action does not match proposal",
      trace,
      safeForCoSign: false,
    };
  }
  return {
    ok: true,
    reason: "clean simulation trace",
    trace,
    safeForCoSign: true,
  };
}

export class MockComputeTransactionClient implements TransactionSimulator {
  constructor(private readonly defaultFixture: SimulateFixtureId = "clean-transfer") {}

  compute(proposal: Proposal, fixture?: SimulateFixtureId): SimulatorVerdict {
    const trace = buildFixtureTrace(proposal, fixture ?? this.defaultFixture);
    return verdictFromTrace(trace, proposal);
  }
}

export const defaultSimulator = new MockComputeTransactionClient();

export interface SimulateResult {
  policyOk: boolean;
  policyReason: string;
  simulation: SimulatorVerdict;
  /** Testnet candidate only; readiness still required for actual push. */
  broadcastCandidate: boolean;
  broadcastReason: string;
  recommendedRpc: "/v1/chain/compute_transaction";
  note: string;
}

/**
 * Policy decision + offline compute_transaction fixture.
 * Does not HTTP. Does not imply push is safe without readiness checklist.
 */
export function simulateAllowed(
  proposal: Proposal,
  decision: Decision,
  options?: { fixture?: SimulateFixtureId; simulator?: TransactionSimulator },
): SimulateResult {
  const broadcast = evaluateBroadcast(proposal.chainId);
  const simulator = options?.simulator ?? defaultSimulator;
  const simulation = simulator.compute(proposal, options?.fixture) as SimulatorVerdict;
  return {
    policyOk: decision.ok,
    policyReason: decision.reason,
    simulation,
    broadcastCandidate: broadcast.ok,
    broadcastReason: broadcast.ok
      ? "testnet candidate — push only after evaluatePushReadiness"
      : broadcast.reason,
    recommendedRpc: "/v1/chain/compute_transaction",
    note: decision.ok && simulation.safeForCoSign
      ? "Offline simulation clean. Simulation is not inclusion; keep linkauth + short expiry."
      : "Fix policy and/or simulation before co-sign or push.",
  };
}
