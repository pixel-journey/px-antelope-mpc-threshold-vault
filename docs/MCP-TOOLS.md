# Four tools, and nothing that signs

An agent connected over the Model Context Protocol can call tools. Those tools run code. A tool description is not a security boundary: hidden text in a description, a description that changes after approval, and one server shadowing another's tool name have all been shown in the wild. The prompt is not the gate.

The safe split is the one this course already codes. The model proposes. A function that does not hold a key decides. Signing, if it ever happens, happens in a different process that has already read the same transaction the model claims to have proposed.

## The four calls

None of these hold a share. None of them return a signature.

### 1. Inspect

Read-only. Ask a node for an account's permissions, `linkauth` rows, and CPU, NET, and RAM. This course does not open a socket. A later tool would call `get_account` and return the rows. It would not follow a URL or a memo from the model.

### 2. Decode and simulate

Read-only. Unpack an action against its ABI and ask the node what the balance changes would be. If the simulation shows a recipient the policy alias does not name, the proposal stops. This course does not simulate against a node. The policy gate is the local stand-in: unknown aliases are refused before any network call.

### 3. Propose a transfer

This is `createPolicy().propose` in [src/policy.ts](../src/policy.ts). The model supplies:

| Field | Rule |
| --- | --- |
| `chainId` | Must be a lab id unless an operator has widened the list. Mainnet ids are refused. |
| `contract` / `action` | Only `eosio.token` / `transfer` today. |
| `alias` | `px-treasury`, `wax-faucet`, or `test-peer`. A raw account name is refused. |
| `amountUnits` | Integer smallest units, from 1 through 100000 (10.0000 WAX). |
| `symbol` | `WAX` in the current allow-list. |
| `memo` | Printable ASCII, at most 64 characters, and not an account name hiding in the text. |
| `nowSec` / `expiresAtSec` | Lifetime at most 120 seconds. |

The return value is `{ ok, reason, account }`. `account` is the resolved name when `ok` is true. The model never chooses that name by typing it.

### 4. Check status

Ask whether the last decision was an allow, a refusal, or a kill. `policy.audit` is the log. `policy.kill("reason")` pauses further allows. A killed policy refuses everything until a new policy object is created. There is no hidden resume.

## Human in the loop

A proposal the gate allows is still not a signature. A deployment that has a real co-signer should treat an allow under the cap as permission to start a ceremony, and anything over the cap, or any action outside the allow-list, as a prompt for a person holding `owner` or a passkey. This repository has no passkey prompt and no ceremony.

## What must not be a tool

- `sign_digest`, `sign_hex`, or any function that accepts a hash the model computed.
- `updateauth` and the other blocked actions.
- A free-text recipient field.
- A tool whose description says it will ignore the policy if the user insists.

[skills/antelope-agent-propose/SKILL.md](../skills/antelope-agent-propose/SKILL.md) is the short form of this page for an agent that loads skills.
