# Education — threshold signatures on an account that is not a key

> **Rung:** `npm test` runs [src/course.test.ts](src/course.test.ts).  
> **The test is the rule** for the byte counts, the checksum, the digest, and the policy gate. Everything else in this file is reading, with a source next to it.

## What you should be able to do

| Level | After this file |
| --- | --- |
| Beginner | Say why an Antelope account can change its active key without moving an NFT |
| Intermediate | Predict whether a 65-byte K1 signature will pass `is_canonical`, and why R1 is different |
| Masterclass | Explain why a presignature must be thrown away on retry, and why a policy gate is not a prompt |

---

## Agentic payments

An agent that can pay on Antelope proposes a transfer, has that proposal checked by something that is not the model, and then produces a signature the network will accept. The signature is one 65-byte value. The network does not see how many parties helped produce it. That is why a threshold scheme is useful: the agent can hold one share, a policy service can hold another, and a human can hold the third.

See [docs/AGENTIC-PAYMENTS.md](docs/AGENTIC-PAYMENTS.md) for the loop, [docs/NETWORKS.md](docs/NETWORKS.md) for the chain ids, and [docs/WITHOUT-WHARFKIT.md](docs/WITHOUT-WHARFKIT.md) if the agent cannot load the WharfKit packages.

## Beginner — the account is the name

An Ethereum externally owned account is a hash of one public key. Lose that key, or share it, and the address moves with it. An Antelope account is a 12-character name. `owner`, `active`, and any custom permission are rows you can replace with `eosio::updateauth`. The NFTs and the token balance stay on the name.

That is the whole hybrid pattern:

- Put one day-to-day public key on `active`. If that key was produced by a threshold scheme, the chain still sees one `PUB_K1_` or `PUB_R1_` and one 65-byte signature.
- Put a cold 2-of-3 on `owner`, with keys that live on hardware or on a native `eosio.msig` board. If the active key is ever suspect, `owner` rotates it. Nothing is transferred.
- If a bot needs a narrower door, `eosio::linkauth` binds a custom permission to one contract action. The bot's key is not `active`.

Native multisig shows every signer on chain, costs RAM and CPU, and waits. A threshold signature hides the roster and finishes in the time your round protocol takes. Use the slow public one for the cold path. Use the fast private one, if you use it at all, for the hot path. Do not skip the cold path because the hot path feels modern.

This repository does not create either key.

### What threshold ECDSA is hard

Schnorr's signing equation is linear in the secret, which is why FROST (RFC 9591) can add partial signatures. BLS signatures add as well. Antelope's Savanna finality uses BLS12-381 for blocks. Antelope **account** authorities do not accept BLS or Schnorr. They accept ECDSA on secp256k1 (K1) or secp256r1 (R1), plus WebAuthn (WA) which is also P-256 and is not a place to store a threshold share.

ECDSA is `s = k^{-1} (m + r x) mod n`. Both `k` and `x` are secrets, and they are multiplied. You cannot hand each signer a Shamir share of `x` and ask them to sign locally. Someone would have to rebuild `x`, or the signers need a multiplication protocol (Paillier, oblivious transfer, or Beaver triples). Rebuilding `x` is the Level 1 anti-pattern. [src/museum.ts](src/museum.ts) reconstructs a toy secret on purpose so the test can show the secret coming back.

---

## Intermediate — four generations, as a map

The four generations are written out in [docs/PROTOCOL-GENERATIONS.md](docs/PROTOCOL-GENERATIONS.md). Short version:

These are papers and codebases to read. This course does not run them.

