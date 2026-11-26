# Gap audit — external review vs live tree (2026-11-26)

An external review (Gemini) judged the repo from the **public description** only
(“No threshold signing. No broadcast. Unaudited.”). That description is still
true for **production threshold + broadcast**. It understates the educational
surface already in this tree.

## Corrected status

| Component | External claim | Live tree |
| --- | --- | --- |
| Honesty banner / MIT / TS | Done | Done |
| WharfKit 4.0.2 vector recovery | Done | Done |
| Network map + mainnet lock | Needs guardrail | **Done** — policy, lab signer, `broadcast.ts`, MCP `broadcast_status` |
| Real Rust/WASM threshold ECDSA | Missing (P0) | **Intentionally missing** — mock only |
| K1 canonical / presign / R1 | “Conceptual” | **Executable** |
| WalletPluginMPC | Missing | **Stub + refuse paths** |
| Policy engine + kill | Missing | **Done** |
| Attack museum | Missing | **Done** |
| MCP proposal tools | Missing | **Done** (9 tools incl. simulate + broadcast_status) |
| Local compute_transaction stand-in | Missing | **Done** — `simulate.ts` (no RPC) |
| Agent skills | Missing | **5 skills** under `skills/` |
| Opt-in extra testnets + lab sig | — | **Done** |
| Hybrid permission shapes / codecs | — | **Done** |
| Agentic payments curriculum | Positioned | **Expanded** `AGENTIC-PAYMENTS.md` |
| Relay / Vault / WebAuthn / Next.js | Missing | Design / not started |

## Integrated agent path (today)

`list → run_strategy / propose → simulate_proposal → broadcast_status`  
Lab SIG optional after allow. `wouldBroadcast` always false. See [AGENT-RECIPE.md](AGENT-RECIPE.md).

## What remains (honest backlog)

| Phase | Work |
| --- | --- |
| **R** | Cargo workspace, DKLs23 + CGGMP24 WASM, `cargo-deny`, benchmarks |
| **W** | Live `AbstractWalletPlugin`, real RPC `compute_transaction`, opt-in **testnet** push after lock |
| **A** | Mock x402 facilitator lab, deeper KYA/escrow demos |
| **I** | Relay, Vault co-signer, WebAuthn PRF, server-down recovery test |
| **U** | Next.js lab, skill CI validate, deeper PQ module |

## Non-negotiables

1. No mainnet value behind unaudited threshold orchestration  
2. No `sign_digest` MCP tool  
3. No AGPL / SLL / `backend-rug` in-tree  
4. Model proposes; policy decides; shares stay out of the model process  
