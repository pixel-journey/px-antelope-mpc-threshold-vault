import { createHash } from "node:crypto";

/**
 * Modern Antelope public keys checksum RIPEMD-160(payload || ASCII("K1"|"R1")).
 * The legacy EOS prefix checksums RIPEMD-160(payload) with no type suffix.
 * The suffix is not part of the Base58 body. This module checks that layout.
 * It does not generate keys.
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
