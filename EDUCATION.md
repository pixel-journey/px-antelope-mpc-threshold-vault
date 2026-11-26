# Education — threshold signatures on an account that is not a key

> **Rung:** `npm test` locks bytes, codecs, digests, policy, strategies, presign, simulate fixtures, museum, engines mock, lab client guards, and plugin refusals.  
> **Completion:** [docs/COMPLETION.md](docs/COMPLETION.md) · **Gaps:** [docs/GAP-AUDIT.md](docs/GAP-AUDIT.md)

## What you should be able to do

| Level | After this file |
| --- | --- |
| Beginner | Why an Antelope account can change its active key without moving an NFT |
| Intermediate | K1 `is_canonical`, R1 difference, presign burn, offline simulate fixtures |
| Masterclass | Hybrid owner/active, push readiness, why `sign` is still mock-only |

## What this repository runs today

| Surface | Module |
| --- | --- |
| Strategies + MCP (10 tools) | `strategies.ts`, `mcp.ts` |
| Policy + operator testnets | `policy.ts` |
| Lab `SIG_K1_` after allow | `labsign.ts` |
| Offline compute fixtures | `simulate.ts` |
| Push readiness / lab RPC builders | `broadcast.ts`, `rpc.ts` |
| Opt-in lab `get_info` | `labClient.ts` |
| Engine registry (mock) | `threshold.ts` |
| Codecs, digests, presign, curve | `codec`, `digest`, `presign`, `curve` |
| Museum + shared vectors | `museum.ts`, `testdata/vectors.json` |
| R.1 Rust format | `crates/antelope-crypto-format` |

Default allows: `wax-testnet-tip`, `treasury-tip`, `jungle-tip`, `peer-tip`.

```ts
import { runStrategyTool, listEnginesTool } from "./src/mcp.js";
runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));
listEnginesTool(); // educational-mock only
```

## Beginner — the account is the name

Antelope accounts are names. `updateauth` rotates keys; balances stay. Hybrid: cold **owner**, day-to-day **active** (maybe MPC pubkey), **agent** via `linkauth` only. See `permissions.ts`.

## Intermediate — K1, digest, policy, simulate

- K1 ~75% naive fail → offline r-filter + low-S + burn ([K1-CANONICAL.md](docs/K1-CANONICAL.md))
- `sig_digest = SHA-256(chain_id ‖ packed ‖ cfd)` — not lab proposal-id sigs
- Policy refuses mainnet / `updateauth` / memo accounts
- Simulate fixtures: clean, inline-escalation, assert-revert

## Masterclass — push and engines

1. Push is taught last ([PUSH.md](docs/PUSH.md)); HTTP push not default  
2. Only `educational-mock` engine; `sign` throws until R.2  
3. Optional `fetchLabChainInfo(..., { enableNetwork: true })` for lab get_info  
4. No mainnet value on unaudited threshold orchestration  

```bash
npm test && npm run check-skills
```
