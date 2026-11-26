/**
 * Educational threshold-signature flow and engine registry.
 *
 * Phase R.2 will plug real MIT/Apache WASM engines behind `ThresholdEngine`.
 * Until then only `educational-mock` is constructible. `sign` always throws.
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
  readonly productionReady: false;
  dkg(curve: Curve): Promise<[Share, Share, Share]>;
  presign(shares: [Share, Share], curve: Curve): Promise<Presignature>;
  sign(presign: Presignature, digest: Uint8Array): Promise<never>;
}

/** Engines named for R.2 — not importable in this package. */
export const ENGINE_ROADMAP = [
  {
    id: "educational-mock",
    status: "available" as const,
    license: "MIT",
    notes: "Tokens only; sign() throws",
  },
  {
    id: "dkls23",
    status: "planned-r2" as const,
    license: "MIT/Apache-2.0 (0xCarbon lineage)",
    notes: "Unaudited for mainnet; testnet banner required",
  },
  {
    id: "cggmp24",
    status: "planned-r2" as const,
    license: "MIT/Apache-2.0 (Lockness ≥ 0.7.0-alpha.2)",
    notes: "Prefer over cggmp21; deny.toml blocks cggmp21",
  },
] as const;

export type EngineId = (typeof ENGINE_ROADMAP)[number]["id"];

class EducationalEngine implements ThresholdEngine {
  readonly name = "educational-mock";
  readonly productionReady = false as const;

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
      "educational engine does not sign. Phase R.2: replace with reviewed WASM under testnet policy before any push.",
    );
  }
}

export function createEducationalEngine(): ThresholdEngine {
  return new EducationalEngine();
}

/** Only the mock is available until R.2 crates land. */
export function createEngine(id: EngineId = "educational-mock"): ThresholdEngine {
  if (id === "educational-mock") return createEducationalEngine();
  throw new Error(
    `engine "${id}" is Phase R.2 — not in this package. See ENGINE_ROADMAP and docs/RUST.md.`,
  );
}

export function listEngines() {
  return ENGINE_ROADMAP.map((e) => ({ ...e }));
}
