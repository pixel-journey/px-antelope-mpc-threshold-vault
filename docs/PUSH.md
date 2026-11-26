# `push_transaction` — final curriculum stage

Learners should **understand** push. This course includes an **opt-in lab sender** with the same gates as the checklist — not a default agent tool, not mainnet, not silent.

## Why push was staged last

Early course modules use throwaway lab signatures and offline fixtures so mistakes stay local. `push_transaction` changes shared testnet state. Teaching it without readiness gates trains the wrong habit: “if the model is confident, send.”

## Checklist (`evaluatePushReadiness`)

| Flag | Meaning |
| --- | --- |
| `chainId` is testnet candidate | Mainnet always fails |
| `policyAllowed` | Gate already allowed this proposal |
| `signedAntelopeDigest` | Signature is over real `sig_digest`, **not** lab proposal id |
| `dryRunOk` | Offline and/or live compute looks clean |
| `operatorOptsIntoPush` | Human/operator opt-in — **not** the model |
| `senderImplemented` | A real sender exists (`pushLabTransaction` sets this) |

Any false → `{ ready: false, blockers: [...] }` and **no HTTP**.

## Path

```ts
import { evaluatePushReadiness } from "./broadcast.js";
import { pushLabTransaction } from "./labClient.js";
import { CHAINS } from "./digest.js";

const result = await pushLabTransaction(
  {
    chainId: CHAINS.waxTestnet,
    transaction: packedSignedTxObject,
    readiness: {
      policyAllowed: true,
      signedAntelopeDigest: true,
      dryRunOk: true,
      operatorOptsIntoPush: true,
    },
  },
  { enableNetwork: true },
);

if (!result.ok) {
  // inspect result.readiness.blockers
}
```

Also available: `buildPushTransactionRequest` in [rpc.ts](../src/rpc.ts) builds the URL/body without sending.

## Dangers

| Mistake | Consequence |
| --- | --- |
| Claiming `signedAntelopeDigest: true` for lab proposal-id SIG | Node reject or worse confusion |
| Model sets `operatorOptsIntoPush` | Bypasses human gate |
| Mainnet | Locked in `evaluateBroadcast` |
| Skipping dry-run | Inline actions / asserts missed |
| Exposing push as MCP tool | Model-driven broadcast |

## MCP

Push is **not** listed in [MCP-TOOLS.md](MCP-TOOLS.md). Operators call `pushLabTransaction` from controlled scripts or a future dedicated operator UI.

## Related

[RPC.md](RPC.md) · [LAB-SIGNER.md](LAB-SIGNER.md) · [AGENT-RECIPE.md](AGENT-RECIPE.md) · [COMPLETION.md](COMPLETION.md)
