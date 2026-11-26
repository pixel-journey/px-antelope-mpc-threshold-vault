# Agent strategies on Antelope

An agent proposes a narrow action, a non-model gate decides, and only then may a signature be produced. The network sees one 65-byte value, not the roster.

Callable catalog: [src/strategies.ts](../src/strategies.ts) · MCP: [src/mcp.ts](../src/mcp.ts).

```ts
import {
  runStrategyTool,
  listStrategiesTool,
  listEnginesTool,
  simulateProposal,
  broadcastStatus,
} from "../src/mcp.js";

listStrategiesTool({ expect: "allow" });
listEnginesTool(); // educational-mock only
runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));
```

## Three share roles

| Share | Where it lives | Alone |
| --- | --- | --- |
| User / browser | Local, passkey/passphrase | Cannot pay |
| Policy co-signer | Server that decodes tx + runs gate | Cannot pay |
| Agent / recovery | Offline file or `linkauth`-scoped key | Cannot pay |

2-of-3: any two can sign. Compromised agent → `updateauth` on the agent permission; balances stay on the account name. This course does **not** hold those shares.

## MCP tools in this course (10)

None hold a threshold share. None fire `push_transaction`.

| Tool | Role |
| --- | --- |
| `list_networks` | Playbooks + lab/broadcast flags |
| `list_strategies` | Catalog filters |
| `inspect_playbook` | Per-chain actions |
| `propose_transfer` | Gate only |
| `run_strategy` | Gate + optional lab SIG |
| `check_status` | Audit / kill / lab set / engines |
| `lab_sign_allowed` | Throwaway lab SIG (proposal id) |
| `simulate_proposal` | Offline fixtures (not live nodeos) |
| `broadcast_status` | Testnet candidate vs mainnet lock |
| `list_engines` | Mock available; R.2 named only |

Lab HTTP is **not** an MCP tool. Operators use `labClient.ts` (`get_info`, gated `push_transaction`). Builders in `rpc.ts` can form URLs without sending.

## Per-chain opportunities

| Network | Callable today |
| --- | --- |
| WAX Testnet | `wax-testnet-tip`, `treasury-tip`, `peer-tip` |
| Jungle 4 | `jungle-tip` |
| Telos / XPR testnets | Via `runStrategyTool(..., { extraLabChainIds })` |
| Mainnets | Always refuse |
| AtomicAssets / system / DEX | Catalogued refusals |

Full tables: [CHAIN-OPPORTUNITIES.md](CHAIN-OPPORTUNITIES.md).

## Cross-chain

Secp256k1 shares do not invent Ethereum or Taproot formats. This course locks Antelope digests and K1 canonicality only. Chain id stays inside the signing digest — do not strip it. Bridges are out of the default gate.

## Must not

- Trust a foreign digest · seed nonces from chain entropy · hold the only share · skip the gate · call `updateauth`/`setcode` from the agent path · set push readiness flags · treat lab `SIG_K1_` as a node signature

See [AGENTIC-PAYMENTS.md](AGENTIC-PAYMENTS.md) · [AGENT-RECIPE.md](AGENT-RECIPE.md) · [GAP-AUDIT.md](GAP-AUDIT.md).
