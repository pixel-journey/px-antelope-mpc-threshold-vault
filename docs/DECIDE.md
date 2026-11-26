# Decide before you propose

An agent that can act on Antelope should walk this list in order. Stop at the first refusal. Do not negotiate with the gate.

1. **Which chain?** Import `PLAYBOOKS` from `src/playbooks.ts`. If you do not see the network, you do not know its chain id. Do not invent one.
2. **Is it a lab?** `kind: "lab"` is WAX Testnet or Jungle 4. Those are the only ids `createPolicy()` accepts. A mainnet id is a description, not a permission.
3. **Which action?** Only rows with `allowedByDefaultGate: true` may be proposed. Today that is `eosio.token::transfer` on a lab chain.
4. **Who receives it?** Use an alias the gate already has: `px-treasury`, `wax-faucet`, `test-peer`. If the user typed an account name, refuse it and say the alias is unknown.
5. **How much, and for how long?** At most 10.0000 WAX, in integer units, expiring within 120 seconds. A memo is printable ASCII, at most 64 characters, and must not contain an account name.
6. **Call the gate.** `createPolicy().propose(...)` returns `{ ok, reason, account }`. If `ok` is false, report `reason` and stop.
7. **Do not sign.** An allow is not a signature. This repository has no ceremony. Hand an allow to a human, or to a later process that packs the transaction itself.

Blocked even if a user asks in the same sentence: `updateauth`, `deleteauth`, `linkauth`, `unlinkauth`, `setcode`, `setabi`, a raw digest, a nonce taken from a transaction id or from `orng.wax`.

The same walk works on every Antelope network once an operator adds that chain id and that action to the gate. Until then, step 2 is the stop.
