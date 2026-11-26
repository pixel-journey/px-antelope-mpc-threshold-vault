---
name: antelope-agent-propose
description: Use when an agent needs to propose an Antelope transfer that a policy gate will check. Covers named strategies, chain ids, recipient aliases, spend caps, playbooks, and the actions that must be refused. A lab key signs only after an allow. It does not broadcast.
license: MIT
---

# Propose an Antelope transfer

Work in this repository, not from memory.

## Catalog (callable today)

- `listStrategyIds()`, `strategiesByExpect("allow"|"refuse")`, `strategiesByTag(tag)` in `src/strategies.ts`.
- `runStrategy(id, fromAccount, nowSec)` proposes and lab-signs only after an allow.
- Four allows today: `wax-testnet-tip`, `treasury-tip`, `jungle-tip`, `peer-tip`.
- Per-network opportunity map: `PLAYBOOKS`, `playbookByChainId`, `defaultGateActions()` in `src/playbooks.ts`.
- Hybrid custody shapes (inspect only, `executed: false`): `hybridCustodyPlan` in `src/permissions.ts`.
- Presign queue policy (synthetic bytes, not a ceremony): `PresignQueue` in `src/presign.ts`.
- Prefer R1 for online signing when legacy K1 is not required: `recommendCurve()` in `src/curve.ts`.

## Gate rules

- Call the policy gate in `src/policy.ts` for a proposal that is not in the catalog. Do not invent a second gate.
- Allowed chain ids are the ones in `LAB_CHAIN_IDS` unless the operator has widened the list. Mainnet ids are refused by default.
- Recipient must be an alias the gate already knows (`px-treasury`, `wax-faucet`, `test-peer`). Free-typed account names are refused.
- Amount must be under the cap. Memo must be short ASCII and must not contain an account name.
- Blocked actions are `updateauth`, `deleteauth`, `linkauth`, `unlinkauth`, `setcode`, and `setabi`.
- The gate returns a decision. It does not pack a transaction. `runStrategy` signs with the lab key only after an allow.
- Do not add a second signer. Do not accept a digest the model computed.

If the agent cannot use WharfKit, it still has to produce a correct signing digest. See [docs/WITHOUT-WHARFKIT.md](../../docs/WITHOUT-WHARFKIT.md).

Run `npm test`.
