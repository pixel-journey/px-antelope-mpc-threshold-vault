# Named strategies an agent can run

[src/strategies.ts](../src/strategies.ts) is a **catalog**. An agent picks an id. The **policy gate** still decides. A lab `SIG_K1_` is produced when the gate allows and the chain is in the policy’s effective lab set.

Lab signatures are over a **proposal identifier**, not `sig_digest(chain_id ‖ packed_tx ‖ cfd)`. Nodes will not accept them as transfer signatures. See [LAB-SIGNER.md](LAB-SIGNER.md).

```ts
import {
  runStrategy,
  runStrategyWithPolicy,
  listStrategyIds,
  strategiesByExpect,
  strategiesByTag,
} from "./strategies.js";
import { CHAINS } from "./digest.js";

const now = Math.floor(Date.now() / 1000);
listStrategyIds();
strategiesByExpect("allow");
runStrategy("wax-testnet-tip", "agent.pxj", now);

runStrategyWithPolicy("telos-testnet-tip", "agent.pxj", now, {
  extraLabChainIds: [CHAINS.telosTestnet],
});
// → allow + handoff + recoverable lab SIG_K1_
```

MCP wrappers: `runStrategyTool`, `listStrategiesTool` in [mcp.ts](../src/mcp.ts).

## Allows today (default gate)

| Id | Chain | Intent | Result |
| --- | --- | --- | --- |
| `wax-testnet-tip` | WAX Testnet | Small tip to known alias | Allow + lab `SIG_K1_` |
| `treasury-tip` | WAX Testnet | Tip to treasury alias | Allow + lab `SIG_K1_` |
| `jungle-tip` | Jungle 4 | Cross-lab tip | Allow + lab `SIG_K1_` |
| `peer-tip` | WAX Testnet | Peer alias tip | Allow + lab `SIG_K1_` |

Amounts stay under the gate’s per-transfer and session caps. Memos are short labels, not free-form account names.

## Operator opt-in testnets

| Id | Default | With `extraLabChainIds` |
| --- | --- | --- |
| `telos-testnet-tip` | Refuse (chain not in default lab set) | Allow + lab `SIG_K1_` |
| `xpr-testnet-tip` | Refuse | Allow + lab `SIG_K1_` |

Tag: `operator-opt-in`. Mainnets remain **hard-refused** even if an operator mistakenly lists them in `extraLabChainIds` (policy strips mainnet chain ids).

```ts
strategiesByTag("operator-opt-in");
```

## Refusals (catalogued on purpose)

These ids exist so agents learn structured denial, not silent success:

| Class | Examples |
| --- | --- |
| Mainnet | Tips / transfers on WAX, Vaulta, Telos, XPR mainnet chain ids |
| Wrong action | `updateauth`, `setcode`, unrestricted AtomicAssets mint paths |
| Resources | Stake/unstake style actions outside the transfer gate |
| Memo injection | Memo that looks like an account name |
| Over-cap | Amount above policy max |
| Expired TTL | `expiresAtSec` already past `nowSec` |

Each refusal returns a stable `reason` string agents can branch on. See [AGENT-STRATEGIES.md](AGENT-STRATEGIES.md) for playbook-level guidance.

## Session policy

```ts
import { createPolicy } from "./policy.js";

const policy = createPolicy({
  extraLabChainIds: [CHAINS.telosTestnet],
  // optional: tighter maxAmountUnits, allowedAliases, …
});
policy.propose(proposal);
policy.kill("incident-drill"); // subsequent proposes refuse
```

Kill is in-memory for the course. Production needs cold-owner `updateauth` / `unlinkauth` prepared offline.

## Related

[NETWORKS.md](NETWORKS.md) · [AGENT-RECIPE.md](AGENT-RECIPE.md) · [MCP-TOOLS.md](MCP-TOOLS.md) · [CHAIN-OPPORTUNITIES.md](CHAIN-OPPORTUNITIES.md)
