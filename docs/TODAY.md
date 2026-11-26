# What a developer or an agent can use today

This repository does not broadcast. The lab signer produces a recoverable SIG_K1_ on a lab chain. It is not a threshold share. The pieces below are usable now.

## For an agent (right now)

```ts
import { runStrategyTool, listNetworks, listStrategiesTool, checkStatus } from "./mcp.js";
import { PresignQueue, componentBytes } from "./presign.js";
import { hybridCustodyPlan } from "./permissions.js";
import { recommendCurve } from "./curve.js";
import { pluginSign, pluginLogin } from "./walletPlugin.js";

const tip = runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));
listNetworks();
listStrategiesTool({ expect: "allow" });
recommendCurve(); // "R1"
```

| Surface | Module |
| --- | --- |
| MCP-shaped tools | `mcp.ts` |
| Named strategies / playbooks | `strategies.ts` · `playbooks.ts` |
| Policy gate | `policy.ts` |
| Lab sign after allow | `labsign.ts` |
| Presign queue policy | `presign.ts` |
| Hybrid permission shapes | `permissions.ts` |
| R1-preferred curves | `curve.ts` |
| WalletPlugin stub (refuses live MPC sign) | `walletPlugin.ts` |
| Canonical / digest / museum | `canonical.ts` · `digest.ts` · `museum.ts` |

**Four allows today:** `wax-testnet-tip`, `treasury-tip`, `jungle-tip`, `peer-tip`.

## For a developer

- `@wharfkit/session` **4.0.2** recovers published vectors and sorts authorities.
- [WALLET-PLUGIN.md](WALLET-PLUGIN.md) is the contract for a future real plugin.
- [K1-CANONICAL.md](K1-CANONICAL.md) + presign tests before any K1 signer.
- [ARCHITECTURE.md](../ARCHITECTURE.md) for the hybrid thesis.

## Still out of scope (by design)

| Item | Why |
| --- | --- |
| Real DKLs23 / CGGMP24 WASM | Unaudited orchestration must not hold mainnet funds |
| Live WalletPlugin co-sign | Stub refuses until a reviewed engine is wired |
| Default mainnet gate | Operator decision |
| `sign_digest` tool | Blind hashing is a CVE class |

Run `npm test`.
