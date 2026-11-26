# Education — threshold signatures on an account that is not a key

> **Rung:** `npm test && npm run check-skills` locks bytes, codecs, digests, policy, strategies, presign, simulate fixtures, museum, engine mock, lab client gates, and plugin refusals.  
> **The test is the rule** for those facts. This file is the reading path around them.  
> **Completion:** [docs/COMPLETION.md](docs/COMPLETION.md) · **Gaps:** [docs/GAP-AUDIT.md](docs/GAP-AUDIT.md)

## What you should be able to do

| Level | After this file |
| --- | --- |
| Beginner | Say why an Antelope account can change its active key without moving an NFT |
| Intermediate | Predict K1 `is_canonical`, why R1 differs, how the presign queue burns a bad slot, and what offline simulate fixtures catch |
| Masterclass | Explain hybrid owner/active, operator `extraLabChainIds`, push readiness, why lab `SIG_K1_` is not pushable, and why real `sign` is still mock-only |

## What this repository runs today

| Surface | Module |
| --- | --- |
| Agent strategies + MCP tools (10) | `strategies.ts`, `mcp.ts` |
| Policy gate (optional extra *testnets*) | `policy.ts` |
| Lab `SIG_K1_` after allow | `labsign.ts` |
| Offline compute fixtures | `simulate.ts` |
| Push readiness + gated lab HTTP | `broadcast.ts`, `labClient.ts`, `rpc.ts` |
| PUB_/SIG_ encode-parse | `codec.ts` |
| Presign r-filter / burn / refresh | `presign.ts` |
| Prefer R1 online | `curve.ts` |
| Hybrid `updateauth` / `linkauth` shapes | `permissions.ts` |
| WalletPlugin stub (refuses live MPC sign) | `walletPlugin.ts` |
| Engine registry (mock only) | `threshold.ts` |
| Canonical counts + low-S | `canonical.ts` |
| Signing digest + shared vectors | `digest.ts`, `testdata/vectors.json` |
| Attack museum | `museum.ts` |
| R.1 Rust format parity | `crates/antelope-crypto-format` |

Four default allows: `wax-testnet-tip`, `treasury-tip`, `jungle-tip`, `peer-tip`.  
Operator opt-in: `runStrategyWithPolicy("telos-testnet-tip", …, { extraLabChainIds: [CHAINS.telosTestnet] })`.

```ts
import { runStrategyTool, listEnginesTool } from "./src/mcp.js";
runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));
listEnginesTool(); // educational-mock only until Phase R.2
```

Deep links: [docs/TODAY.md](docs/TODAY.md) · [docs/STRATEGIES.md](docs/STRATEGIES.md) · [docs/MCP-TOOLS.md](docs/MCP-TOOLS.md) · [ARCHITECTURE.md](ARCHITECTURE.md)

---

## Agentic payments

An agent proposes a transfer; something that is **not** the model decides; a signature the network accepts may follow. The network sees one 65-byte value, not the roster.

See [docs/AGENTIC-PAYMENTS.md](docs/AGENTIC-PAYMENTS.md), [docs/NETWORKS.md](docs/NETWORKS.md), [docs/WITHOUT-WHARFKIT.md](docs/WITHOUT-WHARFKIT.md).

## Beginner — the account is the name

An Ethereum EOA is a hash of one key. An Antelope account is a 12-character name. `owner`, `active`, and custom permissions are rows replaced with `eosio::updateauth`. Balances and NFTs stay on the name.

Hybrid pattern:

- **active** — day-to-day pubkey (possibly MPC aggregate `PUB_K1_` / `PUB_R1_`)
- **owner** — cold 2-of-3 hardware / `eosio.msig` to rotate active if needed
- **agent** — `linkauth`-scoped permission, not full active

Shapes (not broadcast): `hybridCustodyPlan` in `src/permissions.ts` · [docs/PERMISSIONS.md](docs/PERMISSIONS.md).

