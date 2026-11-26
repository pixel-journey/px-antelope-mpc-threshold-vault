# What a developer or an agent can use today

No broadcast. No threshold share. Lab `SIG_K1_` is over a proposal id only.

## Integrated agent path

```ts
import {
  listStrategiesTool,
  runStrategyTool,
  broadcastStatus,
  checkStatus,
} from "./mcp.js";
import { listLabRpcSummary, buildPushTransactionRequest } from "./rpc.js";
import { CHAINS } from "./digest.js";

listStrategiesTool({ expect: "allow" });
runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));
broadcastStatus(CHAINS.waxMainnet); // locked
listLabRpcSummary(); // compute_transaction shapes; push always throws
```

| Surface | Module |
| --- | --- |
| MCP tools (9) | `mcp.ts` |
| Strategies + opt-in | `strategies.ts` |
| Policy | `policy.ts` |
| Lab sign | `labsign.ts` |
| Local simulate | `simulate.ts` |
| Broadcast lock | `broadcast.ts` |
| Lab RPC catalog | `rpc.ts` |
| PUB_/SIG_ codec | `codec.ts` |
| Presign queue | `presign.ts` |
| Permissions shapes | `permissions.ts` |
| Curve preference | `curve.ts` |
| WalletPlugin stub | `walletPlugin.ts` |

## Skills

`antelope-agent-propose` · `antelope-agentic-payments` · `antelope-mpc-sig-format` · `mpc-security-audit` · `antelope-network-scope`

## Docs

[GAP-AUDIT.md](GAP-AUDIT.md) · [AGENT-RECIPE.md](AGENT-RECIPE.md) · [RPC.md](RPC.md) · [AGENTIC-PAYMENTS.md](AGENTIC-PAYMENTS.md)

Run `npm test`.
