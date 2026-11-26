# Post-quantum and what Antelope can verify today

Antelope account authorities accept ECDSA on K1 or R1, and WebAuthn (which is also P-256). They do not accept BLS, Schnorr, or any post-quantum signature scheme. Savanna finality uses BLS12-381 aggregate votes for blocks. That is a consensus mechanism, not an account permission.

## What would have to change

A post-quantum account permission would need a new key type and a new signature type that nodeos can recover and check. Until that exists, an account that wants to move away from ECDSA does so with `eosio::updateauth`. The account name, the token balance, and the NFTs stay. Only the authority changes.

Telos launched an experimental Quantum Testnet in October 2026 to test post-quantum account migration. That is a testnet. It is not a mainnet authority type.

## Threshold schemes that are not ECDSA

FROST (RFC 9591) is a threshold Schnorr scheme. It is the right tool for Bitcoin Taproot and for chains that accept Schnorr. It is not a drop-in replacement for an Antelope authority. Mithril, TALUS, and ML-DSA threshold constructions are research or other-chain tools. They do not produce a `SIG_K1_` or `SIG_R1_`.

## What this course does

It locks the ECDSA digest and the K1 canonical rule, and it refuses to sign. It does not implement a post-quantum scheme, and it does not claim that one is ready for an Antelope account.
