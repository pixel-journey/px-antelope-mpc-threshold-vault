# Architecture — hybrid MPC active, native cold owner

> **What this repository runs:** TypeScript labs (canonical bytes, digests, codecs, policy, strategies, presign, hybrid permission shapes, MCP tools, lab signer, simulate fixtures, gated lab HTTP, educational threshold + WalletPlugin stubs) plus Phase **R.1** Rust format crate.  
> **What it does not run:** DKLs23/CGGMP24 WASM **sign**, a live co-signing WalletPlugin, a WebSocket relay, or **default** broadcast.

## Design thesis

Antelope accounts are names with a permission tree. An Ethereum address *is* the key. MPC and native multisig complete each other:

| Dimension | Native multisig | Pure off-chain MPC-TSS | **This course’s hybrid** |
| --- | --- | --- | --- |
| On-chain footprint | Multiple keys; msig RAM/CPU | Single `PUB_*`; one 65-byte sig | MPC key on **active**; weighted cold multisig on **owner** |
| Governance privacy | Public signers | Private quorum | Private ops on active; transparent owner |
| Signing latency | Async | Sub-second online | UX + **policy gate** before co-sign |
| Key rotation | Native `updateauth` | Off-chain refresh | Refresh + `updateauth` |
| Failure posture | L1 verification | Protocol surface risk | **Owner can revoke compromised active key** without moving assets |

## Layers in this tree

```
Agent (MCP / runStrategy)
        │
        ▼
Policy gate  ── extraLabChainIds (testnets only)
        │ allow
        ▼
Offline simulate fixtures (clean / inline-escalation / revert)
        │
        ├──► Lab signer (throwaway SIG_K1_ over proposal id)
        ├──► WalletPlugin stub (refuses live MPC sign)
        └──► Optional labClient (enableNetwork)
                 ├── get_info
                 └── push_transaction only if evaluatePushReadiness is green

Parallel pure labs:
  canonical · digest · codec · presign · curve · permissions · museum · threshold mock

Rust R.1: crates/antelope-crypto-format (canonical + sig_digest parity)
```

| Module | Role |
| --- | --- |
| `policy.ts` | Gate; operator testnets; mainnets stripped |
| `strategies.ts` / `playbooks.ts` | Catalog allows + refusals |
| `mcp.ts` | MCP tools (no production threshold sign; **no push tool**) |
| `simulate.ts` | Offline compute_transaction fixtures |
| `broadcast.ts` | Push readiness checklist |
| `labClient.ts` | Opt-in get_info + gated push |
| `rpc.ts` | Lab endpoint catalog + request builders |
| `presign.ts` | Offline r-filter, single-use, burn-on-bad-s |
| `threshold.ts` | Engine registry; mock `sign()` throws |
| `walletPlugin.ts` | Plugin contract; refuses model digests |

## Still for later phases

| Layer | Phase |
| --- | --- |
| Reviewed DKLs23 / CGGMP24 WASM | R.2 |
| Real `AbstractWalletPlugin` registration | W+ |
| WebSocket share relay | I |
| Mainnet in the default gate | Never here |

## Boss fights

1. **K1 `is_canonical`** — ~75.20% fail without offline r-filter; ~99.61% after filter + low-S  
2. **Signing digest** — every co-signer hashes `SHA-256(chain_id ‖ packed ‖ cfd)` itself  
3. **Low-S without `recid ^= 1`** — recovers the wrong key  
4. **Blind `sign_digest` / model push** — refused in MCP rules  

```bash
npm test && npm run check-skills
```

WharfKit **4.0.2** recovers the published vectors.
