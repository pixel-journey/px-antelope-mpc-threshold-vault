# Named strategies an agent can run

[src/strategies.ts](../src/strategies.ts) is a catalog. An agent picks an id. `runStrategy` turns that id into a proposal, asks the policy gate, and signs with a throwaway lab key only when the gate allows it.

```ts
import { runStrategy } from "./strategies.js";

const now = Math.floor(Date.now() / 1000);
const result = runStrategy("wax-testnet-tip", "agent.pxj", now);
// result.decision.ok, result.handoff, result.lab
```

| Id | What it tries | Default gate |
| --- | --- | --- |
| `wax-testnet-tip` | 1.0000 WAX to the faucet alias | Allow, then a lab `SIG_K1_` |
| `jungle-tip` | 1.0000 A on Jungle 4 | Allow, then a lab `SIG_K1_` |
| `wax-mainnet-tip` | The same tip on WAX mainnet | Refuse |
| `vaulta-tip` | The same tip on Vaulta | Refuse |
| `telos-tip` | A TLOS tip | Refuse |
| `xpr-tip` | An XPR tip | Refuse |
| `ux-tip` | A UX tip | Refuse |
| `nft-transfer` | `atomicassets::transfer` | Refuse. NFTs are not in the allow-list |
| `buy-ram` | `eosio::buyram` | Refuse. Resource changes stay with a human |
| `memo-injection` | A memo that names `evil.wam` | Refuse. The memo is not a second recipient |

The two allows do not share a proposal id. A real Antelope signing digest would differ as well, because the chain id is part of `SHA-256(chain_id || packed_transaction || cfd_hash)`.

The lab signature is over the proposal id, not over that digest. A node will not accept it. See [LAB-SIGNER.md](LAB-SIGNER.md).

To add a chain, add a strategy, put the chain id in the gate's allow-list, and keep the blocked actions. Do not delete a refusal to make a demo pass.
