# Named strategies an agent can run

[src/strategies.ts](../src/strategies.ts) is a catalog. An agent picks an id. The policy gate still decides. A lab `SIG_K1_` is produced only when the gate allows **and** the chain is in the built-in `LAB_CHAIN_IDS`.

```ts
import {
  listStrategyIds,
  runStrategy,
  runStrategyWithPolicy,
  strategiesByExpect,
  strategiesByTag,
  operatorOptInStrategies,
} from "./strategies.js";
import { CHAINS } from "./digest.js";

const now = Math.floor(Date.now() / 1000);
runStrategy("wax-testnet-tip", "agent.pxj", now);

// Operator opens Telos Testnet for this process only
runStrategyWithPolicy("telos-testnet-tip", "agent.pxj", now, {
  extraLabChainIds: [CHAINS.telosTestnet],
});
// → allow + handoff; lab signature is null (lab signer is still LAB_CHAIN_IDS-only)

operatorOptInStrategies(); // telos-testnet-tip, xpr-testnet-tip
```

## Allows today (default gate)

| Id | What it tries | Result |
| --- | --- | --- |
| `wax-testnet-tip` | 1.0000 WAX → faucet | Allow + lab `SIG_K1_` |
| `treasury-tip` | 0.5000 WAX → treasury | Allow + lab `SIG_K1_` |
| `jungle-tip` | 1.0000 A → faucet | Allow + lab `SIG_K1_` |
| `peer-tip` | 0.2500 A → test-peer | Allow + lab `SIG_K1_` |

## Operator opt-in testnets

| Id | Default | With `extraLabChainIds` |
| --- | --- | --- |
| `telos-testnet-tip` | Refuse | Allow + handoff (no lab sig yet) |
| `xpr-testnet-tip` | Refuse | Allow + handoff (no lab sig yet) |

Mainnets remain hard-refused even if listed in `extraLabChainIds`.

## Refusals (catalogued on purpose)

| Id | Why |
| --- | --- |
| `wax-mainnet-tip` · `vaulta-tip` · `telos-tip` · `xpr-tip` · `ux-tip` | Mainnet |
| `nft-transfer` · `nft-mintasset` · `nft-burnasset` | AtomicAssets not in default allow-list |
| `buy-ram` · `delegate-bw` | Resource / system |
| `updateauth-agent` · `setcode` | Blocked by name |
| `memo-injection` · `over-cap-tip` | Abuse / cap |

Tags include `operator-opt-in` for the Telos/XPR testnet tips. Full tag list: `tip`, `transfer`, `lab`, `mainnet`, `testnet`, `nft`, `atomicassets`, `mint`, `burn`, `resources`, `system`, `blocked`, `cap`, `abuse`, `wax`, `vaulta`, `eos`, `telos`, `xpr`, `proton`, `ux`, `treasury`, `operator-opt-in`.

Do not delete a refusal to make a demo pass. See [LAB-SIGNER.md](LAB-SIGNER.md) and [NETWORKS.md](NETWORKS.md).
