# Antelope networks

An agent that can pay on one Antelope chain can pay on the others. The account name, the permission tree, and the 65-byte signature are the same shape. Only the chain id, the system token symbol, and the public endpoints change.

This course's policy gate still defaults to the two lab testnets. Operators may opt into **additional testnets** via `createPolicy({ extraLabChainIds: [...] })`. Mainnet chain ids are always refused, even if listed by mistake.

## Chain ids

These ids come from `@wharfkit/session` 4.0.2 `Chains`.

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

Vaulta and EOS share the same chain id. XPR Network and Proton share the same chain id.

## Default lab set vs operator opt-in

```ts
import { createPolicy } from "./policy.js";
import { CHAINS } from "./digest.js";

// Default: WAX Testnet + Jungle 4 only
createPolicy();

// Operator opens Telos Testnet (still not mainnet)
createPolicy({ extraLabChainIds: [CHAINS.telosTestnet, CHAINS.xprTestnet] });
```

| Chain | Default gate | With `extraLabChainIds` |
| --- | --- | --- |
| WAX Testnet / Jungle 4 | Allow (with matching symbol) | Allow |
| Telos Testnet / XPR Testnet | Refuse | Allow if listed + symbol `TLOS` / `XPR` |
| Any mainnet | Refuse | **Still refuse** (stripped from extra list) |

Symbol map for opted-in testnets is in `src/policy.ts` (`SYMBOL_BY_CHAIN`).

## What an agent needs per network

1. The chain id (so the signing digest is bound to that chain).
2. A working RPC endpoint that answers `/v1/chain/get_info` and `/v1/chain/push_transaction` (this course does not call them).
3. The system token symbol and its precision. The lab gate counts amounts as 4-decimal units (`10000n` = `1.0000`). WAX mainnet assets use 8 decimals; a co-signer packing a real WAX transfer must use that precision.
4. A permission that is allowed to call `eosio.token::transfer`.

The gate still refuses `updateauth`, `setcode`, and free-typed recipient names.

## Testnets first, then mainnets

Start on WAX Testnet or Jungle 4. Opt into other testnets deliberately. Mainnets are never a default or a soft option in this course.
