import { createHash } from "node:crypto";

/**
 * Modern Antelope public keys checksum RIPEMD-160(payload || ASCII("K1"|"R1")).
 * The legacy EOS prefix checksums RIPEMD-160(payload) with no type suffix.
 * Compact signatures are 65 bytes [header | r(32) | s(32)] with the same
 * type-suffixed checksum for SIG_K1_ / SIG_R1_.
 *
 * header = 31 + recid (recid in 0..3).
 * After low-S, if s was negated, recid must flip (see canonical.normalizeLowS).
 * This module does not generate keys or sign digests.
 */

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function base58Encode(bytes: Uint8Array): string {
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
  const digits = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let j = 0; j < digits.length; j++) {
      const value = digits[j]! * 256 + carry;
      digits[j] = value % 58;
      carry = Math.floor(value / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  let out = "1".repeat(zeros);
  for (let i = digits.length - 1; i >= 0; i--) out += ALPHABET[digits[i]!]!;
  return out;
}

export function base58Decode(text: string): Uint8Array {
  let zeros = 0;
  while (zeros < text.length && text[zeros] === "1") zeros++;
  const digits = [0];
  for (let i = zeros; i < text.length; i++) {
    const value = ALPHABET.indexOf(text[i]!);
    if (value < 0) throw new Error("invalid base58 character");
    let carry = value;
    for (let j = 0; j < digits.length; j++) {
      const n = digits[j]! * 58 + carry;
      digits[j] = n & 0xff;
      carry = n >> 8;
    }
    while (carry > 0) {
      digits.push(carry & 0xff);
      carry >>= 8;
    }
  }
  const out = new Uint8Array(zeros + digits.length);
  for (let i = 0; i < digits.length; i++) {
    out[out.length - 1 - i] = digits[i]!;
  }
  return out;
}

export function ripemd160(bytes: Uint8Array): Buffer {
  return createHash("ripemd160").update(bytes).digest();
}

export function checksum4(payload: Uint8Array, typeSuffix?: "K1" | "R1"): Buffer {
  const hash = createHash("ripemd160");
  hash.update(payload);
  if (typeSuffix) hash.update(Buffer.from(typeSuffix, "ascii"));
  return hash.digest().subarray(0, 4);
}

export function formatPublicKey(
  compressed33: Uint8Array,
  kind: "K1" | "R1" | "legacy",
): string {
  if (compressed33.length !== 33) {
    throw new Error("compressed public key is 33 bytes");
  }
  if (compressed33[0] !== 0x02 && compressed33[0] !== 0x03) {
    throw new Error("compressed point must start with 0x02 or 0x03");
  }
  if (kind === "legacy") {
    const body = Buffer.concat([compressed33, checksum4(compressed33)]);
    return `EOS${base58Encode(body)}`;
  }
  const body = Buffer.concat([compressed33, checksum4(compressed33, kind)]);
  return `PUB_${kind}_${base58Encode(body)}`;
}

/** header = 31 + recid (recid 0..3). */
export function signatureHeader(recid: number): number {
  if (recid < 0 || recid > 3) throw new Error("recid must be 0..3");
  return 31 + recid;
}

export function packCompactSignature(recid: number, r: Uint8Array, s: Uint8Array): Uint8Array {
  if (r.length !== 32 || s.length !== 32) throw new Error("r and s must be 32 bytes");
  const out = new Uint8Array(65);
  out[0] = signatureHeader(recid);
  out.set(r, 1);
  out.set(s, 33);
  return out;
}

export function formatSignature(sig65: Uint8Array, kind: "K1" | "R1"): string {
  if (sig65.length !== 65) throw new Error("compact signature is 65 bytes");
  const body = Buffer.concat([sig65, checksum4(sig65, kind)]);
  return `SIG_${kind}_${base58Encode(body)}`;
}

export function parseSignature(text: string): { kind: "K1" | "R1"; sig65: Uint8Array; recid: number } {
  const match = /^SIG_(K1|R1)_([1-9A-HJ-NP-Za-km-z]+)$/.exec(text);
  if (!match) throw new Error("expected SIG_K1_ or SIG_R1_");
  const kind = match[1] as "K1" | "R1";
  const body = base58Decode(match[2]!);
  if (body.length !== 69) throw new Error("signature body must be 65 bytes + 4 checksum");
  const sig65 = body.subarray(0, 65);
  const csum = body.subarray(65);
  const expected = checksum4(sig65, kind);
  if (!Buffer.from(csum).equals(expected)) throw new Error("signature checksum mismatch");
  const header = sig65[0]!;
  if (header < 31 || header > 34) throw new Error("header must be 31..34 (recid 0..3)");
  return { kind, sig65: new Uint8Array(sig65), recid: header - 31 };
}

/** Published Vector 1. Checked here. Not a key this course controls. */
export const VECTOR1_POINT = Uint8Array.from(
  Buffer.from(
    "02be7f725859754433991eca4c0af042d6d7ef1cf99605f3d7037623d3839c46d5",
    "hex",
  ),
);

export const VECTOR1_PUB_K1 =
  "PUB_K1_6LPN8xGye86wme4PwqN8TSxAfGTQvqBcN5jGnURJPHyqn3a973";

export const VECTOR1_LEGACY =
  "EOS6LPN8xGye86wme4PwqN8TSxAfGTQvqBcN5jGnURJPHyqnXqNAR";

/** Published Jungle 4 K1 signature from the course vectors (WharfKit recovers PUB_K1_6Rrv…). */
export const VECTOR_JUNGLE_SIG_K1 =
  "SIG_K1_KcgeV43BeK7cuCz4ywZGZGnnE21f7TAJaVfGFVG2KPNtH9yFwphvzbLchycFE4ryXTo1bu2ethLi2iFQR5aHUmjiVrTAM3";

/** Published R1 signature over the Jungle 4 sig_digest. */
export const VECTOR_JUNGLE_SIG_R1 =
  "SIG_R1_KKd9ErxRrbtcksVrCHpF1FefXqC7eo85sU1niggQkThAfYgBt3DSFzcoeFC37sCetJPnMt9PVpfSYWeXJbk9fbNMfoVHCL";
