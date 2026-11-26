# Agentic payments on Antelope

An agent that can pay is an agent that can propose a transfer, have that proposal checked by something that is not the model, and then produce a signature that the network will accept.

On Antelope the signature is one 65-byte ECDSA value. The network does not see how many parties helped produce it. That is why a threshold scheme is useful for an agent: the agent can hold one share, a policy service can hold another, and a human can hold the third. No single process can move the money alone.

## The loop

1. The agent decides it wants to send 1.0000 WAX to `treasury.pxj` on WAX Testnet.
2. It builds a proposal: chain id, contract (`eosio.token`), action (`transfer`), recipient alias, amount, memo, expiration.
3. A policy gate (this course's `src/policy.ts` is a local stand-in) checks the proposal. It refuses mainnet, refuses `updateauth`, refuses a memo that contains an account name, and refuses amounts over the cap.
4. If the gate allows it, the agent (or a co-signer) packs the transaction, computes the signing digest, and obtains a signature.
5. The signed transaction is pushed. The network recovers the public key and checks it against the account's `active` (or linked) permission.

The course stops at step 3. Steps 4 and 5 are what a later lab would add once the threshold engines are compiled and reviewed.

## Why the account name matters

The agent's permission does not have to be `active`. You can create a custom permission called `agent`, put a key (or an MPC public key) on it, and `linkauth` it to `eosio.token::transfer` only. The agent can then pay, but it cannot change the account's owner or active key. If the agent is compromised, the owner rotates the `agent` permission with one `updateauth`. The tokens and NFTs stay on the account name.

## What the agent must not do

- Trust a digest that someone else hashed. The agent (or its co-signer) must pack the transaction and hash it.
- Use a transaction id or a block id as a nonce. Those are public.
- Hold the only share. A 2-of-3 where the agent has one share and a policy service has another means the agent cannot pay by itself.
- Skip the policy gate because the model "sounds sure." The gate is the part that is not a language model.

## Across networks

The same proposal shape works on Telos, XPR Network, Vaulta, and UX. Change the chain id, the token symbol, and the recipient account. The policy gate in this course currently only allows the two lab testnets. Widening it is a configuration change, not a new protocol.

See [NETWORKS.md](NETWORKS.md) for the chain ids and [WITHOUT-WHARFKIT.md](WITHOUT-WHARFKIT.md) if the agent cannot use the WharfKit packages.
