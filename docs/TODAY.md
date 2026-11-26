# What a developer or an agent can use today

This repository does not broadcast. The lab signer produces a recoverable SIG_K1_ on a lab chain. It is not a threshold share. The pieces below are usable now.

## For an agent (right now)

```ts
import { runStrategy, listStrategyIds, strategiesByTag } from "./strategies.js";
import { PLAYBOOKS, defaultGateActions } from "./playbooks.js";
import { PresignQueue, componentBytes } from "./presign.js";
import { hybridCustodyPlan } from "./permissions.js";
import { recommendCurve } from "./curve.js";

const now = Math.floor(Date.now() / 1000);
const tip = runStrategy("wax-testnet-tip", "agent.pxj", now);

listStrategyIds();
strategiesByTag("nft");
defaultGateActions();
recommendCurve(); // "R1" unless legacy K1 / EVM derivation is requested

const q = new PresignQueue();
q.tryEnqueue("K1", componentBytes(0x40, 0x01));
```

| Call | Module | Result |
| --- | --- | --- |
| `runStrategy` / catalog filters | `strategies.ts` | Gate + optional lab sign |
| `PLAYBOOKS` / `defaultGateActions` | `playbooks.ts` | Per-network opportunity map |
| `handoff` | `dryrun.ts` | Bound proposal record |
| `signAllowed` | `labsign.ts` | Throwaway recoverable `SIG_K1_` |
| `PresignQueue` | `presign.ts` | Offline r-filter, single-use, burn-on-bad-s |
| `hybridCustodyPlan` | `permissions.ts` | owner/active/linkauth shapes, `executed: false` |
| `recommendCurve` | `curve.ts` | R1-preferred online policy |
| `createPolicy().propose` | `policy.ts` | The actual gate |

**Four allows today:** `wax-testnet-tip`, `treasury-tip`, `jungle-tip`, `peer-tip`.

## For a developer

- Import `@wharfkit/session` **4.0.2**. Tests show digest recovery and `Authority.sort()`.
- Use `src/digest.ts` without WharfKit ([WITHOUT-WHARFKIT.md](WITHOUT-WHARFKIT.md)).
- Read [K1-CANONICAL.md](K1-CANONICAL.md) and run the presign queue tests before writing any K1 signer.
- Read [ARCHITECTURE.md](../ARCHITECTURE.md) for the hybrid thesis.

## What "thorough" still does **not** mean

Raising educational coverage is not the same as enabling mainnet value behind an unaudited ceremony.

| Still out of scope (by design) | Why |
| --- | --- |
| Real DKLs23 / CGGMP24 WASM | Unaudited orchestration must not hold mainnet funds |
| WalletPluginMPC that co-signs live | Needs a reviewed engine + relay |
| Opening mainnet in the default gate | Operator decision, not a demo toggle |
| `sign_digest` MCP tool | Blind hashing is a CVE class |

## For a later lab

- Swap `createEducationalEngine()` for a reviewed MIT/Apache WASM build; keep the refuse-to-sign posture until review is done.
- Widen `LAB_CHAIN_IDS` deliberately (e.g. Telos Testnet) without enabling mainnet.
- Wrap `propose` / `listStrategyIds` as MCP tools that still never hold a key.

Run `npm test`.
