# Lab signer — throwaway `SIG_K1_` after allow

Module: [src/labsign.ts](../src/labsign.ts).

## What it is

After the policy gate **allows** a proposal, the course can attach a recoverable `SIG_K1_` produced with a **throwaway** key over a **proposal identifier** (a stable string derived from the proposal fields). That teaches:

- encode/parse of `SIG_K1_` via the codec path
- that “signature after allow” is a separate step from “policy decide”
- that agents should not treat every base58 string as a chain-valid action signature

## What it is not

| Claim | Reality |
| --- | --- |
| Node-accepted transfer signature | **No** — digest is not `sig_digest(chain_id ‖ packed ‖ cfd)` |
| Threshold share output | **No** — single lab key |
| Production custody | **No** |
| Input to `pushLabTransaction` as proof of `signedAntelopeDigest` | **No** — that flag must mean a real Antelope digest was signed |

## Flow

```ts
import { createLabKey, signAllowed } from "./labsign.js";
import { createPolicy } from "./policy.js";

const decision = createPolicy().propose(proposal);
if (decision.ok) {
  const lab = signAllowed(createLabKey(), proposal, decision, "agent.pxj");
  // lab.signature starts with SIG_K1_
}
```

Strategies call this path automatically on default-lab allows. Operator opt-in testnets get the same after `extraLabChainIds`.

## Chain allow list

Lab sign refuses if `proposal.chainId` is not in the policy’s effective lab set (default WAX Testnet + Jungle 4, plus operator extras). Mainnets never.

## Related

Real digests: [src/digest.ts](../src/digest.ts) · Push honesty: [PUSH.md](PUSH.md) · Codec: [src/codec.ts](../src/codec.ts)
