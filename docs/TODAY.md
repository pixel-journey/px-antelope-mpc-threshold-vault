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
import { evaluatePushReadiness } from "./broadcast.js";
import { fetchLabChainInfo, pushLabTransaction } from "./labClient.js";
import { CHAINS } from "./digest.js";

listStrategiesTool({ expect: "allow" });
const tip = runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));
broadcastStatus(CHAINS.waxMainnet); // locked
listEnginesTool();
checkStatus();

// operator extra testnet:
runStrategyTool("telos-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000), {
  extraLabChainIds: [CHAINS.telosTestnet],
});
```

## Surfaces

| Surface | Module |
| --- | --- |
| MCP tools (10) | `mcp.ts` |
| Strategies + opt-in | `strategies.ts` |
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

`antelope-agent-propose` · `antelope-agentic-payments` · `antelope-mpc-sig-format` · `mpc-security-audit` · `antelope-network-scope`

## Docs map

[GAP-AUDIT](GAP-AUDIT.md) · [COMPLETION](COMPLETION.md) · [AGENT-RECIPE](AGENT-RECIPE.md) · [PUSH](PUSH.md) · [MCP-TOOLS](MCP-TOOLS.md) · [ENGINE](ENGINE.md) · [RUST](RUST.md)
