//! Antelope signature *format* helpers for educational parity with the TypeScript course.
//!
//! No threshold signing. No network.

#![no_std]

extern crate alloc;

use alloc::string::String;
use alloc::vec::Vec;
use ripemd::Ripemd160;
use sha2::{Digest, Sha256};

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

const B58: &[u8] = b"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

fn ripemd160(data: &[u8]) -> [u8; 20] {
    let out = Ripemd160::digest(data);
    let mut arr = [0u8; 20];
    arr.copy_from_slice(&out);
    arr
}

/// First 4 bytes of RIPEMD-160(payload || optional ASCII type suffix).
pub fn checksum4(payload: &[u8], type_suffix: Option<&[u8]>) -> [u8; 4] {
    let mut buf = Vec::with_capacity(payload.len() + 2);
    buf.extend_from_slice(payload);
    if let Some(suffix) = type_suffix {
        buf.extend_from_slice(suffix);
    }
    let hash = ripemd160(&buf);
    let mut out = [0u8; 4];
    out.copy_from_slice(&hash[..4]);
    out
}

fn base58_encode(bytes: &[u8]) -> String {
    let mut zeros = 0usize;
    while zeros < bytes.len() && bytes[zeros] == 0 {
        zeros += 1;
    }
    let mut digits = alloc::vec![0u8];
    for &byte in bytes {
        let mut carry = byte as u32;
        for digit in digits.iter_mut() {
            let value = (*digit as u32) * 256 + carry;
            *digit = (value % 58) as u8;
            carry = value / 58;
        }
        while carry > 0 {
            digits.push((carry % 58) as u8);
            carry /= 58;
        }
    }
    let mut out = String::new();
    out.extend(core::iter::repeat_n('1', zeros));
    for digit in digits.iter().rev() {
        out.push(B58[*digit as usize] as char);
    }
    out
}

fn base58_decode(text: &str) -> Result<Vec<u8>, &'static str> {
    let bytes = text.as_bytes();
    let mut zeros = 0usize;
    while zeros < bytes.len() && bytes[zeros] == b'1' {
        zeros += 1;
    }
    let mut digits = alloc::vec![0u8];
    for &ch in &bytes[zeros..] {
        let value = match B58.iter().position(|&c| c == ch) {
            Some(v) => v as u32,
            None => return Err("invalid base58 character"),
        };
        let mut carry = value;
        for digit in digits.iter_mut() {
            let n = (*digit as u32) * 58 + carry;
            *digit = (n & 0xff) as u8;
            carry = n >> 8;
        }
        while carry > 0 {
            digits.push((carry & 0xff) as u8);
            carry >>= 8;
        }
    }
    let mut decoded = Vec::with_capacity(zeros + digits.len());
    decoded.extend(core::iter::repeat_n(0u8, zeros));
    for digit in digits.iter().rev() {
        decoded.push(*digit);
    }
    Ok(decoded)
}

/// `PUB_K1_`, `PUB_R1_`, or legacy `EOS` from a 33-byte compressed point.
/// Does not generate a key.
pub fn format_public_key(compressed33: &[u8], kind: &str) -> String {
    assert_eq!(compressed33.len(), 33, "compressed public key is 33 bytes");
    assert!(
        compressed33[0] == 0x02 || compressed33[0] == 0x03,
        "compressed point must start with 0x02 or 0x03"
    );
    let (prefix, suffix): (&str, Option<&[u8]>) = match kind {
        "legacy" => ("EOS", None),
        "K1" => ("PUB_K1_", Some(b"K1")),
        "R1" => ("PUB_R1_", Some(b"R1")),
        _ => panic!("kind must be K1, R1, or legacy"),
    };
    let csum = checksum4(compressed33, suffix);
    let mut body = Vec::with_capacity(37);
    body.extend_from_slice(compressed33);
    body.extend_from_slice(&csum);
    let mut out = String::from(prefix);
    out.push_str(&base58_encode(&body));
    out
}

