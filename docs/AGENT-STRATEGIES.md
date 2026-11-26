# Agent strategies on Antelope

An agent proposes a narrow action, a non-model gate decides, and only then may a signature be produced. The network sees one 65-byte value, not the roster.

Callable catalog: [src/strategies.ts](../src/strategies.ts) · MCP: [src/mcp.ts](../src/mcp.ts).

```ts
import { runStrategyTool, listStrategiesTool, simulateProposal, broadcastStatus } from "../src/mcp.js";

listStrategiesTool({ expect: "allow" });
runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));
```

## Three share roles

| Share | Where it lives | Alone |
| --- | --- | --- |
| User / browser | Local, passkey/passphrase | Cannot pay |
| Policy co-signer | Server that decodes tx + runs gate | Cannot pay |
| Agent / recovery | Offline file or `linkauth`-scoped key | Cannot pay |

2-of-3: any two can sign. Compromised agent → `updateauth` on the agent permission; balances stay on the account name.

## MCP tools in this course (9)

None hold a threshold share. None broadcast.

| Tool | Role |
| --- | --- |
| `list_networks` | Playbooks + lab/broadcast flags |
| `list_strategies` | Catalog filters |
| `inspect_playbook` | Per-chain actions |
| `propose_transfer` | Gate only |
| `run_strategy` | Gate + optional lab SIG |
| `check_status` | Audit / kill / lab set |
| `lab_sign_allowed` | Throwaway lab SIG (not production MCP) |
| `simulate_proposal` | Local dry-run (not nodeos) |
| `broadcast_status` | Mainnet lock + course never sends |

Lab RPC **shapes** for a later client: [src/rpc.ts](../src/rpc.ts) (`compute_transaction` builder only; `push_transaction` always throws).

## Per-chain opportunities

| Network | Callable today |
| --- | --- |
| WAX Testnet | `wax-testnet-tip`, `treasury-tip` |
| Jungle 4 | `jungle-tip`, `peer-tip` |
| Telos / XPR testnets | Via `runStrategyTool(..., { extraLabChainIds })` |
| Mainnets | Always refuse |
| AtomicAssets / system / DEX | Catalogued refusals |

Full tables: [CHAIN-OPPORTUNITIES.md](CHAIN-OPPORTUNITIES.md).

## Cross-chain

Secp256k1 shares do not invent Ethereum or Taproot formats. This course locks Antelope digests and K1 canonicality only. Chain id stays inside the signing digest — do not strip it.

## Must not

- Trust a foreign digest · seed nonces from chain entropy · hold the only share · skip the gate · call `updateauth`/`setcode` from the agent path · push transactions from this tree

See [AGENTIC-PAYMENTS.md](AGENTIC-PAYMENTS.md) · [AGENT-RECIPE.md](AGENT-RECIPE.md) · [GAP-AUDIT.md](GAP-AUDIT.md).
