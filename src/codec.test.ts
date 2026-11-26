import { describe, expect, it } from "vitest";
import {
  formatPublicKey,
  formatSignature,
  packCompactSignature,
  parseSignature,
  signatureHeader,
  VECTOR1_LEGACY,
  VECTOR1_POINT,
  VECTOR1_PUB_K1,
  VECTOR_JUNGLE_SIG_K1,
  VECTOR_JUNGLE_SIG_R1,
} from "./codec.js";

describe("Antelope key and signature codecs", () => {
  it("formats Vector 1 PUB_K1_ and legacy EOS", () => {
    expect(formatPublicKey(VECTOR1_POINT, "K1")).toBe(VECTOR1_PUB_K1);
    expect(formatPublicKey(VECTOR1_POINT, "legacy")).toBe(VECTOR1_LEGACY);
  });

  it("round-trips published Jungle SIG_K1_ and SIG_R1_", () => {
    const k1 = parseSignature(VECTOR_JUNGLE_SIG_K1);
    expect(k1.kind).toBe("K1");
    expect(k1.sig65.length).toBe(65);
    expect(k1.recid).toBeGreaterThanOrEqual(0);
    expect(k1.recid).toBeLessThanOrEqual(3);
    expect(formatSignature(k1.sig65, "K1")).toBe(VECTOR_JUNGLE_SIG_K1);

    const r1 = parseSignature(VECTOR_JUNGLE_SIG_R1);
    expect(r1.kind).toBe("R1");
    expect(formatSignature(r1.sig65, "R1")).toBe(VECTOR_JUNGLE_SIG_R1);
  });

  it("packs header = 31 + recid", () => {
    expect(signatureHeader(0)).toBe(31);
    expect(signatureHeader(1)).toBe(32);
    const r = new Uint8Array(32).fill(0x11);
    const s = new Uint8Array(32).fill(0x22);
    const packed = packCompactSignature(1, r, s);
    expect(packed[0]).toBe(32);
    expect(packed.subarray(1, 33)).toEqual(r);
    expect(packed.subarray(33)).toEqual(s);
  });
});
