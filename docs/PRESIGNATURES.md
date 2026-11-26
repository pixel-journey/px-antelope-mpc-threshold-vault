# Presignatures, refresh, and abort

A presignature is a one-time nonce share. It is not a key, and it is not reusable.

## Executable lab in this repo

[src/presign.ts](../src/presign.ts) models the **queue policy** the blueprint requires. It does not run DKLs23 or CGGMP24.

```ts
import { PresignQueue, componentBytes } from "./presign.js";

const q = new PresignQueue();
q.tryEnqueue("K1", componentBytes(0x40, 0x01)); // offline r-filter
const take = q.take(componentBytes(0x40, 0x01)); // online s check
// bad s → burned: true, slot used, enqueue a *new* r — never tweak k
q.invalidateAll("refresh"); // after proactive share refresh
```

| Rule | Locked behavior |
| --- | --- |
| Offline K1 r-filter | Non-canonical `r` never enters the queue |
| R1 enqueue | No K1 high-bit trap on `r` |
| Single use | Second `consume` / `take` on the same slot fails |
| Bad `s` after low-S | Slot burned; caller must get a new presign |
| Refresh | `invalidateAll` discards unused slots |

Curve preference (prefer R1 for zero-retry online) lives in [src/curve.ts](../src/curve.ts).

## Use it once

The online signature is \(s = k^{-1}(m + r x) \bmod n\). If the same \(k\) signs two digests, both signatures publish enough to recover \(x\). The museum fixture in [src/museum.ts](../src/museum.ts) does that recovery on a key the test created. A protocol that caches presignatures must delete the one it just used, including when the node rejects the transaction and the agent wants to retry.

Retry means a new presignature. It does not mean the same \(r\) with a new memo.

## Filter \(r\) before the user is waiting

Antelope's K1 check rejects many random \(r\) values. Doing that filter offline, while nobody is waiting, is why a filtered pool can accept online at about 99.61% instead of about 24.8%. The count behind the naive rate is in [docs/K1-CANONICAL.md](K1-CANONICAL.md). R1 does not need the byte filter. It still needs low-\(s\).

The educational engine in [src/threshold.ts](../src/threshold.ts) marks a K1 presignature `rFiltered: true` and then refuses to sign. The flag is a reminder of the rule. The **queue** in `presign.ts` is where the filter is actually applied to synthetic bytes.

## Do not sign a raw digest

CVE-2025-66017 is a class of bug where a presignature API accepts a hash the caller claims is a transaction, and where BIP-32 additive derivation on top of those presignatures loses security margin. The feature name that turns the check off in cggmp24 is `insecure-assume-preimage-known`. This course rejects that string in manifests. A co-signer must pack the transaction itself, hash `chain_id || packed_transaction || cfd_hash` itself, and refuse a digest that arrived alone.

## Refresh

Proactive refresh replaces shares without changing the public key. Old shares must stop working. Cached presignatures from before the refresh must be thrown away, because they were built against the old shares. `PresignQueue.invalidateAll("refresh")` is the local model of that rule.

## Identifiable abort

A useful protocol tells you which party sent a message that failed a check, and it does not panic the process. A panic can leak timing and can stall the other honest parties. This course has no round messages. The rule is here so a later engine is judged on it.

## The relay is not a party

If two signers ever exchange rounds over a WebSocket, that relay sees ciphertext and sizes, not shares. Frames need their own authentication, a size cap, and an execution id that binds the session, the peer set, the chain id, and the transaction hash. A frame from another session must not be accepted. This repository does not open that socket.
