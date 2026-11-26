# `push_transaction` — final curriculum stage

It is **not** a mistake that agents and learners need to understand `push_transaction`. That is how a signed Antelope transaction reaches a node. Hiding the endpoint forever would be an exaggeration of the safety posture.

What this course does instead:

1. **Teach the full path** in order (gate → digest → dry-run → push).
2. **Lock mainnets** always.
3. **Default to not HTTP-sending** until a deliberate Phase W sender exists and the readiness checklist passes.

## Why push is last

| Stage | What you prove |
| --- | --- |
| Policy gate | Amount, alias, chain, memo, blocked actions |
| Real digest + signature | `SHA-256(chain_id ‖ packed ‖ cfd)` — **not** the lab proposal-id `SIG_K1_` |
| `compute_transaction` | Node would execute without committing (or local `simulate.ts` as a stand-in) |
| `push_transaction` | Network accepts the signed packed transaction |

Pushing a lab signature, a mainnet id, or a model-supplied digest is how educational demos become incident reports.

## Readiness checklist (code)

```ts
import { evaluatePushReadiness } from "./broadcast.js";
import { buildPushTransactionRequest, endpointsForChain } from "./rpc.js";
import { CHAINS } from "./digest.js";

const readiness = evaluatePushReadiness({
  chainId: CHAINS.waxTestnet,
  policyAllowed: true,
  signedAntelopeDigest: true, // must be true for a real push
  dryRunOk: true,
  operatorOptsIntoPush: true,  // human/operator — not the model alone
  senderImplemented: false,    // true only when you wire fetch
});

const [ep] = endpointsForChain(CHAINS.waxTestnet);
const built = buildPushTransactionRequest(ep!, { transaction: packedSigned }, {
  policyAllowed: true,
  signedAntelopeDigest: true,
  dryRunOk: true,
  operatorOptsIntoPush: true,
  senderImplemented: true,
});
// built.ok → URL for POST /v1/chain/push_transaction
// built.httpSendImplemented === false in this package
```

## Dangers (keep visible)

- **Mainnet** with unaudited co-signers or agent tools that accept free-form recipients
- **Lab `SIG_K1_`** mistaken for a node-valid signature
- **Skipping dry-run** and discovering authority/CPU errors only after broadcast
- **Model opt-in** — `operatorOptsIntoPush` must not be set because a chat said “just send it”
- **Relay/share leaks** if you rush to push before custody separation is real

## When is it “ready” for someone researching this?

| Actor | Reasonable bar |
| --- | --- |
| Student on WAX Testnet / Jungle 4 | Checklist green + funded test account + understands lab sig ≠ chain sig |
| Builder adding Phase W `fetch` | Same + explicit env/flag, still mainnet-locked in this lineage |
| Anyone with mainnet value | Independent audit of threshold stack, cold owner path tested, no educational shortcuts |

## Related

[RPC.md](RPC.md) · [LAB-SIGNER.md](LAB-SIGNER.md) · [AGENT-RECIPE.md](AGENT-RECIPE.md) · [GAP-AUDIT.md](GAP-AUDIT.md) Phase W
