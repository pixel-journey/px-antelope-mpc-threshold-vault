# A recipe an agent can run today

Full educational path: list → propose/run → offline simulate → optional lab sig → optional lab network → optional gated push. **No mainnet. No silent HTTP.**

## 1. List

```ts
import {
  listNetworks,
  listStrategiesTool,
  listEnginesTool,
  broadcastStatus,
  checkStatus,
} from "./mcp.js";

listStrategiesTool({ expect: "allow" });
listStrategiesTool({ tag: "operator-opt-in" });
listNetworks();
listEnginesTool(); // educational-mock only
broadcastStatus(chainId);
checkStatus();
```

## 2. Propose or run strategy

```ts
import { runStrategyTool, proposeTransfer, resetSessionPolicy } from "./mcp.js";
import { CHAINS } from "./digest.js";

const now = Math.floor(Date.now() / 1000);
const tip = runStrategyTool("wax-testnet-tip", "agent.pxj", now);
// tip.decision.ok === true → tip.lab may hold throwaway SIG_K1_

runStrategyTool("telos-testnet-tip", "agent.pxj", now, {
  extraLabChainIds: [CHAINS.telosTestnet],
});
```

Or step-by-step:

```ts
resetSessionPolicy();
const decision = proposeTransfer(proposal);
```

## 3. Offline compute_transaction fixtures

```ts
import { simulateProposal } from "./mcp.js";

simulateProposal(proposal, decision, "clean-transfer");
simulateProposal(proposal, decision, "inline-escalation"); // catches updateauth
simulateProposal(proposal, decision, "assert-revert");
simulateProposal(proposal, decision, "context-free-or-deferred");
```

`safeForCoSign` must be true before treating the path as simulation-clean. Simulation is **not** inclusion — keep `linkauth` + short expiry.

## 4. Lab signature (not pushable)

After allow, strategies may attach a throwaway `SIG_K1_` over the **proposal id**. Nodes will not accept it as an action signature. Real digests: [digest.ts](../src/digest.ts) · [LAB-SIGNER.md](LAB-SIGNER.md).

## 5. Optional lab get_info

```ts
import { fetchLabChainInfo } from "./labClient.js";

await fetchLabChainInfo(CHAINS.waxTestnet, { enableNetwork: true });
// throws without enableNetwork; mainnet always blocked
```

## 6. Push — final stage, gated

```ts
import { evaluatePushReadiness } from "./broadcast.js";
import { pushLabTransaction } from "./labClient.js";

const readiness = evaluatePushReadiness({
  chainId: CHAINS.waxTestnet,
  policyAllowed: true,
  signedAntelopeDigest: true, // only if you really signed sig_digest
  dryRunOk: true,
  operatorOptsIntoPush: true,  // human/operator — not the model
  senderImplemented: true,
});

if (readiness.ready) {
  await pushLabTransaction(
    {
      chainId: CHAINS.waxTestnet,
      transaction: packedSignedTxObject,
      readiness: {
        policyAllowed: true,
        signedAntelopeDigest: true,
        dryRunOk: true,
        operatorOptsIntoPush: true,
      },
    },
    { enableNetwork: true },
  );
}
```

Push is **not** an MCP tool. Incomplete readiness → no HTTP. See [PUSH.md](PUSH.md).

## Stop conditions

| Condition | Action |
| --- | --- |
| Policy refuse | Stop; branch on `reason` |
| Unsafe simulation | Stop; do not co-sign |
| Mainnet chain id | Always refuse |
| Model-computed digest | Refuse (`sign_digest` is forbidden) |
| Free-typed recipient | Refuse; aliases only |
| Lab SIG treated as chain SIG | Wrong — will fail on node |
| Model sets `operatorOptsIntoPush` | Do not |

[TODAY.md](TODAY.md) · [MCP-TOOLS.md](MCP-TOOLS.md) · [STRATEGIES.md](STRATEGIES.md) · [GAP-AUDIT.md](GAP-AUDIT.md)
