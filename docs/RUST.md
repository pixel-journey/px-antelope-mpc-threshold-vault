# Rust workspace (Phase R.1)

| Crate | Role |
| --- | --- |
| `crates/antelope-crypto-format` | K1 `is_canonical`, R1 low-S check (no K1 byte rule), locked counts, `sig_digest`, `tx_id`, `PUB_K1_` / `PUB_R1_` / legacy `EOS`, `SIG_K1_` / `SIG_R1_`, low-S + recid flip |

**No** DKLs23 / CGGMP24 / WASM threshold engines in this workspace yet. Those are Phase **R.2** and must still pass the same `deny.toml` firewall.

## Commands

```bash
cargo test -p antelope-crypto-format
cargo clippy -p antelope-crypto-format --all-targets -- -D warnings
# with cargo-deny installed:
cargo deny check
```

CI: [`.github/workflows/rust.yml`](../.github/workflows/rust.yml) (test + clippy + cargo audit + cargo-deny). Toolchain pin: [rust-toolchain.toml](../rust-toolchain.toml).

Shared vectors: [testdata/vectors.json](../testdata/vectors.json) — Vectors 1–4 plus the Jungle 4 digest and canonical counts. TypeScript loads the same file in `src/vectors.test.ts` and recovers keys with WharfKit in `src/wharfkit.test.ts`. Rust checks encoding only (no secp recovery).

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
| Vector 1 `PUB_K1_`, `PUB_R1_`, and `EOS` | `codec.ts` | `format_public_key` |
| Vectors 2–4 `SIG_K1_` / `SIG_R1_` checksum round-trip | `codec.ts` | `parse_signature` / `format_signature` |
| R1 skips the K1 byte check; still low-S | `signatureIsCanonicalR1` | `signature_is_canonical_r1` |
| low-S and `recid ^= 1` | `canonical.ts` | `normalize_low_s` |
| Key recovery of Vectors 2–4 | WharfKit 4.0.2 only | Not implemented (no secp crate) |

## What R.1 is not

- Not a threshold signer
- Not a substitute for WharfKit session flows
- Not permission to mainnet

Threshold signing remains out of scope until an audited-or-bannered R.2 engine lands under testnet policy. See [ENGINE.md](ENGINE.md).
