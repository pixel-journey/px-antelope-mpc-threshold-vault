import { CHAINS, LAB_CHAIN_IDS } from "./digest.js";

/**
 * A policy gate that sits outside any model.
 * It does not hold a key, does not sign, and does not talk to a node.
 * "Model proposes, policy decides" is the whole job of this file.
 */

const BLOCKED_ACTIONS = new Set([
  "updateauth",
  "deleteauth",
  "linkauth",
  "unlinkauth",
  "setcode",
  "setabi",
]);

const ALIASES: Record<string, string> = {
  "px-treasury": "treasury.pxj",
  "wax-faucet": "faucet.wax",
  "test-peer": "testpeer.pxj",
};

const MAX_UNITS = 100_000n; // 10.0000 WAX
const MAX_MEMO = 64;
const MAX_TTL_SEC = 120;

export interface Proposal {
  chainId: string;
  contract: string;
  action: string;
  alias: string;
  /** Integer smallest units. 10.0000 WAX is 100000. */
  amountUnits: bigint;
  symbol: string;
  memo: string;
  nowSec: number;
  expiresAtSec: number;
}

export interface Decision {
  ok: boolean;
  reason: string;
  account: string | null;
}

export interface Policy {
  killed: boolean;
  audit: string[];
  kill(reason: string): void;
  propose(input: Proposal): Decision;
}

export function createPolicy(): Policy {
  const audit: string[] = [];
  const policy: Policy = {
    killed: false,
    audit,
    kill(reason: string) {
      policy.killed = true;
      audit.push(`kill: ${reason}`);
    },
    propose(input: Proposal): Decision {
      const refuse = (reason: string): Decision => {
        audit.push(`refuse: ${reason}`);
        return { ok: false, reason, account: null };
      };
      if (policy.killed) return refuse("policy is killed");
      if (!LAB_CHAIN_IDS.includes(input.chainId as (typeof LAB_CHAIN_IDS)[number])) {
        return refuse("chain is not a lab testnet");
      }
      if (input.chainId === CHAINS.waxMainnet || input.chainId === CHAINS.vaulta) {
        return refuse("mainnet is refused");
      }
      if (BLOCKED_ACTIONS.has(input.action)) {
        return refuse(`action ${input.action} is not a model tool`);
      }
      if (input.contract !== "eosio.token" || input.action !== "transfer") {
        return refuse("only eosio.token::transfer is in the allowlist");
      }
      const account = ALIASES[input.alias];
      if (!account) return refuse("recipient alias is unknown");
      const expectedSymbol = input.chainId === CHAINS.jungle4 ? "A" : "WAX";
      if (input.symbol !== expectedSymbol) {
        return refuse(`symbol must be ${expectedSymbol} on this chain`);
      }
      if (input.amountUnits <= 0n || input.amountUnits > MAX_UNITS) {
        return refuse("amount is outside 1..10.0000 of the chain token");
      }
      if (input.memo.length > MAX_MEMO) return refuse("memo is longer than 64 characters");
      if (![...input.memo].every((ch) => ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) <= 126)) {
        return refuse("memo is not printable ASCII");
      }
      if (/\b[a-z1-5.]{1,12}\b/.test(input.memo) && input.memo.includes(".")) {
        return refuse("memo must not carry an account name");
      }
      const ttl = input.expiresAtSec - input.nowSec;
      if (ttl <= 0 || ttl > MAX_TTL_SEC) return refuse("expiration is outside 120 seconds");
      audit.push(`allow: ${input.alias} ${input.amountUnits.toString()} ${input.symbol}`);
      return { ok: true, reason: "within the testnet cap", account };
    },
  };
  return policy;
}
