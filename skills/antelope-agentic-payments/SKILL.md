---
name: antelope-agentic-payments
description: Use when designing or explaining agent payments on Antelope—policy gates, linkauth blast radius, what MPC does and does not solve, and how this course’s strategies/MCP tools fit. Does not broadcast or threshold-sign.
license: MIT
---

# Agentic payments on Antelope

Read [docs/AGENTIC-PAYMENTS.md](../../docs/AGENTIC-PAYMENTS.md) and [docs/GAP-AUDIT.md](../../docs/GAP-AUDIT.md).

## Facts to enforce

- MPC secures key **holding**, not spend policy. Policy lives in `src/policy.ts` / named strategies.
- Antelope rotates keys with `updateauth` without moving balances; scope agents with `linkauth`.
- Default allows: `wax-testnet-tip`, `treasury-tip`, `jungle-tip`, `peer-tip` via `runStrategy` / `runStrategyTool`.
- Extra testnets: `runStrategyWithPolicy` + `extraLabChainIds` only. Mainnets always refuse.
- Lab `SIG_K1_` is over a proposal id, not a node-accepted packed transaction.
- `assertBroadcastAllowed` / `refuseBroadcast` in `src/broadcast.ts` — this course does not push txs.
- Never expose `sign_digest`, free-form recipients, or `updateauth` as agent tools.

## Related modules

- Strategies: `src/strategies.ts`
- MCP surface: `src/mcp.ts`
- Permissions shapes: `src/permissions.ts`
- Hybrid thesis: `ARCHITECTURE.md`

Run `npm test`.
