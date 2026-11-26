# The K1 canonical check

Antelope's nodeos rejects a secp256k1 signature unless both the \(r\) and \(s\) components pass a legacy byte check inherited from BitShares/Steem (EOSIO/eos#6699 documents it and asks for removal; it still applies).

The check looks at the **first two bytes** of each 32-byte integer. For a uniform random 32-byte value, **32640 of 65536** first-two-byte pairs pass. Both components together pass on **65025 of 262144** draws. The other **197119** fail. That is a **75.202%** failure rate under the uniform-byte model, and \(262144 / 65025\) is about **4.031** draws per success.

This is a **byte model**. It is not a measurement of a live WAN ceremony.

## What fails

A 65-byte compact signature is `[header | r(32) | s(32)]`. A component fails when:

- the high bit of the first byte is set, or
- the first byte is `0x00` and the second byte has its high bit clear ("too many leading zero bits" class).

A signer that produces a uniformly random \(s\) will hit this often. A threshold protocol that produces a fresh \(s\) on every attempt will therefore retry — unless it filters offline.

## Low-S and the recovery-id flip

ECDSA signatures are valid for both \(s\) and \(n - s\). Antelope, like Bitcoin, prefers the low \(s\). If a signer produces a high \(s\), it must replace \(s\) with \(n - s\) and flip the recovery id with **`recid ^= 1`**. Flipping \(s\) alone produces a signature that recovers the **wrong** key.

Implemented in `normalizeLowS` in [src/canonical.ts](../src/canonical.ts).

## r-filtering (presign queue)

If the offline presignature stage discards any presignature whose \(r\) would fail the canonical check, the online stage only has to normalize \(s\). That raises K1 online acceptance to roughly **99.61%** (leftover is mostly the leading-zero case on \(s\)).

**R1 does not have this byte check.** An R1 signature that passes the low-S rule is accepted on the first attempt. Prefer R1 for zero-retry online when legacy K1 is not required ([src/curve.ts](../src/curve.ts)).

Queue policy: [src/presign.ts](../src/presign.ts) · [PRESIGNATURES.md](PRESIGNATURES.md).

## Ops checklist for a real co-signer

1. Offline: reject non-canonical \(r\) before the user is waiting.  
2. Online: low-S normalize and **always** flip `recid` when \(s\) is reflected.  
3. If still non-canonical after normalize → **burn** the presign slot; start a **new** nonce — never tweak \(k\).  
4. Do not use public chain entropy for \(k\) ([ENTROPY.md](ENTROPY.md)).

## What the tests lock

| Fact | Location |
| --- | --- |
| Exactly 32640 passing first-two-byte pairs | `countCanonicalFirstTwoBytes` |
| `CANONICAL_COUNTS` constants | `canonical.ts` + `testdata/vectors.json` |
| Rust R.1 parity | `crates/antelope-crypto-format` |
| WharfKit 4.0.2 recovers published K1/R1 vectors | `wharfkit.test.ts` |
| Educational engine marks K1 presign `rFiltered` then refuses sign | `threshold.ts` |

Do not change the count to match a rounded percentage.
