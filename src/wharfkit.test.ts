import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
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

const vectors = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../testdata/vectors.json"), "utf8"),
) as {
  vector1: { pubK1: string; legacyEos: string };
  vector2: { digest: string; sigK1: string; recoveredPubK1: string };
  vector3: { sigK1: string; recoveredPubK1: string };
  vector4: { sigR1: string; recoveredPubR1: string };
};

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
    expect(pub.toString()).toBe(vectors.vector1.pubK1);
    expect(pub.toLegacyString()).toBe(VECTOR1_LEGACY);
    expect(pub.toLegacyString()).toBe(vectors.vector1.legacyEos);

    const fromDigest = Signature.from(vectors.vector2.sigK1).recoverDigest(
      Checksum256.from(vectors.vector2.digest),
    );
    expect(fromDigest.toString()).toBe(vectors.vector2.recoveredPubK1);

    const packed = Bytes.from(JUNGLE4_PACKED_TX);
    const tx = Serializer.decode({ data: packed, type: Transaction });
    expect(tx.id.toString()).toBe(JUNGLE4_TX_ID);
    expect(tx.signingDigest(Chains.Jungle4.id).toString()).toBe(JUNGLE4_SIG_DIGEST);

    const fromJungle = Signature.from(vectors.vector3.sigK1).recoverDigest(
      Checksum256.from(JUNGLE4_SIG_DIGEST),
    );
    expect(fromJungle.toString()).toBe(vectors.vector3.recoveredPubK1);

    const fromR1 = Signature.from(vectors.vector4.sigR1).recoverDigest(
      Checksum256.from(JUNGLE4_SIG_DIGEST),
    );
    expect(fromR1.toString()).toBe(vectors.vector4.recoveredPubR1);
  });

  it("sorts authority keys before an updateauth body would be packed", () => {
    const authority = Authority.from({ threshold: 1, keys: [], accounts: [], waits: [] });
    authority.keys = [
      KeyWeight.from({ key: PublicKey.from(vectors.vector3.recoveredPubK1), weight: 1 }),
      KeyWeight.from({ key: PublicKey.from(VECTOR1_PUB_K1), weight: 1 }),
    ];
    authority.sort();
    expect(authority.keys.map((key) => key.key.toString())).toEqual([
      VECTOR1_PUB_K1,
      vectors.vector3.recoveredPubK1,
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
