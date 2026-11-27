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
    extractionEffort: "Full key recovery from one valid signature",
    rootCause: "Small Paillier modulus / MtA range-proof gap destroys hiding",
    mandatoryFix: "N >= q^8; MtA range proofs (prover q^2, verifier q^3); EC-point binding in MtAwc",
    repoInvariant: "No Paillier engine in-tree; license/feature hygiene rejects insecure flags",
    demoInRepo: false,
  },
  {
    id: "bitforge-gg",
    references: "CVE-2023-33241",
    affected: "GG18/20 wallets with smooth Paillier moduli",
    extractionEffort: "Full key recovery in about 16 signatures",
    rootCause: "Smooth Paillier modulus with about 2^16 prime factors opens CRT channels",
    mandatoryFix: "Paillier-Blum modulus proof and no-small-factors (primes > 2^256) before any MtA",
    repoInvariant: "No GG18 runtime; documented only",
    demoInRepo: false,
  },
  {
    id: "bitforge-lindell",
    references: "CVE-2023-33242",
    affected: "Non-compliant Lindell17 abort handling",
    extractionEffort: "About 1 bit per failed signature",
    rootCause: "Abort paths not paper-compliant",
    mandatoryFix: "Exact abort semantics; prefer modern multi-party stacks",
    repoInvariant: "No Lindell17 dependency",
    demoInRepo: false,
  },
  {
    id: "tssshock-transcript",
    references: "CVE-2022-47931 / CVE-2023-26556",
    affected: "Weak Fiat-Shamir transcript framing; weak DLN parameters",
    extractionEffort: "Delimiter collision; DLN k=1 is about a 50% cheat rate",
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
    repoInvariant: "deny.toml bans the crate name cggmp21",
    demoInRepo: false,
  },
  {
    id: "cggmp-66017",
    references: "CVE-2025-66017 / RUSTSEC-2025-0127",
    affected: "Presignatures + raw digest / weak HD derivation misuse",
    extractionEffort: "Forgery against a known R; BIP-32 misuse drops ~128-bit security to ~85 bits",
    rootCause: "API allows raw prehash + insecure feature flags",
    mandatoryFix: "Type-guards; ban sign_digest MCP; no insecure-assume-preimage-known",
    repoInvariant: "MCP has no sign_digest; hygiene scans feature names",
    demoInRepo: false,
  },
  {
    id: "ops-ai-bypass",
    references: "Multichain; Web3Auth/Keplr (reported Nov 2026); Freysa; AIXBT; TDX interposer",
    affected: "Operational separation and agent tool design",
    extractionEffort: "Often no cryptographic break — reported losses are third-party figures, not re-audited here",
    rootCause: "Zero share separation, third-party OAuth as a single custody point, prompt injection, forged TEE attestation",
    mandatoryFix: "Independent share custody; passkey PRF (no SSO custody); external policy + L1 linkauth; TEE counts as one share below t",
    repoInvariant: "Policy gate + broadcast readiness + no free recipients",
    demoInRepo: false,
  },
  {
    id: "safe-prime-dln",
    references: "KS-BTL-F-03",
    affected: "DLN and Pedersen groups built from generic RSA primes",
    extractionEffort: "Pohlig–Hellman once the group order is smooth",
    rootCause: "Generic RSA primes can leave a smooth subgroup order",
    mandatoryFix: "Safe primes only (p = 2q + 1) for those groups",
    repoInvariant: "No Paillier or DLN implementation in this tree",
    demoInRepo: false,
  },
  {
    id: "audit-pq-2026",
    references: "Cure53 CBS-02-004; Trail of Bits Bron review Oct 2026; Niot ia.cr/2026/1386",
    affected: "ECC refresh, Lindell17 DKG operand order, TALUS v1 lattice commitments",
    extractionEffort: "Subgroup skip, panic on peer bytes, key recovery on TALUS v1",
    rootCause:
      "Missing prime-order checks; swapped DKG operands; non-hiding commitments and a noisy residual",
    mandatoryFix:
      "Check subgroup membership, attribute peer errors instead of panicking, and cap signature counts on lattice threshold schemes",
    repoInvariant: "No Lindell17 or post-quantum engine in-tree; see POST-QUANTUM.md",
    demoInRepo: false,
  },
];
