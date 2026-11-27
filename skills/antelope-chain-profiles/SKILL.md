---
name: antelope-chain-profiles
description: Use when selecting an Antelope chain id, core token contract, or RPC/API pattern for WAX, Vaulta, Telos, or XPR. Loads one-level references only. Does not sign or push.
license: MIT
---

# Chain profiles index

Import chain ids from `src/digest.ts` `CHAINS` — do not paste ids from chat.

| Network | `CHAINS` key | Notes |
| --- | --- | --- |
| WAX Mainnet | `waxMainnet` | 8-decimal WAX; PowerUp + Atomic ecosystem |
| WAX Testnet | `waxTestnet` | Default lab |
| Vaulta / EOS | `vaulta` | Same id as historical EOS; watch `core.vaulta` vs `eosio.token` |
| Jungle 4 | `jungle4` | Default lab; digest vectors |
| Telos Mainnet | `telos` | Staking resources |
| Telos Testnet | `telosTestnet` | Operator opt-in lab |
| XPR Mainnet | `xpr` | Zero-gas style UX; RAM matters |
| XPR Testnet | `xprTestnet` | Operator opt-in lab |
| UX | `ux` | Profile only; no default lab |

## Account names

Antelope names: `a-z`, `1-5`, `.`, length 1–12 (common 4–12). Validate before proposing.

## API families (patterns)

- Chain RPC: `/v1/chain/*` (get_info, get_account, compute_transaction, push_transaction)
- History: Hyperion-style `/v2/history/*` where hosted
- Atomic: chain-specific AtomicAssets / AtomicMarket HTTP APIs
- Alcor: `api.alcor.exchange/{wax|eos|telos|xpr}/...`

## Finality

Some networks run Savanna-style BLS finality for **blocks**. That is not an account authority type and does not replace ECDSA on `active`.

## References (1 level)

See `references/wax.md`, `vaulta.md`, `telos.md`, `xpr.md` in this skill folder for short notes. Load only the chain the user named.

## Safety

Mainnet agent path = read + unsigned handoff. Testnet lab path = policy gate + optional gated push. See [docs/EXECUTION-MODES.md](../../docs/EXECUTION-MODES.md).
