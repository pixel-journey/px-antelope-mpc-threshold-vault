# What a developer or an agent can use today

```bash
npm test && npm run check-skills
```

## Agent path

```ts
import {
  listStrategiesTool,
  runStrategyTool,
  simulateProposal,
  broadcastStatus,
} from "./mcp.js";
import { evaluatePushReadiness } from "./broadcast.js";
import { MUSEUM_CARDS } from "./museum.js";
import { CHAINS } from "./digest.js";

listStrategiesTool({ expect: "allow" });
runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));
broadcastStatus(CHAINS.waxTestnet);
MUSEUM_CARDS.length; // structured CVE cards
evaluatePushReadiness({ /* … */ }); // final stage gates
```

| Surface | Module |
| --- | --- |
| MCP (9 tools) | `mcp.ts` |
| Offline compute fixtures | `simulate.ts` |
| Push readiness | `broadcast.ts` / [PUSH.md](PUSH.md) |
| Lab RPC builders | `rpc.ts` |
| Museum cards + demos | `museum.ts` |
| Strategies / policy / lab sign | `strategies.ts` / `policy.ts` / `labsign.ts` |
| Skills CI | `scripts/check-skills.mjs` |

## Skills

`antelope-agent-propose` · `antelope-agentic-payments` · `antelope-mpc-sig-format` · `mpc-security-audit` · `antelope-network-scope`

[GAP-AUDIT.md](GAP-AUDIT.md) · [AGENT-RECIPE.md](AGENT-RECIPE.md) · [ATTACK-MUSEUM.md](ATTACK-MUSEUM.md)
