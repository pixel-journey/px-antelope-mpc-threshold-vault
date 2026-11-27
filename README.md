# Antelope agents that can trade inside bounds

> **Goal:** bots operate and trade **on their own**, as safely as the permission, caps, and simulate-step allow. Human approval is optional, not the default for every action. See [docs/AUTONOMY.md](docs/AUTONOMY.md).  
> **This tree today:** educational and **unaudited**. Default gate is **WAX Testnet** + **Jungle 4**. Mainnet push stays off until an operator opens a bounded agent permission with a real signer.  
> **No threshold WASM signing** (`sign()` throws). **No model-fired HTTP push.**  
> **Map:** [docs/INDEX.md](docs/INDEX.md) · [docs/EXECUTION-MODES.md](docs/EXECUTION-MODES.md) · [docs/GAP-AUDIT.md](docs/GAP-AUDIT.md)

The account is a **name**. A custom `trade` permission (or a reviewed threshold share later) can spend a budget without touching `owner`. Threshold ECDSA hides the signer set; it does not replace a cold owner.

## Quick start

```bash
npm test && npm run check-skills
# optional (Phase R.1):
cargo test -p antelope-crypto-format
```

### Testnet agent path (acts after policy allow)

```ts
import { listStrategiesTool, runStrategyTool, listEnginesTool } from "./src/mcp.js";

listStrategiesTool({ expect: "allow" });
runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));
listEnginesTool(); // educational-mock only until Phase R.2
```

### Optional cosign transport (not required for in-policy trades)

`eosio.token::transfer` encodes a real `esr://` (WharfKit signing-request 4.0.2). Hand it to a human wallet **or** to another process that holds the trade key. Other actions still use `esr://edu/` until their ABI is local.

```ts
import { buildUnsignedHandoffTool } from "./src/mcp.js";
import { CHAINS } from "./src/digest.js";

const handoff = await buildUnsignedHandoffTool({
  chainId: CHAINS.waxMainnet,
  summary: "Tip treasury 1 WAX",
  actions: [
    {
      account: "eosio.token",
      name: "transfer",
      authorization: [{ actor: "human.wam", permission: "active" }],
      data: {
        from: "human.wam",
        to: "treasury.pxj",
        quantity: "1.00000000 WAX",
        memo: "agent-or-cosigner",
      },
    },
  ],
});
// handoff.esrProtocol === "wharfkit-4.0.2"
```

### Lab push (explicit)

```ts
import { pushLabTransaction } from "./src/labClient.js";
// readiness: policy + real Antelope digest + dry-run + operatorOptsIntoPush + enableNetwork
```

## Skills

Knowledge the agent uses when it acts, not a requirement to stop and ask:

| Pack | Skills |
| --- | --- |
| Agent / MPC | `antelope-agent-propose`, `antelope-agentic-payments`, `antelope-network-scope`, `antelope-mpc-sig-format`, `mpc-security-audit`, `antelope-next-step` |
| Markets and chain | `antelope-powerup-and-resources`, `antelope-atomicassets`, `antelope-atomicmarket`, `antelope-alcor-defi`, `antelope-permissions-and-msig`, `antelope-chain-profiles` |

## What `npm test` covers

K1 canonical, codecs, digests, WharfKit 4.0.2, policy/strategies, presign, simulate, lab client, **MCP (11 tools)**, museum, threshold mock, **ESR handoff**, skills linter.

**Does not prove:** real DKLs23/CGGMP24, audited mainnet custody, or that a lab `SIG_K1_` is accepted by nodeos.

## Engines

| Engine | Status |
| --- | --- |
| `educational-mock` | DKG/presign tokens; **`sign()` throws** |
| DKLs23 / CGGMP24 WASM | **Phase R.2** — named only |

## Related courses

- [wax-multi-sig-proposal-builder-and-simulator](https://github.com/pixel-journey/wax-multi-sig-proposal-builder-and-simulator)
- [wax-permission-visualizer-and-editor](https://github.com/pixel-journey/wax-permission-visualizer-and-editor)
- [wax-wharfkit-session-keys-and-linked-permissions](https://github.com/pixel-journey/wax-wharfkit-session-keys-and-linked-permissions)
- [wax-escrowed-merch-custody-timeline](https://github.com/pixel-journey/wax-escrowed-merch-custody-timeline)
- [px-orng-v3-randnotify-starter](https://github.com/pixel-journey/px-orng-v3-randnotify-starter)

MIT. Pixel Journey.
