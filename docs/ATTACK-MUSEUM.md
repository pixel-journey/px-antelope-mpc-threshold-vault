# Attack museum

These are failures that have happened in real threshold ECDSA deployments, or Antelope-specific traps that break naive adapters. The course demonstrates some on fixtures it creates. It does not demonstrate others that would require compiling vulnerable engines.

## Boss fight: Antelope K1 `is_canonical`

Every 65-byte `SIG_K1_` must pass nodeos’s inherited BitShares/Steem check (`elliptic_secp256k1.cpp`, still open as EOSIO/eos#6699):

- `r` and `s` each need the high bit clear in byte 0
- neither may start with `0x00` followed by a second byte `< 0x80`

Restricting `s` is similar to a tight low-S rule. Restricting **`r` has no cryptographic necessity** — and `r = (k·G)_x mod n` cannot be mutated after the distributed nonce is fixed. On a single CPU, retrying local nonces is cheap. Over a WAN MPC quorum, re-running multi-round protocols multiplies latency.

Published uniform-byte model (locked in `src/canonical.ts`):

| Model | Pass / total | Rate |
| --- | --- | --- |
| One 32-byte component | 32640 / 65536 | ~49.80% |
| Both `r` and `s` | 65025 / 262144 | ~24.80% pass → **75.20% fail** |
| Expected draws per success | ≈ 4.031 | |
| After offline r-filter + online low-S stand-in | 32640 / 32768 | **~99.61%** |

**Architectural rules this course teaches:**

1. For K1 with presignatures: filter non-canonical `r` **offline**, zeroize and discard bad slots before enqueue.
2. Online: normalize to low-S and flip `recid ^= 1`. If the rare leading-zero `s` case still fails, **burn** that presignature and take a new one — never tweak the same nonce (HNP / lattice key recovery).
3. Prefer **R1** (`secp256r1`) when first-attempt online signing matters: Antelope’s R1 path enforces low-S only, so a correct low-S signature succeeds without the `r` trap. Keep K1 for legacy explorers and EVM/Bitcoin derivation.

See [K1-CANONICAL.md](K1-CANONICAL.md) and [ARCHITECTURE.md](../ARCHITECTURE.md).

## Nonce reuse

If the same ephemeral \(k\) is used for two different digests \(m_1\) and \(m_2\), the private key \(x\) is recoverable:

$$k = (m_1 - m_2)(s_1 - s_2)^{-1} \bmod n$$

$$x = r^{-1}(s_1 k - m_1) \bmod n$$

`src/museum.ts` builds a fixture with `@noble/curves` and recovers \(x\). The test locks that recovery. A threshold protocol must never reuse a nonce, and it must never take a nonce from a transaction id, a block id, or `orng.wax`.

## Low-S without recovery-id flip

Negating `s` sends the curve point `R` to `-R`, which inverts the parity of `R_y`. Forgetting `recid ^= 1` after low-S normalization makes nodeos recover an unrelated public key. `normalizeLowS` in `src/canonical.ts` locks the flip.

## Concatenation collisions

Hashing \(H(a || b)\) without length prefixes lets encodings collide. TSSHOCK showed that delimiter-concatenated Fiat–Shamir transcripts allowed this class of collision. The course demonstrates a small collision on strings it creates. Real engines must use injective encoding (length prefixes or a canonical serialization).

## Paillier proof gaps

Alpha-Rays, BitForge, and TSSHOCK showed that missing Paillier biprimality, no-small-factor, and MtA range proofs leaked keys across more than 15 wallet providers. CVE-2025-66016 and CVE-2025-66017 are later omissions in the CGGMP line. This course does not compile a Paillier engine. The hygiene check rejects the `insecure-assume-preimage-known` feature flag by name.

## Operational separation failures

Even a mathematically sound MPC offers zero protection when:

- one process can open two of three shares (browser + co-signer share co-located)
- the “relay” sees plaintext shares instead of ciphertext + authenticated sender ids
- an agent is granted `active` instead of a `linkauth`-scoped custom permission
- mainnet value is guarded by an unaudited orchestration of educational crates

Those are design rules in [THREAT_MODEL.md](THREAT_MODEL.md), not tests of a deployed wallet.

## What is not in the museum

BitForge smooth-modulus recovery, full TSSHOCK transcript attacks, and the CVE-2025-66017 raw-digest forgery require the vulnerable code. They are described so a reader knows what to look for in an audit. They are not re-implemented.
