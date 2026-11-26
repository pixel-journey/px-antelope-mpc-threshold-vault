# A recipe an agent can run today

This is the path an agent can run today. The lab signer produces a recoverable SIG_K1_ after the gate allows the proposal. It does not broadcast, and it is not a threshold share.

## 1. Pick a network

```ts
import { PLAYBOOKS } from "./playbooks.js";

const lab = PLAYBOOKS.filter((entry) => entry.kind === "lab");
// WAX Testnet and Jungle 4. Mainnets are listed and refused.
```

Do not paste a chain id from a chat. Read it from `PLAYBOOKS` or from `CHAINS` in `src/digest.ts`.

## 2. Propose

```ts
import { createPolicy } from "./policy.js";
import { CHAINS } from "./digest.js";

const policy = createPolicy();
const now = Math.floor(Date.now() / 1000);
const decision = policy.propose({
  chainId: CHAINS.waxTestnet,
  contract: "eosio.token",
  action: "transfer",
  alias: "wax-faucet",
  amountUnits: 10000n, // 1.0000 WAX
  symbol: "WAX",
  memo: "agent tip",
  nowSec: now,
  expiresAtSec: now + 60,
});
```

`decision.ok` is true only when the chain is a lab, the alias is known, the amount is under the cap, the memo is short ASCII, and the action is `eosio.token::transfer`. `decision.account` is the resolved name. The model never typed that name.

## 3. Stop or continue

If `decision.ok` is false, stop. Do not rewrite the proposal to sneak past the reason. If `decision.ok` is true, either sign with the lab key in step 5, or hand the bound fields to a co-signer that packs the real transaction.

## 4. What not to add

- A function that accepts a digest the model computed.
- A free-typed recipient.
- `updateauth` as a tool.
- A mainnet chain id, unless an operator has already widened `LAB_CHAIN_IDS` and told you.

See [MCP-TOOLS.md](MCP-TOOLS.md) for the four-tool shape and [TODAY.md](TODAY.md) for what else is callable.

## 5. Sign with the lab key

```ts
import { createLabKey, signAllowed, recoverLab } from "./labsign.js";

const key = createLabKey();
const signed = signAllowed(key, proposal, decision, "agent.pxj");
recoverLab(signed) === signed.publicKey; // true on a lab chain
```

`signed.signature` is a real `SIG_K1_`. It is over the proposal id, not over a packed transaction. A node will not accept it. See [docs/LAB-SIGNER.md](LAB-SIGNER.md).
