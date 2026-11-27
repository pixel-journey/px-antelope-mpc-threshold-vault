# What a developer or an agent can use today

No mainnet. No threshold WASM `sign`. Lab `SIG_K1_` is over a **proposal id**, not a node-accepted packed transaction. HTTP is **off** until `enableNetwork: true`.

```bash
npm test && npm run check-skills
cargo test -p antelope-crypto-format   # optional R.1
```

## Integrated agent path

```ts
import {
  listStrategiesTool,
  runStrategyTool,
  simulateProposal,
  broadcastStatus,
  listEnginesTool,
  checkStatus,
} from "./mcp.js";
import { adviseNext } from "./next.js";
import { compareDomains } from "./domains.js";
import { CHAINS } from "./digest.js";

listStrategiesTool({ expect: "allow" });
const tip = runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));
adviseNext(tip); // lab-only. not a node signature. do not push.
broadcastStatus(CHAINS.waxMainnet); // locked
```

## After a strategy

- `adviseNext(result)` from `src/next.ts` — stop, handoff, or lab-only. Never push from the model.
- `compareDomains(a, b)` from `src/domains.ts` — two handoffs are not one ceremony when the chain id differs.
- `OPPORTUNITIES` from `src/opportunities.ts` — per-chain rows. Only `callableToday` is a permission. `orng.wax` is WAX-only and is never a nonce.

See [docs/NEXT.md](NEXT.md).

## Surfaces

| Surface | Module |
| --- | --- |
| MCP tools (10) | `mcp.ts` |
| Strategies + opt-in | `strategies.ts` |
| Next-step advice | `next.ts` |
| Cross-chain domains | `domains.ts` |
| Per-chain opportunities | `opportunities.ts` |
| Policy | `policy.ts` |
| Lab sign (proposal id) | `labsign.ts` |
| Offline simulate fixtures | `simulate.ts` |
| Push readiness | `broadcast.ts` |
| Lab RPC builders | `rpc.ts` |
| Opt-in `get_info` / gated push | `labClient.ts` |
| Engine registry (mock) | `threshold.ts` |
| PUB_/SIG_ codec | `codec.ts` |
| Presign queue | `presign.ts` |
| Permissions shapes | `permissions.ts` |
| Curve preference | `curve.ts` |
| WalletPlugin stub | `walletPlugin.ts` |
| Museum cards | `museum.ts` |
| Shared vectors | `testdata/vectors.json` |

## Skills

`antelope-agent-propose` · `antelope-agentic-payments` · `antelope-mpc-sig-format` · `mpc-security-audit` · `antelope-network-scope` · `antelope-next-step`

## Docs map

[GAP-AUDIT](GAP-AUDIT.md) · [COMPLETION](COMPLETION.md) · [AGENT-RECIPE](AGENT-RECIPE.md) · [NEXT](NEXT.md) · [PUSH](PUSH.md) · [MCP-TOOLS](MCP-TOOLS.md) · [ENGINE](ENGINE.md) · [RUST](RUST.md)
