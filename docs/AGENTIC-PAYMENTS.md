# Agentic payments on Antelope

An agent that can pay proposes a transfer, has that proposal checked by something that is **not** the model, and may then obtain a signature the network accepts.

On Antelope the signature is one 65-byte ECDSA value. The network does not see the roster. Threshold schemes help because the agent can hold one share, a policy service another, and a human the third.

## The loop in this course

1. Agent picks a strategy or builds a proposal (chain id, `eosio.token::transfer`, alias, amount, memo, TTL).
2. `policy.ts` / `runStrategy` decides. Mainnets refused. Cap, memo, and blocked actions enforced.
3. On allow: handoff record + optional **lab** `SIG_K1_` (not a node-accepted packed-tx digest).
4. **Not implemented here:** real co-signer ceremony, `compute_transaction`, `push_transaction`.

Callable today: [TODAY.md](TODAY.md) · [STRATEGIES.md](STRATEGIES.md) · [MCP-TOOLS.md](MCP-TOOLS.md).

Broadcast is locked: [src/broadcast.ts](../src/broadcast.ts) — mainnets never; even candidate testnets hit `refuseBroadcast`.

---

## What MPC alone does **not** solve

MPC only changes **how a key is held**. It does not by itself provide:

| Gap | Still needed |
| --- | --- |
| Spend caps / schedules | Policy engine (this course’s gate is the teaching form) |
| Blast-radius limits | `linkauth` to one contract::action |
| Address-preserving rotation | `updateauth` on the **name** (Antelope-native) |
| Fee / resource abstraction | CPU/NET staking, resource providers |
| Human kill switch | Cold `owner` + `kill()` / offline revocation tx |
| HTTP machine-payment semantics | Application layer (x402 / session channels) |

On EVM, an MPC wallet is still an EOA unless paired with account-abstraction (ERC-4337 / EIP-7702) and paymasters. Antelope already separates **account name** from **key material**.

## Why Antelope is a strong agent rail

1. **Address-preserving key rotation** — `eosio::updateauth` swaps a compromised active/MPC key without moving tokens or NFTs off the 12-character name.
2. **On-chain blast radius** — `eosio::linkauth` can bind `account@agent` to `eosio.token::transfer` only, blocking `updateauth` / `setcode` from that permission.
3. **Native multisig still available** — `eosio.msig` for slow public treasury paths beside private threshold hot paths.
4. **Session keys** — short-lived linked permissions for high-frequency low-value actions (see related WharfKit session-keys course). Not a threshold share.

Shapes: [PERMISSIONS.md](PERMISSIONS.md) · `hybridCustodyPlan` in `src/permissions.ts`.

---

## Machine payments: discrete vs continuous

Two patterns dominate late-2026 agent payment design discussions:

| Pattern | Idea | Fit |
| --- | --- | --- |
| **HTTP payment challenges** (e.g. x402-style `402` + payment headers) | One resource, one settlement or escrow leg | Discrete API calls, fixed or “up to” caps |
| **Session / channel style** | Authorize a ceiling once, stream off-chain, settle net | Continuous workloads where every sub-cent on-chain receipt is wasteful |

This course does **not** implement an x402 facilitator or a channel server. It teaches the Antelope side that those apps still need:

- a policy gate before co-sign
- chain-id-bound digests
- linked agent permissions
- no blind `sign_digest`

A local mock facilitator is backlog (Phase A in [GAP-AUDIT.md](GAP-AUDIT.md)), not a claim that this repo speaks HTTP 402 today.

**Industry volume figures** circulating in secondary writeups should be verified against primary sources before you cite them in a paper or pitch. This file intentionally does not pin contested transaction counts.

---

## KYA, structured denial, escrow

| Concern | Course posture |
| --- | --- |
| **Know Your Agent** | Bind agent identity to an Antelope `account@permission` and a human-owned policy config; do not let the model edit caps |
| **Structured denial** | Gate returns `reason` strings agents can branch on (`strategies` refusals are the catalog) |
| **Kill switch** | `policy.kill()` in-memory; production needs cold-owner `updateauth` / `unlinkauth` ready offline |
| **No chargebacks** | Prefer escrow or staged release for irreversible API work — see Pixel Journey [wax-escrowed-merch-custody-timeline](https://github.com/pixel-journey/wax-escrowed-merch-custody-timeline) for the custody mental model |

---

## What the agent must not do

- Trust a digest someone else hashed
- Use a tx id / block id / `orng.wax` as a signing nonce
- Hold the only share
- Call `updateauth` / `setcode` from the agent path
- Skip the gate because the model sounds sure
- Broadcast from this educational tree

## Across networks

Same proposal shape on WAX, Jungle 4, Telos, XPR, Vaulta, UX. Default gate: two labs. Operator: `extraLabChainIds` for more **testnets** only. See [NETWORKS.md](NETWORKS.md).
