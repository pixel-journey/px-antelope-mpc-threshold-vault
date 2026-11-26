import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { CANONICAL_COUNTS } from "./canonical.js";
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
});
