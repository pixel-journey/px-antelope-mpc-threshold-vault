# After the gate

`runStrategy` returns a decision. [src/next.ts](../src/next.ts) turns that decision into the next move an agent is allowed to take.

| `next` | Meaning |
| --- | --- |
| `stop` | The gate refused. Report the reason. Do not rewrite the fields. |
| `handoff` | Allowed, no lab signature attached. Bind the fields and give them to a co-signer. |
| `lab-only` | Allowed, and a throwaway `SIG_K1_` was produced. It is over the proposal id. A node will not accept it. |

`pushFromModel` is always false. `labSignatureIsNodeValid` is always false.

## Cross-chain

[src/domains.ts](../src/domains.ts) compares two handoffs. Different chain ids are not the same ceremony. A real Antelope signing digest prepends the chain id, so a packed WAX transfer cannot be replayed on Telos or Jungle 4. Do not strip that prefix.

## Per-chain rows

[src/opportunities.ts](../src/opportunities.ts) lists what is callable today and what is only a description:

- Callable today: WAX Testnet transfer, Jungle 4 transfer.
- WAX-only and refused: AtomicAssets, `orng.wax` (public game randomness, never an MPC nonce).
- Shared but refused: `eosio.msig::propose`, `eosio::buyram`.
- Chain-specific and refused: Alcor-style swap or bridge shapes.

See [DECIDE.md](DECIDE.md) for the ordered walk and [STRATEGIES.md](STRATEGIES.md) for the named ids.
