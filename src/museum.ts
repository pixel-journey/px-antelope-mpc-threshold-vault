import { secp256k1 } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha2";

/**
 * Attack-museum arithmetic on numbers this file creates.
 * CVE writeups live in docs/ATTACK-MUSEUM.md; here we only demo safe toy cases.
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
 *
 * Px Principle #3: never seed MPC nonces from tx/block hashes or orng.wax.
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

/**
 * TSSHOCK-style ambiguous delimiter: join with "$" lets
 * ["a$", "b"] collide with ["a", "$b"] under naive concatenation.
 */
export function dollarJoinedHash(parts: string[]): string {
  return Buffer.from(sha256(Buffer.from(parts.join("$"), "utf8"))).toString("hex");
}

export function dollarDelimiterCollides(): boolean {
  return dollarJoinedHash(["a$", "b"]) === dollarJoinedHash(["a", "$b"]);
}

/** Structured catalog for docs/CI — no vulnerable engines. */
export interface MuseumCard {
  id: string;
  references: string;
  affected: string;
  extractionEffort: string;
  rootCause: string;
  mandatoryFix: string;
  repoInvariant: string;
  demoInRepo: boolean;
}

export const MUSEUM_CARDS: readonly MuseumCard[] = [
  {
    id: "alpha-rays",
    references: "ePrint 2021/1621",
    affected: "GG-style MtA without range proofs",
    extractionEffort: "Full key recovery from 1 valid signature class of attacks",
    rootCause: "Small Paillier modulus / MtA range-proof gap destroys hiding",
    mandatoryFix: "N >= q^8, MtA range proofs, EC-point binding in MtAwc",
    repoInvariant: "No Paillier engine in-tree; license/feature hygiene rejects insecure flags",
    demoInRepo: false,
  },
  {
    id: "bitforge-gg",
    references: "CVE-2023-33241",
    affected: "GG18/20 wallets with smooth Paillier moduli",
    extractionEffort: "Full key recovery on order of tens of signatures",
    rootCause: "Smooth Paillier modulus opens CRT channels",
    mandatoryFix: "Paillier-Blum + no-small-factors proofs before MtA",
    repoInvariant: "No GG18 runtime; documented only",
    demoInRepo: false,
  },
  {
    id: "bitforge-lindell",
    references: "CVE-2023-33242",
    affected: "Non-compliant Lindell17 abort handling",
    extractionEffort: "~1 bit leak per failed signature request",
    rootCause: "Abort paths not paper-compliant",
    mandatoryFix: "Exact abort semantics; prefer modern multi-party stacks",
    repoInvariant: "No Lindell17 dependency",
    demoInRepo: false,
  },
  {
    id: "tssshock-transcript",
    references: "CVE-2022-47931 / CVE-2023-26556",
    affected: "Weak Fiat-Shamir transcript framing; weak DLN parameters",
    extractionEffort: "Transcript collision / high cheat rate when k=1",
    rootCause: "Ambiguous delimiters; insufficient soundness repetitions",
    mandatoryFix: "Length-prefixed injective encoding + k >= 80–128",
    repoInvariant: "taggedHash vs smashedHash / dollarJoinedHash demos",
    demoInRepo: true,
  },
  {
    id: "nonce-reuse",
    references: "Classical ECDSA HNP",
    affected: "Any ECDSA with repeated ephemeral k",
    extractionEffort: "Immediate full key recovery from 2 signatures",
    rootCause: "Linear equations in k and x",
    mandatoryFix: "CSPRNG nonces; never chain entropy for MPC k",
    repoInvariant: "recoverFromReusedNonce fixture + ENTROPY.md",
    demoInRepo: true,
  },
  {
    id: "cggmp-66016",
    references: "CVE-2025-66016 / RUSTSEC-2025-0129",
    affected: "Older CGGMP21 builds missing Jacobi check",
    extractionEffort: "Malicious signer key recovery class",
    rootCause: "Omitted J(w, N) = -1 in aux keygen proof",
    mandatoryFix: "cggmp24 >= 0.7.0-alpha.2 lineage when engines land",
    repoInvariant: "No cggmp21; deny.toml will ban name when Cargo arrives",
    demoInRepo: false,
  },
  {
    id: "cggmp-66017",
    references: "CVE-2025-66017 / RUSTSEC-2025-0127",
    affected: "Presignatures + raw digest / weak HD derivation misuse",
    extractionEffort: "Forgery against known R; HD security reduction",
    rootCause: "API allows raw prehash + insecure feature flags",
    mandatoryFix: "Type-guards; ban sign_digest MCP; no insecure-assume-preimage-known",
    repoInvariant: "MCP has no sign_digest; hygiene scans feature names",
    demoInRepo: false,
  },
  {
    id: "ops-ai-bypass",
    references: "Multichain, OAuth custody incidents, agent prompt injection",
    affected: "Operational separation and agent tool design",
    extractionEffort: "Varies — often no crypto break required",
    rootCause: "Shared hosts, SSO SPOF, free-form agent tools",
    mandatoryFix: "Independent shares; passkey PRF; linkauth + external policy",
    repoInvariant: "Policy gate + broadcast readiness + no free recipients",
    demoInRepo: false,
  },
];