Native multisig is slow and public; threshold ECDSA is fast and private for the hot path. Do not skip the cold path.

### Why threshold ECDSA is hard

Schnorr/FROST is linear; Antelope **account** authorities accept ECDSA on K1 or R1 only (plus WA). ECDSA multiplies secrets `k` and `x`. Shamir-of-`x` alone is not enough — that is the Level 1 anti-pattern (`src/museum.ts`).

---

## Intermediate — generations, K1 boss fight, presign, simulate

Four generations: [docs/PROTOCOL-GENERATIONS.md](docs/PROTOCOL-GENERATIONS.md). Short map:

| Generation | Remember | Do not ship |
| --- | --- | --- |
| GG18/GG20/Lindell17 | First Paillier TSS; BitForge/TSSHOCK | New wallets |
| CGGMP24 | Hardened ZK; 1 online round; CVE-2025-66016/66017 | Pre-0.7.0-alpha.2 without review |
| DKLs23 | OT, no Paillier; MIT/Apache 0xCarbon crates | Unaudited mainnet orchestration |
| 2025–26 class-group | 2-round research | Not an Antelope authority type |

### K1 `is_canonical`

Both `r` and `s` need clear high bit and no `0x00` + weak second byte. Uniform-byte model: **75.20%** fail; after offline r-filter + low-S ≈ **99.61%**. Fail leftover → **burn** presign, new nonce — never tweak `k` ([src/presign.ts](src/presign.ts), [docs/K1-CANONICAL.md](docs/K1-CANONICAL.md)).

Low-S: if `s > n/2`, set `s' = n - s` and **`recid ^= 1`**.

Prefer **R1** for zero-retry online when legacy K1 is not required (`src/curve.ts`).

### Codecs and digest

- `PUB_K1_` / `SIG_K1_`: RIPEMD-160(payload ‖ ASCII type); `header = 31 + recid` ([src/codec.ts](src/codec.ts))
- `sig_digest = SHA-256(chain_id ‖ packed_tx ‖ cfd_hash)` — not `tx_id` ([src/digest.ts](src/digest.ts))
- Lab signatures in this course sign a **proposal id**, not that digest — nodes will reject them as action sigs ([docs/LAB-SIGNER.md](docs/LAB-SIGNER.md))
- WharfKit **4.0.2** recovers published Jungle K1/R1 vectors and sorts authorities

### Policy

Default labs: WAX Testnet + Jungle 4. Operators may add testnets only:

```ts
createPolicy({ extraLabChainIds: [CHAINS.telosTestnet] });
```

Mainnets are always refused. Blocked: `updateauth`, `setcode`, free-typed accounts, memo account smuggling.

### Offline simulation

Fixtures: `clean-transfer`, `inline-escalation` (hidden `updateauth`), `assert-revert`, `context-free-or-deferred`. Simulation is necessary but never sufficient — pair with `linkauth` and short expiration ([src/simulate.ts](src/simulate.ts)).

---

## Masterclass — push, engines, what later work must prove

1. Reviewed MIT/Apache engine; no `backend-rug`, no AGPL/SLL in the tree  
2. K1 presignatures filtered offline; failed online check burns the slot  
3. Every co-signer packs and hashes; no `sign_digest` from the model  
4. Model process never maps a share into itself  
5. Cold `owner` can `updateauth` away a bad active key  
6. Independent audit before mainnet value  
7. Relay is not a party ([docs/RELAY.md](docs/RELAY.md))  
8. Push only after readiness + explicit `enableNetwork` ([docs/PUSH.md](docs/PUSH.md)); not an MCP tool  
9. Only `educational-mock` until Phase R.2; `sign()` throws ([docs/ENGINE.md](docs/ENGINE.md))

Until R.2 + audit: this is a course. The tests are the checks. There is no production threshold signer.

```bash
npm test && npm run check-skills
# optional:
cargo test -p antelope-crypto-format
```
