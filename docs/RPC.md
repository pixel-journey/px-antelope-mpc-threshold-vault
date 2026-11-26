# Lab RPC catalog

[src/rpc.ts](../src/rpc.ts) lists public lab endpoints and builds request shapes. It does not fetch by default.

## Endpoints

| Network | Kind | Example API root |
| --- | --- | --- |
| WAX Testnet | default lab | `https://waxtestnet.greymass.com` |
| Jungle 4 | default lab | `https://jungle4.greymass.com` |
| Telos Testnet | operator opt-in | `https://telostestnet.greymass.com` |
| XPR Testnet | operator opt-in | `https://proton-testnet.greymass.com` |

## Paths

**Early / middle curriculum**

- `/v1/chain/get_info`
- `/v1/chain/get_required_keys`
- `/v1/chain/compute_transaction`
- `/v1/chain/send_read_only_transaction`

**Final curriculum stage** (see [PUSH.md](PUSH.md))

- `/v1/chain/push_transaction`
- `/v1/chain/send_transaction2`

`buildPushTransactionRequest` returns a URL only when `evaluatePushReadiness` is fully green **and** still sets `httpSendImplemented: false` in this package. That is “learn the endpoint,” not “we shipped a silent sender.”

## Local vs node

| Module | Node contact | Role |
| --- | --- | --- |
| `simulate.ts` | No | Policy + broadcast candidate checks |
| `rpc.ts` | Builders only | Correct URLs/bodies for lab clients |
| Phase W (future) | Optional `fetch` | Real dry-run / testnet push under readiness |
