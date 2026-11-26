# Threshold engines

| Engine | Status | License posture | Notes |
| --- | --- | --- | --- |
| `educational-mock` | **Available** | MIT (this repo) | Opaque share tokens; `sign()` always throws |
| `dkls23` | Planned R.2 | MIT/Apache-2.0 (0xCarbon lineage) | Unaudited for mainnet; testnet banner required |
| `cggmp24` | Planned R.2 | MIT/Apache-2.0 (Lockness ≥ 0.7.0-alpha.2) | Prefer over `cggmp21` (denied in `deny.toml`) |

```ts
import { createEngine, listEngines, createEducationalEngine } from "./threshold.js";

listEngines();
const engine = createEngine("educational-mock"); // only constructible id
const shares = await engine.dkg("K1");
const pre = await engine.presign([shares[0], shares[1]], "K1");
// await engine.sign(pre, digest) → throws until R.2 WASM is wired

createEngine("cggmp24"); // throws: Phase R.2
```

MCP: `list_engines` / `listEnginesTool()`.

## Interface contract

| Method | Contract |
| --- | --- |
| `dkg(curve)` | Three logical shares (2-of-3 shape); tokens are **not** scalars |
| `presign(shares, curve)` | Offline slot; K1 marks `rFiltered` |
| `sign(presign, digest)` | Must consume a **real** Antelope digest (`sig_digest`); never a model string |
| `productionReady` | Always `false` in this package |

## Before any testnet push with a real engine

1. Policy allow + offline/live `compute_transaction`
2. Signature over packed-tx digest (not lab proposal id)
3. `evaluatePushReadiness` including `operatorOptsIntoPush`
4. `enableNetwork: true` on `pushLabTransaction`
5. Mainnet still locked in this course lineage
6. Independent audit before mainnet value

## Supply chain

When R.2 crates land they must pass [deny.toml](../deny.toml): no `rug` / GMP, no `cggmp21`, unknown git registries denied. See [RUST.md](RUST.md) · [LICENSES.md](LICENSES.md).

[PUSH.md](PUSH.md) · [GAP-AUDIT.md](GAP-AUDIT.md) · [ATTACK-MUSEUM.md](ATTACK-MUSEUM.md)
