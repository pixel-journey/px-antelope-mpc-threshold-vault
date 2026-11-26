# Antelope MPC, without a mainnet signer

> Educational agent-payments + Antelope MPC course. **Unaudited.**  
> Mainnets refused. **No threshold WASM sign.** **No HTTP push by default.**  
> **Educational completion:** [docs/COMPLETION.md](docs/COMPLETION.md) · **Gaps:** [docs/GAP-AUDIT.md](docs/GAP-AUDIT.md)

```bash
npm test && npm run check-skills
# optional: cargo test -p antelope-crypto-format
```

```ts
import { runStrategyTool, listEnginesTool } from "./src/mcp.js";
runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));
listEnginesTool();
```

Optional lab network (explicit):

```ts
import { fetchLabChainInfo } from "./src/labClient.js";
import { CHAINS } from "./src/digest.js";
await fetchLabChainInfo(CHAINS.waxTestnet, { enableNetwork: true });
```

## Docs

[TODAY](docs/TODAY.md) · [COMPLETION](docs/COMPLETION.md) · [AGENT-RECIPE](docs/AGENT-RECIPE.md) · [PUSH](docs/PUSH.md) · [ENGINE](docs/ENGINE.md) · [RUST](docs/RUST.md) · [EDUCATION](EDUCATION.md)

WharfKit **4.0.2**. MIT. Pixel Journey.
