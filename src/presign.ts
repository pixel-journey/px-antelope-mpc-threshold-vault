/**
 * Educational presignature pool for Antelope K1.
 *
 * A real CGGMP24/DKLs23 ceremony would generate (r, partial shares) offline.
 * This module does not run those protocols. It models the *queue policy*
 * the blueprint requires:
 *
 * 1. Filter non-canonical r offline before enqueue.
 * 2. Use each slot at most once.
 * 3. After low-S, if s still fails the leading-zero byte rule, burn the slot
 *    and take a new one — never tweak the same nonce.
 *
 * r and s here are synthetic 32-byte buffers the tests supply. They are not
 * outputs of a threshold ceremony and must not be broadcast.
 */

import { componentIsCanonical } from "./canonical.js";

export interface PresignSlot {
  readonly id: string;
  readonly curve: "K1" | "R1";
  /** 32-byte big-endian r. For K1, only enqueued when canonical. */
  readonly r: Uint8Array;
  /** True when offline filter already accepted r (K1) or when curve is R1. */
  readonly rFiltered: boolean;
  used: boolean;
}

export type EnqueueResult =
  | { ok: true; slot: PresignSlot }
  | { ok: false; reason: string };

export type ConsumeResult =
  | {
      ok: true;
      slotId: string;
      /** s after optional low-S style leading-byte check (educational). */
      s: Uint8Array;
      burned: boolean;
    }
  | { ok: false; reason: string; burned?: boolean };

function clone32(bytes: Uint8Array): Uint8Array {
  if (bytes.length !== 32) throw new Error("component must be 32 bytes");
  return new Uint8Array(bytes);
}

/** Offline enqueue: K1 slots need canonical r; R1 always accepted. */
export function enqueuePresign(
  curve: "K1" | "R1",
  r: Uint8Array,
  id = crypto.randomUUID(),
): EnqueueResult {
  const copy = clone32(r);
  if (curve === "K1" && !componentIsCanonical(copy)) {
    return { ok: false, reason: "K1 r failed offline canonical filter" };
  }
  return {
    ok: true,
    slot: {
      id,
      curve,
      r: copy,
      rFiltered: true,
      used: false,
    },
  };
}

/**
 * Online consume: mark used, check s for the leftover leading-zero trap.
 * On failure, the slot is burned (used=true) and the caller must enqueue a new r.
 */
export function consumePresign(slot: PresignSlot, s: Uint8Array): ConsumeResult {
  if (slot.used) return { ok: false, reason: "presignature already used" };
  if (!slot.rFiltered) return { ok: false, reason: "presignature was not r-filtered" };
  const sCopy = clone32(s);

  // For K1, after low-S the remaining trap is leading 0x00 + second byte < 0x80.
  // R1 only needs low-S in production; we still reject a non-canonical s shape
  // here so the queue API stays uniform in the lab.
  if (!componentIsCanonical(sCopy)) {
    slot.used = true;
    return {
      ok: false,
      reason: "s failed leading-byte check after low-S; burn slot and retry with new presign",
      burned: true,
    };
  }

  slot.used = true;
  return { ok: true, slotId: slot.id, s: sCopy, burned: false };
}

export class PresignQueue {
  private readonly slots: PresignSlot[] = [];

  size(): number {
    return this.slots.filter((s) => !s.used).length;
  }

  tryEnqueue(curve: "K1" | "R1", r: Uint8Array, id?: string): EnqueueResult {
    const result = enqueuePresign(curve, r, id);
    if (result.ok) this.slots.push(result.slot);
    return result;
  }

  /** Take the oldest unused slot, apply s check, burn on failure. */
  take(s: Uint8Array): ConsumeResult {
    const slot = this.slots.find((entry) => !entry.used);
    if (!slot) return { ok: false, reason: "presign queue empty" };
    return consumePresign(slot, s);
  }

  /** Discard every slot (e.g. after proactive refresh of shares). */
  invalidateAll(reason: string): number {
    let n = 0;
    for (const slot of this.slots) {
      if (!slot.used) {
        slot.used = true;
        n++;
      }
    }
    void reason;
    return n;
  }
}

/** Build a 32-byte buffer with controlled first two bytes (for tests). */
export function componentBytes(first: number, second: number, fill = 0x11): Uint8Array {
  const out = new Uint8Array(32);
  out.fill(fill);
  out[0] = first & 0xff;
  out[1] = second & 0xff;
  return out;
}
