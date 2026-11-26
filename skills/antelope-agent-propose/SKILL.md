---
name: antelope-agent-propose
description: Use when an agent needs to propose an Antelope transfer checked by a policy gate. Covers strategies, operator-gated testnets, MCP tools, offline simulate fixtures, and lab signatures after allow. Push is operator-only and not an MCP tool.
license: MIT
---

# Propose an Antelope transfer

Work from this repository. Read [docs/DECIDE.md](../../docs/DECIDE.md) and [docs/AGENT-RECIPE.md](../../docs/AGENT-RECIPE.md).

## Callable surface

- `runStrategy` / `runStrategyWithPolicy` / `runStrategyTool`
- Four default allows: `wax-testnet-tip`, `treasury-tip`, `jungle-tip`, `peer-tip`
- Operator testnets: `extraLabChainIds` (never mainnet)
- MCP: `list_networks`, `list_strategies`, `inspect_playbook`, `propose_transfer`, `run_strategy`, `check_status`, `lab_sign_allowed`, `simulate_proposal`, `broadcast_status`, `list_engines`
- Offline simulate fixtures in `src/simulate.ts`
- Lab RPC: `src/rpc.ts` builders; live calls only via `src/labClient.ts` with `enableNetwork: true`
- Push: `pushLabTransaction` only when readiness is honest. Do not expose it as a model tool.

## Gate rules

- Aliases only (`px-treasury`, `wax-faucet`, `test-peer`)
- Cap + short ASCII memo without account names
- Blocked: `updateauth`, `deleteauth`, `linkauth`, `unlinkauth`, `setcode`, `setabi`
- No model-supplied digests; no free-form recipients
- Lab `SIG_K1_` is a proposal id, not `sig_digest`

Run `npm test`.
