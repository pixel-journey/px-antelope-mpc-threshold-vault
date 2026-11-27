# Gap audit — live tree vs external “description only” reviews

Public one-liners (“No threshold signing. No broadcast. Unaudited.”) are still **true** for **production threshold WASM** and **default** HTTP behavior. They understate the educational + gated lab surface already in-tree.

## Corrected status

| Component | Live tree |
| --- | --- |
| Honesty banner / MIT / TypeScript | Done |
| WharfKit 4.0.2 vector recovery | Done |
| Network map + **mainnet** hard-refuse on agent push | Done |
| Two-tier execution modes doc | **Done** ([EXECUTION-MODES.md](EXECUTION-MODES.md)) |
| K1 canonical / low-S / presign queue | **Executable** |
| Policy engine + kill + strategies + operator testnets | **Done** |
| Lab `SIG_K1_` after allow (proposal id) | **Done** |
| Offline `compute_transaction` fixtures | **Done** |
| MCP tools (10) + `r2` on `check_status` | **Done** |
| Attack museum + CVE cards | **Done** |
| MPC + agent skills (core) + two-tier CI | **Done** |
| **Mainnet skills wave** (powerup, atomicassets, atomicmarket, alcor, permissions-msig, chain-profiles) | **Done** (SKILL.md pack) |
| **Unsigned ESR-style handoff** | **Done** (`src/esr.ts` educational URI) |
| Gated lab `get_info` / `pushLabTransaction` | **Done** |
| Push as MCP tool | **Intentionally omitted** |
| R.1 Rust format + `deny.toml` | **Done** |
| `ThresholdEngine` mock (`sign` throws) + `r2Admission` | **Done** |
| Real DKLs23 / CGGMP24 WASM (R.2) | **Not started** |
| Live WharfKit WalletPlugin registration | Stub only |
| Production SigningRequest binary codec | Educational placeholder only |
| Relay / Vault / WebAuthn PRF | Design docs only |
| Next.js lab / x402 | Not started |

## Two paths

```text
Testnet lab: policy → simulate → optional lab SIG → optional gated push
Mainnet ops: skills/playbooks → unsigned handoff / ESR → human Anchor|msig|hardware
```

## Backlog

| Phase | Work |
| --- | --- |
| **ESR+** | Real `@wharfkit/signing-request` encode + QR helpers |
| **R.2** | DKLs23 / CGGMP24 behind `ThresholdEngine` |
| **W+** | Live `AbstractWalletPlugin` co-sign (testnet) |
| **I** | Relay, Vault, WebAuthn PRF |
| **U / A** | Next.js lab, x402 mock |

## Non-negotiables

1. No mainnet value behind unaudited threshold orchestration  
2. No `sign_digest` MCP tool  
3. No AGPL / SLL / `backend-rug` / `rug` GMP in-tree  
4. Model proposes; policy decides; shares stay out of the model process  
5. Mainnet agent output is unsigned / human-signed — not lab SIG  

See [COMPLETION.md](COMPLETION.md) · [EXECUTION-MODES.md](EXECUTION-MODES.md).
