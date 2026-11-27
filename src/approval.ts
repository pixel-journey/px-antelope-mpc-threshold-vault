/**
 * How an autonomous agent continues after a proposal.
 *
 * Unassisted does not mean unrestricted. The model may run the loop
 * without a human in the prompt only when the non-model policy already
 * allowed a lab action. Mainnet spend is human-monitored: unsigned ESR
 * or msig, then a person or cold board approves. This file does not sign
 * and does not push.
 */

import { evaluateBroadcast } from "./broadcast.js";
import { MAINNET_CHAIN_IDS, type Decision } from "./policy.js";

export type ApprovalMode = "refuse" | "lab-unassisted" | "human-monitor";

export type ApprovalRoute = {
  mode: ApprovalMode;
  reason: string;
  /** Model must never set push flags. */
  mayPush: false;
  /** Lab proposal-id signature only, and only after an allow. */
  mayLabSign: boolean;
  /** Human Anchor, hardware, or eosio.msig must approve before broadcast. */
  humanRequired: boolean;
  next: "stop" | "simulate-then-optional-lab-sig" | "build-unsigned-handoff";
};

export function routeApproval(input: {
  chainId: string;
  decision: Decision;
  /** True when the session policy has been killed. */
  killed?: boolean;
}): ApprovalRoute {
  if (input.killed) {
    return {
      mode: "refuse",
      reason: "policy is killed",
      mayPush: false,
      mayLabSign: false,
      humanRequired: false,
      next: "stop",
    };
  }

  if (MAINNET_CHAIN_IDS.includes(input.chainId)) {
    return {
      mode: "human-monitor",
      reason:
        "mainnet spend is not an agent signature. Build an unsigned handoff and wait for a human or msig.",
      mayPush: false,
      mayLabSign: false,
      humanRequired: true,
      next: "build-unsigned-handoff",
    };
  }

  const broadcast = evaluateBroadcast(input.chainId);
  if (!broadcast.ok && !input.decision.ok) {
    return {
      mode: "refuse",
      reason: input.decision.reason,
      mayPush: false,
      mayLabSign: false,
      humanRequired: false,
      next: "stop",
    };
  }

  if (!input.decision.ok) {
    return {
      mode: "refuse",
      reason: input.decision.reason,
      mayPush: false,
      mayLabSign: false,
      humanRequired: false,
      next: "stop",
    };
  }

  return {
    mode: "lab-unassisted",
    reason: input.decision.reason,
    mayPush: false,
    mayLabSign: true,
    humanRequired: false,
    next: "simulate-then-optional-lab-sig",
  };
}
