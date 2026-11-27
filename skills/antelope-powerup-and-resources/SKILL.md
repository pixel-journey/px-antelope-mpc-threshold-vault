---
name: antelope-powerup-and-resources
description: Use when an agent must rent or stake CPU/NET/RAM on WAX, Vaulta, Telos, or XPR. Encodes per-chain resource models and powerup schemas. Does not sign or push. Mainnet spend is human-signed only.
license: MIT
---

# PowerUp and resources (per chain)

Work from this skill and [docs/EXECUTION-MODES.md](../../docs/EXECUTION-MODES.md). Do not invent decimals or contract names from chat memory alone.

## Safety

- Mainnet: build unsigned payloads / ESR handoff (`src/esr.ts`). Never auto-push.
- Always prefer `compute_transaction` dry-run before a human signs.
- Check `cpu_limit.available` / account resources before proposing heavy actions.

## WAX (mainnet + testnet)

- **PowerUp:** `eosio::powerup` with `payer`, `receiver`, `days` (usually `1`), `net_frac`, `cpu_frac`, `max_payment` in **8-decimal** WAX (e.g. `0.00776626 WAX`).
- `net_frac` / `cpu_frac` are scaled fractions (see nodeos / WAX docs); do not treat them as plain percentages without the scale factor.
- Include a **slippage buffer** on `max_payment` so market moves do not fail the rent.
- Legacy path still exists: stake CPU/NET + `buyram` / `buyrambytes`.

## Vaulta (EOS lineage)

- **PowerUp:** `eosio::powerup` (typically ~24h rental) plus RAM AMM.
- **Token split:** legacy `eosio.token` vs **`core.vaulta`** for `$A`. Agents must not mix `eosio.token::transfer` of EOS-era quantities with Vaulta `$A` transfers without reading the active system contracts.
- 1 EOS historical unit maps to 1 A in the transition narrative; always verify live ABI/token contract on the chain id in use.

## Telos

- Staking-based proportional CPU/NET; RAM market separate.
- Some apps sponsor user resources (cosign / freemium). Agents must not assume free CPU without the dApp's provider path.

## XPR Network

- Near **zero-gas** user experience with network-delegated CPU/NET patterns (e.g. `eosio.proton` resource helpers on account creation).
- **RAM** remains the scarce paid resource for accounts and state—budget it when minting or creating accounts.

## Cross-chain helpers

- `@wharfkit/transact-plugin-resource-provider` (Fuel / providers) can cosign resource costs—still not a reason for the model to hold keys.
- Simulate resource consumption with `/v1/chain/compute_transaction` before human sign.

## Output shape

Propose an `UnsignedAction[]` + `buildUnsignedHandoff` summary. Do not set `operatorOptsIntoPush`.
