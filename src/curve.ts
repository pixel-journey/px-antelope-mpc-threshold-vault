/**
 * Curve selection policy for Antelope threshold / lab signing.
 *
 * Blueprint: R1 (secp256r1) is the zero-retry optimal path because nodeos
 * enforces low-S only. K1 still needs offline r-filter + online low-S and
 * can burn a presign on the rare leading-zero s case (~0.39% after filter).
 *
 * Keep K1 available for legacy explorers and EVM/Bitcoin derivation.
 */

export type AntelopeCurve = "K1" | "R1";

export interface CurvePolicy {
  /** Prefer for first-attempt online threshold / lab signing. */
  preferredOnline: AntelopeCurve;
  /** Still supported for compatibility. */
  alsoSupported: AntelopeCurve[];
  /** Whether offline r canonical filter is required before enqueue. */
  requiresOfflineRFilter: (curve: AntelopeCurve) => boolean;
  /** Human-readable reason for agents and docs. */
  whyPreferred: string;
}

export const CURVE_POLICY: CurvePolicy = {
  preferredOnline: "R1",
  alsoSupported: ["K1"],
  requiresOfflineRFilter: (curve) => curve === "K1",
  whyPreferred:
    "Antelope R1 validates low-S only, so a correct low-S signature succeeds without the K1 is_canonical r trap. K1 remains for legacy PUB_K1_/SIG_K1_ and cross-ecosystem derivation.",
};

export function recommendCurve(opts?: {
  needLegacyK1Explorers?: boolean;
  needEvmDerivation?: boolean;
}): AntelopeCurve {
  if (opts?.needLegacyK1Explorers || opts?.needEvmDerivation) return "K1";
  return CURVE_POLICY.preferredOnline;
}
