# Antelope networks

An agent that can pay on one Antelope chain can pay on the others. The account name, the permission tree, and the 65-byte signature are the same shape. Only the chain id, the system token symbol, and the public endpoints change.

This course's policy gate still defaults to the two lab testnets. The map below is what you use when you decide the agent is ready for a wider set.

## Chain ids

These ids come from `@wharfkit/session` 4.0.2 `Chains`. They were re-read while this file was written.

| Network | Chain id | System token | Typical public endpoint |
| --- | --- | --- | --- |
| WAX Mainnet | `1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4` | WAX | `https://wax.greymass.com` |
| WAX Testnet | `f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12` | WAX | `https://waxtestnet.greymass.com` |
| Vaulta (EOS) Mainnet | `aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906` | A | `https://eos.greymass.com` |
| Jungle 4 (Vaulta testnet) | `73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d` | A / EOS | `https://jungle4.greymass.com` |
| Telos Mainnet | `4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11` | TLOS | `https://telos.greymass.com` |
| Telos Testnet | `1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f` | TLOS | `https://telostestnet.greymass.com` |
| XPR Network (Proton) Mainnet | `384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0` | XPR | `https://proton.greymass.com` |
| XPR Network Testnet | `71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd` | XPR | `https://proton-testnet.greymass.com` |
| UX Network | `8fc6dce7942189f842170de953932b1f66693ad3788f766e777b6f9d22335c02` | UX | (check current public nodes) |

Vaulta and EOS share the same chain id. XPR Network and Proton share the same chain id. An agent that hard-codes "EOS" or "Proton" will still hit the right network if it uses the id above.

## What an agent needs per network

1. The chain id (so the signing digest is bound to that chain).
2. A working RPC endpoint that answers `/v1/chain/get_info` and `/v1/chain/push_transaction`.
3. The system token symbol and precision (WAX is 8 decimals on mainnet in some contracts, 4 in others; check the token contract).
4. A permission that is allowed to call `eosio.token::transfer` (or whatever action the agent is supposed to take).

The policy gate in `src/policy.ts` currently only allows WAX Testnet and Jungle 4. To let an agent propose a transfer on Telos or XPR, add the chain id to the allow-list and give the agent an alias that resolves to a real account on that chain. The gate still refuses `updateauth`, `setcode`, and free-typed recipient names.

## Testnets first, then mainnets

Start on WAX Testnet or Jungle 4. The same proposal shape works on the mainnets once the agent has a funded account and the policy gate has been widened. The course does not broadcast on any of them.
