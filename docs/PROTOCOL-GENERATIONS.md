# Four generations of threshold ECDSA

Antelope account authorities accept ECDSA on secp256k1 (K1) or secp256r1 (R1). They do not accept Schnorr or BLS. Schnorr is linear, so FROST can add partial signatures. ECDSA is not. The signing equation is

$$s = k^{-1}(m + r \cdot x) \bmod n$$

where \(r = (k \cdot G)_x \bmod n\) and \(m\) is the SHA-256 signing digest. Both \(k\) and \(x\) are secrets, and they are multiplied. You cannot hand each signer a Shamir share of \(x\) and ask them to sign locally. Someone would have to rebuild \(x\), or the signers need a multiplication protocol.

Rebuilding \(x\) is the custody failure. The museum in `src/museum.ts` does it on purpose over a tiny prime so the test can show the secret coming back.

## First generation — Paillier, and the attacks that followed

GG18 (9 signing rounds), GG20 (6 total rounds, 1 online), and Lindell17 (2-of-2) established trustless threshold ECDSA using Paillier homomorphic encryption for the multiplications. In 2023, Alpha-Rays, BitForge, and TSSHOCK showed that unhardened implementations across more than 15 wallet providers leaked full private keys. The missing pieces were Paillier biprimality checks, no-small-factor proofs, and MtA range proofs.

Modern repositories keep GG18 and GG20 as historical lessons. They are not active signing engines.

## Second generation — CGGMP21 / CGGMP24

Canetti, Gennaro, Goldfeder, Makriyannis, and Peled (ePrint 2021/060, revised October 2024) hardened the Paillier line with a full zero-knowledge suite: \(\Pi_{\mathrm{mod}}\), \(\Pi_{\mathrm{fac}}\), \(\Pi_{\mathrm{enc}}\), \(\Pi_{\mathrm{aff-g}}\). The design is UC-secure against a dishonest majority, with 3 offline preprocessing rounds plus 1 non-interactive online round, proactive refresh, and identifiable abort in the specification.

Even this lineage had November 2025 disclosures (CVE-2025-66016 and CVE-2025-66017). A paper omission in a ZK check can still enable key recovery, and presignatures degrade if they are reused with raw-digest signing or BIP-32 additive derivation. The LFDT-Lockness `cggmp24` crate at or after 0.7.0-alpha.2 patches those two CVEs. It must be built with the `num-bigint` backend. The `backend-rug` feature pulls LGPL GMP and is not used here.

## Third generation — DKLs23 and Cait-Sith

DKLs23 (Doerner, Kondi, Lee, and Shelat; IEEE S&P 2024, ePrint 2023/765) removes Paillier and RSA assumptions. It is UC-secure against a dishonest majority in 3 interactive rounds (or 2 amortized when pipelined) via 2-round vectorized multiplication over oblivious-transfer extensions. Vendor reports show large latency gains versus earlier DKLs variants and versus GG20, and clean WebAssembly execution without multi-minute Paillier setup.

Cait-Sith separates multiplication into key-independent committed Beaver triples \([a]\), \([b]\), \([c = ab]\). It is used in NEAR's Chain Signatures network. Periodic proactive refresh had not been enabled in that deployment because refreshing invalidates cached presignatures.

0xCarbon's `dkls23-*` crates at 0.6.2 are dual-licensed MIT/Apache-2.0 and support both K1 and R1. They are not compiled in this course.

## Fourth generation — 2025–2026 class-group protocols

Trout (ACM CCS 2025, ePrint 2025/1666) gives 2-round threshold ECDSA from class groups, with a constant-time Rust implementation benchmarked up to 100 parties. Lyu, Li, Zhou, and Deng (ePrint 2025/1696, submitted as Twig to NIST IR 8214C) achieve 2-round threshold-optimal ECDSA via non-interactive multiplication over class groups, with a minimal 2-generator transparent setup and transcript-derived nonce re-randomization.

These are research. Antelope account authorities do not yet accept a signature format that would let a chain verify a class-group threshold scheme natively. An account that later wants to move would do so with `eosio::updateauth`, without transferring balances.

## What this course runs

None of the engines. The tests lock the K1 canonical byte rule, one published public-key checksum, one Jungle 4 signing digest, WharfKit recovery of the published vectors, and a policy gate. The educational threshold engine in `src/threshold.ts` walks DKG and presign and then refuses to sign.
