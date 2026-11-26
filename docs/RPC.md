# Lab RPC helpers

Modules: [src/rpc.ts](../src/rpc.ts) · [src/labClient.ts](../src/labClient.ts).

## Endpoints catalog

| Name | Kind | Default lab gate |
| --- | --- | --- |
| WAX Testnet (Greymass) | lab | Yes |
| Jungle 4 | lab | Yes |
| Telos Testnet | testnet-opt-in | Via `extraLabChainIds` |
| XPR Testnet | testnet-opt-in | Via `extraLabChainIds` |

Mainnets are **not** in this catalog as send targets.

## Paths taught

| Path | Use |
| --- | --- |
| `/v1/chain/get_info` | `fetchLabChainInfo` (opt-in network) |
| `/v1/chain/compute_transaction` | Request builder; offline fixtures in `simulate.ts` |
| `/v1/chain/push_transaction` | `pushLabTransaction` only after readiness |
| `/v1/chain/get_required_keys` | Documented for later WalletPlugin work |

## Builders vs fetch

- `buildComputeTransactionRequest` / `buildPushTransactionRequest` — URL + body; **no** socket
- `fetchLabChainInfo` / `pushLabTransaction` — require `{ enableNetwork: true }`

Push additionally requires green `evaluatePushReadiness` (policy, real digest, dry-run, operator opt-in). Incomplete → no HTTP.

## Agent guidance

Do not expose raw push as an MCP tool. Prefer offline fixtures first, then operator-controlled scripts for any live lab send. See [PUSH.md](PUSH.md) · [MCP-TOOLS.md](MCP-TOOLS.md).
