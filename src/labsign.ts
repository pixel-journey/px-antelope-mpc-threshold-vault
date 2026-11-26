import { Checksum256, PrivateKey, Signature } from "@wharfkit/antelope";
import { LAB_CHAIN_IDS } from "./digest.js";
import { handoff, proposalId, type Handoff } from "./dryrun.js";
import type { Decision, Proposal } from "./policy.js";

/**
 * A throwaway lab key that signs a proposal the gate already allowed.
 *
 * This is not a threshold share. It is one PrivateKey generated in this
 * process so a student or an agent can see a real SIG_K1_ and recover it.
 * It refuses mainnets. It does not broadcast.
 */

export interface LabSignature {
  publicKey: string;
  signature: string;
  proposalId: string;
  chainId: string;
}

export function createLabKey(): PrivateKey {
  return PrivateKey.generate("K1");
}

export function signAllowed(
  key: PrivateKey,
  proposal: Proposal,
  decision: Decision,
  fromAccount: string,
): LabSignature {
  if (!LAB_CHAIN_IDS.includes(proposal.chainId as (typeof LAB_CHAIN_IDS)[number])) {
    throw new Error("lab signer refuses a chain that is not a lab testnet");
  }
  const record = handoff(proposal, decision, fromAccount);
  if (record.proposalId !== proposalId(record)) {
    throw new Error("proposal id does not match the bound fields");
  }
  const digest = Checksum256.from(record.proposalId);
  const signature = key.signDigest(digest);
  return {
    publicKey: key.toPublic().toString(),
    signature: signature.toString(),
    proposalId: record.proposalId,
    chainId: record.chainId,
  };
}

export function recoverLab(signed: LabSignature): string {
  const digest = Checksum256.from(signed.proposalId);
  return Signature.from(signed.signature).recoverDigest(digest).toString();
}
