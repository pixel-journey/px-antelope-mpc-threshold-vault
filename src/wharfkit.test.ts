import { describe, expect, it } from "vitest";
import {
  Authority,
  Chains,
  Checksum256,
  KeyWeight,
  PublicKey,
  Serializer,
  SessionKit,
  Signature,
  Transaction,
  Bytes,
} from "@wharfkit/session";
import { CHAINS, JUNGLE4_PACKED_TX, JUNGLE4_SIG_DIGEST, JUNGLE4_TX_ID } from "./digest.js";
import { VECTOR1_LEGACY, VECTOR1_PUB_K1 } from "./codec.js";

const PUB_R1 = "PUB_R1_7WVsSeomUhZL8FFHZWTLjBNJPxYuvEjjxuQRAq8hVaq768i8Wa";
const SIG_R1 =
  "SIG_R1_KKd9ErxRrbtcksVrCHpF1FefXqC7eo85sU1niggQkThAfYgBt3DSFzcoeFC37sCetJPnMt9PVpfSYWeXJbk9fbNMfoVHCL";
const SIG_K1_DIGEST =
  "SIG_K1_KZ2Rnnqgmv6soS8ZrUE5EvkQpV2f3BuArCDpbthokgzGJk6j8PmJnk4NSNtN1ANLrL16XgJfEbTgXjvyxwxZYBZyiwMVNh";
const DIGEST_ONLY = "5206a2e62f2e1235dba4e991b830fb3106fa3531015446cafc3817c65a6b73e7";
const PUB_FROM_DIGEST = "PUB_K1_5AWABL23YzbJad4gNKGYi23Y6uTrxqYoTkSbJdzwenwfjw84eW";
const SIG_K1_JUNGLE =
  "SIG_K1_KcgeV43BeK7cuCz4ywZGZGnnE21f7TAJaVfGFVG2KPNtH9yFwphvzbLchycFE4ryXTo1bu2ethLi2iFQR5aHUmjiVrTAM3";
const PUB_FROM_JUNGLE = "PUB_K1_6RrvujLQN1x5Tacbep1KAk8zzKpSThAQXBCKYFfGUYeACcSRFs";

describe("WharfKit 4.0.2 is the Antelope client", () => {
  it("matches the chain ids this course already locked, and publishes the ones the blueprint OCR lost", () => {
    expect(Chains.WAXTestnet.id.toString()).toBe(CHAINS.waxTestnet);
    expect(Chains.Jungle4.id.toString()).toBe(CHAINS.jungle4);
    expect(Chains.WAX.id.toString()).toBe(CHAINS.waxMainnet);
    expect(Chains.Vaulta.id.toString()).toBe(CHAINS.vaulta);
    expect(Chains.EOS.id.toString()).toBe(Chains.Vaulta.id.toString());
    expect(Chains.Telos.id.toString()).toBe(CHAINS.telos);
    expect(Chains.TelosTestnet.id.toString()).toBe(
      "1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f",
    );
    expect(Chains.Proton.id.toString()).toBe(Chains.XPR.id.toString());
    expect(Chains.ProtonTestnet.id.toString()).toBe(Chains.XPRTestnet.id.toString());
    expect(Chains.Proton.id.toString()).toBe(
      "384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0",
    );
  });

  it("round-trips Vector 1 and recovers the published K1 and R1 keys", () => {
    const pub = PublicKey.from(VECTOR1_PUB_K1);
    expect(pub.toString()).toBe(VECTOR1_PUB_K1);
    expect(pub.toLegacyString()).toBe(VECTOR1_LEGACY);

    const fromDigest = Signature.from(SIG_K1_DIGEST).recoverDigest(Checksum256.from(DIGEST_ONLY));
    expect(fromDigest.toString()).toBe(PUB_FROM_DIGEST);

    const packed = Bytes.from(JUNGLE4_PACKED_TX);
    const tx = Serializer.decode({ data: packed, type: Transaction });
    expect(tx.id.toString()).toBe(JUNGLE4_TX_ID);
    expect(tx.signingDigest(Chains.Jungle4.id).toString()).toBe(JUNGLE4_SIG_DIGEST);

    const fromJungle = Signature.from(SIG_K1_JUNGLE).recoverDigest(Checksum256.from(JUNGLE4_SIG_DIGEST));
    expect(fromJungle.toString()).toBe(PUB_FROM_JUNGLE);

    const fromR1 = Signature.from(SIG_R1).recoverDigest(Checksum256.from(JUNGLE4_SIG_DIGEST));
    expect(fromR1.toString()).toBe(PUB_R1);
  });

  it("sorts authority keys before an updateauth body would be packed", () => {
    const authority = Authority.from({ threshold: 1, keys: [], accounts: [], waits: [] });
    authority.keys = [
      KeyWeight.from({ key: PublicKey.from(PUB_FROM_JUNGLE), weight: 1 }),
      KeyWeight.from({ key: PublicKey.from(VECTOR1_PUB_K1), weight: 1 }),
    ];
    authority.sort();
    expect(authority.keys.map((key) => key.key.toString())).toEqual([
      VECTOR1_PUB_K1,
      PUB_FROM_JUNGLE,
    ]);
  });

  it("builds a SessionKit aimed only at the two lab chains and does not log in", () => {
    const kit = new SessionKit({
      appName: "px-antelope-mpc-threshold-vault",
      chains: [Chains.WAXTestnet, Chains.Jungle4],
      walletPlugins: [],
    });
    expect(kit.chains.map((chain) => chain.id.toString())).toEqual([
      CHAINS.waxTestnet,
      CHAINS.jungle4,
    ]);
    expect(kit.walletPlugins).toEqual([]);
  });
});
