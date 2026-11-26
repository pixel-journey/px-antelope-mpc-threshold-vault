# What an agent can do on each Antelope network

The proposal shape is the same on every chain: a chain id, a contract, an action, a recipient alias, an amount, a short memo, and an expiration. The policy gate resolves the alias and refuses anything outside its allow-list. What changes per network is the system token, the contracts worth calling, and whether the gate currently allows the chain id.

The gate in this course allows only WAX Testnet and Jungle 4. The tables below are what becomes possible once an operator adds a chain id and an alias.

## WAX

| Action | Contract | Why an agent would call it |
| --- | --- | --- |
| Transfer WAX | `eosio.token` | Pay a tip, fund a faucet, or move WAXP between known accounts. |
| AtomicAssets transfer / burn | `atomicassets` | Move or retire an NFT the agent is allowed to handle. The gate must allow-list the specific action. |
| Stake / unstake | `eosio` | Adjust CPU/NET for the account. Usually a human action, not an agent action. |

WAX Testnet is the place to practice. WAX Mainnet is the place those actions matter. The gate refuses the mainnet id until it is added.

## Vaulta (EOS)

| Action | Contract | Why an agent would call it |
| --- | --- | --- |
| Transfer A | `eosio.token` | Move the system token. |
| REX / RAM | `eosio` | Buy or sell RAM, or interact with REX. These are higher-risk and should stay behind a tighter cap or a human approval. |

Vaulta and EOS share the chain id `aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906`. Jungle 4 is the testnet.

## Telos

| Action | Contract | Why an agent would call it |
| --- | --- | --- |
| Transfer TLOS | `eosio.token` | Move the system token. |
| Telos-native contracts | varies | Only after the gate has an allow-list entry for that contract and action. |

Telos completed its Savanna transition in July 2026. The experimental Quantum Testnet is a separate network for post-quantum migration tests. It is not a place this course's gate allows.

## XPR Network (Proton)

| Action | Contract | Why an agent would call it |
| --- | --- | --- |
| Transfer XPR | `eosio.token` | Move the system token. |
| Proton-native contracts | varies | Only after the gate has an allow-list entry. |

XPR Network and Proton share the same chain id. The gate must be given that id explicitly.

## UX Network

| Action | Contract | Why an agent would call it |
| --- | --- | --- |
| Transfer UX | `eosio.token` | Move the system token once the gate allows the chain id. |

## Cross-chain

An agent that holds a secp256k1 share can, in principle, produce a signature for any chain that accepts secp256k1. The digest rules differ:

- Antelope: `SHA-256(chain_id || packed_transaction || cfd_hash)`.
- Ethereum: a different RLP encoding and a different chain id placement.
- Bitcoin Taproot: Schnorr via FROST, not ECDSA.

This course locks the Antelope digest. It does not produce an Ethereum transaction or a Bitcoin signature. If the same key material is used on more than one chain, the policy gate must be told which chain id is allowed for which action. The chain id inside the Antelope signing digest is what prevents a WAX transfer from being replayed on Telos. Do not strip it.

## What the agent must still not do

- Trust a digest that someone else hashed.
- Use a transaction id, a block id, or `orng.wax` as a nonce.
- Hold the only share.
- Call `updateauth`, `setcode`, or `deleteauth` from the agent permission.
- Skip the gate because the model sounds sure.

See [AGENT-STRATEGIES.md](AGENT-STRATEGIES.md) for the share roles and [NETWORKS.md](NETWORKS.md) for the chain ids.
