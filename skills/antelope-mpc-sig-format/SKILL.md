---
name: antelope-mpc-sig-format
description: Use when checking Antelope PUB_K1 or SIG_K1 layout, the K1 is_canonical byte rule, a low-S recovery-id flip, or the chain-id signing digest. Does not sign and does not hold a key.
license: MIT
---

# Antelope signature format

Work in this repository, not from memory.

- The K1 check is on bytes 1..32 and 33..64 of the 65-byte compact signature. See `src/canonical.ts`. Counts: 32640/65536 per component, 65025/262144 both, about 75.202 percent fail.
- A high `s` becomes `n - s` and `recid` flips with xor 1. Do not flip `s` alone.
- `sig_digest` hashes `chain_id || packed_transaction || cfd_hash`. `tx_id` hashes the packed transaction only. See `src/digest.ts` and `testdata/vectors.json`.
- Rust parity: `crates/antelope-crypto-format` (`cargo test -p antelope-crypto-format`).
- `PUB_K1_` checksums `RIPEMD-160(point || "K1")`. Legacy `EOS` checksums the point alone. See `src/codec.ts`.
- R1, as described in EOSIO/eos#6699, is a low-S rule, not this byte check.
- Lab signatures from `src/labsign.ts` are over a proposal id. They are not node-accepted action signatures.

Run `npm test`. Do not add a signer to satisfy this skill.
