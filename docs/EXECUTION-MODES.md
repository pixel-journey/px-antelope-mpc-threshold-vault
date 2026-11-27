# Execution modes

**Goal:** agents trade and operate alone inside operator bounds. Human cosign is optional, for actions that change authority or exceed the budget. See [AUTONOMY.md](AUTONOMY.md).

What ships in this tree today is narrower than that goal. The table is the **current code**, not a product rule that every fill needs a person.

| Mode | Testnets (WAX Testnet, Jungle 4, operator-opt-in labs) | Mainnets (WAX, Vaulta, Telos, XPR, UX) |
| --- | --- | --- |
| Read / playbooks / skills | Full | Full |
| Offline simulate fixtures | Full | Full (fixtures, not live nodeos) |
| Policy gate on transfer proposals | Lab allows + refusals | **Refuse auto-sign in the default gate** until an operator opens a bounded agent permission |
| Lab `SIG_K1_` (proposal id) | After allow | Never — not a node signature |
| Gated `pushLabTransaction` | After readiness + `enableNetwork` | **Refused by this build** |
| Threshold `sign` | Mock throws; R.2 later, testnet first | **Not on an unaudited stack** |
| Unsigned ESR | Optional transport to any signer | Real `esr://` for `eosio.token::transfer`; other actions still `esr://edu/` |

## Bounded-agent path (end state)

```text
skills + chain profile
  → proposal inside caps / allowlist
  → simulate (no hidden updateauth)
  → agent permission signs
  → push
  → kill switch still works
```

## Cosign path (when the operator wants it)

```text
build unsigned payload / ESR
  → owner, hardware, msig, or a separate signer process
  → that signer pushes
```

Use cosign for `updateauth`, `setcode`, and cap changes. Do not require it for every swap inside the trade permission.

## Still true in this repository

1. No mainnet value on the unaudited threshold mock.  
2. No `sign_digest` MCP tool.  
3. No model-fired `push_transaction` — the runtime that holds the key calls push on purpose.  
4. Default policy does not spend mainnet. Opening that is an operator decision plus a real signer, not a missing human click on each trade.

See [AUTONOMY.md](AUTONOMY.md) · [GAP-AUDIT.md](GAP-AUDIT.md) · [PUSH.md](PUSH.md) · [ENGINE.md](ENGINE.md).
