import { CHAINS } from "./digest.js";

/**
 * A catalog an agent can import.
 * It describes networks and the actions worth proposing.
 * It does not open a socket, does not sign, and does not widen the policy gate.
 */

export interface PlaybookAction {
  contract: string;
  action: string;
  /** Why an agent would want this, in one sentence. */
  why: string;
  /** True only when src/policy.ts will accept it on a lab chain today. */
  allowedByDefaultGate: boolean;
}

export interface NetworkPlaybook {
  name: string;
  chainId: string;
  symbol: string;
  kind: "lab" | "mainnet" | "other-testnet";
  actions: PlaybookAction[];
}

const transfer = (why: string, allowed: boolean): PlaybookAction => ({
  contract: "eosio.token",
  action: "transfer",
  why,
  allowedByDefaultGate: allowed,
});

export const PLAYBOOKS: readonly NetworkPlaybook[] = [
  {
    name: "WAX Testnet",
    chainId: CHAINS.waxTestnet,
    symbol: "WAX",
    kind: "lab",
    actions: [
      transfer("Practice a capped tip to a known alias.", true),
      {
        contract: "atomicassets",
        action: "transfer",
        why: "Move an NFT only after the gate has an allow-list row for this action. It does not today.",
        allowedByDefaultGate: false,
      },
    ],
  },
  {
    name: "Jungle 4",
    chainId: CHAINS.jungle4,
    symbol: "A",
    kind: "lab",
    actions: [transfer("Same proposal shape as WAX Testnet. The published digest vector is from this chain.", true)],
  },
  {
    name: "WAX",
    chainId: CHAINS.waxMainnet,
    symbol: "WAX",
    kind: "mainnet",
    actions: [
      transfer("Pay or tip on mainnet only after an operator adds this chain id.", false),
      {
        contract: "atomicassets",
        action: "transfer",
        why: "NFT moves on WAX. Still refused until the contract is allow-listed.",
        allowedByDefaultGate: false,
      },
    ],
  },
  {
    name: "Vaulta",
    chainId: CHAINS.vaulta,
    symbol: "A",
    kind: "mainnet",
    actions: [
      transfer("Move the system token. Same chain id as EOS.", false),
      {
        contract: "eosio",
        action: "buyram",
        why: "RAM and REX change account resources. Keep them behind a human approval.",
        allowedByDefaultGate: false,
      },
    ],
  },
  {
    name: "Telos",
    chainId: CHAINS.telos,
    symbol: "TLOS",
    kind: "mainnet",
    actions: [transfer("Move TLOS after the gate allows this chain id.", false)],
  },
];

export function playbookByChainId(chainId: string): NetworkPlaybook | undefined {
  return PLAYBOOKS.find((entry) => entry.chainId === chainId);
}
