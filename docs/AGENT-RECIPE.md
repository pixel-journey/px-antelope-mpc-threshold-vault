# A recipe an agent can run today

End-to-end path without broadcast and without a threshold share.

## 1. List what is allowed

```ts
import { listNetworks, listStrategiesTool, broadcastStatus } from "./mcp.js";

listStrategiesTool({ expect: "allow" }); // four default lab tips
listNetworks(); // includes broadcast evaluation per chain
broadcastStatus(chainId); // mainnets locked; course still never sends
```

## 2. Propose (or run a named strategy)

```ts
import { runStrategyTool, proposeTransfer, resetSessionPolicy } from "./mcp.js";
import { CHAINS } from "./digest.js";

const now = Math.floor(Date.now() / 1000);
const tip = runStrategyTool("wax-testnet-tip", "agent.pxj", now);
// tip.decision.ok, tip.lab.signature (lab SIG_K1_ over proposal id)

// Operator-only extra testnet:
runStrategyTool("telos-testnet-tip", "agent.pxj", now, {
  extraLabChainIds: [CHAINS.telosTestnet],
});
```

Or build a proposal by hand with `proposeTransfer` / `createPolicy()`.

## 3. Local simulate (not nodeos)

```ts
import { simulateProposal } from "./mcp.js";

simulateProposal(proposal, decision);
// policyOk, wouldBroadcast: false, recommendedRpc: /v1/chain/compute_transaction
```

A production stack would call real `compute_transaction` on a **lab** RPC after this.

## 4. Stop conditions

- `decision.ok === false` → stop; do not rewrite to sneak past the reason  
- Never accept a model-computed digest  
- Never free-type a recipient  
- Never treat lab `SIG_K1_` as a pushable transaction signature  
- `refuseBroadcast` / `wouldBroadcast: false` — this course does not push  

## 5. What comes later (not this tree)

Real co-signer WASM, live WalletPlugin, authenticated relay, opt-in testnet `push_transaction` after `assertBroadcastAllowed`.

See [TODAY.md](TODAY.md) · [MCP-TOOLS.md](MCP-TOOLS.md) · [AGENTIC-PAYMENTS.md](AGENTIC-PAYMENTS.md) · [GAP-AUDIT.md](GAP-AUDIT.md).
