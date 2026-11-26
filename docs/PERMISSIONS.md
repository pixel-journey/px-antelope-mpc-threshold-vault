# Permissions an agent can live inside

An Antelope account is a name. `owner`, `active`, and any custom permission are rows on that name. `eosio::updateauth` replaces a row. The token balance and the NFTs stay. That is the whole reason a threshold key is useful here and still not the whole custody design.

## Three rows, three jobs

| Permission | Who should hold it | What it is for |
| --- | --- | --- |
| `owner` | A cold 2-of-3: hardware keys, or an `eosio.msig` board | Rotate `active` if the hot key is ever suspect. Not for daily transfers. |
| `active` | One public key, which may be the output of a threshold scheme | Daily actions that are not narrowed further. The chain still sees one `PUB_K1_` or `PUB_R1_`. |
| `agent` | A key or a share that an automated process can reach | Only the actions `linkauth` binds it to. Not `owner`. Not `active`. |

`eosio::linkauth` binds one permission to one contract action. An `agent` permission linked only to `eosio.token::transfer` can pay. It cannot change code, and it cannot change who owns the account. If the agent process is compromised, `owner` issues one `updateauth` and the `agent` key is gone. Nothing is transferred.

## What the chain checks

Every action names an account and a permission. nodeos recovers the public key from the signature and checks it against that permission's authority. The authority is a threshold over keys, accounts, and waits. WharfKit's `Authority.sort()` puts those entries in the order nodeos expects before the action is packed. Unsorted keys are a common reason a hand-packed `updateauth` is rejected. The test in `src/wharfkit.test.ts` sorts two K1 keys and checks the order. It does not broadcast.

## What an agent must not be allowed to pack

`updateauth`, `deleteauth`, `linkauth`, `unlinkauth`, `setcode`, and `setabi` change who can act or what code runs. They are blocked in `src/policy.ts`. An agent that needs one of them should stop and hand the proposal to a human on `owner`. The model does not get a tool that emits those action names.

## Native multisig beside the threshold key

`eosio.msig` is the slow, public path. Every approver is visible, and the proposal waits until the threshold is met. That is the right path for a treasury or a DAO. A threshold signature is the fast, private path for the hot permission. Use both. Do not replace the cold board with the hot key because the hot key feels modern.

The on-chain proposal lab is [wax-multi-sig-proposal-builder-and-simulator](https://github.com/pixel-journey/wax-multi-sig-proposal-builder-and-simulator). The permission-tree lab is [wax-permission-visualizer-and-editor](https://github.com/pixel-journey/wax-permission-visualizer-and-editor). A session key, covered in [wax-wharfkit-session-keys-and-linked-permissions](https://github.com/pixel-journey/wax-wharfkit-session-keys-and-linked-permissions), is a short-lived key on a linked permission. It is not a threshold share.
