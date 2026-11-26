/**
 * Educational permission payloads for the hybrid custody pattern.
 *
 * Blueprint thesis: MPC (or lab) public key on `active`; weighted cold
 * multisig on `owner`; optional `agent` permission scoped with linkauth.
 *
 * These helpers build *shapes* an agent or developer can inspect. They do
 * not pack a transaction, do not call WharfKit Session.transact, and do not
 * broadcast. Authority key ordering still belongs to WharfKit Authority.sort()
 * before any real updateauth is signed.
 */

export type KeyWeight = { key: string; weight: number };
export type AccountWeight = { permission: { actor: string; permission: string }; weight: number };
export type WaitWeight = { wait_sec: number; weight: number };

export interface AuthorityShape {
  threshold: number;
  keys: KeyWeight[];
  accounts: AccountWeight[];
  waits: WaitWeight[];
}

export interface UpdateAuthShape {
  account: string;
  permission: string;
  parent: string;
  auth: AuthorityShape;
  /** Always false in this course — no packed tx, no broadcast. */
  executed: false;
}

export interface LinkAuthShape {
  account: string;
  code: string;
  type: string;
  requirement: string;
  executed: false;
}

/** Single-key active authority — the slot an MPC PUB_K1_/PUB_R1_ would fill. */
export function activeMpcAuthority(pubKey: string): AuthorityShape {
  if (!pubKey.startsWith("PUB_K1_") && !pubKey.startsWith("PUB_R1_")) {
    throw new Error("active MPC key must be PUB_K1_ or PUB_R1_");
  }
  return {
    threshold: 1,
    keys: [{ key: pubKey, weight: 1 }],
    accounts: [],
    waits: [],
  };
}

/** 2-of-3 cold owner from three hardware/Anchor keys. */
export function coldOwnerAuthority(keys: [string, string, string]): AuthorityShape {
  for (const key of keys) {
    if (!key.startsWith("PUB_K1_") && !key.startsWith("PUB_R1_")) {
      throw new Error("owner keys must be PUB_K1_ or PUB_R1_");
    }
  }
  return {
    threshold: 2,
    keys: keys.map((key) => ({ key, weight: 1 })),
    accounts: [],
    waits: [],
  };
}

export function updateAuthPayload(
  account: string,
  permission: string,
  parent: string,
  auth: AuthorityShape,
): UpdateAuthShape {
  if (!/^[a-z1-5.]{1,12}$/.test(account)) throw new Error("invalid account");
  if (auth.threshold < 1) throw new Error("threshold must be >= 1");
  const weightSum =
    auth.keys.reduce((n, k) => n + k.weight, 0) +
    auth.accounts.reduce((n, a) => n + a.weight, 0) +
    auth.waits.reduce((n, w) => n + w.weight, 0);
  if (weightSum < auth.threshold) throw new Error("weights cannot meet threshold");
  return {
    account,
    permission,
    parent,
    auth,
    executed: false,
  };
}

/** Cap a custom permission to one contract action (blast-radius control). */
export function linkAuthPayload(
  account: string,
  code: string,
  type: string,
  requirement: string,
): LinkAuthShape {
  if (!/^[a-z1-5.]{1,12}$/.test(account)) throw new Error("invalid account");
  return {
    account,
    code,
    type,
    requirement,
    executed: false,
  };
}

/**
 * Recommended hybrid layout for documentation and agent planning.
 * Not a live chain state.
 */
export function hybridCustodyPlan(account: string, mpcPub: string, ownerKeys: [string, string, string]) {
  return {
    account,
    owner: updateAuthPayload(account, "owner", "", coldOwnerAuthority(ownerKeys)),
    active: updateAuthPayload(account, "active", "owner", activeMpcAuthority(mpcPub)),
    agentLink: linkAuthPayload(account, "eosio.token", "transfer", "agent"),
    note: "executed is always false. Sort keys with WharfKit Authority.sort() before any real updateauth.",
  };
}
