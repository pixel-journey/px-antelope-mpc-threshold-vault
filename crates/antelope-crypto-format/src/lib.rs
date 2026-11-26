//! Antelope signature *format* helpers for educational parity with the TypeScript course.
//!
//! No threshold signing. No network. `#![no_std]` + `alloc` ready shape via `sha2`.

#![no_std]

extern crate alloc;

use sha2::{Digest, Sha256};

/// secp256k1 curve order n (for low-S education).
pub const SECP256K1_N_BE: [u8; 32] = [
    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFE,
    0xBA, 0xAE, 0xDC, 0xE6, 0xAF, 0x48, 0xA0, 0x3B, 0xBF, 0xD2, 0x5E, 0x8C, 0xD0, 0x36, 0x41, 0x41,
];

/// Uniform-byte model counts locked with TypeScript `CANONICAL_COUNTS`.
pub mod counts {
    pub const ONE_COMPONENT_PASS: u32 = 32640;
    pub const ONE_COMPONENT_TOTAL: u32 = 65536;
    pub const BOTH_PASS: u32 = 65025;
    pub const BOTH_TOTAL: u32 = 262144;
    pub const BOTH_FAIL: u32 = 197119;
}

/// BitShares/Steem-derived K1 component check (EOSIO/eos#6699).
pub fn component_is_canonical(be32: &[u8]) -> bool {
    assert_eq!(be32.len(), 32, "component must be 32 bytes");
    let high_bit = (be32[0] & 0x80) != 0;
    let leading_zero = be32[0] == 0 && (be32[1] & 0x80) == 0;
    !high_bit && !leading_zero
}

/// 65-byte compact K1: header | r(32) | s(32).
pub fn signature_is_canonical_k1(sig65: &[u8]) -> bool {
    assert_eq!(sig65.len(), 65, "K1 compact signature is 65 bytes");
    component_is_canonical(&sig65[1..33]) && component_is_canonical(&sig65[33..65])
}

/// Count first-two-byte pairs that pass the component rule (must be 32640).
pub fn count_canonical_first_two_bytes() -> u32 {
    let mut pass = 0u32;
    for a in 0u16..256 {
        for b in 0u16..256 {
            let high_bit = (a as u8 & 0x80) != 0;
            let leading_zero = a == 0 && (b as u8 & 0x80) == 0;
            if !high_bit && !leading_zero {
                pass += 1;
            }
        }
    }
    pass
}

/// Antelope signing digest: SHA-256(chain_id || packed_tx || cfd_hash).
/// `cfd_hash` defaults to 32 zero bytes when omitted.
pub fn sig_digest(chain_id: &[u8; 32], packed_tx: &[u8], cfd_hash: Option<&[u8; 32]>) -> [u8; 32] {
    let cfd = cfd_hash.unwrap_or(&[0u8; 32]);
    let mut hasher = Sha256::new();
    hasher.update(chain_id);
    hasher.update(packed_tx);
    hasher.update(cfd);
    let out = hasher.finalize();
    let mut arr = [0u8; 32];
    arr.copy_from_slice(&out);
    arr
}

/// Transaction id: SHA-256(packed_tx) only.
pub fn tx_id(packed_tx: &[u8]) -> [u8; 32] {
    let out = Sha256::digest(packed_tx);
    let mut arr = [0u8; 32];
    arr.copy_from_slice(&out);
    arr
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn canonical_count_matches_ts() {
        assert_eq!(count_canonical_first_two_bytes(), counts::ONE_COMPONENT_PASS);
        assert_eq!(
            counts::BOTH_PASS,
            counts::ONE_COMPONENT_PASS * counts::ONE_COMPONENT_PASS / counts::ONE_COMPONENT_TOTAL
                * counts::ONE_COMPONENT_PASS
                / counts::ONE_COMPONENT_TOTAL
                + 0
        );
        // Exact locked ratio:
        assert_eq!(
            (counts::ONE_COMPONENT_PASS as u64).pow(2),
            counts::BOTH_PASS as u64
        );
        assert_eq!(
            (counts::ONE_COMPONENT_TOTAL as u64).pow(2),
            counts::BOTH_TOTAL as u64
        );
        assert_eq!(counts::BOTH_FAIL, counts::BOTH_TOTAL - counts::BOTH_PASS);
    }

    #[test]
    fn rejects_high_bit_r() {
        let mut sig = [0u8; 65];
        sig[1] = 0x80;
        assert!(!signature_is_canonical_k1(&sig));
    }

    #[test]
    fn jungle4_digest_vector() {
        // Same constants as src/digest.ts
        let chain = hex::decode("73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d")
            .unwrap();
        let mut chain_id = [0u8; 32];
        chain_id.copy_from_slice(&chain);

        let packed = hex::decode(
            "e00300007b00c8010000000000000100a6823403ea3055000000572d3ccdcd01000000000000285d00000000a8ed3232280000000000855c340000000000000e3da40100000000000001474d5a0000000007666f7220796f7500",
        )
        .unwrap();

        let expect_digest =
            hex::decode("c0a70da4105f0f3a282d262be419724062fc829baaff1516baa173f1f6eee8a3")
                .unwrap();
        let expect_txid =
            hex::decode("6eac401c92c7e6b52af282c0811b0094ede33d81b982221ca85f9ff835a655ba")
                .unwrap();

        let d = sig_digest(&chain_id, &packed, None);
        assert_eq!(d.as_slice(), expect_digest.as_slice());
        let tid = tx_id(&packed);
        assert_eq!(tid.as_slice(), expect_txid.as_slice());
    }
}
