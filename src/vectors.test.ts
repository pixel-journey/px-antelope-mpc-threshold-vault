import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { CANONICAL_COUNTS } from "./canonical.js";
import {
  formatPublicKey,
  formatSignature,
  parseSignature,
  VECTOR1_LEGACY,
  VECTOR1_POINT,
  VECTOR1_PUB_K1,
  VECTOR_JUNGLE_SIG_K1,
  VECTOR_JUNGLE_SIG_R1,
} from "./codec.js";
import { CHAINS, sigDigest, txId } from "./digest.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const vectors = JSON.parse(readFileSync(join(root, "testdata/vectors.json"), "utf8")) as {
  jungle4: {
    chainId: string;
    packedTx: string;
    txId: string;
    sigDigest: string;
  };
  canonicalCounts: {
    oneComponentPass: number;
    oneComponentTotal: number;
    bothPass: number;
    bothTotal: number;
    bothFail: number;
  };
  vector1: { compressed: string; pubK1: string; pubR1: string; legacyEos: string };
  vector2: { digest: string; sigK1: string; recoveredPubK1: string };
  vector3: { sigK1: string; recoveredPubK1: string };
  vector4: { sigR1: string; recoveredPubR1: string };
};

describe("shared testdata/vectors.json", () => {
  it("matches TypeScript CANONICAL_COUNTS", () => {
    expect(vectors.canonicalCounts.oneComponentPass).toBe(CANONICAL_COUNTS.oneComponentPass);
    expect(vectors.canonicalCounts.bothPass).toBe(CANONICAL_COUNTS.bothPass);
    expect(vectors.canonicalCounts.bothFail).toBe(CANONICAL_COUNTS.bothFail);
  });

  it("matches Jungle 4 digest constants and live hashing", () => {
    expect(vectors.jungle4.chainId).toBe(CHAINS.jungle4);
    const packed = Uint8Array.from(Buffer.from(vectors.jungle4.packedTx, "hex"));
    expect(txId(packed)).toBe(vectors.jungle4.txId);
    expect(sigDigest(vectors.jungle4.chainId, packed)).toBe(vectors.jungle4.sigDigest);
  });

  it("locks Vector 1 PUB_K1_, PUB_R1_, and legacy EOS", () => {
    const point = Uint8Array.from(Buffer.from(vectors.vector1.compressed, "hex"));
    expect(Buffer.from(point).equals(Buffer.from(VECTOR1_POINT))).toBe(true);
    expect(formatPublicKey(point, "K1")).toBe(vectors.vector1.pubK1);
    expect(formatPublicKey(point, "R1")).toBe(vectors.vector1.pubR1);
    expect(formatPublicKey(point, "legacy")).toBe(vectors.vector1.legacyEos);
    expect(vectors.vector1.pubK1).toBe(VECTOR1_PUB_K1);
    expect(vectors.vector1.legacyEos).toBe(VECTOR1_LEGACY);
  });

  it("round-trips Vector 2–4 signature strings", () => {
    for (const sig of [vectors.vector2.sigK1, vectors.vector3.sigK1]) {
      const parsed = parseSignature(sig);
      expect(parsed.kind).toBe("K1");
      expect(formatSignature(parsed.sig65, "K1")).toBe(sig);
    }
    const r1 = parseSignature(vectors.vector4.sigR1);
    expect(r1.kind).toBe("R1");
    expect(formatSignature(r1.sig65, "R1")).toBe(vectors.vector4.sigR1);
    expect(vectors.vector3.sigK1).toBe(VECTOR_JUNGLE_SIG_K1);
    expect(vectors.vector4.sigR1).toBe(VECTOR_JUNGLE_SIG_R1);
    expect(vectors.vector2.digest).toHaveLength(64);
    expect(vectors.vector2.recoveredPubK1.startsWith("PUB_K1_")).toBe(true);
    expect(vectors.vector3.recoveredPubK1.startsWith("PUB_K1_")).toBe(true);
    expect(vectors.vector4.recoveredPubR1.startsWith("PUB_R1_")).toBe(true);
  });
});
