# Antelope MPC, without a mainnet signer

> **Status:** educational reference for agentic payments on Antelope. Unaudited.  
> Default gate: WAX Testnet + Jungle 4. **Mainnets hard-refused.**  
> **No threshold WASM** (Phase R.2). **No HTTP push by default** ([docs/PUSH.md](docs/PUSH.md)).  
> **R.1:** Rust `antelope-crypto-format` + `deny.toml` only — [docs/RUST.md](docs/RUST.md).  
> **Done vs remains:** [docs/GAP-AUDIT.md](docs/GAP-AUDIT.md).

## Agent path (TypeScript)

```bash
npm test && npm run check-skills
```

```ts
import { runStrategyTool, listStrategiesTool } from "./src/mcp.js";
listStrategiesTool({ expect: "allow" });
runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));
```

## Format path (Rust)

```bash
cargo test -p antelope-crypto-format
```

K1 canonical counts and Jungle 4 digest parity with the TS course. **Still no MPC signing crates.**

## Docs

[TODAY](docs/TODAY.md) · [GAP-AUDIT](docs/GAP-AUDIT.md) · [AGENT-RECIPE](docs/AGENT-RECIPE.md) · [PUSH](docs/PUSH.md) · [RUST](docs/RUST.md) · [ATTACK-MUSEUM](docs/ATTACK-MUSEUM.md)

WharfKit **4.0.2**. Naive K1 fail rate ~**75.2%** (uniform-byte model).

MIT. Pixel Journey.
