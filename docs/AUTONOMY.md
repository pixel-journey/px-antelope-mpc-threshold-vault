# Autonomous agents are the product

Bots and agents should be able to **trade and operate on their own** inside explicit bounds. Human approval is a **policy choice for some actions**, not a rule for every purpose.

This repository is still an **unaudited educational stack**. It does not yet ship a production mainnet signer. That is a capability gap, not a claim that agents must always wait for a person.

## Two policy modes (operator picks)

| Mode | Who signs | When it fits |
| --- | --- | --- |
| **Bounded agent** | The agent's own permission (session key, linked auth, or later a reviewed threshold share) | Market making, tips, NFT bids, powerup, scheduled transfers **inside caps** |
| **Human or cold cosign** | Owner, hardware, or `eosio.msig` | `updateauth`, `setcode`, raising caps, moving the treasury outside the agent budget |

Default code today still **refuses mainnet push**. That default stays until an operator turns on a funded agent permission with caps, an allowlist, and a real signer. It is not the end state.

## What "safe enough to run alone" means

Safety is the **bound**, not a human in the loop on every fill:

1. **Separate permission.** Agent key is `active` child or a custom `trade` permission. `owner` stays cold. `linkauth` only the contracts the bot may call.
2. **Caps.** Max notional per action, per hour, and per day. Token and collection allowlists. Slippage ceiling on AMM swaps.
3. **Simulate, then sign.** `compute_transaction` (or the offline fixtures while learning) must match the intended top-level actions. Hidden `updateauth` / `setcode` aborts.
4. **Kill switch.** One call stops new signs. Already-signed transactions can still land; do not pretend otherwise.
5. **No owner key in the model.** The agent holds only the permission it is allowed to spend.
6. **Chain scope.** Start on WAX Testnet and Jungle 4. Open a mainnet agent account only after the same policy passes there with tiny caps.

## What this tree can do now

| Capability | Status |
| --- | --- |
| Name strategies, refuse bad proposals, lab-sign after allow | Yes, testnet gate |
| Skills for powerup, AtomicAssets, AtomicMarket, Alcor, msig, chain profiles | Yes — knowledge the bot needs to act |
| Real `esr://` for `eosio.token::transfer` | Yes — useful when a *human or another signer* should take the payload; not required for every trade |
| Unaudited threshold `sign` on mainnet | No |
| Model-fired HTTP push | No — push stays an explicit operator/agent runtime call with readiness checks |

## ESR is a transport, not a leash

`build_unsigned_handoff` exists so an agent can hand a packed request to **any** signer: a human wallet, a hardware key, **or another process that holds the trade permission**. It is not a requirement that a person approve the trade.

See [EXECUTION-MODES.md](EXECUTION-MODES.md) · [PUSH.md](PUSH.md) · [skills/antelope-alcor-defi](../skills/antelope-alcor-defi/SKILL.md).
