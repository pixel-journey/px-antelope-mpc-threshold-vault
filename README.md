# Antelope MPC, without a mainnet signer

> **Status:** educational reference for agentic payments on Antelope. Unaudited. The policy gate defaults to testnets; the network map includes the mainnets. A lab signer produces a recoverable SIG_K1_ on those testnets.  
> **What `npm test` does:** locks the K1 canonical byte rule, published key/digest vectors, WharfKit 4.0.2 recovery, policy gate, strategy catalog, presign queue policy, hybrid permission shapes, MCP tool surface, and WalletPlugin stub refusals.  
> **What it does not do:** real threshold signing, WebAssembly engines, a live co-signing WalletPlugin, a relay, a key share, or a broadcast. `src/threshold.ts` walks DKG/presign and refuses to sign. `src/walletPlugin.ts` refuses threshold sign.

Antelope already has a way to rotate a key without moving the assets: the account is a name, and `eosio::updateauth` changes who may act for it. An Ethereum address cannot do that, because the address is the key. Threshold ECDSA still matters here, because a single `SIG_K1_` or `SIG_R1_` hides the signer set and does not need an `eosio.msig` proposal for every game action. It does not replace the cold owner multisig. The cold owner is how you throw away a bad active key.

This repository is the reading course and the byte-level lab for that idea. It is not a custody product. No public audit of the engines named below was repeated in this repository, and a custom orchestration of those engines should not hold mainnet value.

## Agent path (today)

```ts
import { runStrategyTool, listStrategiesTool, listNetworks } from "./src/mcp.js";

listNetworks();
listStrategiesTool({ expect: "allow" });
const tip = runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));
// tip.decision.ok, tip.lab.signature — lab key only, not a threshold share
```

Four allows: `wax-testnet-tip`, `treasury-tip`, `jungle-tip`, `peer-tip`. See [docs/TODAY.md](docs/TODAY.md).

## Read in this order

| Doc | What it is |
| --- | --- |
| [EDUCATION.md](EDUCATION.md) | The course: permissions, the four protocol generations, the K1 trap, the policy gate |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Hybrid thesis: MPC on active, cold owner multisig, what this tree runs vs later |
| [docs/TODAY.md](docs/TODAY.md) | What a developer or an agent can call right now |
| [docs/CURRICULUM.md](docs/CURRICULUM.md) | Eight levels, and which of them this repo actually runs |
| [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) | What the tests refuse, and what they cannot prove |
| [docs/MCP-TOOLS.md](docs/MCP-TOOLS.md) | Callable MCP-shaped tools in `src/mcp.ts` |
| [docs/WALLET-PLUGIN.md](docs/WALLET-PLUGIN.md) | Educational WalletPluginMPC contract (refuses live sign) |
| [docs/STRATEGIES.md](docs/STRATEGIES.md) | Named moves, allows, and intentional refusals |
| [docs/PRESIGNATURES.md](docs/PRESIGNATURES.md) | Presign queue: r-filter, single-use, burn, refresh |
| [docs/PERMISSIONS.md](docs/PERMISSIONS.md) | Hybrid `updateauth` / `linkauth` shapes |
| [docs/K1-CANONICAL.md](docs/K1-CANONICAL.md) | The byte check, low-S, recovery-id flip |
| [docs/PROTOCOL-GENERATIONS.md](docs/PROTOCOL-GENERATIONS.md) | GG18 → CGGMP24 → DKLs23 → class-group research |
| [docs/ATTACK-MUSEUM.md](docs/ATTACK-MUSEUM.md) | Canonical boss fight, nonce reuse, Paillier gaps |
| [docs/CHAIN-OPPORTUNITIES.md](docs/CHAIN-OPPORTUNITIES.md) | Per-chain and cross-chain agent opportunities |
| [docs/NETWORKS.md](docs/NETWORKS.md) | Chain ids and symbols |
| [docs/LICENSES.md](docs/LICENSES.md) | MIT course + BSD-3 WharfKit; no AGPL engines in-tree |
| [docs/SOURCES.md](docs/SOURCES.md) | Primary sources |

```bash
npm test
```

`@wharfkit/antelope` and `@wharfkit/session` are pinned at **4.0.2** (BSD-3-Clause). `@noble/curves` is used only inside the nonce-reuse fixture.

## The number the tests lock

For uniform random bytes, one 32-byte integer passes Antelope's K1 canonical check on **32640 of 65536** first-two-byte pairs. Both `r` and `s` together pass on **65025 of 262144** draws. The other **197119** fail. That failure rate is **75.202%**, which is the figure people round to 75.20%, and `262144 / 65025` is about **4.031** draws per success.

That count is a byte model. It is not a measurement of a WAN signing ceremony, and it is not a measurement of integers reduced modulo the curve order.

## WharfKit is the client

On Antelope, the library to teach is WharfKit, not eosjs and not UAL. `SessionKit` takes the chain list and the wallet plugins, `login` returns a session, and `session.transact` sends. This course constructs a `SessionKit` for WAX Testnet and Jungle 4 with **no** wallet plugin and does not call `login` or `transact`.

`@wharfkit/session` 4.0.2 re-exports the antelope types. The tests use that one copy for Vector 1, Jungle 4 digests, K1/R1 recovery, and `Authority.sort()`.

The blueprint named WharfKit 4.0.1. The registry's current 4.x line on 26 November 2026 was **4.0.2**, and 4.0.2 still recovers those vectors, so the pin is 4.0.2. Do not add `@wharfkit/wallet-plugin-wombat`.

## Engines named, and not imported

| Engine | Why it is on the reading list | Why it is not in this package |
| --- | --- | --- |
| [0xCarbon/DKLs23](https://github.com/0xCarbon/DKLs23) v0.6.2 | 3-round threshold ECDSA, MIT or Apache-2.0, K1 and R1 | Not compiled. Treat as unaudited for mainnet. |
| [LFDT-Lockness/cggmp24](https://github.com/LFDT-Lockness/cggmp21) | 1 online round; use ≥ 0.7.0-alpha.2 for CVE fixes | Not compiled. No `backend-rug`. |
| silence-laboratories/dkls23 | Different license | Forbidden in an MIT Pixel Journey repo |
| entropyxyz/synedrion | AGPL-3.0 | Forbidden here |

`npm test` scans `package.json` for banned names.

## Lab chain ids

| Network | Chain id |
| --- | --- |
| WAX Testnet | `f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12` |
| Jungle 4 | `73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d` |

Mainnets and other testnets appear in `CHAINS` / playbooks / strategies as **catalogued refusals** until an operator opts in.

## Related courses

- [wax-multi-sig-proposal-builder-and-simulator](https://github.com/pixel-journey/wax-multi-sig-proposal-builder-and-simulator) — on-chain `eosio.msig`
- [wax-permission-visualizer-and-editor](https://github.com/pixel-journey/wax-permission-visualizer-and-editor) — permission tree
- [wax-wharfkit-session-keys-and-linked-permissions](https://github.com/pixel-journey/wax-wharfkit-session-keys-and-linked-permissions) — session keys ≠ threshold shares
- [px-orng-v3-randnotify-starter](https://github.com/pixel-journey/px-orng-v3-randnotify-starter) — WAX RNG is not an MPC nonce source

MIT. Pixel Journey.
