# Signing without WharfKit

WharfKit is the client this course recommends for new Antelope apps. It is not the only way to pack a transaction and produce a signature. An agent that already has a key, or that is running inside a process that cannot load the WharfKit packages, can still talk to an Antelope node.

## What you still have to get right

The node does not care which library packed the transaction. It checks:

- The transaction was signed over `SHA-256(chain_id || packed_transaction || cfd_hash)`.
- The recovered public key satisfies the authority that authorized the action.
- The signature bytes pass the K1 canonical check (or the R1 low-S check).

If any of those are wrong, the transaction is rejected. WharfKit does those three things for you. Without it, you do them yourself.

## A minimal path

1. Build the action data (account, name, authorization, data).
2. Pack the transaction with the correct expiration, ref-block, and limits.
3. Compute the signing digest with the chain id of the network you are targeting.
4. Sign the digest with a key that is on the authorizing permission.
5. Attach the signature and push the packed transaction to `/v1/chain/push_transaction`.

The course's `src/digest.ts` already computes step 3. The Jungle 4 vector in the tests is an example of a packed transaction and the digest it produces. You can feed that digest to any ECDSA library that can produce a compact 65-byte signature, then wrap it as `SIG_K1_` or `SIG_R1_`.

## When you would skip WharfKit

- The agent runs in a language that does not have a current WharfKit binding.
- You are generating the signature inside a threshold ceremony that already has the digest and only needs to return 65 bytes.
- You are writing a one-off script that talks to a single known endpoint and does not need session restore or wallet-plugin UI.

In every other case, use `@wharfkit/session`. It already knows the chain ids, it sorts authorities, and it refuses to sign a transaction whose digest does not match the packed bytes.

## What this course does not ship

There is no second client implementation here. The tests lock the digest and the canonical rule so that a non-WharfKit signer can be checked against the same vectors. If you write that signer, run it against the Jungle 4 packed transaction and confirm it produces a signature that `Signature.recoverDigest` turns back into the expected public key.
