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
  tags?: readonly string[];
}

export interface NetworkPlaybook {
  name: string;
  chainId: string;
  symbol: string;
  kind: "lab" | "mainnet" | "other-testnet";
  actions: PlaybookAction[];
}

const transfer = (why: string, allowed: boolean, tags: readonly string[] = ["transfer"]): PlaybookAction => ({
  contract: "eosio.token",
  action: "transfer",
  why,
  allowedByDefaultGate: allowed,
  tags,
});

const aa = (action: string, why: string): PlaybookAction => ({
  contract: "atomicassets",
  action,
  why,
  allowedByDefaultGate: false,
  tags: ["nft", "atomicassets"],
});

const system = (action: string, why: string): PlaybookAction => ({
  contract: "eosio",
  action,
  why,
  allowedByDefaultGate: false,
  tags: ["system", "resources"],
});

export const PLAYBOOKS: readonly NetworkPlaybook[] = [
  {
    name: "WAX Testnet",
    chainId: CHAINS.waxTestnet,
    symbol: "WAX",
    kind: "lab",
    actions: [
      transfer("Practice a capped tip to a known alias.", true, ["transfer", "tip", "lab"]),
      aa("transfer", "Move an NFT only after the gate has an allow-list row for this action. It does not today."),
      aa("mintasset", "Mint only with a dedicated mint policy. Default gate refuses."),
      aa("burnasset", "Burns are irreversible. Default gate refuses."),
      system("delegatebw", "Stake CPU/NET. Human or tight resource policy only."),
      system("buyram", "RAM buys change the account footprint."),
    ],
  },
  {
    name: "Jungle 4",
    chainId: CHAINS.jungle4,
    symbol: "A",
    kind: "lab",
    actions: [
      transfer(
        "Same proposal shape as WAX Testnet, paid in A. The published digest vector is from this chain.",
        true,
        ["transfer", "tip", "lab"],
      ),
      system("buyram", "Resource buy on the Vaulta/EOS testnet. Refused by default."),
      system("setcode", "Contract deploy is blocked by name in the policy gate."),
    ],
  },
  {
    name: "WAX",
    chainId: CHAINS.waxMainnet,
    symbol: "WAX",
    kind: "mainnet",
    actions: [
      transfer("Pay or tip on mainnet only after an operator adds this chain id.", false, ["transfer", "tip", "mainnet"]),
      aa("transfer", "NFT moves on WAX. Still refused until the contract is allow-listed."),
      aa("mintasset", "Mainnet mint. Operator + human approval."),
      {
        contract: "alcor.dex",
        action: "swapexactin",
        why: "DEX swap shape — educational only. Gate does not allow Alcor actions today.",
        allowedByDefaultGate: false,
        tags: ["dex", "alcor"],
      },
      system("delegatebw", "Stake on mainnet. Keep behind a human."),
    ],
  },
  {
    name: "Vaulta",
    chainId: CHAINS.vaulta,
    symbol: "A",
    kind: "mainnet",
    actions: [
      transfer("Move the system token. Same chain id as EOS.", false, ["transfer", "mainnet"]),
      system("buyram", "RAM and REX change account resources. Keep them behind a human approval."),
      system("delegatebw", "Stake CPU/NET on Vaulta."),
      {
        contract: "eosio.msig",
        action: "propose",
        why: "Native multisig proposal — complementary to MPC, not replaced by it.",
        allowedByDefaultGate: false,
        tags: ["msig", "governance"],
      },
    ],
  },
  {
    name: "Telos",
    chainId: CHAINS.telos,
    symbol: "TLOS",
    kind: "mainnet",
    actions: [
      transfer("Move TLOS after the gate allows this chain id.", false, ["transfer", "mainnet"]),
      system("delegatebw", "Stake on Telos after an operator opens the chain."),
    ],
  },
  {
    name: "Telos Testnet",
    chainId: CHAINS.telosTestnet,
    symbol: "TLOS",
    kind: "other-testnet",
    actions: [transfer("Practice a TLOS transfer once this chain id is added to the gate.", false, ["transfer", "testnet"])],
  },
  {
    name: "XPR Network",
    chainId: CHAINS.xpr,
    symbol: "XPR",
    kind: "mainnet",
    actions: [
      transfer("Move XPR after the gate allows this chain id. Same id as Proton.", false, ["transfer", "mainnet"]),
      {
        contract: "eosio.token",
        action: "transfer",
        why: "XPR often pairs with Metal X / fiat rails — still a normal transfer at the gate layer.",
        allowedByDefaultGate: false,
        tags: ["transfer", "payments"],
      },
    ],
  },
  {
    name: "XPR Testnet",
    chainId: CHAINS.xprTestnet,
    symbol: "XPR",
    kind: "other-testnet",
    actions: [transfer("Practice an XPR transfer once this chain id is added to the gate.", false, ["transfer", "testnet"])],
  },
  {
    name: "UX",
    chainId: CHAINS.ux,
    symbol: "UX",
    kind: "mainnet",
    actions: [transfer("Move UX after the gate allows this chain id.", false, ["transfer", "mainnet"])],
  },
];

export function playbookByChainId(chainId: string): NetworkPlaybook | undefined {
  return PLAYBOOKS.find((entry) => entry.chainId === chainId);
}

export function playbooksByKind(kind: NetworkPlaybook["kind"]): NetworkPlaybook[] {
  return PLAYBOOKS.filter((entry) => entry.kind === kind);
}

/** Actions across all playbooks that the default gate would accept on a lab chain. */
export function defaultGateActions(): { network: string; action: PlaybookAction }[] {
  const out: { network: string; action: PlaybookAction }[] = [];
  for (const book of PLAYBOOKS) {
    for (const action of book.actions) {
      if (action.allowedByDefaultGate) out.push({ network: book.name, action });
    }
  }
  return out;
}
