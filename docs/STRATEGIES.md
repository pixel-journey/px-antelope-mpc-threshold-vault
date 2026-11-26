# Named strategies an agent can run

[src/strategies.ts](../src/strategies.ts) is a catalog. An agent picks an id. The policy gate still decides. A lab `SIG_K1_` is produced when the gate allows and the chain is in the policy’s effective lab set.

```ts
import {
  runStrategy,
  runStrategyWithPolicy,
  operatorOptInStrategies,
} from "./strategies.js";
import { CHAINS } from "./digest.js";

const now = Math.floor(Date.now() / 1000);
runStrategy("wax-testnet-tip", "agent.pxj", now);

runStrategyWithPolicy("telos-testnet-tip", "agent.pxj", now, {
  extraLabChainIds: [CHAINS.telosTestnet],
});
// → allow + handoff + recoverable lab SIG_K1_ (not a node-accepted transfer digest)
```

## Allows today (default gate)

| Id | Result |
| --- | --- |
| `wax-testnet-tip` · `treasury-tip` · `jungle-tip` · `peer-tip` | Allow + lab `SIG_K1_` |

## Operator opt-in testnets

| Id | Default | With `extraLabChainIds` |
| --- | --- | --- |
| `telos-testnet-tip` · `xpr-testnet-tip` | Refuse | Allow + lab `SIG_K1_` |

Mainnets remain hard-refused even if listed in `extraLabChainIds`.

## Refusals (catalogued on purpose)

Mainnet tips · AtomicAssets · resources · `updateauth` / `setcode` · memo injection · over-cap.

Tags include `operator-opt-in` for the Telos/XPR testnet tips.

See [LAB-SIGNER.md](LAB-SIGNER.md) and [NETWORKS.md](NETWORKS.md).
