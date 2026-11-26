# Architecture — hybrid MPC active, native cold owner

> **What this repository runs:** pure TypeScript labs (canonical bytes, digests, codecs, policy gate, strategies, presign queue policy, hybrid permission shapes, MCP tool surface, lab signer, educational threshold + WalletPlugin stubs).  
> **What it does not run:** DKLs23, CGGMP24 WASM, a live co-signing WalletPlugin, a WebSocket relay, or a broadcast.

## Design thesis (from the blueprint)

Antelope accounts are names with a permission tree. An Ethereum address *is* the key. That difference is why MPC and native multisig complete each other instead of competing.

| Dimension | Native multisig | Pure off-chain MPC-TSS | **This course’s hybrid** |
| --- | --- | --- | --- |
| On-chain footprint | Multiple keys; msig RAM/CPU | Single `PUB_K1_` / `PUB_R1_`; one 65-byte sig | MPC key on **active**; weighted cold multisig on **owner** |
| Governance privacy | Public signers | Private quorum | Private operational quorum on active; transparent owner |
| Signing latency | Async | Sub-second online | Sub-second UX + policy gate before co-sign |
| Key rotation without moving assets | Native `updateauth` | Off-chain refresh | Refresh + `updateauth` |
| Action scoping | `linkauth` | Off-chain policy | Both |
| Failure posture | L1 verification | Protocol surface risk | **Owner can revoke compromised active MPC key** without moving assets |

## Layers that exist in *this* tree

```
Agent (MCP tools / runStrategy / listStrategies)
        │
        ▼
Policy gate  ── extraLabChainIds (testnets only; mainnets always stripped)
        │ allow
        ▼
Handoff record ──► Lab signer (throwaway SIG_K1_)   OR   WalletPlugin stub (refuses MPC sign)

Parallel pure labs:
  canonical · digest · codec (PUB_/SIG_) · presign queue · curve policy
  permissions (hybrid shapes) · museum · threshold mock
```

| Module | Role |
| --- | --- |
| `policy.ts` | Gate; optional operator `extraLabChainIds` for more *testnets* |
| `strategies.ts` / `playbooks.ts` | Catalog allows + intentional refusals |
| `mcp.ts` | MCP-shaped tools (no production threshold sign) |
| `presign.ts` | Offline r-filter, single-use, burn-on-bad-s, invalidate on refresh |
| `curve.ts` | Prefer R1 online |
| `permissions.ts` | `hybridCustodyPlan` shapes, `executed: false` |
| `walletPlugin.ts` | Plugin contract; refuses model digests and live MPC sign |
| `codec.ts` | `PUB_*` / `SIG_*` encode-parse |
| `threshold.ts` | DKG/presign shape; `sign()` throws |

## Blueprint layers still for a later repo

| Layer | Status here |
| --- | --- |
| Reviewed DKLs23 / CGGMP24 WASM | Named only |
| Real `AbstractWalletPlugin` registration | Shape + refuse paths |
| WebSocket share relay | Documented, not built |
| Mainnet in the default gate | Hard-refused |

## Boss fights

1. **K1 `is_canonical`** — ~75.20% fail without offline r-filter; ~99.61% after filter + low-S.
2. **Signing digest** — every co-signer hashes `SHA-256(chain_id ‖ packed ‖ cfd)` itself.
3. **Low-S without `recid ^= 1`** — recovers the wrong key.
4. **Blind `sign_digest`** — refused in plugin stub and MCP rules.

## Verification

```bash
npm test
```

WharfKit **4.0.2** recovers the published vectors.
