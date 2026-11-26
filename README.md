# Antelope MPC, without a mainnet signer

> **Status:** educational reference for agentic payments on Antelope. Unaudited.  
> Default gate: WAX Testnet + Jungle 4. More *testnets* via `extraLabChainIds`. **Mainnets hard-refused.**  
> **No threshold WASM.** **No HTTP push by default** — push is a documented end-stage with a readiness checklist ([docs/PUSH.md](docs/PUSH.md)).  
> **Done vs remains:** [docs/GAP-AUDIT.md](docs/GAP-AUDIT.md).

Antelope rotates keys with `updateauth` without moving balances. Threshold ECDSA hides the signer set inside one `SIG_K1_` / `SIG_R1_`. It does **not** replace cold owner multisig.

## Agent path (today)

```ts
import { runStrategyTool, listStrategiesTool, simulateProposal } from "./src/mcp.js";
import { CHAINS } from "./src/digest.js";

listStrategiesTool({ expect: "allow" });
const tip = runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));
// offline fixtures: clean-transfer | inline-escalation | assert-revert
```

```bash
npm test && npm run check-skills
```

## Read in this order

| Doc | What it is |
| --- | --- |
| [docs/TODAY.md](docs/TODAY.md) | Callable surface |
| [docs/GAP-AUDIT.md](docs/GAP-AUDIT.md) | Done vs remains |
| [docs/AGENT-RECIPE.md](docs/AGENT-RECIPE.md) | Full agent loop |
| [docs/PUSH.md](docs/PUSH.md) | `push_transaction` as final stage |
| [docs/AGENTIC-PAYMENTS.md](docs/AGENTIC-PAYMENTS.md) | MPC limits + Antelope rails |
| [docs/ATTACK-MUSEUM.md](docs/ATTACK-MUSEUM.md) | CVE cards + toy demos |
| [EDUCATION.md](EDUCATION.md) | Course spine |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Hybrid thesis |

WharfKit **4.0.2**. Naive K1 canonical fail rate (uniform-byte model): **~75.2%**.

## Engines named, not imported

DKLs23 / CGGMP24 reading-list only until Phase R. AGPL / non-commercial DKLs trees forbidden. [docs/LICENSES.md](docs/LICENSES.md).

## Related

[wax-multi-sig-proposal-builder-and-simulator](https://github.com/pixel-journey/wax-multi-sig-proposal-builder-and-simulator) · [wax-wharfkit-session-keys-and-linked-permissions](https://github.com/pixel-journey/wax-wharfkit-session-keys-and-linked-permissions) · [wax-escrowed-merch-custody-timeline](https://github.com/pixel-journey/wax-escrowed-merch-custody-timeline)

MIT. Pixel Journey.
