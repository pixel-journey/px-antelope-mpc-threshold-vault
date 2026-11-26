import { describe, expect, it } from "vitest";
import {
  componentBytes,
  consumePresign,
  enqueuePresign,
  PresignQueue,
} from "./presign.js";

describe("presign queue policy", () => {
  it("rejects non-canonical K1 r offline and accepts a clear pair", () => {
    const badR = componentBytes(0x80, 0x01);
    expect(enqueuePresign("K1", badR).ok).toBe(false);

    const goodR = componentBytes(0x40, 0x01);
    const ok = enqueuePresign("K1", goodR);
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.slot.rFiltered).toBe(true);
      expect(ok.slot.curve).toBe("K1");
    }
  });

  it("accepts R1 r without the K1 high-bit trap", () => {
    const highBitR = componentBytes(0x80, 0x01);
    const ok = enqueuePresign("R1", highBitR);
    expect(ok.ok).toBe(true);
  });

  it("burns the slot when s fails the leading-zero rule", () => {
    const r = componentBytes(0x40, 0x02);
    const enq = enqueuePresign("K1", r);
    expect(enq.ok).toBe(true);
    if (!enq.ok) return;

    const badS = componentBytes(0x00, 0x40); // leading zero + second < 0x80
    const once = consumePresign(enq.slot, badS);
    expect(once.ok).toBe(false);
    expect(once.burned).toBe(true);
    expect(enq.slot.used).toBe(true);

    const goodS = componentBytes(0x40, 0x01);
    const twice = consumePresign(enq.slot, goodS);
    expect(twice.ok).toBe(false);
    expect(twice.reason).toMatch(/already used/);
  });

  it("FIFO take + invalidateAll after refresh", () => {
    const q = new PresignQueue();
    expect(q.tryEnqueue("K1", componentBytes(0x41, 0x01)).ok).toBe(true);
    expect(q.tryEnqueue("K1", componentBytes(0x42, 0x01)).ok).toBe(true);
    expect(q.size()).toBe(2);

    const first = q.take(componentBytes(0x43, 0x01));
    expect(first.ok).toBe(true);
    expect(q.size()).toBe(1);

    const burned = q.invalidateAll("refresh");
    expect(burned).toBe(1);
    expect(q.size()).toBe(0);
    expect(q.take(componentBytes(0x44, 0x01)).reason).toMatch(/empty/);
  });
});
