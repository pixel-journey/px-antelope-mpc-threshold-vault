# `push_transaction` — final curriculum stage

Learners should understand push. This course now includes an **opt-in lab sender** with the same gates as the checklist — not a default agent tool, not mainnet.

## Path

| Stage | Module |
| --- | --- |
| Policy allow | `policy.ts` / strategies |
| Real Antelope digest signature | Not lab proposal-id `SIG_K1_` |
| Dry-run | offline `simulate.ts` and/or live compute |
| Operator opt-in | `operatorOptsIntoPush: true` |
| Network opt-in | `enableNetwork: true` |
| Send | `pushLabTransaction` in `labClient.ts` |

```ts
import { pushLabTransaction } from "./labClient.js";
import { CHAINS } from "./digest.js";

const result = await pushLabTransaction(
  {
    chainId: CHAINS.waxTestnet,
    transaction: packedSignedTxObject,
    readiness: {
      policyAllowed: true,
      signedAntelopeDigest: true, // must be honest
      dryRunOk: true,
      operatorOptsIntoPush: true,
    },
  },
  { enableNetwork: true },
);
```

If any gate fails, `{ ok: false, readiness }` is returned and **no HTTP** is attempted.

## Dangers

- Claiming `signedAntelopeDigest: true` for a lab proposal-id signature
- Letting the model set `operatorOptsIntoPush`
- Mainnet (always locked)
- Skipping dry-run

## MCP

Push is **not** exposed as an MCP tool by default (avoids model-driven broadcast). Operators call `pushLabTransaction` from controlled scripts.

See [RPC.md](RPC.md) · [LAB-SIGNER.md](LAB-SIGNER.md) · [COMPLETION.md](COMPLETION.md).
