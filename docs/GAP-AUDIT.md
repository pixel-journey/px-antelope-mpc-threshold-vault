# Gap audit (2026-11-26)

| Layer | Status |
| --- | --- |
| TS agent course (policy, MCP, simulate, museum, skills CI, push readiness) | **Done** |
| Shared `testdata/vectors.json` (TS + Rust) | **Done** |
| R.1 `antelope-crypto-format` + `deny.toml` | **Done** |
| `ThresholdEngine` registry + mock | **Done** (`sign` throws) |
| R.2 real DKLs23 / CGGMP24 WASM | **Not started** |
| W live plugin + HTTP lab push | **Not started** |
| Relay / Vault / PRF / UI | **Not started** |

Honesty line still accurate: **No threshold signing. No HTTP push by default. Unaudited.**

Next: R.2 engines behind the existing trait **or** W lab `fetch` under `evaluatePushReadiness`.
