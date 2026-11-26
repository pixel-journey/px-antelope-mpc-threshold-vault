---
name: antelope-agent-propose
description: Use when an agent needs to propose an Antelope transfer that a policy gate will check. Covers chain ids, recipient aliases, spend caps, and the actions that must be refused. Does not sign and does not hold a key.
license: MIT
---

# Propose an Antelope transfer

Work in this repository, not from memory.

- Call the policy gate in `src/policy.ts`. Do not invent a second gate.
- Allowed chain ids are the ones in `LAB_CHAIN_IDS` unless the operator has widened the list. Mainnet ids are refused by default.
- Recipient must be an alias the gate already knows (`px-treasury`, `wax-faucet`, `test-peer`). Free-typed account names are refused.
- Amount must be under the cap. Memo must be short ASCII and must not contain an account name.
- Blocked actions are `updateauth`, `deleteauth`, `linkauth`, `unlinkauth`, `setcode`, and `setabi`.
- The gate returns a decision. It does not pack a transaction and it does not sign.

If the agent cannot use WharfKit, it still has to produce a correct signing digest. See [docs/WITHOUT-WHARFKIT.md](../../docs/WITHOUT-WHARFKIT.md).

Run `npm test`. Do not add a signer to satisfy this skill.
