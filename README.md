# Antelope MPC, without a mainnet signer

> **Status:** educational reference for **agentic payments** on Antelope. **Unaudited.**  
> Default gate: **WAX Testnet** + **Jungle 4**. Operators may open more *testnets* via `extraLabChainIds`. **Mainnets hard-refused.**  
> **No threshold WASM signing** (engine mock only; `sign()` throws).  
> **No HTTP by default** — lab `get_info` / `push_transaction` require explicit `enableNetwork` + readiness gates ([docs/PUSH.md](docs/PUSH.md)).  
> **Done vs remains:** [docs/GAP-AUDIT.md](docs/GAP-AUDIT.md) · **Educational checklist:** [docs/COMPLETION.md](docs/COMPLETION.md)

Antelope already has a way to rotate a key without moving assets: the account is a **name**, and `eosio::updateauth` changes who may act for it. Threshold ECDSA still matters because a single `SIG_K1_` / `SIG_R1_` hides the signer set. It does **not** replace cold owner multisig.

## Quick start

```bash
npm test && npm run check-skills
# optional (Phase R.1):
cargo test -p antelope-crypto-format
```

### Agent path (today)

```ts
import {
  listStrategiesTool,
  runStrategyTool,
  listEnginesTool,
  simulateProposal,
} from "./src/mcp.js";
import { runStrategyWithPolicy } from "./src/strategies.js";
import { CHAINS } from "./src/digest.js";

listStrategiesTool({ expect: "allow" });
// four default allows: wax-testnet-tip, treasury-tip, jungle-tip, peer-tip
runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));

// operator-only extra testnet + recoverable lab SIG_K1_ (not node-pushable)
runStrategyWithPolicy("telos-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000), {
  extraLabChainIds: [CHAINS.telosTestnet],
});

listEnginesTool(); // educational-mock only until Phase R.2
```

### Optional lab network (explicit)

```ts
import { fetchLabChainInfo, pushLabTransaction } from "./src/labClient.js";
import { CHAINS } from "./src/digest.js";

await fetchLabChainInfo(CHAINS.waxTestnet, { enableNetwork: true });

// push only when readiness is honest (real digest, dry-run, operator opt-in)
await pushLabTransaction(
  {
    chainId: CHAINS.waxTestnet,
    transaction: packedSignedTxObject,
    readiness: {
      policyAllowed: true,
      signedAntelopeDigest: true, // must NOT be a lab proposal-id signature
      dryRunOk: true,
      operatorOptsIntoPush: true,
    },
  },
  { enableNetwork: true },
);
```

Push is **not** an MCP tool (models should not fire broadcast). See [docs/PUSH.md](docs/PUSH.md).

## What `npm test` covers

| Area | Modules |
| --- | --- |
| K1 `is_canonical`, low-S + recid flip | `canonical.ts` |
| PUB_/SIG_ codecs | `codec.ts` |
| Jungle 4 / chain digests + shared vectors | `digest.ts`, `testdata/vectors.json` |
| WharfKit **4.0.2** recovery | `wharfkit.test.ts` |
| Policy + strategies + operator opt-in | `policy.ts`, `strategies.ts` |
| Presign queue (r-filter, burn) | `presign.ts` |
| Offline compute fixtures | `simulate.ts` |
| Lab client gates | `labClient.ts` |
| MCP tools (10) | `mcp.ts` |
| Attack museum + engine mock | `museum.ts`, `threshold.ts` |
| Skills frontmatter / secrets | `scripts/check-skills.mjs` |

**What it does not prove:** real DKLs23/CGGMP24 ceremonies, audited mainnet custody, or that a lab `SIG_K1_` is accepted by nodeos.

## Read in this order

| Doc | What it is |
| --- | --- |
| [EDUCATION.md](EDUCATION.md) | Course spine: hybrid permissions, generations, K1 trap, policy |
| [docs/TODAY.md](docs/TODAY.md) | Callable surface right now |
| [docs/AGENT-RECIPE.md](docs/AGENT-RECIPE.md) | Full agent loop |
| [docs/GAP-AUDIT.md](docs/GAP-AUDIT.md) | Done vs remains (vs description-only reviews) |
| [docs/COMPLETION.md](docs/COMPLETION.md) | Educational vs production definition of done |
| [docs/AGENTIC-PAYMENTS.md](docs/AGENTIC-PAYMENTS.md) | What MPC does / does not solve; Antelope L1 advantages |
| [docs/PUSH.md](docs/PUSH.md) | `push_transaction` as final stage + gated sender |
| [docs/MCP-TOOLS.md](docs/MCP-TOOLS.md) | Tool list; what is intentionally not a tool |
| [docs/ENGINE.md](docs/ENGINE.md) | Threshold engine registry |
| [docs/RUST.md](docs/RUST.md) | Phase R.1 format crate + `deny.toml` |
| [docs/ATTACK-MUSEUM.md](docs/ATTACK-MUSEUM.md) | CVE cards + toy demos |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Hybrid thesis |
| [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) | In / out of scope |
| [docs/RELAY.md](docs/RELAY.md) | Co-signer relay design (not implemented) |

## Engines

| Engine | Status |
| --- | --- |
| `educational-mock` | Available — DKG/presign tokens; **`sign()` throws** |
| DKLs23 / CGGMP24 WASM | **Phase R.2** — named in registry, not imported |

License firewall: [deny.toml](deny.toml) blocks `rug` / GMP / `cggmp21`. AGPL and non-commercial DKLs trees stay out. See [docs/LICENSES.md](docs/LICENSES.md).

## Lab chain ids (default)

| Network | Chain id |
| --- | --- |
| WAX Testnet | `f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12` |
| Jungle 4 | `73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d` |

WharfKit **4.0.2**. Naive K1 canonical failure rate (uniform-byte model): **~75.202%**.

## Related courses

- [wax-multi-sig-proposal-builder-and-simulator](https://github.com/pixel-journey/wax-multi-sig-proposal-builder-and-simulator)
- [wax-permission-visualizer-and-editor](https://github.com/pixel-journey/wax-permission-visualizer-and-editor)
- [wax-wharfkit-session-keys-and-linked-permissions](https://github.com/pixel-journey/wax-wharfkit-session-keys-and-linked-permissions)
- [wax-escrowed-merch-custody-timeline](https://github.com/pixel-journey/wax-escrowed-merch-custody-timeline)
- [px-orng-v3-randnotify-starter](https://github.com/pixel-journey/px-orng-v3-randnotify-starter)

MIT. Pixel Journey.
