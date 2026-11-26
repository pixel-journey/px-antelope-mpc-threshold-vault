---
name: mpc-security-audit
description: Use when reviewing this course, a Cargo manifest, or a pull request for forbidden MPC licenses, raw-digest signing, mainnet defaults, nonce reuse, or model-fired push. Does not perform a cryptographic audit.
license: MIT
---

# Review checklist

Reject the change if any of these appear in a manifest, deny exception, or a default config:

- `silence-laboratories` or a non-commercial SLL license
- `entropyxyz/synedrion` or AGPL-3.0 for the signing engine
- `backend-rug`, `rug`, or `gmp-mpfr-sys`
- crate name `cggmp21` (superseded; CVE-2025-66016 / 66017 lineage)
- `insecure-assume-preimage-known`
- `@wharfkit/wallet-plugin-wombat`
- a default chain id other than WAX Testnet or Jungle 4
- an exported function that signs a caller-supplied digest (`sign_digest`)
- a nonce or DKG coefficient taken from a transaction id, a block id, or `orng.wax`
- an MCP tool that calls `push_transaction`
- code that sets `signedAntelopeDigest: true` for a lab proposal-id signature

Also check:

- `deny.toml` still denies unknown git and the crates above
- `src/hygiene.ts` still lists the manifest strings
- `npm test` still scans `package.json`
- skills stay under the frontmatter rules in `scripts/check-skills.mjs`

This skill does not certify DKLs23, cggmp24, or any wallet. Say "not audited here" rather than implying a review you did not do.
