import { Checksum256, PrivateKey, Signature } from "@wharfkit/antelope";
import { LAB_CHAIN_IDS } from "./digest.js";
import { handoff, proposalId } from "./dryrun.js";
import { MAINNET_CHAIN_IDS, type Decision, type Proposal } from "./policy.js";

/**
 * A throwaway lab key that signs a proposal the gate already allowed.
 *
 * This is not a threshold share. It is one PrivateKey generated in this
 * process so a student or an agent can see a real SIG_K1_ and recover it.
 * It refuses mainnets. It does not broadcast.
 *
 * By default only LAB_CHAIN_IDS are accepted. Operators may pass the same
 * testnet set they opened in createPolicy({ extraLabChainIds }) so an allow
 * on Telos/XPR testnet can also produce a recoverable lab signature.
 */

export interface LabSignature {
  publicKey: string;
  signature: string;
  proposalId: string;
  chainId: string;
}

export interface LabSignOptions {
  /** Chain ids already allowed by the policy instance (must not include mainnets). */
  allowedChainIds?: readonly string[];
}

export function createLabKey(): PrivateKey {
  return PrivateKey.generate("K1");
}

function resolveAllowed(options?: LabSignOptions): readonly string[] {
  const raw = options?.allowedChainIds ?? LAB_CHAIN_IDS;
  return raw.filter((id) => !MAINNET_CHAIN_IDS.includes(id));
}

export function signAllowed(
  key: PrivateKey,
  proposal: Proposal,
  decision: Decision,
  fromAccount: string,
  options?: LabSignOptions,
): LabSignature {
  if (!decision.ok) {
    throw new Error("lab signer requires an allow decision");
  }
  const allowed = resolveAllowed(options);
  if (!allowed.includes(proposal.chainId)) {
    throw new Error("lab signer refuses a chain that is not an allowed lab testnet");
  }
  if (MAINNET_CHAIN_IDS.includes(proposal.chainId)) {
    throw new Error("lab signer refuses mainnet");
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
