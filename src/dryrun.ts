import { createHash } from "node:crypto";
import type { Decision, Proposal } from "./policy.js";

/**
 * Bind an allowed proposal into a record a co-signer can re-pack.
 * Does not sign. Does not broadcast. Does not accept a digest from the caller.
 * The hash is a proposal id, not an Antelope signing digest.
 */

export interface Handoff {
  chainId: string;
  from: string;
  to: string;
  quantity: string;
  memo: string;
  expiresAtSec: number;
  /** SHA-256 of the fields above, length-prefixed. Not a nodeos signing digest. */
  proposalId: string;
}

export function handoff(
  proposal: Proposal,
  decision: Decision,
  fromAccount: string,
): Handoff {
  if (!decision.ok || !decision.account) {
    throw new Error("handoff requires an allowed proposal");
  }
  if (!/^[a-z1-5.]{1,12}$/.test(fromAccount)) {
    throw new Error("from account is not an Antelope name");
  }
  const record: Handoff = {
    chainId: proposal.chainId,
    from: fromAccount,
    to: decision.account,
    quantity: formatQuantity(proposal.amountUnits, proposal.symbol),
    memo: proposal.memo,
    expiresAtSec: proposal.expiresAtSec,
    proposalId: "",
  };
  record.proposalId = proposalId(record);
  return record;
}

export function proposalId(record: Omit<Handoff, "proposalId">): string {
  const parts = [
    record.chainId,
    record.from,
    record.to,
    record.quantity,
    record.memo,
    record.expiresAtSec.toString(),
  ];
  const hash = createHash("sha256");
  for (const part of parts) {
    const bytes = Buffer.from(part, "utf8");
    hash.update(Buffer.from([bytes.length]));
    hash.update(bytes);
  }
  return hash.digest("hex");
}

function formatQuantity(units: bigint, symbol: string): string {
  const whole = units / 10000n;
  const frac = (units % 10000n).toString().padStart(4, "0");
  return `${whole.toString()}.${frac} ${symbol}`;
}
