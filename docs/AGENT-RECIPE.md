# A recipe an agent can run today

Full educational path: propose → offline simulate → optional lab sig → learn push gates. No mainnet. No silent HTTP push.

## 1. List

```ts
import { listNetworks, listStrategiesTool, broadcastStatus } from "./mcp.js";

listStrategiesTool({ expect: "allow" });
listNetworks();
broadcastStatus(chainId);
```

## 2. Propose or run strategy

```ts
import { runStrategyTool } from "./mcp.js";
import { CHAINS } from "./digest.js";

const now = Math.floor(Date.now() / 1000);
runStrategyTool("wax-testnet-tip", "agent.pxj", now);

runStrategyTool("telos-testnet-tip", "agent.pxj", now, {
  extraLabChainIds: [CHAINS.telosTestnet],
});
```

## 3. Offline compute_transaction fixtures

```ts
import { simulateProposal } from "./mcp.js";

simulateProposal(proposal, decision, "clean-transfer");
simulateProposal(proposal, decision, "inline-escalation"); // catches updateauth
simulateProposal(proposal, decision, "assert-revert");
```

Simulation is **not** inclusion. Keep `linkauth` + short expiry.

## 4. Lab signature (not pushable)

After allow, strategies may attach a throwaway `SIG_K1_` over the **proposal id**. Nodes will not accept it as an action signature. Real digests: [digest.ts](../src/digest.ts).

## 5. Push — end stage, not forbidden

```ts
import { evaluatePushReadiness } from "./broadcast.js";
import { buildPushTransactionRequest, endpointsForChain } from "./rpc.js";

evaluatePushReadiness({ /* policy, real digest, dry-run, operator opt-in, sender */ });
// buildPushTransactionRequest returns URL only when ready; httpSendImplemented is still false here
```

See [PUSH.md](PUSH.md).

## Stop conditions

- Policy refuse · unsafe simulation · mainnet · model-computed digest · free-typed recipient · treating lab SIG as chain SIG

[TODAY.md](TODAY.md) · [MCP-TOOLS.md](MCP-TOOLS.md) · [GAP-AUDIT.md](GAP-AUDIT.md)
