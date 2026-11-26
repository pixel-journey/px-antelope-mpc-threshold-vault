# WalletPluginMPC — educational contract

Blueprint requirement: a WharfKit wallet plugin that co-signs with threshold ECDSA, passes the **full** serialized transaction and chain id to every party, and never accepts a pre-hashed digest from a model.

## What exists here

[src/walletPlugin.ts](../src/walletPlugin.ts) is the **shape**:

| API | Behavior today |
| --- | --- |
| `pluginLogin` | Lab chain ids only; returns `account@permission` |
| `pluginSign` | Refuses model digests; refuses threshold sign |
| `pluginConfig` | `acceptsPrehashedDigest: false`, `requiresReviewedEngine: true` |
| id | `wallet-plugin-px-mpc` |

It does not extend `AbstractWalletPlugin` in-process, does not register with `SessionKit`, and does not open a network socket. The WharfKit tests still construct a `SessionKit` with an **empty** `walletPlugins` array.

Lab HTTP (`labClient.ts`) is a separate operator path for `get_info` and gated `push_transaction`. It is not this plugin.

## What a real plugin must still do

1. Extend WharfKit 4.x `AbstractWalletPlugin` (clone-aware for session restore).
2. In `sign(resolved, context)`, pass `resolved.transaction` + `resolved.chainId` to every co-signer; each party packs/hashes `SHA-256(chain_id ‖ packed ‖ cfd_hash)` itself.
3. Enforce the policy gate (or an equivalent) **before** the online threshold round.
4. Apply K1 offline r-filter / R1 preference ([src/presign.ts](../src/presign.ts), [src/curve.ts](../src/curve.ts)).
5. Return `{ signatures: [Signature.from(sigString)] }` only after a reviewed engine produces a recoverable `SIG_K1_` or `SIG_R1_`.
6. Keep `owner` as cold multisig so one `updateauth` can revoke the active MPC key.
7. Do not call `push_transaction` inside the plugin. Push stays an operator step after readiness ([PUSH.md](PUSH.md)).

## Why the stub refuses

CVE-class failures (blind digest signing, presignature reuse, missing r-filter) are worse when wrapped in a familiar wallet plugin API. The stub teaches the **refuse** paths first.

See [ARCHITECTURE.md](../ARCHITECTURE.md), [ENGINE.md](ENGINE.md), and [THREAT_MODEL.md](THREAT_MODEL.md).
