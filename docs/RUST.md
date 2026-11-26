# Rust workspace (Phase R.1)

| Crate | Role |
| --- | --- |
| `crates/antelope-crypto-format` | K1 `is_canonical`, locked counts, `sig_digest`, `tx_id` |

**No** DKLs23 / CGGMP24 / WASM threshold engines in this workspace yet. Those are Phase **R.2** and must still pass the same `deny.toml` firewall.

## Commands

```bash
cargo test -p antelope-crypto-format
cargo clippy -p antelope-crypto-format --all-targets -- -D warnings
# with cargo-deny installed:
cargo deny check
```

CI: [`.github/workflows/rust.yml`](../.github/workflows/rust.yml) (test + clippy + cargo-deny). Toolchain pin: [rust-toolchain.toml](../rust-toolchain.toml).

Shared vectors: [testdata/vectors.json](../testdata/vectors.json) (Jungle 4 digest + canonical counts). TypeScript loads the same file in `src/vectors.test.ts`.

## Deny policy (summary)

| Rule | Effect |
| --- | --- |
| Allow licenses | MIT, Apache-2.0, BSD, ISC, Zlib, Unicode-3.0, CC0-1.0 |
| Deny crates | `rug`, `gmp-mpfr-sys`, `cggmp21` |
| Sources | Unknown registries / git denied |

Full file: [deny.toml](../deny.toml).

## Parity with TypeScript

| Check | TS | Rust |
| --- | --- | --- |
| Component canonical | `canonical.ts` | `component_is_canonical` |
| Counts 32640 / 65025 / 197119 | `CANONICAL_COUNTS` | `counts::*` |
| Jungle 4 sig digest + tx id | `digest.ts` | `sig_digest` / `tx_id` tests |

## What R.1 is not

- Not a threshold signer
- Not a substitute for WharfKit session flows
- Not permission to mainnet

Threshold signing remains out of scope until an audited-or-bannered R.2 engine lands under testnet policy. See [ENGINE.md](ENGINE.md).
