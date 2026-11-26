# Four tools (and a few catalog helpers), nothing that threshold-signs

An agent connected over the Model Context Protocol can call tools. Those tools run code. A tool description is not a security boundary: hidden text in a description, a description that changes after approval, and one server shadowing another's tool name have all been shown in the wild. The prompt is not the gate.

The safe split is the one this course already codes. The model proposes. A function that does not hold a key decides. Signing, if it ever happens, happens in a different process that has already read the same transaction the model claims to have proposed.

## Callable surface: `src/mcp.ts`

```ts
import {
  listNetworks,
  listStrategiesTool,
  inspectPlaybook,
  proposeTransfer,
  runStrategyTool,
  checkStatus,
  MCP_TOOL_SPECS,
} from "./mcp.js";
```

| Tool name | Function | Holds key? |
| --- | --- | --- |
| `list_networks` | `listNetworks()` | No |
| `list_strategies` | `listStrategiesTool({ expect?, tag? })` | No |
| `inspect_playbook` | `inspectPlaybook(chainId)` | No |
| `propose_transfer` | `proposeTransfer(proposal)` | No |
| `run_strategy` | `runStrategyTool(id, from, now)` | Lab key only after allow |
| `check_status` | `checkStatus()` | No |
| `lab_sign_allowed` | `labSignAllowed(...)` | Throwaway lab key — **not** for production MCP |

`MCP_TOOL_SPECS` is the machine-readable advertisement list.

## Propose rules (unchanged)

| Field | Rule |
| --- | --- |
| `chainId` | Must be a lab id unless an operator has widened the list. Mainnet ids are refused. |
| `contract` / `action` | Only `eosio.token` / `transfer` today. |
| `alias` | `px-treasury`, `wax-faucet`, or `test-peer`. A raw account name is refused. |
| `amountUnits` | Integer smallest units, from 1 through 100000 (10.0000 of the chain token). |
| `symbol` | `WAX` on WAX Testnet, `A` on Jungle 4. |
| `memo` | Printable ASCII, at most 64 characters, and not an account name hiding in the text. |
| `nowSec` / `expiresAtSec` | Lifetime at most 120 seconds. |

Named moves: [STRATEGIES.md](STRATEGIES.md).

## Human in the loop

A proposal the gate allows is still not a signature from a co-signer. The lab key in this process can sign an allow so a student can recover a `SIG_K1_`. A deployment that has a real co-signer should treat an allow under the cap as permission to start a ceremony, and anything over the cap, or any action outside the allow-list, as a prompt for a person holding `owner` or a passkey.

The educational WalletPlugin shape in [src/walletPlugin.ts](../src/walletPlugin.ts) refuses threshold sign and refuses model-supplied digests.

## What must not be a tool

- `sign_digest`, `sign_hex`, or any function that accepts a hash the model computed.
- `updateauth` and the other blocked actions.
- A free-text recipient field.
- A tool whose description says it will ignore the policy if the user insists.

[skills/antelope-agent-propose/SKILL.md](../skills/antelope-agent-propose/SKILL.md) is the short form of this page for an agent that loads skills.
