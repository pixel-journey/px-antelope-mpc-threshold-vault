# Security

This repository is an unaudited educational lab.

- It does not sign, does not store a share, and does not broadcast.
- Do not point it at WAX mainnet, Vaulta, or Telos mainnet and expect a safety property. The policy example refuses those chain ids in memory only.
- Do not import silence-laboratories/dkls23, entropyxyz/synedrion, or a cggmp build with `backend-rug` into this MIT tree.
- The nonce-reuse fixture in `src/museum.ts` is a closed test vector. It is not a tool against someone else's signature pair. Two real signatures that share a nonce are already public evidence of the private key; this file does not search for them.
- Report issues on the repository. There is no bounty and no production deployment.
