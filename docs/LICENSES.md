# What MIT allows, and what it does not

Our files are MIT because a student, a teacher, or another chain's teaching repo should be able to fork the notes and the tests without asking. MIT does not relicense anybody else's code. It also does not make a non-commercial or copyleft library safe to drop into this tree.

Teaching a library, linking to it, and describing what it replaces are fine under every license below. Copying its source into this repository is a separate act. Do that only when the upstream license says the copy may be shipped inside an MIT project.

## Use these

| Piece | License | What to do |
| --- | --- | --- |
| This course (`src/`, the markdown, the tests) | MIT | Fork it. Keep the copyright notice. |
| `@wharfkit/antelope` and `@wharfkit/session` **4.0.2** | BSD-3-Clause | Depend on them. This is the Antelope client to teach. BSD-3 is compatible with MIT if the WharfKit copyright and the "no endorsement" sentence stay in `node_modules` and in any redistribution of their files. Do not claim you wrote WharfKit. |
| 0xCarbon `dkls23-*` 0.6.2, and LFDT-Lockness `cggmp24` at or after 0.7.0-alpha.2 | MIT or Apache-2.0, dual | A later lab may depend on them. Apache-2.0 wants its NOTICE kept. Do not turn on `backend-rug` (LGPL GMP). They are not dependencies of this course yet, because we do not compile a threshold ceremony. |
| `eosio.msig`, `updateauth`, `linkauth` | Protocol, not a package | The cold path. WharfKit is how you pack those actions. They do not replace each other. |

`npm view` on 26 November 2026 reported `@wharfkit/antelope` **4.0.2** as current. The blueprint named 4.0.1. The tests pin **4.0.2**, the newer release that still recovers the same vectors. When a later 4.x appears, bump `@wharfkit/antelope` and `@wharfkit/session` together and re-run `npm test`. Do not stay on 4.0.1 out of habit, and do not mix two major lines in one install.

## Describe these, do not vendor them

| Piece | License | Why it stays upstream | What it can replace |
| --- | --- | --- | --- |
| [silence-laboratories/dkls23](https://github.com/silence-laboratories/dkls23) | Custom SLL, non-commercial | A Trail of Bits review does not grant a right to ship the code in an MIT product. A company that wants that tree buys a commercial license and keeps it in their own repository. | The 0xCarbon DKLs23 crates, when the reason you wanted Silence was the audit rather than the algorithm. The algorithm is the same paper. The license is the difference. |
| [entropyxyz/synedrion](https://github.com/entropyxyz/synedrion) | AGPL-3.0 | AGPL can sit in its own repository, including a class fork that stays AGPL. Copying it into this MIT repo, or linking it into a program we ship under MIT, is the opposite of what AGPL asks. | A Paillier-style CGGMP implementation for people who are prepared to release their whole service's source. It does not replace WharfKit. |
| `cggmp24` feature `backend-rug` | Pulls LGPL GMP | LGPL in a statically bundled WASM binary is a mess we do not need. The `num-bigint` backend is the MIT/Apache one. | Nothing. It is an optional arithmetic backend, not a better protocol. |
| eosjs, Universal Authenticator Library, Scatter | Legacy clients | They still appear in old tutorials. New Antelope apps should use WharfKit `SessionKit`: chains, wallet plugins, then `login`, then `transact`. | WharfKit replaces them. They do not replace WharfKit. |
| `@wharfkit/wallet-plugin-wombat` | Archived | The wallet's domain lapsed and the plugin was archived in 2026. | A current Anchor (or equivalent) wallet plugin, or a plugin you write against `AbstractWalletPlugin`. This course's `SessionKit` is constructed with an empty plugin list on purpose. |

## How the pieces fit

```text
student or wallet
    SessionKit  (@wharfkit/session 4.0.2, BSD-3-Clause)
        packs the transaction, sorts the authority, hashes chain_id || packed_tx || cfd
    optional later: threshold engine (MIT or Apache-2.0 crates only)
        produces one SIG_K1_ or SIG_R1_
    owner permission
        eosio.msig or a hardware 2-of-3, rotated with updateauth
```

A model, an MCP tool, or a skill may propose an action. It does not get a share and it does not pick the license of the signer. If a class wants to study the AGPL engine, clone that repository beside this one. Do not merge the trees.

The check in `src/hygiene.ts` only rejects those names inside our manifests. The words appear in this file because naming a license is how you teach it.
