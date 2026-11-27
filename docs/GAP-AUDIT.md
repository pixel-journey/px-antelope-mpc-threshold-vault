# Gap audit — live tree vs external “description only” reviews

Public one-liners (“No threshold signing. No broadcast. Unaudited.”) are still **true** for **production threshold WASM** and **default** HTTP behavior. They understate the educational + gated lab surface already in-tree.

## Corrected status

| Component | Live tree |
| --- | --- |
| Honesty banner / MIT / TypeScript | Done |
| WharfKit 4.0.2 vector recovery | Done |
| Network map + **mainnet** hard-refuse | Done (`policy`, `labsign`, `broadcast`, `labClient`) |
| K1 canonical / low-S / presign queue | **Executable** |
| Policy engine + kill + strategies + operator testnets | **Done** |
| Lab `SIG_K1_` after allow (proposal id) | **Done** |
| Offline `compute_transaction` fixtures | **Done** (`simulate.ts`) |
| MCP tools (10) | **Done** |
| Attack museum + structured CVE cards | **Done** |
| Agent skills (6) + two-tier CI (`agentskills` + `check-skills.mjs`) | **Done** |
| Push **curriculum** + **gated** lab sender | **Done** (`evaluatePushReadiness`, `pushLabTransaction`) |
| Opt-in lab `get_info` | **Done** |
| Push as MCP tool | **Intentionally omitted** |
| R.1 Rust format crate (`PUB_*`, `SIG_*`, K1/R1 canonical, low-S) + `deny.toml` | **Done** |
| Shared `testdata/vectors.json` Vectors 1–4 | **Done** |
| `ThresholdEngine` registry + mock | **Done** (`sign` throws) |
| Real DKLs23 / CGGMP24 WASM (R.2) | **Not started** |
| Live WharfKit WalletPlugin registration | Stub / refuse paths only |
| Authenticated relay / Vault / WebAuthn PRF | Design docs only |
| Next.js lab / x402 facilitator | Not started |

## Integrated agent path

```text
list → propose / run_strategy → simulate fixtures
  → optional lab SIG_K1_ (not pushable)
  → optional fetchLabChainInfo({ enableNetwork: true })
  → optional pushLabTransaction(readiness + enableNetwork)
```

Mainnet never. Model must not set `operatorOptsIntoPush` or claim `signedAntelopeDigest` for a lab proposal-id signature.

## Backlog

| Phase | Work |
| --- | --- |
| **R.2** | DKLs23 / CGGMP24 behind `ThresholdEngine`; testnet banners |
| **W+** | Live `AbstractWalletPlugin` co-sign |
| **I** | Relay, Vault co-signer, WebAuthn PRF |
| **A / U** | x402 mock, Next.js lab |

## Non-negotiables

1. No mainnet value behind unaudited threshold orchestration  
2. No `sign_digest` MCP tool  
3. No AGPL / SLL / `backend-rug` / `rug` GMP in-tree  
4. Model proposes; policy decides; shares stay out of the model process  

See [COMPLETION.md](COMPLETION.md).
