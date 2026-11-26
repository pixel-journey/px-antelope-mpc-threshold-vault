# The K1 canonical check

Antelope's nodeos rejects a secp256k1 signature unless both the \(r\) and \(s\) components pass a legacy byte check. The check looks at the first two bytes of each 32-byte integer. For a uniform random 32-byte value, 32640 of 65536 first-two-byte pairs pass. Both components together pass on 65025 of 262144 draws. The other 197119 fail. That is a 75.202% failure rate, which people round to 75.20%, and \(262144 / 65025\) is about 4.031 draws per success.

This is a byte model. It is not a measurement of a live WAN ceremony.

## What fails

A signature whose \(r\) or \(s\) has a high bit set in the first byte, or too many leading zero bits, is rejected. A signer that produces a uniformly random \(s\) will hit this often. A threshold protocol that produces a fresh \(s\) on every attempt will therefore retry.

## Low-S and the recovery-id flip

ECDSA signatures are valid for both \(s\) and \(n - s\). Antelope, like Bitcoin, prefers the low \(s\). If a signer produces a high \(s\), it must replace \(s\) with \(n - s\) and flip the recovery id with XOR 1. Flipping \(s\) alone produces a signature that recovers the wrong key.

## r-filtering

If the offline presignature stage discards any presignature whose \(r\) would fail the canonical check, the online stage only has to normalize \(s\). That raises K1 online acceptance to roughly 99.61%. R1 does not have this byte check. An R1 signature that passes the low-S rule is accepted on the first attempt.

## What the tests lock

`src/canonical.ts` counts the passing first-two-byte pairs. The test expects exactly 32640. Do not change the count to match a rounded percentage. WharfKit 4.0.2 recovers the published K1 and R1 vectors in `src/wharfkit.test.ts`. The educational threshold engine marks K1 presignatures as r-filtered and then refuses to sign.
