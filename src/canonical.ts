/**
 * Antelope's K1 signature check, inherited from BitShares/Steem.
 * EOSIO/eos#6699 documents it and asks for its removal. It is still the
 * rule a K1 signature must pass before nodeos will recover a key.
 *
 * A 65-byte compact signature is [header | r(32) | s(32)].
 * Each 32-byte integer passes only when its first byte has the high bit
 * clear, and it does not start with 0x00 followed by a byte below 0x80.
 * R1 does not use this byte check. Issue #6699 says R1 only requires low-S.
 */

export function componentIsCanonical(be: Uint8Array): boolean {
  if (be.length !== 32) {
    throw new Error("component must be 32 bytes");
  }
  const highBit = (be[0]! & 0x80) !== 0;
  const leadingZero = be[0] === 0 && (be[1]! & 0x80) === 0;
  return !highBit && !leadingZero;
}

export function signatureIsCanonicalK1(sig65: Uint8Array): boolean {
  if (sig65.length !== 65) {
    throw new Error("K1 compact signature is 65 bytes");
  }
  return (
    componentIsCanonical(sig65.subarray(1, 33)) &&
    componentIsCanonical(sig65.subarray(33, 65))
  );
}

/**
 * R1 does not use the K1 first-two-byte rule (EOSIO/eos#6699).
 * A compact R1 signature is canonical here when the header is 31..34
 * and s is in 1..n/2. A high bit on r is allowed.
 */
export function signatureIsCanonicalR1(sig65: Uint8Array): boolean {
  if (sig65.length !== 65) {
    throw new Error("R1 compact signature is 65 bytes");
  }
  const header = sig65[0]!;
  if (header < 31 || header > 34) return false;
  const s = BigInt(`0x${Buffer.from(sig65.subarray(33)).toString("hex")}`);
  return s > 0n && s <= SECP256K1_N >> 1n;
}

/**
 * Uniform independent bytes, not integers reduced modulo the curve order.
 * That model is what the published 75.20% rejection figure is counting.
 *
 * One component: 127 full first-bytes, plus the 128 second-bytes that rescue
 * a leading 0x00. 32640 of 65536.
 * Both components: (32640/65536)^2 = 65025/262144 succeed.
 * So 197119/262144 fail, which is 75.202% to three decimals.
 *
 * If r stays uniform and s is only forced to a clear high bit (a stand-in
 * for low-S), success is 65025/131072 = 49.604%.
 * If r was already filtered and s is then low-S checked, the leftover
 * failure is the leading-zero case: 128/32768, so 32640/32768 = 99.609% pass.
 */
export const CANONICAL_COUNTS = {
  oneComponentPass: 32640,
  oneComponentTotal: 65536,
  bothPass: 65025,
  bothTotal: 262144,
  bothFail: 197119,
  lowSStandInPass: 65025,
  lowSStandInTotal: 131072,
  rFilteredOnlinePass: 32640,
  rFilteredOnlineTotal: 32768,
} as const;

export function countCanonicalFirstTwoBytes(): number {
  let pass = 0;
  for (let a = 0; a < 256; a++) {
    for (let b = 0; b < 256; b++) {
      const highBit = (a & 0x80) !== 0;
      const leadingZero = a === 0 && (b & 0x80) === 0;
      if (!highBit && !leadingZero) pass++;
    }
  }
  return pass;
}

const SECP256K1_N = BigInt(
  "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141",
);

/**
 * Negating s sends R to -R, so the recovery id's parity bit must flip.
 * Forgetting `recid ^= 1` makes nodeos recover a different public key.
 * This function does not produce a signature.
 */
export function normalizeLowS(
  s: bigint,
  recid: number,
): { s: bigint; recid: number; flipped: boolean } {
  if (s <= 0n || s >= SECP256K1_N) {
    throw new Error("s must be in 1..n-1");
  }
  if (recid < 0 || recid > 3) {
    throw new Error("recid must be 0..3");
  }
  const half = SECP256K1_N >> 1n;
  if (s > half) {
    return { s: SECP256K1_N - s, recid: recid ^ 1, flipped: true };
  }
  return { s, recid, flipped: false };
}

export { SECP256K1_N };
