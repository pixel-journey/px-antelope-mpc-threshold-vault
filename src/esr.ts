/**
 * Unsigned handoff for human Anchor / hardware / msig signing.
 *
 * Mainnet agents must not hold keys or auto-push.
 * `eosio.token::transfer` actions encode as a real EEP-7 `esr://` via
 * `@wharfkit/signing-request` 4.0.2 and a local transfer ABI.
 * Other actions stay on the educational `esr://edu/` placeholder until their ABI is local.
 */

import { deflateRawSync, inflateRawSync } from "node:zlib";
import { ABI } from "@wharfkit/antelope";
import { SigningRequest } from "@wharfkit/signing-request";
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
  summary: string;
  allowMainnetHandoff?: boolean;
};

export type UnsignedHandoff = {
  kind: "unsigned-human-sign";
  chainId: string;
  actions: UnsignedAction[];
  summary: string;
  broadcastLocked: boolean;
  esrUri: string;
  /** True when `esrUri` is a WharfKit SigningRequest, not the edu placeholder. */
  esrProtocol: "wharfkit-4.0.2" | "educational";
  warnings: string[];
};

const TOKEN_TRANSFER_ABI = ABI.from({
  version: "eosio::abi/1.2",
  types: [],
  structs: [
    {
      name: "transfer",
      base: "",
      fields: [
        { name: "from", type: "name" },
        { name: "to", type: "name" },
        { name: "quantity", type: "asset" },
        { name: "memo", type: "string" },
      ],
    },
  ],
  actions: [{ name: "transfer", type: "transfer", ricardian_contract: "" }],
  tables: [],
  ricardian_clauses: [],
  error_messages: [],
  abi_extensions: [],
  variants: [],
});

const zlib = {
  deflateRaw: (data: Uint8Array | ArrayBuffer) =>
    new Uint8Array(deflateRawSync(Buffer.from(data))),
  inflateRaw: (data: Uint8Array | ArrayBuffer) =>
    new Uint8Array(inflateRawSync(Buffer.from(data))),
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

export function isTokenTransfer(action: UnsignedAction): boolean {
  return action.account === "eosio.token" && action.name === "transfer";
}

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
  const b64 = Buffer.from(JSON.stringify(payload), "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `esr://edu/${b64}`;
}

/** EEP-7 URI for eosio.token transfers only. No network. No keys. */
export async function encodeTokenTransferEsr(input: {
  chainId: string;
  actions: UnsignedAction[];
}): Promise<string> {
  if (!input.actions.every(isTokenTransfer)) {
    throw new Error("encodeTokenTransferEsr only packs eosio.token::transfer");
  }
  const request = await SigningRequest.create(
    { actions: input.actions, chainId: input.chainId },
    {
      zlib,
      abiProvider: {
        async getAbi(account: unknown) {
          if (String(account) !== "eosio.token") {
            throw new Error(`no local ABI for ${String(account)}`);
          }
          return TOKEN_TRANSFER_ABI;
        },
      },
    },
  );
  return request.encode();
}

export async function decodeTokenTransferChainId(esrUri: string): Promise<string> {
  const request = SigningRequest.from(esrUri, { zlib });
  return String(request.getChainId());
}

export async function buildUnsignedHandoff(
  input: UnsignedHandoffInput,
): Promise<UnsignedHandoff> {
  const warnings = requireSafeActions(input.actions);
  const broadcast = evaluateBroadcast(input.chainId);
  const broadcastLocked = !broadcast.ok;

  if (broadcastLocked && input.allowMainnetHandoff === false) {
    throw new Error(`handoff refused: ${broadcast.reason}`);
  }
  if (broadcastLocked) {
    warnings.push("chain is broadcast-locked for agent push — human must sign and push");
  }

  const allTransfers = input.actions.every(isTokenTransfer);
  let esrUri: string;
  let esrProtocol: UnsignedHandoff["esrProtocol"];
  if (allTransfers) {
    esrUri = await encodeTokenTransferEsr({
      chainId: input.chainId,
      actions: input.actions,
    });
    esrProtocol = "wharfkit-4.0.2";
  } else {
    esrUri = encodeEducationalEsr({
      chainId: input.chainId,
      actions: input.actions,
      summary: input.summary,
    });
    esrProtocol = "educational";
    warnings.push(
      "educational ESR URI — only eosio.token::transfer is packed with WharfKit SigningRequest",
    );
  }

  return {
    kind: "unsigned-human-sign",
    chainId: input.chainId,
    actions: input.actions,
    summary: input.summary,
    broadcastLocked,
    esrUri,
    esrProtocol,
    warnings,
  };
}
