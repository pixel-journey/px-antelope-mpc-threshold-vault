# Gap audit — external review vs live tree (2026-11-26)

Description-only reviews understate the tree. Source of truth for done vs remains.

## Corrected status

| Component | Live tree |
| --- | --- |
| Honesty banner / MIT / TS / WharfKit 4.0.2 vectors | Done |
| Network map + **mainnet** lock | Done (`policy`, `labsign`, `broadcast`) |
| Push as **curriculum end-stage** (checklist + URL builder; no HTTP by default) | Done ([PUSH.md](PUSH.md)) |
| K1 canonical / presign / R1 | Executable |
| Policy + kill + strategies + operator testnets | Done |
| Offline `compute_transaction` fixtures + `TransactionSimulator` | Done (`simulate.ts`) |
| MCP tools (9) | Done |
| Attack museum cards + toy demos | Done (`MUSEUM_CARDS`, nonce / `$` delimiter) |
| Agent skills (5) + Tier-2 linter + workflow | Done |
| Lab RPC catalog | Done (`rpc.ts`) |
| WalletPlugin stub | Educational refuse paths |
| Real Rust/WASM threshold | **Intentionally missing** (Phase R) |
| Live plugin + HTTP testnet push | Phase W |
| Relay / Vault / WebAuthn / Next.js | Not started |

## Integrated agent path

```text
list_networks / list_strategies
  → propose_transfer | run_strategy (+ optional extraLabChainIds)
  → simulate_proposal (clean | inline-escalation | assert-revert)
  → lab SIG_K1_ (proposal id only — not pushable)
  → evaluatePushReadiness → buildPushTransactionRequest (URL only until Phase W)
```

Mainnet never. HTTP push only after checklist + deliberate sender.

## Backlog

| Phase | Work |
| --- | --- |
| **R.1** | Cargo workspace + `deny.toml` + `antelope-crypto-format` parity (**no** MPC crates) |
| **R.2** | DKLs23 / CGGMP24 WASM behind trait, still testnet-bannered |
| **W** | Live WalletPlugin + optional lab `fetch` for compute/push under readiness |
| **A / I / U** | x402 mock, relay/Vault/PRF, Next.js lab |

## Non-negotiables

1. No mainnet value behind unaudited threshold orchestration  
2. No `sign_digest` MCP tool  
3. No AGPL / SLL / `backend-rug` in-tree  
4. Model proposes; policy decides; shares stay out of the model process  
