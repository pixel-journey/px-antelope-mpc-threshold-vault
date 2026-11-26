# Threat model

This file is the boundary of the lab, not a claim that a wallet was reviewed.

## In scope of the tests

| Threat | What the test does |
| --- | --- |
| K1 canonical rejection | Counts the byte rule exactly. |
| Recovery id not flipped after low-S | `normalizeLowS` flips `recid` when `s > n/2`. |
| Signing the wrong chain | The Jungle 4 packed bytes change digest when the chain id changes. |
| Trusting a preimage-free digest | The digest function requires the chain id and the packed transaction. There is no `signDigest` export. |
| Model-proposed `updateauth` or mainnet transfer | The policy gate refuses them and writes an audit line. |
| Memo used as a second channel for an account | A dotted name in the memo is refused. |
| Reused nonce | A fixture scalar is recovered. The fixture is not a deployed key. |
| Delimiter-free hashing | `["ab","c"]` collides under concatenation and not under a length prefix. |
| Forbidden licenses in our own manifest | `package.json` is scanned for the banned names. |

## Out of scope

- A real DKLs23 or CGGMP24 ceremony, identifiable abort, or key refresh.
- Paillier range proofs, Jacobi checks, or the concrete CVE-2025-66016 proof of knowledge. Those live in the upstream crate, which is not a dependency.
- Side channels, constant-time arithmetic, or memory zeroization of a real share. There is no share.
- WebAuthn PRF, IndexedDB, HashiCorp Vault, enclaves, or a WebSocket relay.
- Malicious peer messages, abort identification, or broadcast authenticity.
- Nodeos itself. The canonical rule is implemented as published in #6699. It was not checked by sending a transaction.
- Mainnet value. The policy gate's default posture is to refuse mainnet chain ids even if someone passes one in.

## Custody picture, if a later repo builds a signer

A 2-of-3 only helps when no single process can open the other shares. The browser share, the co-signer, and the offline recovery file are three places. An agent permission is a fourth idea, and it must be a `linkauth`-scoped permission rather than `active`. The relay is untrusted: it should see ciphertext and an authenticated sender id, not plaintext shares. This repository does not implement that transport. Writing it down here is not the same as having it.

## Entropy

Do not seed a nonce from a transaction id, a block id, or an `orng.wax` result. Those are public. Game labs in this organization use them on purpose. This lab must not.

## Kill switch

`createPolicy().kill()` is an in-memory flag. A production gate would also have an owner transaction ready, `updateauth` or `unlinkauth`, signed by the cold authority. That transaction is not built here.
