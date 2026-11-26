# MCP-shaped tools (no threshold sign, no broadcast)

Callable surface: [src/mcp.ts](../src/mcp.ts).

| Tool | Function | Lab SIG? |
| --- | --- | --- |
| `list_networks` | `listNetworks()` | No |
| `list_strategies` | `listStrategiesTool({ expect?, tag? })` | No |
| `inspect_playbook` | `inspectPlaybook(chainId)` | No |
| `propose_transfer` | `proposeTransfer(proposal)` | No |
| `run_strategy` | `runStrategyTool(id, from, now, options?)` | Yes, after allow |
| `check_status` | `checkStatus()` | No |
| `lab_sign_allowed` | `labSignAllowed(...)` | Yes (lab only) |
| `simulate_proposal` | `simulateProposal(proposal, decision)` | No |
| `broadcast_status` | `broadcastStatus(chainId)` | No |

Session policy: `resetSessionPolicy({ extraLabChainIds })` then `proposeTransfer` / `checkStatus`.

`simulate_proposal` is **local** (policy + broadcast lock). It does not call nodeos. Production should use `/v1/chain/compute_transaction` on a lab endpoint after an allow.

`broadcast_status` reports candidate testnets; `courseBroadcasts` is always `false`.

## Still forbidden as tools

`sign_digest`, free-text recipients, `updateauth` / `setcode`, mainnet send.

Skill: [skills/antelope-agent-propose](../skills/antelope-agent-propose/SKILL.md) · [skills/antelope-agentic-payments](../skills/antelope-agentic-payments/SKILL.md).
