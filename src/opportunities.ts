import { CHAINS } from "./digest.js";

/**
 * Per-chain opportunities an agent can look up.
 * This catalog does not open a socket and does not widen the policy gate.
 * Rows with callableToday: false are descriptions, not permissions.
 */

export interface Opportunity {
  id: string;
  chainId: string;
  network: string;
  contract: string;
  action: string;
  /** True only when a named strategy already allows this on the default gate. */
  callableToday: boolean;
  scope: "shared" | "wax-only" | "chain-specific";
  note: string;
}

export const OPPORTUNITIES: readonly Opportunity[] = [
  {
    id: "wax-transfer",
    chainId: CHAINS.waxTestnet,
    network: "WAX Testnet",
    contract: "eosio.token",
    action: "transfer",
    callableToday: true,
    scope: "shared",
    note: "Default allow via wax-testnet-tip or treasury-tip.",
  },
  {
    id: "jungle-transfer",
    chainId: CHAINS.jungle4,
    network: "Jungle 4",
    contract: "eosio.token",
    action: "transfer",
    callableToday: true,
    scope: "shared",
    note: "Default allow via jungle-tip or peer-tip. Paid in A.",
  },
  {
    id: "atomicassets-transfer",
    chainId: CHAINS.waxTestnet,
    network: "WAX Testnet",
    contract: "atomicassets",
    action: "transfer",
    callableToday: false,
    scope: "wax-only",
    note: "NFT moves need their own allow-list row. Refused today.",
  },
  {
    id: "orng-wax",
    chainId: CHAINS.waxMainnet,
    network: "WAX",
    contract: "orng.wax",
    action: "requestrand",
    callableToday: false,
    scope: "wax-only",
    note: "Public game randomness on WAX. Never an MPC nonce. Not on other Antelope chains.",
  },
  {
    id: "alcor-swap",
    chainId: CHAINS.waxMainnet,
    network: "WAX",
    contract: "alcor",
    action: "swap",
    callableToday: false,
    scope: "chain-specific",
    note: "DEX and bridge shapes stay out of the default gate. A later lab can allow-list a specific contract.",
  },
  {
    id: "msig-propose",
    chainId: CHAINS.jungle4,
    network: "Jungle 4",
    contract: "eosio.msig",
    action: "propose",
    callableToday: false,
    scope: "shared",
    note: "On-chain multisig is a different lab. MPC does not replace eosio.msig.",
  },
  {
    id: "buyram",
    chainId: CHAINS.jungle4,
    network: "Jungle 4",
    contract: "eosio",
    action: "buyram",
    callableToday: false,
    scope: "shared",
    note: "Resource buys stay with a human.",
  },
];

export function opportunitiesFor(chainId: string): Opportunity[] {
  return OPPORTUNITIES.filter((row) => row.chainId === chainId);
}

export function callableToday(): Opportunity[] {
  return OPPORTUNITIES.filter((row) => row.callableToday);
}

export function waxOnly(): Opportunity[] {
  return OPPORTUNITIES.filter((row) => row.scope === "wax-only");
}
