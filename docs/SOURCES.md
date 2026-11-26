# Sources

Rechecked while this course was written, 26 November 2026:

| Claim | Check |
| --- | --- |
| K1 canonical byte rule and the R1 low-S contrast | [EOSIO/eos#6699](https://github.com/EOSIO/eos/issues/6699) |
| Jungle 4 packed-transaction tx id and sig_digest | Rehashed locally with SHA-256. Both match the course blueprint's Vector 3. |
| Vector 1 `PUB_K1_` and `EOS` strings | Rebuilt locally with RIPEMD-160 and Base58. |
| DKLs23 v0.6.2 exists as a GitHub release with the three curve crates named | [0xCarbon/DKLs23 releases](https://github.com/0xCarbon/DKLs23/releases) |
| CVE-2025-66016 text: missing ZK check before 0.6.3, mitigation names cggmp24 0.7.0-alpha.2 | [CVE record](https://www.cve.org/CVERecord?id=CVE-2025-66016) and [GHSA-m95p-425x-x889](https://github.com/LFDT-Lockness/cggmp21/security/advisories/GHSA-m95p-425x-x889) |
| `@wharfkit/antelope` current tag | `npm view` reported 4.0.2, with 4.0.1 still present. Not imported. |
| secp256k1 nonce-reuse algebra | Recomputed with `@noble/curves` 1.9.7 on a fixture scalar. |

Not rechecked in this session, so do not treat this file as a verification of them:

- crates.io's default displayed version of `cggmp24` (the site returned 403 here). Pin from the advisory, not from memory: at least 0.7.0-alpha.2, and read upstream `CGGMP21_MIGRATION.md` before you pick a newer alpha.
- WharfKit's September 2026 monorepo announcement, beyond the version number on npm.
- Telos testnet and XPR chain ids. They were garbled in an OCR pass of the blueprint, so they are omitted rather than guessed.
- Dollar amounts in third-party incident writeups.
- Any claim that a given Rust crate is constant-time, audited, or free of CVE-2025-66017 in a specific alpha. Read the crate's advisory list yourself.

Primary reading, in a useful order:

1. [EOSIO/eos#6699](https://github.com/EOSIO/eos/issues/6699) — the canonical check.
2. [ePrint 2023/765](https://eprint.iacr.org/2023/765) — DKLs23.
3. [ePrint 2021/060](https://eprint.iacr.org/2021/060) — CGGMP.
4. [LFDT-Lockness/cggmp21](https://github.com/LFDT-Lockness/cggmp21) — the Rust tree and its advisories.
5. [Fireblocks on BitForge](https://www.fireblocks.com/bitforge) — why GG18/GG20 examples belong in a museum.
6. [TSSHOCK](https://verichains.io/tsshock/) — transcript encoding.
7. [Trail of Bits, ECDSA handle with care](https://blog.trailofbits.com/2020/06/11/ecdsa-handle-with-care/) — nonces.
8. [WAX RNG tutorial](https://docs.wax.io/build/tutorials/create-wax-rng-smart-contract/rng_sample) — public randomness, which this course refuses as a nonce.
9. [NIST IR 8547](https://nvlpubs.nist.gov/nistpubs/ir/2026/NIST.IR.8547.pdf) — the post-quantum transition dates.
10. [Agent Skills specification](https://agentskills.io/specification) — the skill files in this repo follow the frontmatter shape. They do not grant a signer.

Server-side libraries to read and not to bundle into this MIT tree: [coinbase/cb-mpc](https://github.com/coinbase/cb-mpc) (MIT, C++), [bnb-chain/tss-lib](https://github.com/bnb-chain/tss-lib) (MIT, Go, older audit lineage). Copying them into a browser package is a different project.
