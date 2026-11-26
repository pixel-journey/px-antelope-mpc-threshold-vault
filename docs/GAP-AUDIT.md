# Gap audit — live tree (2026-11-26)

## Status

| Component | Live tree |
| --- | --- |
| TS course (policy, MCP, simulate fixtures, museum, skills CI, push readiness) | **Done** |
| Phase **R.1** Cargo workspace + `deny.toml` + `antelope-crypto-format` | **Done** (no MPC crates) |
| Phase **R.2** DKLs23 / CGGMP24 WASM | Not started |
| Phase **W** live plugin + HTTP lab push | Not started |
| Relay / Vault / WebAuthn / Next.js | Not started |

## Agent path (TS)

`list → propose/run → simulate fixtures → lab SIG → evaluatePushReadiness`  
Mainnet locked. HTTP push only after checklist + deliberate sender.

## Rust path (R.1)

```bash
cargo test -p antelope-crypto-format
```

Parity: K1 canonical counts, Jungle 4 `sig_digest` / `tx_id`. See [RUST.md](RUST.md).

## Backlog

| Phase | Work |
| --- | --- |
| **R.2** | Threshold engines behind trait + WASM; still testnet-bannered |
| **W** | WalletPlugin + optional lab `fetch` under readiness |
| **A / I / U** | x402 mock, infra, UI |

## Non-negotiables

1. No mainnet value behind unaudited threshold orchestration  
2. No `sign_digest` MCP tool  
3. No AGPL / SLL / `backend-rug` / `rug` GMP in-tree  
4. Model proposes; policy decides; shares out of the model process  
