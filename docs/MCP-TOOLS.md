# MCP-shaped tools

Callable surface: [src/mcp.ts](../src/mcp.ts). These are **shapes** an agent runtime can wrap; they are not a full MCP server binary in this repo.

| Tool | Function | Lab SIG? | Notes |
| --- | --- | --- | --- |
| `list_networks` | `listNetworks()` | No | Playbooks + lab/broadcast flags |
| `list_strategies` | `listStrategiesTool({ expect?, tag? })` | No | Filter allows/refusals |
| `inspect_playbook` | `inspectPlaybook(chainId)` | No | Per-chain action catalog |
| `propose_transfer` | `proposeTransfer(proposal)` | No | Session policy only |
| `run_strategy` | `runStrategyTool(id, from, now, options?)` | Yes, after allow | May attach lab SIG |
| `check_status` | `checkStatus()` | No | Audit, kill, engines |
| `lab_sign_allowed` | `labSignAllowed(...)` | Yes | Explicit after allow |
| `simulate_proposal` | `simulateProposal(p, d, fixture?)` | No | Offline fixtures |
| `broadcast_status` | `broadcastStatus(chainId)` | No | Candidate vs locked |
| `list_engines` | `listEnginesTool()` | No | Mock only available |

## Session policy

```ts
resetSessionPolicy({ extraLabChainIds: [CHAINS.telosTestnet] });
proposeTransfer(proposal);
checkStatus();
killPolicy("drill");
```

## Simulation fixtures

| Fixture | Expected teaching |
| --- | --- |
| `clean-transfer` | Top-level matches proposal; `safeForCoSign` |
| `inline-escalation` | Hidden `eosio::updateauth` → refuse |
| `assert-revert` | `except` populated → refuse |
| `context-free-or-deferred` | Deprecated patterns → refuse |

Production should still call live `/v1/chain/compute_transaction` on a lab endpoint after allow; offline fixtures teach the policy boundary only.

## Intentionally not MCP tools

| Action | Why |
| --- | --- |
| `sign_digest` | Co-signer must hash packed tx |
| Free-text recipients | Aliases only |
| `updateauth` / `setcode` | Human / cold path |
| **`push_transaction`** | Use `pushLabTransaction` from a controlled script after readiness — not model-fired |
| Real threshold `sign` | Phase R.2; mock throws |

Lab HTTP helpers: [src/labClient.ts](../src/labClient.ts) · [PUSH.md](PUSH.md).

Skills: [antelope-agent-propose](../skills/antelope-agent-propose/SKILL.md) · [antelope-agentic-payments](../skills/antelope-agentic-payments/SKILL.md).
