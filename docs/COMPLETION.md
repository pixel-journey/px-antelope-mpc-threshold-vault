# Educational completion vs production backlog

This course is **complete as an educational agent-payments + Antelope MPC primer** when the rows below are green. It is **not** a production threshold wallet.

## Educational complete (this tree)

| Item | Evidence |
| --- | --- |
| Honesty banner | README / package description |
| K1 canonical + low-S + presign policy | `canonical.ts`, `presign.ts` |
| Digests + WharfKit 4.0.2 vectors | `digest.ts`, `wharfkit.test.ts` |
| Shared TS/Rust vectors | `testdata/vectors.json` |
| Policy + strategies + operator testnets | `policy.ts`, `strategies.ts` |
| Lab SIG after allow | `labsign.ts` |
| Offline compute fixtures | `simulate.ts` |
| Push curriculum + gated lab sender | `broadcast.ts`, `labClient.pushLabTransaction` |
| Opt-in lab `get_info` | `labClient.fetchLabChainInfo` |
| MCP tool surface (10) | `mcp.ts` |
| Attack museum + cards | `museum.ts`, `ATTACK-MUSEUM.md` |
| Skills + CI | `skills/`, `check-skills`, `ci.yml` |
| R.1 Rust format + deny | `crates/antelope-crypto-format`, `deny.toml` |
| Engine trait + mock | `threshold.ts` (`sign` throws) |

```bash
npm test && npm run check-skills
# optional:
cargo test -p antelope-crypto-format
```

## Not complete (and should not pretend to be)

| Item | Phase |
| --- | --- |
| Real DKLs23 / CGGMP24 WASM signing | R.2 |
| Live WharfKit WalletPlugin co-sign | W+ |
| Model-invoked push MCP tool | Intentionally omitted |
| Relay / Vault / WebAuthn PRF | I |
| Next.js lab UI / x402 facilitator | U / A |
| Mainnet value | Never on unaudited stack |

## Definition of done for *this* repo

A developer or agent can: list strategies, pass the policy gate, run offline simulation fixtures, understand K1 traps, recover a lab signature, name the push checklist, optionally call gated lab `get_info` / `push_transaction` with honest readiness flags, and see that real threshold `sign` is intentionally unavailable — without being misled that mainnet MPC custody ships here.
