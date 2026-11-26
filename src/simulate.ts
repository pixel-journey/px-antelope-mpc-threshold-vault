/**
 * Educational stand-in for Antelope pre-sign simulation.
 *
 * Production agents should call POST /v1/chain/compute_transaction (execute
 * without committing state) and related get_required_keys / send_read_only
 * endpoints. This module never opens a socket. It only checks that a policy
 * allow exists and that broadcast would still be refused by this course.
 */

import { evaluateBroadcast } from "./broadcast.js";
import type { Decision, Proposal } from "./policy.js";

export interface SimulateResult {
  /** Whether the policy gate already allowed the proposal. */
  policyOk: boolean;
  policyReason: string;
  /** Whether this course would ever push the tx (always false today). */
  wouldBroadcast: false;
  broadcastReason: string;
  /** Reminder of the real RPC an implementer should call. */
  recommendedRpc: "/v1/chain/compute_transaction";
  note: string;
}

/**
 * Local dry-run: policy decision + broadcast lock. No node contact.
 */
export function simulateAllowed(proposal: Proposal, decision: Decision): SimulateResult {
  const broadcast = evaluateBroadcast(proposal.chainId);
  return {
    policyOk: decision.ok,
    policyReason: decision.reason,
    wouldBroadcast: false,
    broadcastReason: broadcast.ok
      ? "candidate testnet, but this course refuses all push_transaction"
      : broadcast.reason,
    recommendedRpc: "/v1/chain/compute_transaction",
    note: decision.ok
      ? "Policy allow only. Pack the tx, call compute_transaction on a lab RPC, then co-sign — not implemented here."
      : "Fix the policy refusal before any dry-run against a node.",
  };
}
