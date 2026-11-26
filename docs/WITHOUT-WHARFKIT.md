# Signing without WharfKit

WharfKit is the client this course recommends for new Antelope apps. It is not the only way to pack a transaction and produce a signature. An agent that already has a key, or that is running inside a process that cannot load the WharfKit packages, can still talk to an Antelope node — if it gets the bytes right.

## What you still have to get right

The node does not care which library packed the transaction. It checks:

- The transaction was signed over `SHA-256(chain_id || packed_transaction || cfd_hash)`.
- The recovered public key satisfies the authority that authorized the action.
- The signature bytes pass the K1 canonical check (or the R1 low-S check).

If any of those are wrong, the transaction is rejected. WharfKit does those three things for you. Without it, you do them yourself.

## A minimal path

1. Build the action data (account, name, authorization, data).
2. Pack the transaction with the correct expiration, ref-block, and limits.
3. Compute the signing digest with the chain id of the network you are targeting. `src/digest.ts` and `crates/antelope-crypto-format` both implement this. Shared fixture: `testdata/vectors.json`.
4. Sign the digest with a key that is on the authorizing permission. Normalize low-S and flip `recid` when `s > n/2`. Filter K1 canonical bytes before you consider the signature done.
5. Attach the signature and, only on a **testnet**, push to `/v1/chain/push_transaction` after policy + dry-run + operator opt-in.

This course's `pushLabTransaction` is that last step for lab endpoints. It does not pack or sign for you. A lab `SIG_K1_` over a proposal id will not satisfy step 3.

## When you would skip WharfKit

- The agent runs in a language that does not have a current WharfKit binding (the R.1 Rust crate covers digest + canonical checks only).
- You are generating the signature inside a threshold ceremony that already has the digest and only needs to return 65 bytes (Phase R.2, not this tree).
- You are writing a one-off script that talks to a single known lab endpoint and does not need session restore or wallet-plugin UI.

In every other case, use `@wharfkit/session` 4.0.2. It already knows the chain ids, it sorts authorities, and it refuses to sign a transaction whose digest does not match the packed bytes.

## What this course does not ship

There is no second full client implementation here. The tests lock the digest and the canonical rule so that a non-WharfKit signer can be checked against the same vectors. If you write that signer, run it against the Jungle 4 packed transaction and confirm it produces a signature that `Signature.recoverDigest` turns back into the expected public key.

[K1-CANONICAL.md](K1-CANONICAL.md) · [RUST.md](RUST.md) · [PUSH.md](PUSH.md)
