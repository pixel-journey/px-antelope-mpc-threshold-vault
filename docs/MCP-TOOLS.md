# MCP-shaped tools

Callable surface: [src/mcp.ts](../src/mcp.ts).

| Tool | Function | Lab SIG? |
| --- | --- | --- |
| `list_networks` | `listNetworks()` | No |
| `list_strategies` | `listStrategiesTool(...)` | No |
| `inspect_playbook` | `inspectPlaybook(chainId)` | No |
| `propose_transfer` | `proposeTransfer(proposal)` | No |
| `run_strategy` | `runStrategyTool(...)` | Yes, after allow |
| `check_status` | `checkStatus()` | No |
| `lab_sign_allowed` | `labSignAllowed(...)` | Yes (lab only) |
| `simulate_proposal` | `simulateProposal(...)` | No |
| `broadcast_status` | `broadcastStatus(chainId)` | No |
| `list_engines` | `listEnginesTool()` | No |

## Intentionally not MCP tools

| Action | Why |
| --- | --- |
| `sign_digest` | Co-signer must hash packed tx |
| Free-text recipients | Aliases only |
| `updateauth` / `setcode` | Human / cold path |
| **`push_transaction`** | Use `pushLabTransaction` from a controlled script after readiness — not model-fired |

Lab HTTP helpers: [src/labClient.ts](../src/labClient.ts) · [PUSH.md](PUSH.md).
