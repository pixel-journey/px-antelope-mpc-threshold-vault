---
name: antelope-permissions-and-msig
description: Use when designing updateauth, linkauth, or eosio.msig flows for Antelope accounts. Bridges mainnet operational safety and the hybrid MPC thesis. Does not sign or push; mainnet is human or msig only.
license: MIT
---

# Permissions and msig

Read [docs/PERMISSIONS.md](../../docs/PERMISSIONS.md) and [docs/EXECUTION-MODES.md](../../docs/EXECUTION-MODES.md).

## Hybrid pattern (course thesis)

| Permission | Role |
| --- | --- |
| `owner` | Cold 2-of-3 or `eosio.msig` board |
| `active` | Day-to-day key (future MPC aggregate pubkey) |
| custom e.g. `agent` | `linkauth`-scoped only |

Shapes in `src/permissions.ts` are **not** broadcast (`executed: false`). Sort authorities with WharfKit `Authority.sort()` before packing real `updateauth`.

## linkauth templates (intent)

Examples of tight links (verify ABI/contract on chain):

- `account@powerup` → only `eosio::powerup`
- `account@marketbot` → only `atomicmarket::assertsale` + `purchasesale` (and required pay action if deliberately included)
- Never link an agent permission to `updateauth`, `setcode`, or `setabi`

## eosio.msig (all major Antelope mainnets)

| Action | Role |
| --- | --- |
| `propose` | Create proposal |
| `approve` / `unapprove` | Signer board |
| `exec` | Execute after threshold |
| `cancel` | Cancel |

Same payload idea on WAX, Vaulta, Telos, XPR—**chain id and token contracts differ**. Use [skills/antelope-chain-profiles](../antelope-chain-profiles/SKILL.md).

## Agent rules

- Policy in this repo **blocks** agent-path `updateauth` / `setcode`
- Mainnet: unsigned handoff via `src/esr.ts` or human msig UI
- Do not put threshold shares in the model process
