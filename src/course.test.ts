import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CANONICAL_COUNTS, countCanonicalFirstTwoBytes, normalizeLowS, signatureIsCanonicalK1, signatureIsCanonicalR1, SECP256K1_N } from "./canonical.js";
import { formatPublicKey, VECTOR1_LEGACY, VECTOR1_POINT, VECTOR1_PUB_K1 } from "./codec.js";
import { JUNGLE4_PACKED_TX, JUNGLE4_SIG_DIGEST, JUNGLE4_TX_ID, sigDigest, txId, CHAINS } from "./digest.js";
import { findBannedSnippets } from "./hygiene.js";
import { recoverFromReusedNonce, shamirReconstruct, shamirSplit, smashedHash, taggedHash } from "./museum.js";
import { createPolicy } from "./policy.js";

describe("K1 canonical bytes", () => {
  it("counts 32640 of 65536 first-two-byte pairs", () => {
    expect(countCanonicalFirstTwoBytes()).toBe(CANONICAL_COUNTS.oneComponentPass);
  });

  it("rejects a high bit on r and accepts a low clear pair", () => {
    const bad = new Uint8Array(65);
    bad[1] = 0x80;
    bad[33] = 0x40;
    bad[34] = 0x80;
    expect(signatureIsCanonicalK1(bad)).toBe(false);
    const good = new Uint8Array(65);
    good[1] = 0x40;
    good[2] = 0x01;
    good[33] = 0x40;
    good[34] = 0x01;
    expect(signatureIsCanonicalK1(good)).toBe(true);
  });

  it("lets R1 skip the K1 byte check and still require low-S", () => {
    const highBitR = new Uint8Array(65);
    highBitR[0] = 31;
    highBitR[1] = 0x80;
    highBitR[33] = 0x01;
    expect(signatureIsCanonicalK1(highBitR)).toBe(false);
    expect(signatureIsCanonicalR1(highBitR)).toBe(true);
    const highS = new Uint8Array(65);
    highS[0] = 31;
    highS[1] = 0x40;
    highS[33] = 0xff;
    expect(signatureIsCanonicalR1(highS)).toBe(false);
  });

  it("flips recid when s is above n/2", () => {
    const high = (SECP256K1_N >> 1n) + 3n;
    const out = normalizeLowS(high, 1);
    expect(out.flipped).toBe(true);
    expect(out.recid).toBe(0);
    expect(out.s < SECP256K1_N >> 1n).toBe(true);
    expect(out.s + high).toBe(SECP256K1_N);
  });
});

describe("published vectors this course rechecked", () => {
  it("formats Vector 1 as PUB_K1_ and EOS", () => {
    expect(formatPublicKey(VECTOR1_POINT, "K1")).toBe(VECTOR1_PUB_K1);
    expect(formatPublicKey(VECTOR1_POINT, "legacy")).toBe(VECTOR1_LEGACY);
  });

  it("hashes the Jungle 4 packed transaction into the published tx id and sig_digest", () => {
    const packed = Uint8Array.from(Buffer.from(JUNGLE4_PACKED_TX, "hex"));
    expect(txId(packed)).toBe(JUNGLE4_TX_ID);
    expect(sigDigest(CHAINS.jungle4, packed)).toBe(JUNGLE4_SIG_DIGEST);
    expect(sigDigest(CHAINS.waxTestnet, packed)).not.toBe(JUNGLE4_SIG_DIGEST);
  });
});

describe("policy gate", () => {
  const base = {
    chainId: CHAINS.waxTestnet,
    contract: "eosio.token",
    action: "transfer",
    alias: "px-treasury",
    amountUnits: 10_000n,
    symbol: "WAX",
    memo: "lab transfer",
    nowSec: 1_000,
    expiresAtSec: 1_060,
  };

  it("allows a small testnet transfer to a known alias", () => {
    const decision = createPolicy().propose(base);
    expect(decision.ok).toBe(true);
    expect(decision.account).toBe("treasury.pxj");
  });

  it("refuses mainnet, updateauth, a raw memo account, and a killed gate", () => {
    const policy = createPolicy();
    expect(policy.propose({ ...base, chainId: CHAINS.waxMainnet }).ok).toBe(false);
    expect(policy.propose({ ...base, action: "updateauth", contract: "eosio" }).ok).toBe(false);
    expect(policy.propose({ ...base, memo: "pay alice.wam" }).reason).toMatch(/account name/);
    policy.kill("drill");
    expect(policy.propose(base).reason).toBe("policy is killed");
    expect(policy.audit.some((line) => line.startsWith("kill:"))).toBe(true);
  });
});

describe("museum", () => {
  it("shows Shamir reconstruction puts the secret back on one machine", () => {
    const [a, b] = shamirSplit(42);
    expect(shamirReconstruct(a!, b!)).toBe(42);
  });

  it("recovers a fixture key when the same nonce signs two digests", () => {
    const found = recoverFromReusedNonce({ x: 0x11n, k: 0x22n, m1: 0x33n, m2: 0x44n });
    expect(found.recoveredK).toBe(0x22n);
    expect(found.recoveredX).toBe(0x11n);
  });

  it("shows bare concatenation collides and length prefixes do not", () => {
    expect(smashedHash(["ab", "c"])).toBe(smashedHash(["a", "bc"]));
    expect(taggedHash(["ab", "c"])).not.toBe(taggedHash(["a", "bc"]));
  });
});

describe("manifest hygiene", () => {
  it("keeps banned custody libraries out of package.json", () => {
    const text = readFileSync(new URL("../package.json", import.meta.url), "utf8");
    expect(findBannedSnippets(text)).toEqual([]);
  });
});
