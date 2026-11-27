# Antelope MPC, without a mainnet signer

> **Status:** educational reference for **agentic payments** on Antelope. **Unaudited.**  
> **Two modes:** testnet lab (policy → simulate → gated push) · **mainnet human-sign** (skills + unsigned ESR handoff).  
> Default gate: **WAX Testnet** + **Jungle 4**. **Mainnets hard-refused for agent push.**  
> **No threshold WASM signing** (`sign()` throws). **No model-fired HTTP push.**  
> **Map:** [docs/INDEX.md](docs/INDEX.md) · [docs/EXECUTION-MODES.md](docs/EXECUTION-MODES.md) · [docs/GAP-AUDIT.md](docs/GAP-AUDIT.md)

Antelope already has a way to rotate a key without moving assets: the account is a **name**, and `eosio::updateauth` changes who may act for it. Threshold ECDSA still matters because a single `SIG_K1_` / `SIG_R1_` hides the signer set. It does **not** replace cold owner multisig.

## Quick start

```bash
npm test && npm run check-skills
# optional (Phase R.1):
cargo test -p antelope-crypto-format
```

### Testnet agent path

```ts
import { listStrategiesTool, runStrategyTool, listEnginesTool } from "./src/mcp.js";

listStrategiesTool({ expect: "allow" });
runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));
listEnginesTool(); // educational-mock only until Phase R.2
```

### Mainnet human-sign path (no keys in the model)

```ts
import { buildUnsignedHandoffTool } from "./src/mcp.js";
import { CHAINS } from "./src/digest.js";

const handoff = buildUnsignedHandoffTool({
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
        memo: "human-sign",
      },
    },
  ],
});
// handoff.esrUri is educational — re-encode with @wharfkit/signing-request for production
```

### Optional lab push (explicit, testnet only)

```ts
import { pushLabTransaction } from "./src/labClient.js";
// readiness: policy + real Antelope digest + dry-run + operatorOptsIntoPush + enableNetwork
```

## Skills

| Pack | Skills |
| --- | --- |
| Agent / MPC | `antelope-agent-propose`, `antelope-agentic-payments`, `antelope-network-scope`, `antelope-mpc-sig-format`, `mpc-security-audit`, `antelope-next-step` |
| Mainnet protocol | `antelope-powerup-and-resources`, `antelope-atomicassets`, `antelope-atomicmarket`, `antelope-alcor-defi`, `antelope-permissions-and-msig`, `antelope-chain-profiles` |

## What `npm test` covers

K1 canonical, codecs, digests, WharfKit 4.0.2, policy/strategies, presign, simulate, lab client, **MCP (11 tools)**, museum, threshold mock, **unsigned handoff**, skills linter.

**Does not prove:** real DKLs23/CGGMP24, audited mainnet custody, production ESR binary codec, or that a lab `SIG_K1_` is accepted by nodeos.

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
