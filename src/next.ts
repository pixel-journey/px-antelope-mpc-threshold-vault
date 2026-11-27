import type { StrategyResult } from "./strategies.js";

/**
 * What an agent should do after runStrategy.
 * Does not sign, does not push, does not widen the gate.
 */

export type NextAction = "stop" | "handoff" | "lab-only";

export interface Advice {
  next: NextAction;
  reason: string;
  /** Lab SIG_K1_ is over a proposal id. A node will not accept it. */
  labSignatureIsNodeValid: false;
  /** The model must not call push_transaction. */
  pushFromModel: false;
  doNot: string[];
}

export function adviseNext(result: StrategyResult): Advice {
  const base = {
    labSignatureIsNodeValid: false as const,
    pushFromModel: false as const,
  };
  if (!result.decision.ok) {
    return {
      ...base,
      next: "stop",
      reason: result.decision.reason,
      doNot: [
        "rewrite the proposal to sneak past the reason",
        "switch the chain id to a mainnet",
        "ask the co-signer to sign a digest the model computed",
      ],
    };
  }
  return {
    ...base,
    next: result.lab ? "lab-only" : "handoff",
    reason: "within the testnet cap",
    doNot: [
      "treat the lab SIG_K1_ as a nodeos signature",
      "broadcast from this process",
      "reuse the handoff after it expires",
    ],
  };
}
