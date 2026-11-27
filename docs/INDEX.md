# Doc index

Start at [README](../README.md). Then pick a path.

## If you have ten minutes

1. [EXECUTION-MODES.md](EXECUTION-MODES.md) — mainnet human-sign vs testnet lab
2. [DECIDE.md](DECIDE.md) — stop conditions
3. [TODAY.md](TODAY.md) — what `npm test` runs
4. [GAP-AUDIT.md](GAP-AUDIT.md) — done vs Phase R.2

## If you are an agent

| Step | Doc |
| --- | --- |
| Execution mode | [EXECUTION-MODES.md](EXECUTION-MODES.md) |
| Walk the gate | [DECIDE.md](DECIDE.md) |
| Named strategies | [STRATEGIES.md](STRATEGIES.md) |
| Full loop | [AGENT-RECIPE.md](AGENT-RECIPE.md) |
| Tools | [MCP-TOOLS.md](MCP-TOOLS.md) |
| Networks | [NETWORKS.md](NETWORKS.md) · [CHAIN-OPPORTUNITIES.md](CHAIN-OPPORTUNITIES.md) |
| Human handoff | [HANDOFF.md](HANDOFF.md) · `src/esr.ts` |
| Push last (testnet only) | [PUSH.md](PUSH.md) |

### Skills

**MPC / agent core:** `antelope-agent-propose`, `antelope-agentic-payments`, `antelope-network-scope`, `antelope-mpc-sig-format`, `mpc-security-audit`, `antelope-next-step`

**Mainnet protocol pack:** `antelope-powerup-and-resources`, `antelope-atomicassets`, `antelope-atomicmarket`, `antelope-alcor-defi`, `antelope-permissions-and-msig`, `antelope-chain-profiles`

## If you are learning the crypto

[EDUCATION.md](../EDUCATION.md) · [CURRICULUM.md](CURRICULUM.md) · [K1-CANONICAL.md](K1-CANONICAL.md) · [ENGINE.md](ENGINE.md) · [ATTACK-MUSEUM.md](ATTACK-MUSEUM.md) · [RUST.md](RUST.md)

## Hard lines

- No mainnet agent push / unaudited MPC custody  
- No model-fired `push_transaction`  
- Lab `SIG_K1_` is not a node signature  
- Mainnet = unsigned handoff → human / msig / hardware  
