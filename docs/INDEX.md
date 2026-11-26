# Doc index

Start at [README](../README.md). Then pick a path.

## If you have ten minutes

1. [DECIDE.md](DECIDE.md) — stop conditions
2. [TODAY.md](TODAY.md) — what `npm test` actually runs
3. [GAP-AUDIT.md](GAP-AUDIT.md) — done vs Phase R.2

## If you are an agent

| Step | Doc |
| --- | --- |
| Walk the gate | [DECIDE.md](DECIDE.md) |
| Named strategies | [STRATEGIES.md](STRATEGIES.md) · [AGENT-STRATEGIES.md](AGENT-STRATEGIES.md) |
| Full loop | [AGENT-RECIPE.md](AGENT-RECIPE.md) |
| Tools | [MCP-TOOLS.md](MCP-TOOLS.md) |
| Networks | [NETWORKS.md](NETWORKS.md) · [CHAIN-OPPORTUNITIES.md](CHAIN-OPPORTUNITIES.md) |
| What to give a co-signer | [HANDOFF.md](HANDOFF.md) |
| Push last | [PUSH.md](PUSH.md) · [RPC.md](RPC.md) |

Skills: `skills/antelope-agent-propose`, `antelope-agentic-payments`, `antelope-network-scope`, `antelope-mpc-sig-format`, `mpc-security-audit`.

## If you are learning the crypto

| Topic | Doc |
| --- | --- |
| Course spine | [../EDUCATION.md](../EDUCATION.md) |
| Eight levels | [CURRICULUM.md](CURRICULUM.md) |
| Generations | [PROTOCOL-GENERATIONS.md](PROTOCOL-GENERATIONS.md) |
| K1 bytes | [K1-CANONICAL.md](K1-CANONICAL.md) |
| Presign queue | [PRESIGNATURES.md](PRESIGNATURES.md) |
| Entropy | [ENTROPY.md](ENTROPY.md) |
| Attacks | [ATTACK-MUSEUM.md](ATTACK-MUSEUM.md) |
| Post-quantum | [POST-QUANTUM.md](POST-QUANTUM.md) |
| Sources | [SOURCES.md](SOURCES.md) |
| Without WharfKit | [WITHOUT-WHARFKIT.md](WITHOUT-WHARFKIT.md) |
| Rust R.1 | [RUST.md](RUST.md) |

## If you are designing custody

| Topic | Doc |
| --- | --- |
| Hybrid thesis | [../ARCHITECTURE.md](../ARCHITECTURE.md) |
| Permissions | [PERMISSIONS.md](PERMISSIONS.md) |
| Why Antelope for agents | [AGENTIC-PAYMENTS.md](AGENTIC-PAYMENTS.md) |
| Threats | [THREAT_MODEL.md](THREAT_MODEL.md) |
| Wallet plugin stub | [WALLET-PLUGIN.md](WALLET-PLUGIN.md) |
| Relay (not built) | [RELAY.md](RELAY.md) |
| Engines | [ENGINE.md](ENGINE.md) |
| Lab signatures | [LAB-SIGNER.md](LAB-SIGNER.md) |
| Licenses | [LICENSES.md](LICENSES.md) |
| Done vs not | [COMPLETION.md](COMPLETION.md) |

## Hard lines

- No mainnet.
- No threshold `sign` until Phase R.2, and not on mainnet even then without an audit.
- No model-fired `push_transaction`.
- Lab `SIG_K1_` is not a node signature.
