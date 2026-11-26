# What a developer or an agent can use today

This repository does not broadcast. The lab signer produces a recoverable SIG_K1_ on a lab chain. It is not a threshold share.

## For an agent (right now)

```ts
import { runStrategyTool, listNetworks, listStrategiesTool } from "./mcp.js";
import { createPolicy } from "./policy.js";
import { CHAINS } from "./digest.js";
import { parseSignature, VECTOR_JUNGLE_SIG_K1 } from "./codec.js";
import { PresignQueue, componentBytes } from "./presign.js";
import { hybridCustodyPlan } from "./permissions.js";
import { recommendCurve } from "./curve.js";

runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));
listStrategiesTool({ expect: "allow" }); // four default lab allows

// Operator-only: more testnets (never mainnet)
createPolicy({ extraLabChainIds: [CHAINS.telosTestnet] });

parseSignature(VECTOR_JUNGLE_SIG_K1); // 65-byte body + recid
recommendCurve(); // "R1"
```

| Surface | Module |
| --- | --- |
| MCP-shaped tools | `mcp.ts` |
| Strategies / playbooks | `strategies.ts` · `playbooks.ts` |
| Policy (+ optional extra testnets) | `policy.ts` |
| PUB_/SIG_ codec | `codec.ts` |
| Presign queue | `presign.ts` |
| Hybrid permission shapes | `permissions.ts` |
| Curve preference | `curve.ts` |
| WalletPlugin stub | `walletPlugin.ts` |
| Lab sign after allow | `labsign.ts` |

## Still out of scope

Real threshold WASM, live plugin co-sign, mainnet in the default gate, `sign_digest` tools.

Run `npm test`.
