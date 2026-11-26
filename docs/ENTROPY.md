# Entropy: games are public, keys are not

Pixel Journey uses transaction ids and block data as a public, checkable source of randomness for games. That is the right tool when everyone must be able to recompute the draw. It is the wrong tool for a signing nonce or a distributed key generation.

A nonce \(k\) that an observer can guess, or that is reused, reveals the private key. `orng.wax` is a WAX contract. It is not a general Antelope service, and it is not a CSPRNG. A block id is public the moment it exists. A transaction id is a hash of the transaction you are already signing, which means it is determined by the message, not by secret dice.

## Where MPC randomness comes from

Each party draws at least 128 bits from the operating system or from WebCrypto (`crypto.getRandomValues` in a browser, the OS CSPRNG in Rust via `getrandom`). The draws stay on that party. They are not logged, and they are not sent to the model.

This course's educational engine uses `crypto.randomUUID()` only for **opaque tokens**, not for ECDSA nonces. It does not sign.

## What the tests show

[src/museum.ts](../src/museum.ts) recovers \(x\) from two signatures that share \(k\):

\[
k = (m_1 - m_2)(s_1 - s_2)^{-1} \bmod n,\quad
x = r^{-1}(s_1 k - m_1) \bmod n
\]

That is Principle #3: never seed MPC nonces from tx/block hashes or `orng.wax`. Presignatures are single-use ([PRESIGNATURES.md](PRESIGNATURES.md)).

## What to zero

Ephemeral scalars and share bytes should be overwritten when the round ends. In TypeScript that is filling the `Uint8Array` with zeros and dropping the reference. In Rust it is a zeroize-on-drop type. A process crash can still leave them in a swap file. That is one reason a share should not be the only share.

## Hardware enclaves

A trusted execution environment can hold **one** share. It should not hold enough shares to sign alone. Researchers have shown that some attestation designs fail against a physical interposer plus a privileged host. If the enclave is breached, the loss should be one share, which is below the threshold. The other shares stay outside it.

The public-randomness lab is [px-orng-v3-randnotify-starter](https://github.com/pixel-journey/px-orng-v3-randnotify-starter). Use it for games. Do not import it into a signer.

[ATTACK-MUSEUM.md](ATTACK-MUSEUM.md) · [THREAT_MODEL.md](THREAT_MODEL.md)
