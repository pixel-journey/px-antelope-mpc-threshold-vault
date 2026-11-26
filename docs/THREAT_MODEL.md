# Threat model

This file is the boundary of the lab, not a claim that a wallet was reviewed.

## In scope of the tests

| Threat | What the test does |
| --- | --- |
| K1 canonical rejection | Counts the byte rule exactly (32640/65536 per component). |
| Recovery id not flipped after low-S | `normalizeLowS` flips `recid` when `s > n/2`. |
| Signing the wrong chain | Jungle 4 packed bytes change digest when the chain id changes. |
| Trusting a preimage-free digest | Digest requires chain id + packed tx. Plugin refuses `claimedDigestHex`. |
| Model-proposed `updateauth` / mainnet | Policy refuses; audit line written. |
| Memo as second channel for an account | Dotted name in memo refused. |
| Reused nonce | Fixture scalar recovered in museum (not a deployed key). |
| Delimiter-free hashing | Concat collision vs length-prefix. |
| Forbidden licenses in manifest | `package.json` scanned for banned names. |
| Presign reuse / bad-s retry | Queue marks used; bad `s` burns slot. |
| Operator “accidentally” opens mainnet | `extraLabChainIds` strips mainnet ids; lab signer strips them too. |
| MCP tool over-reach | Specs mark which tools may produce lab sigs; no `sign_digest` tool. |

## Out of scope

- A real DKLs23 or CGGMP24 ceremony, identifiable abort, or share refresh protocol.
- Paillier range proofs / concrete CVE-2025-66016 PoK (upstream, not a dependency).
- Side channels, constant-time arithmetic, or zeroization of a real share (there is no share).
- WebAuthn PRF, IndexedDB, Vault, enclaves, or a **running** WebSocket relay ([RELAY.md](RELAY.md) is design only).
- Malicious peer messages or broadcast authenticity.
- Nodeos itself — the canonical rule matches #6699; not verified by pushing a transaction.
- Mainnet value — default and hard path refuse mainnet chain ids.

## Custody picture, if a later repo builds a signer

A 2-of-3 only helps when no single process can open the other shares. Browser share, co-signer, and offline recovery are three places. An agent permission must be `linkauth`-scoped, not full `active`. The relay is untrusted: ciphertext + authenticated sender, never plaintext shares.

## Entropy

Do not seed a nonce from a transaction id, block id, or `orng.wax` result. Those are public.

## Kill switch

`createPolicy().kill()` is in-memory. Production needs a cold-owner `updateauth` / `unlinkauth` ready offline. That transaction is not built here.

## Operator expansion is not a security boundary relaxation

`extraLabChainIds` only adds **testnets**. Lab signatures on those chains still sign a **proposal id**, not a node-accepted Antelope digests of a packed transfer. Nothing is broadcast from this course.
