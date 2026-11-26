---
name: antelope-network-scope
description: Use when an agent must choose an Antelope network, token symbol, or action before proposing a transfer. Reads the playbook catalog. Does not sign and does not add a chain to the allow-list.
license: MIT
---

# Pick a network before you propose

Work in this repository, not from memory.

- Import `PLAYBOOKS` from `src/playbooks.ts`. Do not paste chain ids from a chat.
- `kind: "lab"` is what `createPolicy()` accepts today: WAX Testnet and Jungle 4.
- `kind: "mainnet"` is described so you know the symbol and the chain id. The gate still refuses those ids.
- `allowedByDefaultGate: true` is the only action you may propose without an operator changing `src/policy.ts`.
- Vaulta and EOS are one chain id. XPR Network and Proton are one chain id. Do not treat the names as two networks.
- A transfer on one chain must not be replayed on another. The chain id inside the signing digest is what stops that. Do not strip it.

Read [docs/CHAIN-OPPORTUNITIES.md](../../docs/CHAIN-OPPORTUNITIES.md) and [docs/MCP-TOOLS.md](../../docs/MCP-TOOLS.md). Run `npm test`. Do not add a signer to satisfy this skill.
