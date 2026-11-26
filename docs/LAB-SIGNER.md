# The lab signer, and what it is not

The course used to stop before a signature. That made the last step of the agent loop invisible. A student could propose and be allowed, and then had nothing to recover.

[src/labsign.ts](../src/labsign.ts) closes that gap with a throwaway key.

## What it is

`createLabKey()` makes one secp256k1 `PrivateKey` in this process. `signAllowed()` signs only after:

1. The policy gate returned `ok: true`.
2. The chain id is WAX Testnet or Jungle 4.
3. `handoff()` bound the same fields the agent proposed.

It returns a real `SIG_K1_`. `recoverLab()` recovers the public key from that signature and the proposal id. The tests lock both the recovery and the mainnet refusal.

## What it is not

It is not a threshold share. It is not DKLs23 or CGGMP24. It is not a co-signer in another process. It does not broadcast. The signature is over the proposal id, which is a length-prefixed hash of the bound fields. It is not `SHA-256(chain_id || packed_transaction || cfd_hash)`. A node will not accept it as an action signature.

That is on purpose. The lab key teaches the shape an agent sees: a signature string, a public key, and a recovery check. The real Antelope digest is still the one in [src/digest.ts](../src/digest.ts) and the Jungle 4 vector. A production co-signer packs the transaction itself and signs that digest. The mock engine in [src/threshold.ts](../src/threshold.ts) still refuses to sign, because a fake threshold ceremony should not look like a real one.

## When to use it

Use it in a test, a notebook, or an agent dry-run on a lab chain. Do not put the lab key on an account that holds value. Do not treat a recovered lab key as evidence that a threshold protocol ran.
