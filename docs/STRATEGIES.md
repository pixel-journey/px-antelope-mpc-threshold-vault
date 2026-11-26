# Named strategies an agent can run

[src/strategies.ts](../src/strategies.ts) is a catalog. An agent picks an id. `runStrategy` turns that id into a proposal, asks the policy gate, and signs with a throwaway lab key only when the gate allows it.

```ts
import {
  listStrategyIds,
  runStrategy,
  strategiesByExpect,
  strategiesByTag,
} from "./strategies.js";

const now = Math.floor(Date.now() / 1000);
const result = runStrategy("wax-testnet-tip", "agent.pxj", now);
// result.decision.ok, result.handoff, result.lab

listStrategyIds();
strategiesByExpect("allow");
strategiesByTag("nft");
```

## Allows today (lab only)

| Id | What it tries | Default gate |
| --- | --- | --- |
| `wax-testnet-tip` | 1.0000 WAX to `wax-faucet` | Allow → lab `SIG_K1_` |
| `treasury-tip` | 0.5000 WAX to `px-treasury` | Allow → lab `SIG_K1_` |
| `jungle-tip` | 1.0000 A on Jungle 4 to faucet alias | Allow → lab `SIG_K1_` |
| `peer-tip` | 0.2500 A to `test-peer` on Jungle 4 | Allow → lab `SIG_K1_` |

## Refusals (catalogued on purpose)

| Id | What it tries | Why it refuses |
| --- | --- | --- |
| `wax-mainnet-tip` · `vaulta-tip` · `telos-tip` · `xpr-tip` · `ux-tip` | Tips on mainnets | Chain not in `LAB_CHAIN_IDS` |
| `telos-testnet-tip` · `xpr-testnet-tip` | Tips on other testnets | Not opted into the lab set |
| `nft-transfer` · `nft-mintasset` · `nft-burnasset` | AtomicAssets | Contract/action not in allow-list |
| `buy-ram` · `delegate-bw` | Resource changes | System actions stay with a human |
| `updateauth-agent` · `setcode` | Permission / deploy | Blocked by name |
| `memo-injection` | Memo names `evil.wam` | Memo must not carry an account |
| `over-cap-tip` | 10.0001 WAX | Cap is 100000 units |

The allows do not share a proposal id across chains. A real Antelope signing digest would differ as well, because the chain id is part of `SHA-256(chain_id || packed_transaction || cfd_hash)`.

The lab signature is over the proposal id, not over that digest. A node will not accept it. See [LAB-SIGNER.md](LAB-SIGNER.md).

## Tags agents can filter on

`tip` · `transfer` · `lab` · `mainnet` · `testnet` · `nft` · `atomicassets` · `mint` · `burn` · `resources` · `system` · `blocked` · `cap` · `abuse` · `wax` · `vaulta` · `eos` · `telos` · `xpr` · `proton` · `ux` · `treasury`

To add a chain, add a strategy, put the chain id in the gate's allow-list, and keep the blocked actions. Do not delete a refusal to make a demo pass.
