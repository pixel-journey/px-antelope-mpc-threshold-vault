# Attack museum

Failures from real threshold ECDSA deployments and Antelope-specific traps that break naive adapters. Some are locked on fixtures in this repo. Others are **described only** so readers know what to demand in an audit — they are not re-implemented.

Executable demos: `src/museum.ts` (nonce reuse, concat collision), `src/canonical.ts` + `src/presign.ts` (K1 gauntlet).

## Boss fight: Antelope K1 `is_canonical`

Every 65-byte `SIG_K1_` must pass nodeos’s inherited check (EOSIO/eos#6699):

- high bit clear on byte 0 of `r` and of `s`
- neither may be `0x00` followed by a second byte `< 0x80`

`r` cannot be edited after the distributed nonce is fixed. WAN retries are expensive.

| Model | Pass rate (uniform bytes) |
| --- | --- |
| Both `r` and `s` naive | ~24.80% pass → **75.20% fail** |
| Offline r-filter + online low-S | **~99.61%** |
| Leftover leading-zero `s` | Burn presign; never tweak `k` |
| R1 (low-S only) | Preferred for first-attempt online |

Rules: offline filter → low-S + `recid ^= 1` → burn on residual fail. See [K1-CANONICAL.md](K1-CANONICAL.md), [PRESIGNATURES.md](PRESIGNATURES.md).

## Nonce reuse (Hidden Number Problem)

Same ephemeral \(k\) on two digests recovers \(x\):

$$k = (m_1 - m_2)(s_1 - s_2)^{-1} \bmod n,\quad x = r^{-1}(s_1 k - m_1) \bmod n$$

Locked in `src/museum.ts`. Never seed nonces from tx ids, block ids, or `orng.wax` ([ENTROPY.md](ENTROPY.md)).

## Low-S without recovery-id flip

Negating `s` maps `R → -R`. Forgetting `recid ^= 1` recovers the wrong key. `normalizeLowS` locks the flip.

## Concatenation / transcript collisions

Bare `H(a||b)` allows ambiguous encodings. TSSHOCK-class bugs used weak Fiat–Shamir transcript framing. Course shows a tiny string collision; real engines need length prefixes or canonical serialization.

## Paillier and CGGMP lineage (reading map)

| Name | Lesson |
| --- | --- |
| **BitForge** (incl. CVE-2023-33241 / 33242 class) | Missing biprimality / abort handling in GG-style stacks leaked keys across many wallets |
| **Alpha-Rays** | MtA range-proof gaps |
| **TSSHOCK** | Transcript delimiter / parameter-choice failures |
| **CVE-2025-66016** | Missing ZK/Jacobi-style check in older CGGMP builds — upgrade lineage (≥ 0.7.0-alpha.2 guidance upstream) |
| **CVE-2025-66017** | Presignature misuse with raw digests / additive derivation — **never** expose `sign_digest` or `insecure-assume-preimage-known` |

This course does not compile Paillier engines. `hygiene.ts` rejects banned license/feature strings in `package.json`.

## Operational separation failures

Sound math fails when:

- one process can open two of three shares
- the relay sees plaintext shares ([RELAY.md](RELAY.md))
- the agent holds `active` instead of `linkauth`-scoped `agent`
- mainnet value sits behind unaudited educational crates
- broadcast bypasses [src/broadcast.ts](../src/broadcast.ts)

## Prompt / tool poisoning (agent layer)

Even with a perfect co-signer:

- poisoned MCP tool descriptions can steer models toward wider tools
- memo / NFT metadata can carry indirect instructions — the gate must not treat memo as executable policy
- never add free-form recipient or `updateauth` tools “because the model asked”

See [MCP-TOOLS.md](MCP-TOOLS.md) and [AGENTIC-PAYMENTS.md](AGENTIC-PAYMENTS.md).

## What is not in the museum

Full BitForge modulus recovery, live TSSHOCK against a vendor binary, and CVE-2025-66017 forgery against a real presign API require vulnerable code. Described for auditors; not re-implemented here.
