# Gap audit — external review vs live tree (2026-11-26)

An external review (Gemini) judged the repo from the **public description** only
(“No threshold signing. No broadcast. Unaudited.”). That description is still
true for **production threshold + broadcast**. It understates the educational
surface already in this tree.

## Corrected status

| Component | External claim | Live tree |
| --- | --- | --- |
| Honesty banner / MIT / TS | Done | Done |
| WharfKit 4.0.2 vector recovery | Done | Done (`wharfkit.test.ts`) |
| Network map + mainnets | Done; needs guardrail | Done; mainnets hard-refused in policy + lab signer + `broadcast.ts` |
| Real Rust/WASM threshold ECDSA | Missing (P0) | **Intentionally missing** — educational mock only (`threshold.ts`) |
| K1 `is_canonical` / R1 / presign | “Likely conceptual” | **Executable:** `canonical.ts`, `presign.ts`, `curve.ts`, tests |
| WalletPluginMPC | Missing | **Stub + refuse paths** (`walletPlugin.ts`); not registered live |
| Policy engine + kill switch | Missing | **Done** (`policy.ts`) |
| Attack museum (nonce, concat) | Missing | **Done** (`museum.ts`, `ATTACK-MUSEUM.md`) |
| MCP proposal tools | Missing | **Done** (`mcp.ts`, `MCP-TOOLS.md`) |
| Agent skills | Missing | **Partial** — 4 skills under `skills/` |
| Opt-in extra testnets + lab sig | — | **Done** (`extraLabChainIds`, `runStrategyWithPolicy`) |
| Hybrid permission shapes | — | **Done** (`permissions.ts`) |
| PUB_/SIG_ codec | — | **Done** (`codec.ts`) |
| Relay / Vault co-signer / WebAuthn PRF | Missing | Design docs only (`RELAY.md`) |
| Next.js PxUI lab | Missing | Not started |
| x402 / MPP deep curriculum | Positioned | Expanded in `AGENTIC-PAYMENTS.md` |

## What remains (honest backlog)

### Phase R — Rust/WASM engine (separate milestone)

- Cargo workspace, `cargo-deny`, DKLs23 + CGGMP24 behind `AntelopeThresholdEngine`
- Browser-WASM benchmarks
- Still **testnet-only** + unaudited banner until independent review

### Phase W — Live WharfKit plugin + optional testnet broadcast

- Real `AbstractWalletPlugin` registration
- `compute_transaction` dry-run client (RPC)
- Opt-in broadcast **only** after `assertBroadcastAllowed` (never mainnet from this course)

### Phase A — Agentic payments depth

- Mock x402 facilitator lab (local)
- KYA binding notes
- Escrow patterns linked to Pixel Journey merch-custody course

### Phase I — Infra

- Authenticated relay implementation
- Vault-backed co-signer
- WebAuthn PRF share unlock
- Server-down recovery integration test

### Phase U — UI / skills / PQ frontier

- Next.js lab
- Fifth skill + CI `skills-ref validate`
- Deeper POST-QUANTUM module

## Non-negotiables (do not “fix” by relaxing)

1. No mainnet value behind unaudited threshold orchestration  
2. No `sign_digest` MCP tool  
3. No AGPL / SLL / `backend-rug` in-tree  
4. Model proposes; policy decides; shares stay out of the model process  

This file is the answer to “what is done vs remains” when the description is
minimal and the tree is not.
