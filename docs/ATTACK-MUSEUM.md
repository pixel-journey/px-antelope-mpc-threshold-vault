# Attack museum

These are failures that have happened in real threshold ECDSA deployments. The course demonstrates two of them on fixtures it creates. It does not demonstrate the others, because demonstrating them would require compiling the vulnerable engines.

## Nonce reuse

If the same ephemeral \(k\) is used for two different digests \(m_1\) and \(m_2\), the private key \(x\) is recoverable from the two signatures:

$$k = (m_1 - m_2)(s_1 - s_2)^{-1} \bmod n$$

$$x = r^{-1}(s_1 k - m_1) \bmod n$$

`src/museum.ts` builds a fixture with `@noble/curves` and recovers \(x\). The test locks that recovery. A threshold protocol must never reuse a nonce, and it must never take a nonce from a transaction id, a block id, or `orng.wax`.

## Concatenation collisions

Hashing \(H(a || b)\) without length prefixes lets \([a, b]\) collide with \([a, \$b]\) under certain encodings. TSSHOCK showed that delimiter-concatenated Fiat–Shamir transcripts allowed this class of collision. The course demonstrates a small collision on strings it creates. Real engines must use injective encoding (length prefixes or a canonical serialization).

## Paillier proof gaps

Alpha-Rays, BitForge, and TSSHOCK showed that missing Paillier biprimality, no-small-factor, and MtA range proofs leaked keys across more than 15 wallet providers. CVE-2025-66016 and CVE-2025-66017 are later omissions in the CGGMP line. This course does not compile a Paillier engine. The hygiene check rejects the `insecure-assume-preimage-known` feature flag by name.

## What is not in the museum

BitForge smooth-modulus recovery, full TSSHOCK transcript attacks, and the CVE-2025-66017 raw-digest forgery require the vulnerable code. They are described here so a reader knows what to look for in an audit. They are not re-implemented.
