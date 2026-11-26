import { createHash } from "node:crypto";

/**
 * Antelope signing digest, not the transaction id.
 *
 * sig_digest = SHA-256(chain_id || packed_transaction || cfd_hash)
 * tx_id      = SHA-256(packed_transaction)
 *
 * cfd_hash is 32 zero bytes when the transaction has no context-free data.
 * A co-signer that trusts a digest someone else already hashed cannot see
 * the actions. This course does not pack transactions and does not sign.
 */

export const CHAINS = {
  waxTestnet: "f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12",
  jungle4: "73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d",
  waxMainnet: "1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4",
  vaulta: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
  telos: "4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11",
} as const;

export const LAB_CHAIN_IDS = [CHAINS.waxTestnet, CHAINS.jungle4] as const;

/** Packed Jungle 4 transaction from the course notes. Not broadcast by this repo. */
export const JUNGLE4_PACKED_TX =
  "e00300007b00c8010000000000000100a6823403ea3055000000572d3ccdcd01000000000000285d00000000a8ed3232280000000000855c340000000000000e3da40100000000000001474d5a0000000007666f7220796f7500";

export const JUNGLE4_TX_ID =
  "6eac401c92c7e6b52af282c0811b0094ede33d81b982221ca85f9ff835a655ba";

export const JUNGLE4_SIG_DIGEST =
  "c0a70da4105f0f3a282d262be419724062fc829baaff1516baa173f1f6eee8a3";

function sha256(bytes: Uint8Array): Buffer {
  return createHash("sha256").update(bytes).digest();
}

export function txId(packedTransaction: Uint8Array): string {
  return sha256(packedTransaction).toString("hex");
}

export function sigDigest(
  chainIdHex: string,
  packedTransaction: Uint8Array,
  cfdHash?: Uint8Array,
): string {
  if (!/^[0-9a-f]{64}$/.test(chainIdHex)) {
    throw new Error("chain id must be 32 bytes of hex");
  }
  const cfd = cfdHash ?? new Uint8Array(32);
  if (cfd.length !== 32) {
    throw new Error("context-free data hash must be 32 bytes");
  }
  const chain = Buffer.from(chainIdHex, "hex");
  return sha256(Buffer.concat([chain, packedTransaction, cfd])).toString("hex");
}