| Generation | What to remember | What not to ship |
| --- | --- | --- |
| GG18, GG20, Lindell17 | First Paillier threshold ECDSA. BitForge (2023) showed missing range and biprimality checks leaking keys across many wallets. | Do not start a new wallet on these. |
| CGGMP21 / CGGMP24 | Hardened Paillier proofs, offline preprocessing, one online round. [ePrint 2021/060](https://eprint.iacr.org/2021/060). | [CVE-2025-66016](https://www.cve.org/CVERecord?id=CVE-2025-66016) is a missing ZK check before 0.6.3. The advisory's own mitigation text says to move to cggmp24 0.7.0-alpha.2 or newer. A later advisory, CVE-2025-66017, is about misusing presignatures on raw digests and on BIP-32 tweaks. |
| DKLs23 | Drops Paillier. Three oblivious-transfer rounds. [ePrint 2023/765](https://eprint.iacr.org/2023/765). The 0xCarbon crates at v0.6.2 are MIT or Apache-2.0 and cover K1 and R1. | Not audited inside this repository. Do not confuse them with silence-laboratories/dkls23, which is a different license. |
| 2025–2026 two-round work | Trout ([ePrint 2025/1666](https://eprint.iacr.org/2025/1666)) and Twig ([ePrint 2025/1696](https://eprint.iacr.org/2025/1696)) use class groups to get two-round ECDSA. FROST remains the Schnorr tool for Solana and Bitcoin Taproot, not for an Antelope `active` key. | Research. Not an Antelope authority type. |

WebAuthn is a login, not a curve you threshold. A passkey can unlock a local share. The on-chain authority is still `PUB_K1_` or `PUB_R1_`.

---

## The K1 boss fight

`fc::ecc::public_key::is_canonical` rejects a compact K1 signature unless both `r` and `s` pass this byte test. [EOSIO/eos#6699](https://github.com/EOSIO/eos/issues/6699) states it and argues it should be removed. The check is:

```text
!(b[0] & 0x80) && !(b[0] == 0 && !(b[1] & 0x80))
```

applied to `r` and again to `s`.

`r` is the x-coordinate of the nonce point. After the nonce is fixed you cannot edit `r` without a new nonce. `s` can be replaced by `n - s`, but that mirrors the nonce point, so the recovery id's low bit has to flip (`recid ^= 1`). The test `normalizeLowS` locks that flip. Forgetting it recovers the wrong public key.

Consequences, under the uniform-byte model the tests count:

| Preparation | Success fraction | Locked ratio |
| --- | --- | --- |
| Fresh random `r` and `s` | 24.798% | 65025/262144 |
| `r` random, `s` only forced to a clear high bit | 49.604% | 65025/131072 |
| `r` already filtered, then low-S `s` | 99.609% | 32640/32768 |
| R1, if the only check is low-S and you normalize | the #6699 description says this is one correction, not a retry loop | not re-measured against nodeos here |

The 99.609% case still fails sometimes, on a leading zero in `s`. Burn that presignature and start a new one. Signing again with a tweaked nonce, or reusing a nonce on a second digest, is the Hidden Number Problem. The museum test recovers a fixture scalar `x = 0x11` from two digests that shared `k = 0x22`. That fixture is not an account.

R1 is attractive for a threshold lab because Antelope's R1 check, as #6699 describes it, is low-S only. K1 stays necessary anywhere a tool still assumes secp256k1, including a lot of explorers and any EVM derivation of the same share. Promoting R1 is a design note, not a claim that this repo produced an R1 signature.

---

## Checksums and the signing digest

Modern keys are `PUB_K1_` or `PUB_R1_` plus Base58 of the 33-byte compressed point and a 4-byte RIPEMD-160 checksum. The checksum covers the point **and** the ASCII suffix `"K1"` or `"R1"`. Legacy `EOS` keys checksum the point alone. Vector 1 in [src/codec.ts](src/codec.ts) is a published point this file re-encodes. Both strings match.

The signing digest is not the transaction id.

```text
tx_id      = SHA-256(packed_transaction)
sig_digest = SHA-256(chain_id || packed_transaction || cfd_hash)
```

`cfd_hash` is 32 zero bytes when there is no context-free data. The Jungle 4 packed transaction in [src/digest.ts](src/digest.ts) hashes to the published tx id `6eac401c…a655ba` and, with the Jungle 4 chain id, to sig_digest `c0a70da4…ee8a3`. The same bytes under the WAX Testnet chain id do not. A co-signer that accepts a naked digest from a model has already lost the ability to read the actions. CVE-2025-66017's class of bug is the same shape: a presignature promised for one message getting used on another.

WharfKit is the client to use. The tests import `@wharfkit/session` **4.0.2** (BSD-3-Clause), which re-exports `@wharfkit/antelope` at the same version. `Transaction.signingDigest(Chains.Jungle4.id)` equals the digest this course hashes by hand. `Signature.recoverDigest` returns `PUB_K1_6RrvujLQN1x5Tacbep1KAk8zzKpSThAQXBCKYFfGUYeACcSRFs` for the Jungle 4 K1 vector and `PUB_R1_7WVsSeomUhZL8FFHZWTLjBNJPxYuvEjjxuQRAq8hVaq768i8Wa` for the R1 vector. `Authority.sort()` puts the keys in the order nodeos expects before an `updateauth`.

The blueprint said 4.0.1. On 26 November 2026 the current tag was 4.0.2, and that tag still matches the vectors, so the course pins 4.0.2 rather than freezing the older patch. A `SessionKit` is constructed for the two lab chains with an empty wallet-plugin list. It does not log in. eosjs and UAL are the legacy path; they are not a second recommended stack. The license reasons are in [docs/LICENSES.md](docs/LICENSES.md). An MIT course may depend on BSD-3-Clause WharfKit. It may describe an AGPL or non-commercial engine. It may not copy those engines into this tree.

---

## Policy, models, and entropy

A model can propose. It cannot be the thing that holds a share or the thing that decides.

[src/policy.ts](src/policy.ts) is a local stand-in for that gate:

- chain id must be WAX Testnet or Jungle 4
- action must be `eosio.token::transfer`
- `updateauth`, `deleteauth`, `linkauth`, `unlinkauth`, `setcode`, and `setabi` are refused
- the recipient is an alias (`px-treasury`, `wax-faucet`, `test-peer`), not a free-typed account
- the amount is at most 10.0000 WAX
- the memo is printable ASCII, at most 64 characters, and may not carry an account name
- the proposal expires inside 120 seconds
- `kill()` refuses everything after that, and the refusal is an audit line

There is no MCP server in this repo. The Model Context Protocol does not make a tool safe. A poisoned tool description is still untrusted text. The gate above does not call a network, so it also does not prove a dry-run against a real node.

Entropy is the other boundary. Pixel Journey uses transaction ids as public, verifiable game seeds in other courses. Those values are a disaster as an MPC nonce or as a DKG coefficient. Nonces come from the operating system's CSPRNG. A public chain does not provide that.

A hardware enclave that holds one share is still one share. It is not a quorum.

---

## Masterclass — what a later implementation would still have to prove

If someone builds the engines for real, the bar is higher than this course:

1. Both crates compile without `backend-rug`, without AGPL, and without the non-commercial DKLs tree.
2. K1 presignatures are filtered before they are stored, and a failed online canonical check destroys that presignature.
3. Every signer packs the transaction, checks the chain id, and hashes the digest itself.
4. The process that speaks to a model never maps a share into that process.
5. `owner` can still rotate `active` with a native multisig if the co-signer disappears or the code is distrusted.
6. Someone who did not write the code publishes an audit before the key is on a mainnet account.

Until those exist, the honest statement is the one in the README: this is a course, the tests are the checks, and there is no signer.

### Predict, then run

```bash
npm test
```

You should see 23 passing tests. If a future edit changes the Jungle 4 vector, the WharfKit recovery, or the 32640 count, the edit is wrong or the rule being taught has changed. Do not "fix" the count to match a rounded percentage.
