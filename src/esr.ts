/**
 * Unsigned handoff for human Anchor / hardware / msig signing.
 *
 * Mainnet agents must not hold keys or auto-push. This module builds a
 * structured payload a human can review. The `esr://` string is educational:
 * a full WharfKit SigningRequest encode may replace `encodeEducationalEsr` later.
 */

import { evaluateBroadcast } from "./broadcast.js";

export type UnsignedAction = {
  account: string;
  name: string;
  authorization: { actor: string; permission: string }[];
  data: Record<string, unknown>;
};

export type UnsignedHandoffInput = {
  chainId: string;
  actions: UnsignedAction[];
  /** Human-readable intent for the signer UI. */
  summary: string;
  /** If true, refuse when chain is mainnet-locked for *agent* push — still allow handoff. */
  allowMainnetHandoff?: boolean;
};

export type UnsignedHandoff = {
  kind: "unsigned-human-sign";
  chainId: string;
  actions: UnsignedAction[];
  summary: string;
  broadcastLocked: boolean;
  /** Educational placeholder — not a full ESR codec. */
  esrUri: string;
  warnings: string[];
};

function requireSafeActions(actions: UnsignedAction[]): string[] {
  const warnings: string[] = [];
  for (const a of actions) {
    if (a.name === "updateauth" || a.name === "setcode" || a.name === "setabi") {
      warnings.push(`${a.account}::${a.name} requires cold-owner / human review`);
    }
    if (!a.authorization?.length) {
      throw new Error(`action ${a.account}::${a.name} needs authorization`);
    }
  }
  if (!actions.length) throw new Error("need at least one action");
  return warnings;
}

/**
 * Minimal ESR-shaped URI for teaching. Real deployments should use
 * `@wharfkit/signing-request` (or equivalent) to pack binary request bytes.
 */
export function encodeEducationalEsr(input: {
  chainId: string;
  actions: UnsignedAction[];
  summary: string;
}): string {
  const payload = {
    v: 1,
    chainId: input.chainId,
    summary: input.summary,
    actions: input.actions,
  };
  const json = JSON.stringify(payload);
  // base64url without padding
  const b64 = Buffer.from(json, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `esr://edu/${b64}`;
}

export function buildUnsignedHandoff(input: UnsignedHandoffInput): UnsignedHandoff {
  const warnings = requireSafeActions(input.actions);
  const broadcast = evaluateBroadcast(input.chainId);
  const broadcastLocked = !broadcast.ok;

  if (broadcastLocked && input.allowMainnetHandoff === false) {
    throw new Error(`handoff refused: ${broadcast.reason}`);
  }

  if (broadcastLocked) {
    warnings.push(
      "chain is broadcast-locked for agent push — human must sign and push",
    );
  }

  warnings.push("educational ESR URI — verify with a real SigningRequest encoder before production");

  return {
    kind: "unsigned-human-sign",
    chainId: input.chainId,
    actions: input.actions,
    summary: input.summary,
    broadcastLocked,
    esrUri: encodeEducationalEsr({
      chainId: input.chainId,
      actions: input.actions,
      summary: input.summary,
    }),
    warnings,
  };
}
