# Callable today

```bash
npm test && npm run check-skills
cargo test -p antelope-crypto-format   # if Rust toolchain present
```

## TypeScript

| Surface | Module |
| --- | --- |
| MCP (9 tools) | `mcp.ts` |
| Simulate fixtures | `simulate.ts` |
| Push readiness | `broadcast.ts` |
| Engine registry (mock only) | `threshold.ts` |
| Shared vectors | `testdata/vectors.json` |
| Museum cards | `museum.ts` |

```ts
import { runStrategyTool } from "./mcp.js";
import { createEngine, listEngines } from "./threshold.js";

runStrategyTool("wax-testnet-tip", "agent.pxj", Math.floor(Date.now() / 1000));
listEngines();
createEngine("educational-mock"); // only available id
```

## Rust R.1

`antelope-crypto-format`: K1 canonical + Jungle 4 digest. [RUST.md](RUST.md) · [ENGINE.md](ENGINE.md)