/// `SIG_K1_` or `SIG_R1_` from a 65-byte compact signature.
/// Checksum is RIPEMD-160(sig || ASCII("K1"|"R1")), first 4 bytes.
pub fn format_signature(sig65: &[u8], kind: &str) -> String {
    assert_eq!(sig65.len(), 65, "compact signature is 65 bytes");
    let suffix: &[u8] = match kind {
        "K1" => b"K1",
        "R1" => b"R1",
        _ => panic!("kind must be K1 or R1"),
    };
    let csum = checksum4(sig65, Some(suffix));
    let mut body = Vec::with_capacity(69);
    body.extend_from_slice(sig65);
    body.extend_from_slice(&csum);
    let mut encoded = String::from("SIG_");
    encoded.push_str(kind);
    encoded.push('_');
    encoded.push_str(&base58_encode(&body));
    encoded
}

/// Parsed `SIG_K1_` / `SIG_R1_`. Does not recover a public key.
pub struct ParsedSignature {
    pub kind: &'static str,
    pub sig65: [u8; 65],
    pub recid: u8,
}

pub fn parse_signature(text: &str) -> Result<ParsedSignature, &'static str> {
    let (kind, rest) = if let Some(rest) = text.strip_prefix("SIG_K1_") {
        ("K1", rest)
    } else if let Some(rest) = text.strip_prefix("SIG_R1_") {
        ("R1", rest)
    } else {
        return Err("expected SIG_K1_ or SIG_R1_");
    };
    let body = base58_decode(rest)?;
    if body.len() != 69 {
        return Err("signature body must be 65 bytes + 4 checksum");
    }
    let mut sig65 = [0u8; 65];
    sig65.copy_from_slice(&body[..65]);
    let suffix: &[u8] = if kind == "K1" { b"K1" } else { b"R1" };
    let expected = checksum4(&sig65, Some(suffix));
    if body[65..] != expected {
        return Err("signature checksum mismatch");
    }
    let header = sig65[0];
    if !(31..=34).contains(&header) {
        return Err("header must be 31..34 (recid 0..3)");
    }
    Ok(ParsedSignature {
        kind,
        sig65,
        recid: header - 31,
    })
}

/// secp256k1 order / 2. An `s` above this must be replaced with `n - s` and `recid ^= 1`.
const HALF_N: [u8; 32] = [
    0x7f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0x5d, 0x57, 0x6e, 0x73, 0x57, 0xa4, 0x50, 0x1d, 0xdf, 0xe9, 0x2f, 0x46, 0x68, 0x1b, 0x20, 0xa0,
];

const N: [u8; 32] = [
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xfe,
    0xba, 0xae, 0xdc, 0xe6, 0xaf, 0x48, 0xa0, 0x3b, 0xbf, 0xd2, 0x5e, 0x8c, 0xd0, 0x36, 0x41, 0x41,
];

/// If `s > n/2`, return `n - s` and flip the low bit of `recid`.
pub fn normalize_low_s(s: [u8; 32], recid: u8) -> ([u8; 32], u8, bool) {
    assert!(recid <= 3, "recid must be 0..3");
    if s.as_slice() <= HALF_N.as_slice() {
        return (s, recid, false);
    }
    let mut out = [0u8; 32];
    let mut borrow = 0i16;
    for i in (0..32).rev() {
        let mut value = N[i] as i16 - s[i] as i16 - borrow;
        if value < 0 {
            value += 256;
            borrow = 1;
        } else {
            borrow = 0;
        }
        out[i] = value as u8;
    }
    (out, recid ^ 1, true)
}

