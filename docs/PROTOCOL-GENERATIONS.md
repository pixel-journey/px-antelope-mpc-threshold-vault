# Four generations of threshold ECDSA

Antelope account authorities accept ECDSA on secp256k1 (K1) or secp256r1 (R1). They do not accept Schnorr or BLS. Schnorr is linear, so FROST can add partial signatures. ECDSA is not. The signing equation is

$$s = k^{-1}(m + r \cdot x) \bmod n$$

where \(r = (k \cdot G)_x \bmod n\) and \(m\) is the SHA-256 signing digest. Both \(k\) and \(x\) are secrets, and they are multiplied. You cannot hand each signer a Shamir share of \(x\) and ask them to sign locally. Someone would have to rebuild \(x\), or the signers need a multiplication protocol.

Rebuilding \(x\) is the custody failure. The museum in `src/museum.ts` does it on purpose over a tiny prime so the test can show the secret coming back.

## First generation — Paillier, and the attacks that followed

GG18 (9 signing rounds), GG20 (6 total rounds, 1 online), and Lindell17 (2-of-2) established trustless threshold ECDSA using Paillier homomorphic encryption for the multiplications. In 2023, Alpha-Rays, BitForge, and TSSHOCK showed that unhardened implementations leaked full private keys. The missing pieces were Paillier biprimality checks, no-small-factor proofs, and MtA range proofs.

Modern repositories keep GG18 and GG20 as historical lessons. They are not active signing engines. Cards: [ATTACK-MUSEUM.md](ATTACK-MUSEUM.md).

## Second generation — CGGMP21 / CGGMP24

Canetti, Gennaro, Goldfeder, Makriyannis, and Peled (ePrint 2021/060, revised October 2024) hardened the Paillier line with a full zero-knowledge suite. The design is UC-secure against a dishonest majority, with offline preprocessing plus 1 non-interactive online round, proactive refresh, and identifiable abort in the specification.

November 2025 disclosures (CVE-2025-66016 and CVE-2025-66017) still matter: a missing Jacobi check, and presignature misuse with raw digests or weak HD derivation. Pin `cggmp24` at or after 0.7.0-alpha.2 when an engine lands. Build with the `num-bigint` backend. `backend-rug` pulls LGPL GMP and is banned in `deny.toml`, along with the crate name `cggmp21`.

## Third generation — DKLs23 and Cait-Sith

DKLs23 (Doerner, Kondi, Lee, and Shelat; IEEE S&P 2024, ePrint 2023/765) removes Paillier and RSA assumptions. It is UC-secure against a dishonest majority via oblivious-transfer extensions, and it has a clean WASM story without multi-minute Paillier setup.

Cait-Sith separates multiplication into key-independent committed Beaver triples. It is used in NEAR's Chain Signatures network. Periodic proactive refresh invalidates cached presignatures — the same rule this course models with `PresignQueue.invalidateAll`.

0xCarbon's `dkls23-*` crates (MIT/Apache-2.0, K1 and R1) are **named** in `ENGINE_ROADMAP`. They are not compiled in this course.

## Fourth generation — 2025–2026 class-group protocols

Trout and related 2-round class-group ECDSA designs are research. Antelope account authorities do not yet accept a signature format that would let a chain verify them natively. An account that later wants to move would do so with `eosio::updateauth`, without transferring balances. See [POST-QUANTUM.md](POST-QUANTUM.md).

## What this course runs

None of the engines' `sign` paths. It does run:

- K1 canonical counts, low-S + recid flip, presign queue policy
- Jungle 4 signing digest (TS + Rust)
- WharfKit 4.0.2 recovery of published vectors
- Policy gate, strategies, MCP tools, offline simulate fixtures
- Educational threshold engine: DKG/presign tokens, then `sign()` throws
- Gated lab `get_info` / `push_transaction` (not a threshold ceremony)

[ENGINE.md](ENGINE.md) · [GAP-AUDIT.md](GAP-AUDIT.md)
