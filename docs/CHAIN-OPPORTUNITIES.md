# What an agent can do on each Antelope network

The proposal shape is the same on every chain: a chain id, a contract, an action, a recipient alias, an amount, a short memo, and an expiration. The policy gate resolves the alias and refuses anything outside its allow-list. What changes per network is the system token, the contracts worth calling, and whether the gate currently allows the chain id.

**Callable today without changing the gate:** four lab strategies — `wax-testnet-tip`, `treasury-tip`, `jungle-tip`, `peer-tip`. See [STRATEGIES.md](STRATEGIES.md).

The tables below are what becomes possible once an operator adds a chain id and an alias. The playbook catalog is also machine-readable in [src/playbooks.ts](../src/playbooks.ts).

## WAX

| Action | Contract | Why an agent would call it | Default gate |
| --- | --- | --- | --- |
| Transfer WAX | `eosio.token` | Tip, fund a faucet, move WAX between known aliases | Lab: allow · Mainnet: refuse |
| AtomicAssets transfer | `atomicassets` | Move an NFT the agent is allowed to handle | Refuse until allow-listed |
| mintasset / burnasset | `atomicassets` | Create or retire supply | Refuse (human / mint policy) |
| Stake / unstake | `eosio` | Adjust CPU/NET | Refuse |
| DEX swap shape | e.g. `alcor.dex` | Educational swap row in the playbook | Refuse |

WAX Testnet is the place to practice. WAX Mainnet is where those actions matter. Strategy ids: `wax-testnet-tip`, `treasury-tip`, `wax-mainnet-tip`, `nft-*`.

## Vaulta (EOS) / Jungle 4

| Action | Contract | Why an agent would call it | Default gate |
| --- | --- | --- | --- |
| Transfer A | `eosio.token` | Move the system token | Jungle: allow · Vaulta: refuse |
| buyram / delegatebw | `eosio` | RAM and stake | Refuse |
| setcode | `eosio` | Deploy | Blocked by name |
| eosio.msig::propose | `eosio.msig` | Native multisig — complements MPC | Refuse (different lab) |

Vaulta and EOS share chain id `aca376…`. Jungle 4 is the testnet and the source of the published digest vector. Strategy ids: `jungle-tip`, `peer-tip`, `vaulta-tip`, `buy-ram`, `setcode`.

## Telos

| Action | Contract | Why an agent would call it | Default gate |
| --- | --- | --- | --- |
| Transfer TLOS | `eosio.token` | Move the system token | Refuse until chain id added |
| Telos-native contracts | varies | Only after allow-list entries | Refuse |

Telos completed its Savanna transition in July 2026. The experimental Quantum Testnet is a separate network for post-quantum migration tests — not a place this course's gate allows. Strategy ids: `telos-tip`, `telos-testnet-tip`.

## XPR Network (Proton)

| Action | Contract | Why an agent would call it | Default gate |
| --- | --- | --- | --- |
| Transfer XPR | `eosio.token` | Move the system token; often pairs with payment rails | Refuse until chain id added |
| Proton-native contracts | varies | Only after allow-list entries | Refuse |

XPR Network and Proton share the same chain id. Strategy ids: `xpr-tip`, `xpr-testnet-tip`.

## UX Network

| Action | Contract | Why an agent would call it | Default gate |
| --- | --- | --- | --- |
| Transfer UX | `eosio.token` | Move the system token once the gate allows the chain id | Refuse |

Strategy id: `ux-tip`.

## Cross-chain and multi-footprint

An agent that holds a secp256k1 share can, in principle, produce a signature for any chain that accepts secp256k1. The digest rules differ:

| Family | Digest idea | This course |
| --- | --- | --- |
| Antelope | `SHA-256(chain_id ‖ packed_tx ‖ cfd_hash)` | Locked |
| Ethereum | RLP + chain id placement | Not produced |
| Bitcoin Taproot | Schnorr via FROST, not ECDSA | Named only in the blueprint |

**Replay protection:** the chain id inside the Antelope signing digest prevents a WAX transfer from being replayed on Telos. Do not strip it. Lab strategies already use different proposal ids across chains.

**Hybrid custody (blueprint thesis):** put the MPC (or lab) key on `active` for day-to-day agent tips; keep a weighted cold multisig on `owner` so one `updateauth` can revoke a compromised active key without moving tokens or NFTs. See [ARCHITECTURE.md](../ARCHITECTURE.md).

**What stays human even after a chain is opened:**

- `updateauth` / `linkauth` / `setcode` / `deleteauth`
- Over-cap transfers
- NFT mint/burn unless a dedicated policy exists
- RAM / stake / REX
- Any free-typed account name (aliases only)

## What the agent must still not do

- Trust a digest that someone else hashed
- Use a transaction id, a block id, or `orng.wax` as a nonce
- Hold the only share
- Call `updateauth`, `setcode`, or `deleteauth` from the agent permission
- Skip the gate because the model sounds sure

See [AGENT-STRATEGIES.md](AGENT-STRATEGIES.md) for share roles and [NETWORKS.md](NETWORKS.md) for chain ids.
