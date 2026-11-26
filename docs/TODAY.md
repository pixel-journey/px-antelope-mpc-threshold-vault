# What a developer or an agent can use today

This repository does not broadcast. The lab signer produces a recoverable SIG_K1_ on built-in lab chains only. It is not a threshold share.

## For an agent (right now)

```ts
import { runStrategyTool, listStrategiesTool } from "./mcp.js";
import { runStrategyWithPolicy, operatorOptInStrategies } from "./strategies.js";
import { createPolicy } from "./policy.js";
import { CHAINS } from "./digest.js";
import { parseSignature, VECTOR_JUNGLE_SIG_K1 } from "./codec.js";
import { PresignQueue, componentBytes } from "./presign.js";
import { hybridCustodyPlan } from "./permissions.js";
import { recommendCurve } from "./curve.js";

runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));
listStrategiesTool({ expect: "allow" }); // four default lab allows

operatorOptInStrategies(); // telos-testnet-tip, xpr-testnet-tip
runStrategyWithPolicy("telos-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000), {
  extraLabChainIds: [CHAINS.telosTestnet],
}); // allow + handoff; lab sig null

parseSignature(VECTOR_JUNGLE_SIG_K1);
recommendCurve(); // "R1"
```

| Surface | Module |
| --- | --- |
| MCP tools | `mcp.ts` |
| Strategies + operator opt-in | `strategies.ts` |
| Policy | `policy.ts` |
| PUB_/SIG_ codec | `codec.ts` |
| Presign queue | `presign.ts` |
| Hybrid permission shapes | `permissions.ts` |
| Curve preference | `curve.ts` |
| WalletPlugin stub | `walletPlugin.ts` |
| Lab sign (built-in labs only) | `labsign.ts` |

## Still out of scope

Real threshold WASM, live plugin co-sign, relay implementation, mainnet in the default gate, `sign_digest` tools.

Relay design notes: [RELAY.md](RELAY.md).

Run `npm test`.
