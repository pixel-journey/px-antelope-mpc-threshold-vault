# Agent strategies on Antelope

An agent that can act on Antelope is an agent that can propose a narrow action, have that proposal checked by something that is not the model, and then obtain a signature that the network will accept. The signature is one 65-byte value. The network does not see how many parties helped produce it.

## Three share roles

| Share | Where it lives | What it can do alone |
| --- | --- | --- |
| User / browser | Encrypted local storage, unlocked by a passkey or passphrase | Nothing. Needs a second share. |
| Policy co-signer | Server process that decodes the transaction and runs the gate | Nothing. Needs a second share. |
| Agent / recovery | Offline file for a human, or a `linkauth`-scoped key for an agent | Nothing. Needs a second share. |

A 2-of-3 means any two of those can produce a signature. The agent never holds the only share. If the agent is compromised, the owner rotates the `agent` permission with one `updateauth`. The tokens and NFTs stay on the account name.

## Four tools an agent is allowed to call

These are the only tools the blueprint's MCP server exposes. None of them hold a key or sign.

1. **Inspect** — Read an account's permissions, `linkauth` bindings, and CPU/NET/RAM. No write.
2. **Decode and simulate** — Unpack an action and ask a node what the balance deltas would be. No write.
3. **Propose a transfer** — Send a chain id, a recipient alias, an amount, and a short memo. The policy gate resolves the alias. Free-typed account names are refused.
4. **Check status** — Ask whether the gate auto-approved the proposal or escalated it to a human.

`src/policy.ts` is the local stand-in for tool 3. It refuses mainnet, refuses `updateauth`, refuses a memo that contains an account name, and refuses amounts over the cap. A later lab can wrap the same checks behind an MCP server.

## Per-chain opportunities

The same proposal shape works on every Antelope network. What changes is the chain id, the system token, and the contracts an agent is allowed to call.

| Network | Token | What an agent can usefully do today |
| --- | --- | --- |
| WAX Testnet | WAX | Propose a transfer to a faucet or a test peer. Practice the gate. |
| Jungle 4 | A / EOS | Same as WAX Testnet. The published digest vector in this course is from here. |
| WAX Mainnet | WAX | Pay for AtomicAssets actions, tip, or move WAXP once the gate is widened and the account is funded. |
| Vaulta | A | Transfer A, interact with REX or RAM markets, once the gate allows the chain id. |
| Telos | TLOS | Transfer TLOS or call a Telos-native contract the gate has allow-listed. |
| XPR Network | XPR | Transfer XPR or call a Proton contract the gate has allow-listed. |
| UX | UX | Transfer UX once the gate allows the chain id. |

The policy gate in this course currently only allows the two lab testnets. Adding a mainnet is a configuration change: put the chain id in the allow-list, give the agent an alias that resolves to a real account, and keep the blocked-action list.

## Cross-chain

An agent that holds a secp256k1 share can, in principle, produce a signature for any chain that accepts secp256k1. Antelope, Ethereum, and Bitcoin Taproot (via FROST, not ECDSA) are different signature formats and different digest rules. This course locks the Antelope digest and the K1 canonical check. It does not produce an Ethereum transaction or a Bitcoin signature.

If the same key material is used on more than one chain, the policy gate must be told which chain id is allowed for which action. A transfer on WAX must not be replayable on Telos. The chain id inside the signing digest is what prevents that replay. Do not strip it.

## What the agent must not do

- Trust a digest that someone else hashed. Pack the transaction and hash it.
- Use a transaction id, a block id, or `orng.wax` as a nonce.
- Hold the only share.
- Skip the gate because the model "sounds sure."
- Call `updateauth`, `setcode`, or `deleteauth` from the agent permission.

See [AGENTIC-PAYMENTS.md](AGENTIC-PAYMENTS.md) for the payment loop and [NETWORKS.md](NETWORKS.md) for the chain ids.
