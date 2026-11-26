---
name: antelope-agentic-payments
description: Use when designing or explaining agent payments on Antelope. Covers policy gates, linkauth blast radius, what MPC does and does not solve, and how this course's strategies and MCP tools fit. Does not threshold-sign. Push is operator-gated.
license: MIT
---

# Agentic payments on Antelope

Read [docs/AGENTIC-PAYMENTS.md](../../docs/AGENTIC-PAYMENTS.md) and [docs/GAP-AUDIT.md](../../docs/GAP-AUDIT.md).

## Facts to enforce

- MPC secures key holding, not spend policy. Policy lives in `src/policy.ts` and named strategies.
- Antelope rotates keys with `updateauth` without moving balances; scope agents with `linkauth`.
- Default allows: `wax-testnet-tip`, `treasury-tip`, `jungle-tip`, `peer-tip`.
- Extra testnets: `runStrategyWithPolicy` plus `extraLabChainIds` only. Mainnets always refuse.
- Lab `SIG_K1_` is over a proposal id, not a node-accepted packed transaction.
- `pushLabTransaction` exists for operators. The model must not set `operatorOptsIntoPush` or claim `signedAntelopeDigest` for a lab signature.
- Never expose `sign_digest`, free-form recipients, `updateauth`, or model-fired push as agent tools.
- `createEngine` only constructs `educational-mock`. `sign()` throws.

## Related modules

- Strategies: `src/strategies.ts`
- MCP surface: `src/mcp.ts`
- Permissions shapes: `src/permissions.ts`
- Lab HTTP: `src/labClient.ts`
- Hybrid thesis: `ARCHITECTURE.md`

Run `npm test`.
