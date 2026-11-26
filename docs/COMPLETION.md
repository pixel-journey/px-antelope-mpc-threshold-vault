# Educational completion vs production backlog

## Educational complete

| Item | Evidence |
| --- | --- |
| Agent loop, policy, strategies, MCP | `mcp.ts`, `strategies.ts` |
| Crypto labs (K1, codecs, digests, presign) | `canonical`, `codec`, `digest`, `presign` |
| Simulate fixtures + museum | `simulate.ts`, `museum.ts` |
| Push **curriculum** + **gated lab sender** | `broadcast.ts`, `labClient.pushLabTransaction` |
| Opt-in lab `get_info` | `labClient.fetchLabChainInfo` |
| Skills CI + R.1 Rust format | `check-skills`, `antelope-crypto-format` |
| Engine mock (`sign` throws) | `threshold.ts` |

```bash
npm test && npm run check-skills
```

## Still not production MPC custody

| Item | Phase |
| --- | --- |
| Real DKLs23 / CGGMP24 sign | R.2 |
| Live WalletPlugin co-sign | W+ |
| Mainnet | Never on unaudited stack |
| Model-invoked push MCP tool | Intentionally omitted |

**Definition of done:** developers can run the full educational loop, optionally push a **testnet** tx only when readiness flags are honest, and cannot confuse lab `SIG_K1_` or mainnet with that path.
