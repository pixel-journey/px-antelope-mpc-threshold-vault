# Threshold engines

| Engine | Status | Notes |
| --- | --- | --- |
| `educational-mock` | **Available** | Opaque share tokens; `sign()` always throws |
| `dkls23` | Planned R.2 | MIT/Apache 0xCarbon lineage; unaudited for mainnet |
| `cggmp24` | Planned R.2 | ≥ 0.7.0-alpha.2; `cggmp21` banned in `deny.toml` |

```ts
import { createEngine, listEngines } from "./threshold.js";

listEngines();
const engine = createEngine("educational-mock");
const shares = await engine.dkg("K1");
const pre = await engine.presign([shares[0], shares[1]], "K1");
// await engine.sign(pre, digest) → throws until R.2 WASM is wired
```

## Interface contract

- `dkg` → three logical shares (2-of-3 shape)
- `presign` → offline slot; K1 marks `rFiltered`
- `sign` → must consume a **real** Antelope digest (`sig_digest`), never a model string
- `productionReady` is always `false` in this package

## Before any testnet push with a real engine

1. Policy allow + offline/live `compute_transaction`
2. Signature over packed-tx digest (not lab proposal id)
3. `evaluatePushReadiness` including `operatorOptsIntoPush`
4. Mainnet still locked in this course lineage

See [RUST.md](RUST.md) · [PUSH.md](PUSH.md) · [GAP-AUDIT.md](GAP-AUDIT.md).
