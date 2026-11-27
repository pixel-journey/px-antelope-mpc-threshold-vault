# Attack museum

Structured cards (also exported as `MUSEUM_CARDS` in [src/museum.ts](../src/museum.ts)). Executable demos only for **nonce reuse** and **transcript delimiter collisions** on throwaway numbers — never against live vendor binaries.

## Boss fight: Antelope K1 `is_canonical`

See [K1-CANONICAL.md](K1-CANONICAL.md). Offline r-filter + low-S + `recid ^= 1` + burn residual; prefer R1 when first-attempt online matters (~75% naive K1 fail under uniform-byte model).

## Cards

| ID | References | Extraction | Root cause | Mandatory fix | Repo invariant |
| --- | --- | --- | --- | --- | --- |
| alpha-rays | ePrint 2021/1621 | One signature | Small Paillier modulus / missing MtA range proof | N at least q^8; prover bound q^2, verifier q^3; MtAwc point binding | No Paillier engine |
| bitforge-gg | CVE-2023-33241 | About 16 signatures | Smooth modulus, about 2^16 factors | Paillier-Blum and primes above 2^256 | Documented only |
| bitforge-lindell | CVE-2023-33242 | About 1 bit per failed request | Abort path not paper-compliant | Spec-accurate aborts; leave Lindell17 | No Lindell17 |
| tssshock-transcript | CVE-2022-47931 / CVE-2023-26556 | `$` collision; DLN k=1 is about 50% | Ambiguous Fiat-Shamir join; too few DLN rounds | Length prefix; k at least 80 | `taggedHash` and `$` demo |
| nonce-reuse | Classical HNP | Two signatures | Reused ephemeral k | CSPRNG only; never chain entropy | `recoverFromReusedNonce` |
| safe-prime-dln | KS-BTL-F-03 | Pohlig-Hellman on a smooth order | Generic RSA primes | Safe primes only | No DLN code |
| cggmp-66016 | CVE-2025-66016 | Malicious-signer key recovery | Missing Jacobi check in aux keygen | cggmp24 at least 0.7.0-alpha.2 if an engine is ever added | `deny.toml` bans `cggmp21` |
| cggmp-66017 | CVE-2025-66017 | Forgery on a known R; HD security drops | Presign plus raw digest, or presign plus BIP-32 | No `sign_digest` tool; no insecure preimage flag | MCP + hygiene |
| audit-pq-2026 | CBS-02-004; Bron Oct 2026; ia.cr/2026/1386 | Subgroup skip, operand swap, TALUS v1 leakage | Missing subgroup checks; non-hiding lattice commitments | Subgroup checks; rotation caps | No PQ engine; [POST-QUANTUM.md](POST-QUANTUM.md) |
| ops-ai-bypass | Multichain; Web3Auth/Keplr; Freysa; AIXBT; TDX | Often no crypto break | Shared host, SSO custody, prompt injection, forged TEE | Independent shares; passkey PRF; linkauth; TEE is one share below t | Gate + readiness |

### Executable demos

```ts
import {
  recoverFromReusedNonce,
  dollarDelimiterCollides,
  taggedHash,
  smashedHash,
  MUSEUM_CARDS,
} from "./museum.js";

dollarDelimiterCollides(); // true — why "$" join is unsafe
taggedHash(["ab", "c"]) !== taggedHash(["a", "bc"]);
MUSEUM_CARDS.map((c) => c.id);
```

Nonce reuse recovers `x` from two signatures with the same `k`:

\\[
k = (m_1 - m_2)(s_1 - s_2)^{-1} \bmod n,\quad
x = r^{-1}(s_1 k - m_1) \bmod n
\\]

Never seed MPC nonces from tx/block hashes or `orng.wax` ([ENTROPY.md](ENTROPY.md)).

Reported dollar figures for the operational incidents are third-party writeups. This course does not re-verify them. The invariant is the control, not the headline number.

## Parameters the papers name

| Card | What to enforce if an engine is ever added |
| --- | --- |
| Alpha-Rays | Paillier N at least q^8. MtA range proof: prover bound q^2, verifier bound q^3. Bind the EC point in MtAwc. |
| BitForge GG | Reject a smooth modulus. Require a Paillier-Blum proof and a no-small-factors proof (primes above 2^256) before any MtA. |
| BitForge Lindell | Abort exactly as the paper does. Do not ship Lindell17 as the lab engine. |
| TSSHOCK | Injective length prefix (8-byte little-endian or an equivalent tagged digest). Domain-separate the transcript. DLN soundness repetitions at least 80, preferably 128. k = 1 is a coin flip. |
| Safe primes | DLN / Pedersen groups use p = 2q + 1 only. |
| CVE-2025-66016 | The omitted check is the Jacobi symbol J(w, N) = -1 in the Paillier-Blum aux proof (CGGMP21 Fig. 16). The named fix lineage is cggmp24 at least 0.7.0-alpha.2. |
| CVE-2025-66017 | Do not sign a raw prehash with a presignature, and do not combine presignatures with BIP-32 the way that drops a 128-bit target toward 85 bits. This repo has no `sign_digest` tool. |
| 2026 audits | Subgroup membership on refresh (CBS-02-004). Do not panic on a peer's bytes; do not swap Lindell17 DKG operands (Bron). TALUS v1 lattice commitments are not hiding (ia.cr/2026/1386) — rotation caps, no PQ engine here. |

## Simulation is not inclusion

`compute_transaction` (and our offline fixtures) can miss state races. Pair with `linkauth` blast-radius caps and short `expiration`. See [src/simulate.ts](../src/simulate.ts).

## What is not re-implemented

Full BitForge modulus recovery, live TSSHOCK against a vendor binary, and CVE-2025-66017 against a real presign API require vulnerable code. Described for auditors only — not reproduced here.

[PROTOCOL-GENERATIONS.md](PROTOCOL-GENERATIONS.md) · [THREAT_MODEL.md](THREAT_MODEL.md) · [ENGINE.md](ENGINE.md)
