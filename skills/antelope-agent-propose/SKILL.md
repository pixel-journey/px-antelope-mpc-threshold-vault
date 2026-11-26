---
name: antelope-agent-propose
description: Use when an agent needs to propose an Antelope transfer checked by a policy gate. Covers strategies, operator-gated testnets, MCP tools, simulate, broadcast lock, and lab RPC shapes. Lab key signs only after allow. Does not broadcast.
license: MIT
---

# Propose an Antelope transfer

Work from this repository.

## Callable surface

- `runStrategy` / `runStrategyWithPolicy` / `runStrategyTool` in `strategies.ts` / `mcp.ts`
- Four default allows: `wax-testnet-tip`, `treasury-tip`, `jungle-tip`, `peer-tip`
- Operator testnets: `extraLabChainIds` (never mainnet)
- MCP: `list_networks`, `list_strategies`, `inspect_playbook`, `propose_transfer`, `run_strategy`, `check_status`, `lab_sign_allowed`, `simulate_proposal`, `broadcast_status`
- Local simulate: `simulate.ts` (no node)
- Lab RPC **builders only**: `rpc.ts` — `buildComputeTransactionRequest` ok on candidates; `buildPushTransactionRequest` always throws
- Broadcast lock: `broadcast.ts`
- Presign / curve / permissions / walletPlugin stubs as documented in `docs/TODAY.md`

## Gate rules

- Aliases only (`px-treasury`, `wax-faucet`, `test-peer`)
- Cap + short ASCII memo without account names
- Blocked: `updateauth`, `deleteauth`, `linkauth`, `unlinkauth`, `setcode`, `setabi`
- No model-supplied digests; no free-form recipients; no push from this course

See [docs/AGENT-RECIPE.md](../../docs/AGENT-RECIPE.md) and [docs/MCP-TOOLS.md](../../docs/MCP-TOOLS.md).

Run `npm test`.
