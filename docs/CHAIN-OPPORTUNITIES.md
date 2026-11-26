# What an agent can do on each Antelope network

The proposal shape is the same on every chain: chain id, contract, action, recipient alias, amount, short memo, expiration. The policy gate resolves the alias and refuses anything outside its allow-list.

**Callable on the default gate:** `wax-testnet-tip`, `treasury-tip`, `jungle-tip`, `peer-tip` → allow + recoverable lab `SIG_K1_` (proposal id, not node digest).

**Callable with operator opt-in:** `telos-testnet-tip`, `xpr-testnet-tip` via `runStrategyWithPolicy(..., { extraLabChainIds })` → allow + lab `SIG_K1_`.

**Optional lab HTTP:** `fetchLabChainInfo` / `pushLabTransaction` only with `enableNetwork` and (for push) readiness. Not an MCP tool. See [PUSH.md](PUSH.md).

Machine-readable playbooks: [src/playbooks.ts](../src/playbooks.ts). Strategies: [STRATEGIES.md](STRATEGIES.md).

## WAX

| Action | Contract | Default gate |
| --- | --- | --- |
| Transfer WAX | `eosio.token` | Lab: allow · Mainnet: refuse |
| AtomicAssets transfer / mint / burn | `atomicassets` | Refuse until dedicated allow-list |
| Stake / unstake | `eosio` | Refuse |
| DEX swap shape | e.g. Alcor | Refuse (playbook row only) |
| `orng.wax` | WAX only | Public RNG — never an MPC nonce |

## Vaulta (EOS) / Jungle 4

| Action | Contract | Default gate |
| --- | --- | --- |
| Transfer A | `eosio.token` | Jungle: allow · Vaulta mainnet: refuse |
| buyram / delegatebw | `eosio` | Refuse |
| setcode | `eosio` | Blocked by name |
| eosio.msig::propose | `eosio.msig` | Refuse (separate msig lab) |

Jungle 4 is the source of the published digest vector (`testdata/vectors.json`).

## Telos

| Action | Default gate |
| --- | --- |
| Transfer TLOS on **testnet** | Refuse by default; **allow + lab sig** with `extraLabChainIds: [telosTestnet]` |
| Transfer TLOS on **mainnet** | Always refuse |
| Quantum Testnet (PQ experiments) | Not in this gate |

## XPR Network (Proton)

| Action | Default gate |
| --- | --- |
| Transfer XPR on **testnet** | Refuse by default; **allow + lab sig** with `extraLabChainIds: [xprTestnet]` |
| Transfer XPR on **mainnet** | Always refuse |

## UX Network

Transfer UX mainnet: refuse. No testnet row in the default catalog yet.

## What is shared vs chain-specific

| Shared Antelope | Often chain-specific |
| --- | --- |
| Account names, `updateauth`, `linkauth` | RAM/CPU model details |
| ECDSA K1/R1 authorities | `orng.wax` (WAX) |
| `sig_digest = SHA-256(chain_id ‖ packed ‖ cfd)` | AtomicAssets deployment names |
| `eosio.token::transfer` shape | Alcor / bridge contracts and memo formats |

## Cross-chain and multi-footprint

| Family | Digest idea | This course |
| --- | --- | --- |
| Antelope | `SHA-256(chain_id ‖ packed_tx ‖ cfd_hash)` | Locked |
| Ethereum | RLP + chain id | Not produced |
| Bitcoin Taproot | Schnorr / FROST | Named only |

**Replay protection:** chain id inside the Antelope digest prevents cross-chain replay of a real packed tx. Lab strategies use different proposal ids per strategy/chain.

Bridges (including newer Alcor-style bridges) are **application** contracts. This course does not encode bridge memos or claim cross-chain settlement. A later repo can teach them after the policy gate grows a dedicated allow-list.

**Hybrid custody:** MPC (or lab) key on `active`; cold 2-of-3 on `owner`. See [ARCHITECTURE.md](../ARCHITECTURE.md).

**Always human:** `updateauth` / `linkauth` / `setcode` / over-cap / mint-burn without policy / free-typed accounts.

## What the agent must still not do

- Trust a digest someone else hashed
- Use a tx id / block id / `orng.wax` as a nonce
- Hold the only share
- Call permission or code-changing actions from the agent path
- Skip the gate because the model sounds sure
- Fire `push_transaction` from the model
