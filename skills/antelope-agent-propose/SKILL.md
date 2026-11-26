---
name: antelope-agent-propose
description: Use when an agent needs to propose an Antelope transfer that a policy gate will check. Covers named strategies, operator-gated extra testnets, playbooks, MCP tools, and blocked actions. A lab key signs only after an allow on built-in lab chains. It does not broadcast.
license: MIT
---

# Propose an Antelope transfer

Work in this repository, not from memory.

## Catalog (callable today)

- `listStrategyIds()`, `strategiesByExpect("allow"|"refuse")`, `strategiesByTag(tag)`, `operatorOptInStrategies()` in `src/strategies.ts`.
- `runStrategy(id, fromAccount, nowSec)` — default gate (WAX Testnet + Jungle 4).
- `runStrategyWithPolicy(id, from, now, { extraLabChainIds })` — same catalog with operator testnet opt-in; mainnets still refused.
- Four default allows: `wax-testnet-tip`, `treasury-tip`, `jungle-tip`, `peer-tip`.
- MCP-shaped tools: `runStrategyTool`, `listStrategiesTool`, `listNetworks`, `proposeTransfer`, `checkStatus` in `src/mcp.ts`.
- Playbooks: `PLAYBOOKS`, `defaultGateActions()` in `src/playbooks.ts`.
- Hybrid custody shapes: `hybridCustodyPlan` in `src/permissions.ts` (`executed: false`).
- Presign queue: `PresignQueue` in `src/presign.ts`.
- Curve preference: `recommendCurve()` in `src/curve.ts` (prefer R1).
- WalletPlugin stub: `pluginSign` refuses model digests and live threshold sign.

## Gate rules

- Do not invent a second gate. Use `src/policy.ts`.
- Default lab ids: `LAB_CHAIN_IDS`. Operators may add **testnets** via `extraLabChainIds`. Mainnets are always refused.
- Recipient must be an alias: `px-treasury`, `wax-faucet`, `test-peer`.
- Cap and memo rules apply. Blocked actions: `updateauth`, `deleteauth`, `linkauth`, `unlinkauth`, `setcode`, `setabi`.
- Do not accept a digest the model computed. Do not broadcast from this course.

If WharfKit is unavailable, see [docs/WITHOUT-WHARFKIT.md](../../docs/WITHOUT-WHARFKIT.md).

Run `npm test`.
