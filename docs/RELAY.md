# Co-signer relay design (not implemented)

The blueprint’s multi-party online round needs a transport. This course does **not** open a WebSocket or host a relay. The rules below are the design an implementer must satisfy so the relay never becomes a third share.

## Role

| Actor | Sees | Must not see |
| --- | --- | --- |
| Party 1 (browser / agent device) | Own share ciphertext, session id | Other parties’ plaintext shares |
| Party 2 (policy co-signer) | Own share, decoded transaction, policy decision | Party 1 plaintext share |
| Relay | Ciphertext frames, sizes, authenticated sender ids | Share plaintext, private keys |
| Owner (cold) | Nothing of the online round | — |

The relay is **not** a threshold party. Losing the relay must not reconstruct `x`.

## Frame requirements

1. **Authenticated sender** — each frame carries a binding the recipient can verify (e.g. signature over session id + round + payload hash with a long-term device key, or TLS client certs in a closed deployment).
2. **Session binding** — execution id binds `{ session, peer set, chain id, transaction hash }`. A frame from another session is rejected.
3. **Size cap** — reject oversized frames before parsing (DoS).
4. **No raw digest API** — parties receive packed transaction bytes (or an ABI-clear action list) and hash `SHA-256(chain_id ‖ packed ‖ cfd)` locally. The relay must not accept a 32-byte “please sign this hash” blob from a model.
5. **One-time presign** — after online use (or canonical failure), the presign slot is burned locally; the relay does not store reusable nonces.

## Failure modes the design must survive

| Failure | Expected behavior |
| --- | --- |
| Relay drops frames | Parties time out; no partial signature is published as final |
| Relay replays an old frame | Session id / counter check rejects |
| Malicious peer aborts | Identifiable abort if the engine supports it; no panic that leaks timing of honest shares |
| Policy refuses | Online round never starts |
| Model drives the relay | Relay accepts only authenticated co-signer peers, not free-form agent tool output |

## What exists in this repo instead

| Piece | Role |
| --- | --- |
| `handoff()` | Binds an allowed proposal for a co-signer **without** a network |
| `PresignQueue` | Local r-filter / burn policy |
| `pluginSign` / WalletPlugin stub | Refuses model digests and live threshold sign |
| `pushLabTransaction` | Gated **lab** push of a finished signed tx — not MPC round transport |
| [PRESIGNATURES.md](PRESIGNATURES.md) | Refresh invalidates the pool |
| [ENGINE.md](ENGINE.md) | R.2 engines still future |

Building the relay is a separate engineering project **after** a reviewed threshold engine exists (Phase I in [GAP-AUDIT.md](GAP-AUDIT.md)).
