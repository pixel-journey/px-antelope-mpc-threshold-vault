# Antelope MPC, without a mainnet signer

> **Status:** educational reference for agentic payments on Antelope. Unaudited. Default gate: WAX Testnet + Jungle 4. Operators may opt into more *testnets* via `extraLabChainIds`; mainnets stay hard-refused. **No broadcast** (`src/broadcast.ts`). **No real threshold WASM.**  
> **What exists:** K1/R1 labs, codecs, digests, WharfKit 4.0.2 recovery, policy + strategies, presign queue, hybrid permissions, MCP tools, WalletPlugin stub, attack museum, agent skills.  
> **Done vs remains:** [docs/GAP-AUDIT.md](docs/GAP-AUDIT.md) (corrects description-only reviews).

Antelope already has a way to rotate a key without moving the assets: the account is a name, and `eosio::updateauth` changes who may act for it. Threshold ECDSA still matters because a single `SIG_K1_` / `SIG_R1_` hides the signer set. It does **not** replace the cold owner multisig.

## Agent path (today)

```ts
import { runStrategyTool, listStrategiesTool } from "./src/mcp.js";
import { runStrategyWithPolicy } from "./src/strategies.js";
import { CHAINS } from "./src/digest.js";

listStrategiesTool({ expect: "allow" });
runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));

runStrategyWithPolicy("telos-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000), {
  extraLabChainIds: [CHAINS.telosTestnet],
});
```

Four default allows: `wax-testnet-tip`, `treasury-tip`, `jungle-tip`, `peer-tip`. See [docs/TODAY.md](docs/TODAY.md).

## Read in this order

| Doc | What it is |
| --- | --- |
| [EDUCATION.md](EDUCATION.md) | Course: hybrid permissions, generations, K1 trap, policy |
| [docs/GAP-AUDIT.md](docs/GAP-AUDIT.md) | What is done vs remains (vs description-only audits) |
| [docs/AGENTIC-PAYMENTS.md](docs/AGENTIC-PAYMENTS.md) | MPC limits, Antelope L1 advantages, x402/MPP framing |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Hybrid thesis |
| [docs/TODAY.md](docs/TODAY.md) | Callable surface |
| [docs/STRATEGIES.md](docs/STRATEGIES.md) | Allows, refusals, operator opt-in |
| [docs/MCP-TOOLS.md](docs/MCP-TOOLS.md) | MCP-shaped tools |
| [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) | In / out of scope |
| [docs/RELAY.md](docs/RELAY.md) | Relay design (not implemented) |

```bash
npm test
```

WharfKit **4.0.2**. Canonical failure rate (uniform-byte model): **75.202%**.

## Engines named, not imported

DKLs23 / CGGMP24 are reading-list only. AGPL and non-commercial DKLs trees are forbidden. See [docs/LICENSES.md](docs/LICENSES.md).

## Related courses

- [wax-multi-sig-proposal-builder-and-simulator](https://github.com/pixel-journey/wax-multi-sig-proposal-builder-and-simulator)
- [wax-permission-visualizer-and-editor](https://github.com/pixel-journey/wax-permission-visualizer-and-editor)
- [wax-wharfkit-session-keys-and-linked-permissions](https://github.com/pixel-journey/wax-wharfkit-session-keys-and-linked-permissions)
- [wax-escrowed-merch-custody-timeline](https://github.com/pixel-journey/wax-escrowed-merch-custody-timeline)

MIT. Pixel Journey.
