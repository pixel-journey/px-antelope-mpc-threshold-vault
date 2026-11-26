import { secp256k1 } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha2";

/**
 * Attack-museum arithmetic on numbers this file creates.
 * Nothing here talks to a chain, and nothing here is a custody design.
 * Shamir reconstruction is the anti-pattern: the secret exists on one machine.
 */

const n = secp256k1.CURVE.n;

function mod(a: bigint, m: bigint): bigint {
  const r = a % m;
  return r >= 0n ? r : r + m;
}

function invert(a: bigint, m: bigint): bigint {
  let [oldR, r] = [mod(a, m), m];
  let [oldS, s] = [1n, 0n];
  while (r !== 0n) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  if (oldR !== 1n) throw new Error("not invertible");
  return mod(oldS, m);
}

/** Two shares of `secret` over a tiny prime. Reconstructing them is the mistake. */
export function shamirSplit(secret: number, prime = 101): { x: number; y: number }[] {
  const slope = 7;
  const at = (x: number) => (secret + slope * x) % prime;
  return [
    { x: 1, y: at(1) },
    { x: 2, y: at(2) },
  ];
}

export function shamirReconstruct(
  a: { x: number; y: number },
  b: { x: number; y: number },
  prime = 101,
): number {
  const num = (a.y * b.x - b.y * a.x) % prime;
  const den = (b.x - a.x) % prime;
  const inv = invert(BigInt(den), BigInt(prime));
  return Number(mod(BigInt(num) * inv, BigInt(prime)));
}

/**
 * Same nonce k on two digests leaks x.
 * k = (m1 - m2) * inv(s1 - s2)
 * x = inv(r) * (s1 * k - m1)
 */
export function recoverFromReusedNonce(input: {
  x: bigint;
  k: bigint;
  m1: bigint;
  m2: bigint;
}): { recoveredX: bigint; recoveredK: bigint } {
  const R = secp256k1.ProjectivePoint.BASE.multiply(input.k).toAffine();
  const r = mod(R.x, n);
  const s1 = mod(invert(input.k, n) * mod(input.m1 + mod(r * input.x, n), n), n);
  const s2 = mod(invert(input.k, n) * mod(input.m2 + mod(r * input.x, n), n), n);
  const recoveredK = mod((input.m1 - input.m2) * invert(mod(s1 - s2, n), n), n);
  const recoveredX = mod(invert(r, n) * mod(s1 * recoveredK - input.m1, n), n);
  return { recoveredX, recoveredK };
}

/** Length-prefixed hashing does not treat ["ab","c"] as ["a","bc"]. */
export function taggedHash(parts: string[]): string {
  const body = parts
    .map((part) => {
      const bytes = Buffer.from(part, "utf8");
      return Buffer.concat([Buffer.from(bytes.length.toString(16).padStart(8, "0")), bytes]);
    })
    .reduce((acc, chunk) => Buffer.concat([acc, chunk]), Buffer.alloc(0));
  return Buffer.from(sha256(body)).toString("hex");
}

export function smashedHash(parts: string[]): string {
  return Buffer.from(sha256(Buffer.from(parts.join(""), "utf8"))).toString("hex");
}
