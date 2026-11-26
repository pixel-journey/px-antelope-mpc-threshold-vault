# Architecture — hybrid MPC active, native cold owner

> **What this repository runs:** pure TypeScript labs (canonical bytes, digests, policy gate, lab signer, educational threshold mock).  
> **What it does not run:** DKLs23, CGGMP24, a WalletPlugin, a WebSocket relay, or a broadcast.

## Design thesis (from the blueprint)

Antelope accounts are names with a permission tree. An Ethereum address *is* the key. That difference is why MPC and native multisig complete each other instead of competing.

| Dimension | Native multisig (`updateauth` / `eosio.msig`) | Pure off-chain MPC-TSS | **This course’s hybrid** |
| --- | --- | --- | --- |
| On-chain footprint | Multiple keys; msig RAM/CPU | Single `PUB_K1_` / `PUB_R1_`; one 65-byte sig | MPC key on **active**; weighted cold multisig on **owner** |
| Governance privacy | Public signers and weights | Private quorum | Private operational quorum on active; transparent owner |
| Signing latency | Async (seconds to days) | Sub-second online | Sub-second UX + policy gate before co-sign |
| Key rotation without moving assets | Native `updateauth` | Off-chain refresh or address migration | Refresh + `updateauth` to swap the active key |
| Action scoping | `linkauth` | Off-chain policy | Both: policy engine + L1 `linkauth` blast-radius caps |
| Failure posture | L1 consensus verification | Protocol surface risk | **Owner can revoke a compromised active MPC key** without moving WAXP, PXJ, or NFTs |

Even under a zero-day in an MPC implementation, or total loss of a co-signing server, a cold **owner** authority (for example a 2-of-3 Anchor/hardware multisig) can issue one `eosio::updateauth` and replace the active key. That kill switch is the reason this course refuses to teach MPC as a replacement for owner.

## Layers that exist in *this* tree

```
┌──────────────────────────────────────────────────────────┐
│  Agent / developer                                       │
│  runStrategy · handoff · signAllowed (lab only)          │
└───────────────────────────┬──────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────┐
│  Policy gate (src/policy.ts)                             │
│  lab chain ids only by default · refuse mainnet ·        │
│  refuse updateauth / linkauth from the model ·           │
│  refuse memo-as-account · kill() flag                    │
└───────────────────────────┬──────────────────────────────┘
                            │ allow
┌───────────────────────────▼──────────────────────────────┐
│  Handoff record (src/dryrun.ts)                          │
│  binds allowed fields · does not pack · does not sign    │
└───────────────────────────┬──────────────────────────────┘
                            │ lab path only
┌───────────────────────────▼──────────────────────────────┐
│  Lab signer (src/labsign.ts)                             │
│  throwaway key → recoverable SIG_K1_                     │
│  NOT a threshold share                                   │
└──────────────────────────────────────────────────────────┘

Parallel pure labs (no network):
  canonical.ts   — is_canonical byte rule + low-S + recid flip
  digest.ts      — chain_id || packed_tx || cfd_hash
  codec.ts       — PUB_K1_ / SIG_K1_ checksum shape
  museum.ts      — nonce-reuse recovery + concat collision
  threshold.ts   — DKG / presign shape · sign() always throws
  playbooks.ts   — per-chain symbols and allowed action names
```

## Layers the blueprint names for a *later* repo

| Layer | Blueprint intent | Status here |
| --- | --- | --- |
| `AntelopeThresholdEngine` trait | Unified API over DKLs23 + CGGMP24 WASM | Interface shape in `threshold.ts`; mock only |
| WalletPluginMPC | Extends WharfKit `AbstractWalletPlugin` | Not implemented. Session is constructed without plugins |
| Policy-gated MCP tools | Four agent calls wrapping the gate | Documented in `docs/MCP-TOOLS.md`; gate already returns the decisions |
| Offline presign + r-filter | Discard non-canonical K1 `r` before online | Counts and rules locked; no real presign queue |
| Owner cold multisig | 2-of-3 hardware / Anchor on `owner` | Documented; no broadcast |

## Engines (named, not imported)

| Engine | Role in the reading list | Constraint |
| --- | --- | --- |
| 0xCarbon/DKLs23 v0.6.2 | 3-round OT-based threshold ECDSA, K1+R1 | MIT/Apache; treat as **unaudited** for mainnet |
| LFDT-Lockness/cggmp24 ≥ 0.7.0-alpha.2 | 1 online round after offline prep | MIT/Apache; **never** `backend-rug`; patches CVE-2025-66016/66017 |
| silence-laboratories/dkls23 | Reference only | Non-commercial license — **forbidden** in this MIT tree |
| entropyxyz/synedrion | Reference only | AGPL — **forbidden** here |

`npm test` scans `package.json` for banned names.

## Boss fights this architecture encodes

1. **K1 `is_canonical`** — ~75.20% of uniform `(r,s)` pairs fail the byte check. Offline r-filter + online low-S raises acceptance; R1 avoids the trap entirely. Locked in `canonical.ts`.
2. **Signing digest** — every co-signer must hash `SHA-256(chain_id ‖ packed_tx ‖ cfd_hash)` itself. No opaque pre-hashed digest API. Locked in `digest.ts` + WharfKit recovery tests.
3. **Low-S without `recid ^= 1`** — negating `s` sends `R` to `-R`; forgetting the flip recovers the wrong key. Locked in `normalizeLowS`.

## Related courses in the catalog

- [wax-multi-sig-proposal-builder-and-simulator](https://github.com/pixel-journey/wax-multi-sig-proposal-builder-and-simulator) — on-chain `eosio.msig`
- [wax-permission-visualizer-and-editor](https://github.com/pixel-journey/wax-permission-visualizer-and-editor) — permission tree / `updateauth` previews
- [wax-wharfkit-session-keys-and-linked-permissions](https://github.com/pixel-journey/wax-wharfkit-session-keys-and-linked-permissions) — session keys ≠ threshold shares

## Verification

```bash
npm test
```

Thirty-two tests as of the last README pin. WharfKit **4.0.2** recovers the published vectors.
