# Execution modes — mainnet utility without unaudited MPC

This course splits **what agents may do today** from **what still requires reviewed threshold engines**.

| Mode | Testnets (WAX Testnet, Jungle 4, operator-opt-in labs) | Mainnets (WAX, Vaulta, Telos, XPR, UX) |
| --- | --- | --- |
| Read / inspect / playbooks | Full | Full (chain ids, symbols, action catalogs) |
| Offline simulate fixtures | Full | Full (same fixtures; not live nodeos) |
| Policy gate on transfer proposals | Lab allows + refusals | **Refuse spend / auto-sign**; may still *describe* payloads |
| Lab `SIG_K1_` (proposal id) | After allow | Never |
| Gated `pushLabTransaction` | After honest readiness + `enableNetwork` | **Hard refuse** |
| Threshold `sign` | Mock throws; R.2 future under testnet banner | **Never on unaudited stack** |
| Human-signed path | Optional | **Preferred:** unsigned handoff / ESR for Anchor, hardware, `eosio.msig` |

## Mainnet-safe agent path (no keys in the model)

```text
list networks / skills → policy-check intent
  → build unsigned action payload (or ESR handoff)
  → human signs in Anchor / hardware / msig
  → human or ops pushes
```

Modules:

| Piece | Role |
| --- | --- |
| `src/esr.ts` | Unsigned handoff record + educational ESR-shaped URI builder |
| `skills/antelope-powerup-and-resources` | Per-chain CPU/NET/RAM |
| `skills/antelope-atomicassets` | NFT lifecycle + RAM traps |
| `skills/antelope-atomicmarket` | Atomic sale/purchase bundles |
| `skills/antelope-alcor-defi` | Multi-chain AMM safety |
| `skills/antelope-permissions-and-msig` | `updateauth` / `linkauth` / msig |
| `skills/antelope-chain-profiles` | Chain registry index |

## Non-negotiables (unchanged)

1. No mainnet value behind unaudited threshold orchestration  
2. No `sign_digest` MCP tool  
3. No model-fired `push_transaction`  
4. Mainnet agent output is **unsigned** (or human msig), never a mock lab SIG  

See [GAP-AUDIT.md](GAP-AUDIT.md) · [PUSH.md](PUSH.md) · [ENGINE.md](ENGINE.md).
