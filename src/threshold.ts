/**
 * Educational threshold-signature flow.
 *
 * This file shows the shape of a 2-of-3 threshold ECDSA ceremony:
 * key generation, offline presign, and online sign.
 *
 * It does not implement DKLs23, CGGMP24, or any other real protocol.
 * It does not produce a signature that a node will accept.
 * It does not assemble a private key at any step.
 *
 * A later lab can replace the mock engine with a reviewed WASM build
 * of an MIT/Apache engine. The interface stays the same.
 */

export type Curve = "K1" | "R1";

export interface Share {
  readonly party: 1 | 2 | 3;
  readonly curve: Curve;
  /** Opaque token. Not a scalar. Not a key. */
  readonly token: string;
}

export interface Presignature {
  readonly id: string;
  readonly curve: Curve;
  readonly parties: readonly [1 | 2 | 3, 1 | 2 | 3];
  /** True when the offline r-filter has already rejected non-canonical r. */
  readonly rFiltered: boolean;
}

export interface ThresholdEngine {
  readonly name: string;
  dkg(curve: Curve): Promise<[Share, Share, Share]>;
  presign(shares: [Share, Share], curve: Curve): Promise<Presignature>;
  sign(presign: Presignature, digest: Uint8Array): Promise<never>;
}

class EducationalEngine implements ThresholdEngine {
  readonly name = "educational-mock";

  async dkg(curve: Curve): Promise<[Share, Share, Share]> {
    const token = (party: 1 | 2 | 3) =>
      `share-${curve}-party-${party}-${crypto.randomUUID()}`;
    return [
      { party: 1, curve, token: token(1) },
      { party: 2, curve, token: token(2) },
      { party: 3, curve, token: token(3) },
    ];
  }

  async presign(shares: [Share, Share], curve: Curve): Promise<Presignature> {
    if (shares[0].curve !== curve || shares[1].curve !== curve) {
      throw new Error("share curve does not match ceremony");
    }
    if (shares[0].party === shares[1].party) {
      throw new Error("need two distinct parties");
    }
    return {
      id: crypto.randomUUID(),
      curve,
      parties: [shares[0].party, shares[1].party],
      rFiltered: curve === "K1",
    };
  }

  async sign(_presign: Presignature, _digest: Uint8Array): Promise<never> {
    throw new Error(
      "educational engine does not sign. Replace it with a reviewed WASM build before any testnet broadcast.",
    );
  }
}

export function createEducationalEngine(): ThresholdEngine {
  return new EducationalEngine();
}
