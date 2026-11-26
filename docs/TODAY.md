# What a developer or an agent can use today

This repository does not broadcast. The lab signer produces a recoverable SIG_K1_ on a lab chain. It is not a threshold share. The pieces below are usable now.

## For an agent (right now)

```ts
import { runStrategy, listStrategyIds, strategiesByTag } from "./strategies.js";
import { PLAYBOOKS, defaultGateActions } from "./playbooks.js";

const now = Math.floor(Date.now() / 1000);
const tip = runStrategy("wax-testnet-tip", "agent.pxj", now);
// tip.decision.ok === true, tip.lab.signature starts with SIG_K1_

listStrategyIds();           // full catalog
strategiesByTag("nft");      // refusals the agent should not retry blindly
defaultGateActions();        // playbook rows the gate already allows
```

| Call | Module | Result |
| --- | --- | --- |
| `runStrategy(id, from, now)` | `strategies.ts` | Gate + optional lab sign |
| `listStrategyIds()` / `strategiesByExpect` / `strategiesByTag` | `strategies.ts` | Catalog filters |
| `handoff(...)` | `dryrun.ts` | Bound proposal record (no pack, no sign) |
| `signAllowed(...)` | `labsign.ts` | Throwaway recoverable `SIG_K1_` after allow |
| `PLAYBOOKS` / `playbookByChainId` / `defaultGateActions` | `playbooks.ts` | Per-network opportunity map |
| `createPolicy().propose` | `policy.ts` | The actual gate |

**Four allows today:** `wax-testnet-tip`, `treasury-tip`, `jungle-tip`, `peer-tip`. Everything else in the catalog is an intentional refusal an agent can learn from.

Read [STRATEGIES.md](STRATEGIES.md) and [AGENT-STRATEGIES.md](AGENT-STRATEGIES.md).

## For a developer

- Import `@wharfkit/session` **4.0.2**. Tests show `Transaction.signingDigest`, `Signature.recoverDigest`, and `Authority.sort()` against published vectors.
- Use `src/digest.ts` if the agent cannot load WharfKit ([WITHOUT-WHARFKIT.md](WITHOUT-WHARFKIT.md)).
- Read [K1-CANONICAL.md](K1-CANONICAL.md) before writing any K1 signer. The 32640 count is locked.
- Read [ARCHITECTURE.md](../ARCHITECTURE.md) for the hybrid MPC-active + cold-owner thesis.
- Read [PROTOCOL-GENERATIONS.md](PROTOCOL-GENERATIONS.md) before choosing an engine. This course does not compile one.

## For a later lab (not today)

- Replace `createEducationalEngine()` in `src/threshold.ts` with a reviewed WASM build of an MIT/Apache engine. The interface stays the same; the mock refuses to sign.
- Widen `LAB_CHAIN_IDS` and add aliases when an operator decides a mainnet or Telos/XPR testnet is in scope. The blocked-action list stays.
- Wrap the policy gate behind the four MCP tools in [MCP-TOOLS.md](MCP-TOOLS.md). The gate already returns the decision those tools would return.
- Implement WalletPluginMPC only after an engine is reviewed.

## What is not ready

A real DKLs23 or CGGMP24 ceremony, a WebSocket relay, a custom wallet plugin, a broadcast, and any claim that the engines named in the blueprint have been audited here.