/// R1 skips the K1 first-two-byte rule (EOSIO/eos#6699).
/// Canonical here means header 31..=34 and `s` in `1..=n/2`.
pub fn signature_is_canonical_r1(sig65: &[u8]) -> bool {
    if sig65.len() != 65 {
        return false;
    }
    let header = sig65[0];
    if !(31..=34).contains(&header) {
        return false;
    }
    let s = &sig65[33..65];
    let zero = [0u8; 32];
    s > zero.as_slice() && s <= HALF_N.as_slice()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn canonical_count_matches_ts() {
        assert_eq!(count_canonical_first_two_bytes(), counts::ONE_COMPONENT_PASS);
        assert_eq!(counts::BOTH_FAIL, counts::BOTH_TOTAL - counts::BOTH_PASS);
        // (32640/65536)^2 * 262144 == 65025
        let pass = counts::ONE_COMPONENT_PASS as u64;
        let total = counts::ONE_COMPONENT_TOTAL as u64;
        let both_total = counts::BOTH_TOTAL as u64;
        assert_eq!(pass * pass * both_total / (total * total), counts::BOTH_PASS as u64);
    }

    #[test]
    fn rejects_high_bit_r() {
        let mut sig = [0u8; 65];
        sig[1] = 0x80;
        assert!(!signature_is_canonical_k1(&sig));
    }

    #[test]
    fn jungle4_digest_vector() {
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

    #[test]
    fn vector1_pub_matches_typescript() {
        let point = hex::decode("02be7f725859754433991eca4c0af042d6d7ef1cf99605f3d7037623d3839c46d5")
            .unwrap();
        assert_eq!(
            format_public_key(&point, "K1"),
            "PUB_K1_6LPN8xGye86wme4PwqN8TSxAfGTQvqBcN5jGnURJPHyqn3a973"
        );
        assert_eq!(
            format_public_key(&point, "legacy"),
            "EOS6LPN8xGye86wme4PwqN8TSxAfGTQvqBcN5jGnURJPHyqnXqNAR"
        );
    }

    #[test]
    fn low_s_flips_recid() {
        let mut high = N;
        high[31] = high[31].wrapping_sub(1);
        let (s, recid, flipped) = normalize_low_s(high, 0);
        assert!(flipped);
        assert_eq!(recid, 1);
        assert_eq!(s[31], 1);
        assert!(s[..31].iter().all(|b| *b == 0));
        let (again, recid2, flipped2) = normalize_low_s(s, recid);
        assert!(!flipped2);
        assert_eq!(recid2, 1);
        assert_eq!(again, s);
    }

    fn load_vectors() -> serde_json::Value {
        serde_json::from_str(include_str!("../../../testdata/vectors.json")).unwrap()
    }

    #[test]
    fn vector1_formats_match_shared_json() {
        let v = load_vectors();
        let point = hex::decode(v["vector1"]["compressed"].as_str().unwrap()).unwrap();
        assert_eq!(format_public_key(&point, "K1"), v["vector1"]["pubK1"].as_str().unwrap());
        assert_eq!(format_public_key(&point, "R1"), v["vector1"]["pubR1"].as_str().unwrap());
        assert_eq!(
            format_public_key(&point, "legacy"),
            v["vector1"]["legacyEos"].as_str().unwrap()
        );
    }

    #[test]
    fn signature_strings_round_trip_vectors_2_to_4() {
        let v = load_vectors();
        for key in ["vector2", "vector3"] {
            let text = v[key]["sigK1"].as_str().unwrap();
            let parsed = parse_signature(text).unwrap();
            assert_eq!(parsed.kind, "K1");
            assert_eq!(format_signature(&parsed.sig65, "K1"), text);
        }
        let r1 = v["vector4"]["sigR1"].as_str().unwrap();
        let parsed = parse_signature(r1).unwrap();
        assert_eq!(parsed.kind, "R1");
        assert_eq!(parsed.recid, 0);
        assert_eq!(format_signature(&parsed.sig65, "R1"), r1);
    }

    #[test]
    fn r1_skips_k1_byte_check_but_requires_low_s() {
        let mut sig = [0u8; 65];
        sig[0] = 31;
        sig[1] = 0x80;
        sig[33] = 0x01;
        assert!(!signature_is_canonical_k1(&sig));
        assert!(signature_is_canonical_r1(&sig));
        sig[33] = 0xff;
        assert!(!signature_is_canonical_r1(&sig));
    }
}
