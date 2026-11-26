# The lab signer, and what it is not

[src/labsign.ts](../src/labsign.ts) produces a throwaway recoverable `SIG_K1_` after the policy gate allows a proposal.

## What it is

`createLabKey()` makes one secp256k1 `PrivateKey` in-process. `signAllowed()` signs only when:

1. The policy gate returned `ok: true`.
2. The chain id is in the **allowed lab set** (default `LAB_CHAIN_IDS`, or the same set passed via `allowedChainIds` / policy `labChainIds` after `extraLabChainIds`).
3. Mainnets are never in that set.
4. `handoff()` bound the same fields the agent proposed.

`recoverLab()` recovers the public key from the signature and the proposal id.

Strategies call this automatically after allow, including operator-opted Telos/XPR testnets when using `runStrategyWithPolicy`.

## What it is not

- Not a threshold share, DKLs23, or CGGMP24  
- Not a co-signer in another process  
- Does not broadcast (`src/broadcast.ts` still refuses send)  
- Signature is over the **proposal id**, not `SHA-256(chain_id ‖ packed_tx ‖ cfd_hash)`  
- A node will **not** accept it as an action signature  

That is intentional. The lab key teaches the agent-visible shape (signature string, pubkey, recovery). Real Antelope digests remain in [src/digest.ts](../src/digest.ts). The mock engine in [src/threshold.ts](../src/threshold.ts) still refuses to sign.

## When to use it

Tests, notebooks, agent dry-runs on lab/opted testnets. Never put the lab key on an account that holds value.
