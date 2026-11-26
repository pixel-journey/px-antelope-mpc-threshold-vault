# Antelope MPC, without a mainnet signer

> **Status:** educational reference for agentic payments on Antelope. Unaudited. Default gate: WAX Testnet + Jungle 4. Operators may opt into more *testnets* via `extraLabChainIds`; mainnets stay hard-refused.  
> **What `npm test` does:** K1 canonical rule, PUB/SIG codecs, digests, WharfKit 4.0.2 recovery, policy + strategies (including operator opt-in), presign queue, hybrid permissions, MCP tools, WalletPlugin stub refusals.  
> **What it does not do:** real threshold signing, WASM engines, live co-signing WalletPlugin, relay, key share, or broadcast.

Antelope already has a way to rotate a key without moving the assets: the account is a name, and `eosio::updateauth` changes who may act for it. Threshold ECDSA still matters because a single `SIG_K1_` / `SIG_R1_` hides the signer set. It does **not** replace the cold owner multisig.

## Agent path (today)

```ts
import { runStrategyTool, listStrategiesTool } from "./src/mcp.js";
import { runStrategyWithPolicy } from "./src/strategies.js";
import { CHAINS } from "./src/digest.js";

listStrategiesTool({ expect: "allow" });
runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));

// Optional: operator opens Telos Testnet for this process
runStrategyWithPolicy("telos-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000), {
  extraLabChainIds: [CHAINS.telosTestnet],
});
```

Four default allows: `wax-testnet-tip`, `treasury-tip`, `jungle-tip`, `peer-tip`. See [docs/TODAY.md](docs/TODAY.md).

## Read in this order

| Doc | What it is |
| --- | --- |
| [EDUCATION.md](EDUCATION.md) | Course: hybrid permissions, generations, K1 trap, policy |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Hybrid thesis and what this tree runs |
| [docs/TODAY.md](docs/TODAY.md) | Callable surface right now |
| [docs/STRATEGIES.md](docs/STRATEGIES.md) | Allows, refusals, `runStrategyWithPolicy` |
| [docs/MCP-TOOLS.md](docs/MCP-TOOLS.md) | MCP-shaped tools |
| [docs/WALLET-PLUGIN.md](docs/WALLET-PLUGIN.md) | Plugin contract (refuses live MPC sign) |
| [docs/PRESIGNATURES.md](docs/PRESIGNATURES.md) | Presign queue policy |
| [docs/PERMISSIONS.md](docs/PERMISSIONS.md) | Hybrid shapes |
| [docs/RELAY.md](docs/RELAY.md) | Co-signer relay design (not implemented) |
| [docs/K1-CANONICAL.md](docs/K1-CANONICAL.md) | Byte check, low-S, recid flip |
| [docs/NETWORKS.md](docs/NETWORKS.md) | Chain ids + operator opt-in |
| [docs/PROTOCOL-GENERATIONS.md](docs/PROTOCOL-GENERATIONS.md) | GG18 → class-group research |
| [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) | What tests refuse vs cannot prove |
| [docs/LICENSES.md](docs/LICENSES.md) | MIT course; no AGPL engines in-tree |

```bash
npm test
```

WharfKit **4.0.2**. Canonical failure rate under the uniform-byte model: **75.202%** (65025/262144 succeed for both components).

## Engines named, not imported

| Engine | Note |
| --- | --- |
| 0xCarbon/DKLs23 v0.6.2 | MIT/Apache; unaudited here for mainnet |
| LFDT-Lockness/cggmp24 ≥ 0.7.0-alpha.2 | CVE fixes; no `backend-rug` |
| silence-laboratories/dkls23 · entropyxyz/synedrion | Forbidden licenses |

## Lab chain ids (default)

| Network | Chain id |
| --- | --- |
| WAX Testnet | `f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12` |
| Jungle 4 | `73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d` |

## Related courses

- [wax-multi-sig-proposal-builder-and-simulator](https://github.com/pixel-journey/wax-multi-sig-proposal-builder-and-simulator)
- [wax-permission-visualizer-and-editor](https://github.com/pixel-journey/wax-permission-visualizer-and-editor)
- [wax-wharfkit-session-keys-and-linked-permissions](https://github.com/pixel-journey/wax-wharfkit-session-keys-and-linked-permissions)
- [px-orng-v3-randnotify-starter](https://github.com/pixel-journey/px-orng-v3-randnotify-starter)

MIT. Pixel Journey.
