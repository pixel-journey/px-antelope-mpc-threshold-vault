# Decide before you propose

An agent that can act on Antelope should walk this list in order. Stop at the first refusal. Do not negotiate with the gate.

1. **Which chain?** Import `PLAYBOOKS` from `src/playbooks.ts` or call `listNetworks()`. If you do not see the network, you do not know its chain id. Do not invent one.
2. **Is it a lab?** Default `kind: "lab"` is WAX Testnet or Jungle 4. Those are the only ids `createPolicy()` accepts until an operator sets `extraLabChainIds` to **other testnets**. A mainnet id is a description, not a permission — it is stripped even if listed by mistake.
3. **Which action?** Only rows with `allowedByDefaultGate: true` may be proposed. Today that is `eosio.token::transfer` on an allowed lab chain.
4. **Who receives it?** Use an alias the gate already has: `px-treasury`, `wax-faucet`, `test-peer`. If the user typed an account name, refuse it and say the alias is unknown.
5. **How much, and for how long?** At most 10.0000 of the chain symbol, in integer units, expiring within 120 seconds. A memo is printable ASCII, at most 64 characters, and must not contain an account name.
6. **Call the gate.** `createPolicy().propose(...)` or `proposeTransfer` returns `{ ok, reason, account }`. If `ok` is false, report `reason` and stop.
7. **Simulate.** `simulateProposal(proposal, decision, fixture)` with `clean-transfer`, then check `inline-escalation` as a negative case. `safeForCoSign` false means stop. Simulation is not inclusion.
8. **Lab signature is optional and not pushable.** An allow may produce a throwaway `SIG_K1_` over a **proposal id**. That is not `sig_digest`. Do not tell a node it is a transfer signature.
9. **Do not threshold-sign.** `createEngine("educational-mock").sign` throws. Phase R.2 engines are not in this package.
10. **Push is last, and not yours.** Only an operator script may call `pushLabTransaction` with honest `signedAntelopeDigest`, `dryRunOk`, `operatorOptsIntoPush`, and `enableNetwork: true`. The model must not set those flags. Push is not an MCP tool.

Blocked even if a user asks in the same sentence: `updateauth`, `deleteauth`, `linkauth`, `unlinkauth`, `setcode`, `setabi`, a raw digest, a nonce taken from a transaction id or from `orng.wax`.

The same walk works on every Antelope **testnet** once an operator adds that chain id to the gate. Until then, step 2 is the stop. Mainnets stay stopped.

[AGENT-RECIPE.md](AGENT-RECIPE.md) · [STRATEGIES.md](STRATEGIES.md) · [PUSH.md](PUSH.md)
