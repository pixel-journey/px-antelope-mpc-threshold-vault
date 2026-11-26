---
name: mpc-security-audit
description: Use when reviewing this course, a Cargo manifest, or a pull request for forbidden MPC licenses, raw-digest signing, mainnet defaults, or nonce reuse. Does not perform a cryptographic audit.
license: MIT
---

# Review checklist

Reject the change if any of these appear in a manifest or a default config:

- `silence-laboratories` or a non-commercial SLL license
- `entropyxyz/synedrion` or AGPL-3.0 for the signing engine
- `backend-rug`
- `insecure-assume-preimage-known`
- `@wharfkit/wallet-plugin-wombat`
- a default chain id other than WAX Testnet or Jungle 4
- an exported function that signs a caller-supplied digest
- a nonce or DKG coefficient taken from a transaction id, a block id, or `orng.wax`

`src/hygiene.ts` lists the manifest strings. `npm test` scans this repo's `package.json`.

This skill does not certify DKLs23, cggmp24, or any wallet. Say "not audited here" rather than implying a review you did not do.
