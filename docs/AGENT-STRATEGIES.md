# Agent strategies on Antelope

An agent that can act on Antelope is an agent that can propose a narrow action, have that proposal checked by something that is not the model, and then obtain a signature that the network will accept. The signature is one 65-byte value. The network does not see how many parties helped produce it.

The callable catalog is [src/strategies.ts](../src/strategies.ts). `runStrategy("wax-testnet-tip", from, now)` is one of four allows today. The other ids are refusals the agent can list and learn from. See [STRATEGIES.md](STRATEGIES.md).

```ts
import { listStrategyIds, runStrategy, strategiesByTag } from "../src/strategies.js";
import { defaultGateActions, PLAYBOOKS } from "../src/playbooks.js";

listStrategyIds();
strategiesByTag("lab");
defaultGateActions();
```

## Three share roles

| Share | Where it lives | What it can do alone |
| --- | --- | --- |
| User / browser | Encrypted local storage, unlocked by a passkey or passphrase | Nothing. Needs a second share. |
| Policy co-signer | Server process that decodes the transaction and runs the gate | Nothing. Needs a second share. |
| Agent / recovery | Offline file for a human, or a `linkauth`-scoped key for an agent | Nothing. Needs a second share. |

A 2-of-3 means any two of those can produce a signature. The agent never holds the only share. If the agent is compromised, the owner rotates the `agent` permission with one `updateauth`. The tokens and NFTs stay on the account name.

## Four tools an agent is allowed to call

These are the only tools the blueprint's MCP server exposes. None of them hold a key or sign.

1. **Inspect** — Read an account's permissions, `linkauth` bindings, and CPU/NET/RAM. No write.
2. **Decode and simulate** — Unpack an action and ask a node what the balance deltas would be. No write.
3. **Propose a transfer** — Send a chain id, a recipient alias, an amount, and a short memo. The policy gate resolves the alias. Free-typed account names are refused. Named moves: `runStrategy`.
4. **Check status** — Ask whether the gate auto-approved the proposal or escalated it to a human.

`src/policy.ts` is the local stand-in for tool 3. The lab signer in `src/labsign.ts` is a fifth, local step: it signs after an allow, with a throwaway key, and it is not one of these four tools. Do not expose it as an MCP tool that accepts a digest.

## Per-chain opportunities (summary)

| Network | Token | Callable strategy today |
| --- | --- | --- |
| WAX Testnet | WAX | `wax-testnet-tip`, `treasury-tip` |
| Jungle 4 | A | `jungle-tip`, `peer-tip` |
| WAX / Vaulta / Telos / XPR / UX mainnets | varies | Catalogued as `*-tip` refusals until an operator opens the chain |
| Other testnets (Telos, XPR) | varies | Catalogued refusals (`telos-testnet-tip`, `xpr-testnet-tip`) |
| AtomicAssets / system / DEX shapes | — | In playbooks + strategy catalog; all refused by default |

Full tables: [CHAIN-OPPORTUNITIES.md](CHAIN-OPPORTUNITIES.md). Machine-readable: [src/playbooks.ts](../src/playbooks.ts).

## Cross-chain

An agent that holds a secp256k1 share can, in principle, produce a signature for any chain that accepts secp256k1. Antelope, Ethereum, and Bitcoin Taproot (via FROST, not ECDSA) are different signature formats and different digest rules. This course locks the Antelope digest and the K1 canonical check. It does not produce an Ethereum transaction or a Bitcoin signature.

Lab tips on different chains do not share a proposal id. A real signing digest would differ too, because the chain id is inside `SHA-256(chain_id || packed_transaction || cfd_hash)`. Do not strip it.

## What the agent must not do

- Trust a digest that someone else hashed. Pack the transaction and hash it.
- Use a transaction id, a block id, or `orng.wax` as a nonce.
- Hold the only share.
- Skip the gate because the model "sounds sure."
- Call `updateauth`, `setcode`, or `deleteauth` from the agent permission.

See [AGENTIC-PAYMENTS.md](AGENTIC-PAYMENTS.md) for the payment loop and [NETWORKS.md](NETWORKS.md) for the chain ids.
