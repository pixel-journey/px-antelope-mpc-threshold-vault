---
name: antelope-next-step
description: Use after an Antelope strategy run to decide whether to stop, hand off, or keep a lab signature. Also checks that two handoffs are not the same cross-chain ceremony. Does not push and does not sign a node digest.
license: MIT
---

# What to do after a strategy

Work in this repository.

- Call `adviseNext(result)` from `src/next.ts` after `runStrategy`. If `next` is `stop`, report `reason` and do not rewrite the proposal.
- `labSignatureIsNodeValid` is always false. A lab `SIG_K1_` is over a proposal id.
- `pushFromModel` is always false. Push is an operator script, not a model tool.
- Call `compareDomains(left, right)` from `src/domains.ts` before treating two handoffs as one ceremony. Different chain ids are not a replay.
- Look up `OPPORTUNITIES` in `src/opportunities.ts` for per-chain rows. `callableToday` is the only permission. `orng.wax` is WAX-only and is never an MPC nonce.

Run `npm test`.
