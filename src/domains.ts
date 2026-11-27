import type { Handoff } from "./dryrun.js";

/**
 * Cross-chain domain checks for handoffs.
 *
 * A proposal id changes when the chain id changes. A real Antelope
 * signing digest also changes, because the chain id is the first 32
 * bytes of SHA-256(chain_id || packed_transaction || cfd_hash).
 *
 * This file does not pack and does not sign.
 */

export interface DomainReport {
  sameChain: boolean;
  sameProposalId: boolean;
  /** True only when every bound field, including the chain id, matches. */
  wouldBeSameCeremony: boolean;
  note: string;
}

export function compareDomains(left: Handoff, right: Handoff): DomainReport {
  const sameChain = left.chainId === right.chainId;
  const sameProposalId = left.proposalId === right.proposalId;
  const wouldBeSameCeremony = sameChain && sameProposalId;
  let note: string;
  if (wouldBeSameCeremony) {
    note = "Same chain and same proposal id. A co-signer should treat this as one ceremony, not two.";
  } else if (!sameChain) {
    note =
      "Different chain ids. A packed transfer on one chain cannot be replayed as the same signing digest on the other. Do not strip the chain id.";
  } else {
    note = "Same chain, different proposal id. Amount, memo, recipient, or expiry changed. Sign the new handoff, do not reuse the old signature.";
  }
  return { sameChain, sameProposalId, wouldBeSameCeremony, note };
}

/** True when two handoffs are not the same ceremony. */
export function domainsSeparated(left: Handoff, right: Handoff): boolean {
  return !compareDomains(left, right).wouldBeSameCeremony;
}
