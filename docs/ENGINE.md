# Threshold engines

| Engine | Status | License posture | Notes |
| --- | --- | --- | --- |
| `educational-mock` | **Available** | MIT (this repo) | Opaque share tokens; `sign()` always throws |
| `dkls23` | Planned R.2 | MIT/Apache-2.0 (0xCarbon lineage) | Unaudited for mainnet; testnet banner required |
| `cggmp24` | Planned R.2 | MIT/Apache-2.0 (Lockness ≥ 0.7.0-alpha.2) | Prefer over `cggmp21` (denied in `deny.toml`) |

```ts
import { createEngine, listEngines, r2Admission } from "./threshold.js";

listEngines();
r2Admission(); // { ready: false, blockers: [...] }
const engine = createEngine("educational-mock");
const shares = await engine.dkg("K1");
const pre = await engine.presign([shares[0], shares[1]], "K1");
// sign(pre, digest) throws. Non-32-byte digests throw first.

createEngine("cggmp24"); // throws and lists admission blockers
```

MCP: `list_engines` / `listEnginesTool()`.

## Interface contract

| Method | Contract |
| --- | --- |
| `dkg(curve)` | Three logical shares (2-of-3 shape); tokens are **not** scalars |
| `presign(shares, curve)` | Offline slot; K1 marks `rFiltered` |
| `sign(presign, digest)` | Digest must be 32 bytes. Even then the mock throws. A real engine must hash the packed tx itself |
| `productionReady` | Always `false` in this package |
| `r2Admission()` | Structured blockers; `ready` is false until a later package flips rows |

## Admission rows (`R2_ADMISSION`)

| Id | Meaning |
| --- | --- |
| `license` | MIT/Apache only; no rug, GMP, cggmp21 |
| `no-sign-digest` | No caller-supplied hash API |
| `k1-filter` | Offline r-filter + burn |
| `testnet-banner` | Mainnet stays locked |
| `audit` | Independent review before mainnet value |

All five are `met: false` here on purpose. Flipping them in a comment without code is not admission.

## Before any testnet push with a real engine

1. `r2Admission().ready` is actually true in that package
2. Policy allow + offline/live `compute_transaction`
3. Signature over packed-tx digest (not lab proposal id)
4. `evaluatePushReadiness` including `operatorOptsIntoPush`
5. `enableNetwork: true` on `pushLabTransaction`
6. Mainnet still locked
7. Independent audit before mainnet value

## Supply chain

When R.2 crates land they must pass [deny.toml](../deny.toml). See [RUST.md](RUST.md) · [LICENSES.md](LICENSES.md).

[PUSH.md](PUSH.md) · [GAP-AUDIT.md](GAP-AUDIT.md) · [ATTACK-MUSEUM.md](ATTACK-MUSEUM.md)
