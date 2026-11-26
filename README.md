# Antelope MPC, without a mainnet signer

> **Status:** educational reference. Unaudited. Testnet discussion only.  
> **What `npm test` does:** locks the K1 canonical byte rule, one published public-key checksum, one Jungle 4 signing digest, WharfKit 4.0.2 recovering the same keys, a policy gate, and two museum calculations.  
> **What it does not do:** threshold signing, WebAssembly, a custom wallet plugin, a relay, a key share, or a broadcast.

Antelope already has a way to rotate a key without moving the assets: the account is a name, and `eosio::updateauth` changes who may act for it. An Ethereum address cannot do that, because the address is the key. Threshold ECDSA still matters here, because a single `SIG_K1_` or `SIG_R1_` hides the signer set and does not need an `eosio.msig` proposal for every game action. It does not replace the cold owner multisig. The cold owner is how you throw away a bad active key.

This repository is the reading course and the byte-level lab for that idea. It is not a custody product. No public audit of the engines named below was repeated in this repository, and a custom orchestration of those engines should not hold mainnet value.

## Read in this order

| Doc | What it is |
| --- | --- |
| [EDUCATION.md](EDUCATION.md) | The course: permissions, the four protocol generations, the K1 trap, the policy gate |
| [docs/CURRICULUM.md](docs/CURRICULUM.md) | Eight levels, and which of them this repo actually runs |
| [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) | What the tests refuse, and what they cannot prove |
| [docs/LICENSES.md](docs/LICENSES.md) | Why this course stays MIT, and why WharfKit (BSD-3-Clause) is the client we depend on |

| [docs/SOURCES.md](docs/SOURCES.md) | Primary sources, and what was rechecked here |

```bash
npm test
```

Fifteen tests. Node 22 was used when they were last run. `@wharfkit/antelope` and `@wharfkit/session` are pinned at **4.0.2** (BSD-3-Clause). `@noble/curves` is used only inside the nonce-reuse fixture.

## The number the tests lock

For uniform random bytes, one 32-byte integer passes Antelope's K1 canonical check on **32640 of 65536** first-two-byte pairs. Both `r` and `s` together pass on **65025 of 262144** draws. The other **197119** fail. That failure rate is **75.202%**, which is the figure people round to 75.20%, and `262144 / 65025` is about **4.031** draws per success.

That count is a byte model. It is not a measurement of a WAN signing ceremony, and it is not a measurement of integers reduced modulo the curve order.

## WharfKit is the client

On Antelope, the library to teach is WharfKit, not eosjs and not UAL. `SessionKit` takes the chain list and the wallet plugins, `login` returns a session, and `session.transact` sends. This course constructs a `SessionKit` for WAX Testnet and Jungle 4 with **no** wallet plugin and does not call `login` or `transact`.

`@wharfkit/session` 4.0.2 re-exports the antelope types. The tests use that one copy:

- `PublicKey` matches Vector 1, including the legacy `EOS` string.
- `Transaction.signingDigest` matches the Jungle 4 digest our own SHA-256 computes.
- `Signature.recoverDigest` returns the published K1 key and the published R1 key for those vectors.
- `Authority.sort()` orders keys the way `updateauth` requires.

The blueprint named WharfKit 4.0.1. The registry's current 4.x line on 26 November 2026 was **4.0.2**, and 4.0.2 still recovers those vectors, so the pin is 4.0.2. Bump `@wharfkit/antelope` and `@wharfkit/session` together when a newer 4.x is what you want students to install. Do not add `@wharfkit/wallet-plugin-wombat`. The license map is [docs/LICENSES.md](docs/LICENSES.md). MIT on our notes does not stop that: WharfKit is BSD-3-Clause, which an MIT course may depend on. AGPL and non-commercial engines stay as links, not as files in this tree.

## Engines named, and not imported

| Engine | Why it is on the reading list | Why it is not in this package |
| --- | --- | --- |
| [0xCarbon/DKLs23](https://github.com/0xCarbon/DKLs23) v0.6.2 | 3-round threshold ECDSA, MIT or Apache-2.0, K1 and R1 crates published with that tag | Not compiled here. Treat it as unaudited for mainnet use unless you have read an audit yourself. |
| [LFDT-Lockness/cggmp24](https://github.com/LFDT-Lockness/cggmp21) | 1 online round after preprocessing. [CVE-2025-66016](https://www.cve.org/CVERecord?id=CVE-2025-66016) says versions before 0.6.3 miss a ZK check, and recommends 0.7.0-alpha.2 or newer for the extra checks. | Not compiled here. Do not enable a `backend-rug` feature. Do not enable `insecure-assume-preimage-known`. |
| silence-laboratories/dkls23 | A different codebase, with a non-commercial license | Forbidden in an MIT Pixel Journey repo |
| entropyxyz/synedrion | AGPL-3.0 | Forbidden here for the same reason |

`npm test` scans `package.json` for those names.

## Lab chain ids

Defaults, if you later build a signer, stay on testnets:

| Network | Chain id |
| --- | --- |
| WAX Testnet | `f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12` |
| Jungle 4 | `73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d` |

WAX mainnet, Vaulta (`aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906`), and Telos mainnet are in the source as ids the policy gate refuses. `@wharfkit/session` 4.0.2 also carries Telos Testnet, Proton, Proton Testnet, and UX. Those ids are now read from `Chains` in the tests. The policy gate still does not select them. Proton and XPR are the same chain id in that package. Vaulta and EOS are the same chain id.

## Related courses

- [wax-multi-sig-proposal-builder-and-simulator](https://github.com/pixel-journey/wax-multi-sig-proposal-builder-and-simulator) is the on-chain `eosio.msig` lab. MPC does not replace it.
- [wax-permission-visualizer-and-editor](https://github.com/pixel-journey/wax-permission-visualizer-and-editor) is the permission-tree lab. `updateauth` and `linkauth` live there as previews, not as a broadcast.
- [wax-wharfkit-session-keys-and-linked-permissions](https://github.com/pixel-journey/wax-wharfkit-session-keys-and-linked-permissions) is the session-key lab. A session key is not a threshold share.
- [px-orng-v3-randnotify-starter](https://github.com/pixel-journey/px-orng-v3-randnotify-starter) is WAX RNG. A transaction id is not a source of MPC nonces.
- Official WAX RNG writeup: [create a WAX RNG smart contract](https://docs.wax.io/build/tutorials/create-wax-rng-smart-contract/rng_sample). `orng.wax` exists on WAX, not as a general Antelope service.

MIT. Pixel Journey.
