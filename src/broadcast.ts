/**
 * Broadcast / push_transaction posture.
 *
 * Learners should understand push_transaction — it is the last step of a
 * real agent payment loop. This course does not hide it. It also does not
 * call it by default.
 *
 * Order of teaching:
 *   1. policy gate + aliases + caps
 *   2. correct Antelope digest (not a lab proposal-id signature)
 *   3. compute_transaction dry-run on a lab node
 *   4. only then push_transaction on a *testnet*, with eyes open
 *
 * Mainnets are never candidates here. Opt-in sender: `pushLabTransaction` in labClient.ts.
 * Mainnet human path: unsigned handoff via `src/esr.ts` (Anchor / msig / hardware).
 */

import { CHAINS, LAB_CHAIN_IDS } from "./digest.js";
import { MAINNET_CHAIN_IDS } from "./policy.js";

/** Chains that may receive an educational testnet push once readiness is green. */
export const BROADCAST_CANDIDATE_CHAIN_IDS: readonly string[] = [
  ...LAB_CHAIN_IDS,
  CHAINS.telosTestnet,
  CHAINS.xprTestnet,
];

export type BroadcastDecision =
  | { ok: true; chainId: string }
  | { ok: false; reason: string };

export function evaluateBroadcast(chainId: string): BroadcastDecision {
  if (MAINNET_CHAIN_IDS.includes(chainId)) {
    return { ok: false, reason: "mainnet broadcast is locked" };
  }
  if (!BROADCAST_CANDIDATE_CHAIN_IDS.includes(chainId)) {
    return { ok: false, reason: "chain is not a broadcast candidate testnet" };
  }
  return { ok: true, chainId };
}

export function assertBroadcastAllowed(chainId: string): void {
  const decision = evaluateBroadcast(chainId);
  if (!decision.ok) throw new Error(decision.reason);
}

export interface PushReadinessInput {
  chainId: string;
  policyAllowed: boolean;
  /**
   * True only if the signature is over SHA-256(chain_id‖packed‖cfd),
   * not over a lab proposal id.
   */
  signedAntelopeDigest: boolean;
  dryRunOk: boolean;
  /**
   * Explicit operator/developer intent. Agents must not set this from model text alone.
   */
  operatorOptsIntoPush: boolean;
  /** True when calling pushLabTransaction (sets this internally). */
  senderImplemented: boolean;
}

export interface PushCheck {
  id: string;
  ok: boolean;
  detail: string;
}

export interface PushReadiness {
  ready: boolean;
  checks: PushCheck[];
  blockers: string[];
  curriculumStage: "learn-gate" | "learn-digest" | "learn-dry-run" | "learn-push" | "blocked-mainnet";
}

export function evaluatePushReadiness(input: PushReadinessInput): PushReadiness {
  if (MAINNET_CHAIN_IDS.includes(input.chainId)) {
    return {
      ready: false,
      curriculumStage: "blocked-mainnet",
      checks: [
        {
          id: "not-mainnet",
          ok: false,
          detail: "Mainnet push is out of scope; use unsigned ESR handoff for human sign.",
        },
      ],
      blockers: ["mainnet"],
    };
  }

  const chain = evaluateBroadcast(input.chainId);
  const checks: PushCheck[] = [
    {
      id: "testnet-candidate",
      ok: chain.ok,
      detail: chain.ok
        ? "Chain is a lab/opt-in testnet candidate."
        : chain.reason,
    },
    {
      id: "policy-allowed",
      ok: input.policyAllowed,
      detail: input.policyAllowed
        ? "Policy gate allowed the proposal."
        : "Policy gate has not allowed this proposal.",
    },
    {
      id: "antelope-digest-signature",
      ok: input.signedAntelopeDigest,
      detail: input.signedAntelopeDigest
        ? "Signature covers the Antelope signing digest."
        : "Lab proposal-id signatures are not pushable; pack and sign the real digest.",
    },
    {
      id: "dry-run",
      ok: input.dryRunOk,
      detail: input.dryRunOk
        ? "Dry-run reported success."
        : "Run compute_transaction (or local simulate + later RPC) before push.",
    },
    {
      id: "operator-opt-in",
      ok: input.operatorOptsIntoPush,
      detail: input.operatorOptsIntoPush
        ? "Operator explicitly opted into push."
        : "Push requires explicit operator opt-in — not a model decision.",
    },
    {
      id: "sender-implemented",
      ok: input.senderImplemented,
      detail: input.senderImplemented
        ? "HTTP sender is wired (pushLabTransaction)."
        : "Pass senderImplemented via pushLabTransaction or a custom sender.",
    },
  ];

  const blockers = checks.filter((c) => !c.ok).map((c) => c.id);
  const ready = blockers.length === 0;

  let curriculumStage: PushReadiness["curriculumStage"] = "learn-gate";
  if (!checks.find((c) => c.id === "policy-allowed")!.ok) curriculumStage = "learn-gate";
  else if (!checks.find((c) => c.id === "antelope-digest-signature")!.ok)
    curriculumStage = "learn-digest";
  else if (!checks.find((c) => c.id === "dry-run")!.ok) curriculumStage = "learn-dry-run";
  else curriculumStage = "learn-push";

  return { ready, checks, blockers, curriculumStage };
}

export function refuseBroadcast(chainId: string): never {
  assertBroadcastAllowed(chainId);
  throw new Error(
    "push_transaction is the final curriculum stage; use evaluatePushReadiness + pushLabTransaction on testnets only — see docs/PUSH.md",
  );
}
