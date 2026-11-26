# Rust workspace (Phase R.1)

| Crate | Role |
| --- | --- |
| `crates/antelope-crypto-format` | K1 `is_canonical`, `sig_digest`, `tx_id`, locked counts |

**No** DKLs23 / CGGMP24 / WASM threshold engines in this workspace yet. Those are Phase **R.2** and stay behind the same `deny.toml` firewall.

## Commands

```bash
cargo test -p antelope-crypto-format
cargo clippy -p antelope-crypto-format --all-targets -- -D warnings
# with cargo-deny installed:
cargo deny check
```

Shared vectors: [testdata/vectors.json](../testdata/vectors.json) (Jungle 4 digest + canonical counts).

## Deny policy (summary)

- Allow: MIT, Apache-2.0, BSD, ISC, Zlib, Unicode-3.0, CC0-1.0  
- Deny crates: `rug`, `gmp-mpfr-sys`, `cggmp21`  
- Unknown registries / git sources: deny  

See root [deny.toml](../deny.toml).

## Parity with TypeScript

| Check | TS | Rust |
| --- | --- | --- |
| Component canonical | `canonical.ts` | `component_is_canonical` |
| Counts 32640 / 65025 | `CANONICAL_COUNTS` | `counts::*` |
| Jungle 4 sig digest | `digest.ts` | `sig_digest` test |

Threshold signing remains out of scope until an audited-or-bannered R.2 engine lands under testnet policy.
