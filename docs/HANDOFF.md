# What to hand a co-signer

The agent does not pack the transaction. The co-signer does. That is the point of the split: a process that talks to a model never gets to choose the bytes that are hashed.

## The record

`handoff()` in [src/dryrun.ts](../src/dryrun.ts) runs only after `createPolicy().propose` has returned `ok: true`. It returns:

| Field | Who chose it |
| --- | --- |
| `chainId` | The agent, from `PLAYBOOKS` or `CHAINS`, then accepted by the gate |
| `from` | The operator, as the account the agent is allowed to spend from |
| `to` | The gate, by resolving the alias. The agent never typed this name |
| `quantity` | The agent, under the cap, formatted as `1.0000 WAX` (or the chain symbol) |
| `memo` | The agent, already checked for length and for a hidden account name |
| `expiresAtSec` | The agent, already checked to be inside 120 seconds |
| `proposalId` | This file. SHA-256 of the fields above, each length-prefixed |

`proposalId` is a **proposal id**. It is not an Antelope signing digest. A co-signer that signs `proposalId` has signed the wrong thing. Lab `SIG_K1_` in [labsign.ts](../src/labsign.ts) is that class of signature — useful for codec drills, useless for `push_transaction`.

## What the co-signer does

1. Check that `proposalId` matches a fresh hash of the other fields.
2. Check the chain id, the amount, the memo, and the expiry again. Do not trust that the agent already did.
3. Run or re-run a dry-run (`compute_transaction` on a lab node, or the offline fixtures as a teaching stand-in).
4. Pack an `eosio.token::transfer` with WharfKit, using a real `ref_block_num` and `ref_block_prefix` from the node.
5. Hash `chain_id || packed_transaction || cfd_hash`. That is the signing digest.
6. Sign that digest with a share, or refuse. This course's mock engine refuses.
7. Only then, if the operator opts in, `pushLabTransaction` with `signedAntelopeDigest: true`.

The published Jungle 4 vector in [src/digest.ts](../src/digest.ts) and [testdata/vectors.json](../testdata/vectors.json) is the packing reference. WharfKit 4.0.2 recovers it in [src/wharfkit.test.ts](../src/wharfkit.test.ts). This helper does not invent a second packer.

## What the agent must not do

- Send a digest and ask the co-signer to sign it (`sign_digest`).
- Change `to` after the gate resolved it.
- Reuse a handoff whose expiry has passed. Build a new one.
- Claim a lab signature is a node signature.
- Call `pushLabTransaction` itself.

[PUSH.md](PUSH.md) · [LAB-SIGNER.md](LAB-SIGNER.md) · [RELAY.md](RELAY.md)
