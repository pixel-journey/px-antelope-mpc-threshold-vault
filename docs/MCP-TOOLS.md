# MCP-shaped tools

Callable surface: [src/mcp.ts](../src/mcp.ts). These are **shapes** an agent runtime can wrap; they are not a full MCP server binary in this repo.

| Tool | Function | Lab SIG? | Notes |
| --- | --- | --- | --- |
| `list_networks` | `listNetworks()` | No | Playbooks + lab/broadcast flags |
| `list_strategies` | `listStrategiesTool({ expect?, tag? })` | No | Filter allows/refusals |
| `inspect_playbook` | `inspectPlaybook(chainId)` | No | Per-chain action catalog |
| `propose_transfer` | `proposeTransfer(proposal)` | No | Session policy only |
| `run_strategy` | `runStrategyTool(id, from, now, options?)` | Yes, after allow | May attach lab SIG |
| `check_status` | `checkStatus()` | No | Audit, kill, engines, **`r2` blockers** |
| `lab_sign_allowed` | `labSignAllowed(...)` | Yes | Explicit after allow |
| `simulate_proposal` | `simulateProposal(p, d, fixture?)` | No | Offline fixtures |
| `broadcast_status` | `broadcastStatus(chainId)` | No | Candidate vs locked |
| `list_engines` | `listEnginesTool()` | No | Mock only available |
| `build_unsigned_handoff` | `buildUnsignedHandoffTool(...)` | No | **Mainnet human-sign path** |

`checkStatus().r2.ready` is `false` until Phase R.2 admission rows are actually met. `httpPushImplemented` stays `false` on the MCP surface even though an operator script can call `pushLabTransaction`.

## Mainnet human path

```ts
buildUnsignedHandoffTool({
  chainId: CHAINS.waxMainnet,
  summary: "Tip treasury",
  actions: [/* unsigned actions */],
});
// → { kind: "unsigned-human-sign", esrUri: "esr://edu/...", broadcastLocked: true, warnings }
```

Educational ESR only. Production should re-encode with `@wharfkit/signing-request`. See [EXECUTION-MODES.md](EXECUTION-MODES.md).

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

## Intentionally not MCP tools

| Action | Why |
| --- | --- |
| `sign_digest` | Co-signer must hash packed tx |
| Free-text recipients | Aliases only |
| `updateauth` / `setcode` as auto-agent tools | Human / cold path |
| **`push_transaction`** | Operator `pushLabTransaction` only |
| Real threshold `sign` | Phase R.2; see `r2` on `check_status` |

Lab HTTP: [src/labClient.ts](../src/labClient.ts) · [PUSH.md](PUSH.md) · [ENGINE.md](ENGINE.md).
