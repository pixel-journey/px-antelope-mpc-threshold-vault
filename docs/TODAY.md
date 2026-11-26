# What a developer or an agent can use today

No broadcast. No threshold share. Lab `SIG_K1_` is over a proposal id only.

## Integrated agent path

```ts
import {
  listStrategiesTool,
  runStrategyTool,
  simulateProposal,
  broadcastStatus,
  checkStatus,
} from "./mcp.js";
import { CHAINS } from "./digest.js";

listStrategiesTool({ expect: "allow" });
const tip = runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));
// simulate with the same proposal/decision fields the strategy used internally as needed
broadcastStatus(CHAINS.waxMainnet); // ok: false
checkStatus(); // broadcasts: false

runStrategyTool("telos-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000), {
  extraLabChainIds: [CHAINS.telosTestnet],
});
```

| Surface | Module |
| --- | --- |
| MCP tools (9) | `mcp.ts` |
| Strategies + opt-in | `strategies.ts` |
| Policy | `policy.ts` |
| Lab sign | `labsign.ts` |
| Local simulate | `simulate.ts` |
| Broadcast lock | `broadcast.ts` |
| PUB_/SIG_ codec | `codec.ts` |
| Presign queue | `presign.ts` |
| Permissions shapes | `permissions.ts` |
| Curve preference | `curve.ts` |
| WalletPlugin stub | `walletPlugin.ts` |

## Skills

- `skills/antelope-agent-propose`
- `skills/antelope-agentic-payments`
- `skills/antelope-mpc-sig-format`
- `skills/mpc-security-audit`
- `skills/antelope-network-scope`

## Docs map

[GAP-AUDIT.md](GAP-AUDIT.md) · [AGENT-RECIPE.md](AGENT-RECIPE.md) · [AGENTIC-PAYMENTS.md](AGENTIC-PAYMENTS.md) · [MCP-TOOLS.md](MCP-TOOLS.md)

Run `npm test`.
