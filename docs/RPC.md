# Lab RPC catalog (no push)

[src/rpc.ts](../src/rpc.ts) lists public lab endpoints and builds **request shapes** for dry-run style calls. It does not fetch by default and never offers `push_transaction`.

## Endpoints

| Network | Kind | Example API root |
| --- | --- | --- |
| WAX Testnet | default lab | `https://waxtestnet.greymass.com` |
| Jungle 4 | default lab | `https://jungle4.greymass.com` |
| Telos Testnet | operator opt-in | `https://telostestnet.greymass.com` |
| XPR Testnet | operator opt-in | `https://proton-testnet.greymass.com` |

## Allowed educational paths

- `/v1/chain/get_info`
- `/v1/chain/get_required_keys`
- `/v1/chain/compute_transaction` — execute without committing state
- `/v1/chain/send_read_only_transaction`

`buildComputeTransactionRequest` only accepts chains that pass `evaluateBroadcast` (testnet candidates). It still does not HTTP-post.

## Forbidden

- `/v1/chain/push_transaction`
- `/v1/chain/send_transaction2`

`buildPushTransactionRequest` always throws. See [src/broadcast.ts](../src/broadcast.ts).

## Relation to `simulate.ts`

| Module | Contact node? | Purpose |
| --- | --- | --- |
| `simulate.ts` | No | Policy + broadcast lock only |
| `rpc.ts` | No (builders only) | Correct URL/body shape for a later lab client |

A Phase W client may `fetch` lab `compute_transaction` after policy allow, still calling `refuseBroadcast` before any send.
