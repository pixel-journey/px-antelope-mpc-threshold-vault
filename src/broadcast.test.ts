import { describe, expect, it } from "vitest";
import { CHAINS } from "./digest.js";
import {
  assertBroadcastAllowed,
  evaluateBroadcast,
  evaluatePushReadiness,
  refuseBroadcast,
} from "./broadcast.js";

describe("broadcast lock and push readiness", () => {
  it("allows candidate testnets at the chain layer", () => {
    expect(evaluateBroadcast(CHAINS.waxTestnet).ok).toBe(true);
    expect(evaluateBroadcast(CHAINS.telosTestnet).ok).toBe(true);
  });

  it("locks every mainnet", () => {
    for (const id of [CHAINS.waxMainnet, CHAINS.vaulta, CHAINS.telos]) {
      expect(evaluateBroadcast(id).ok).toBe(false);
      expect(() => assertBroadcastAllowed(id)).toThrow(/mainnet/);
    }
  });

  it("stages curriculum: gate → digest → dry-run → push",
    () => {
      const base = {
        chainId: CHAINS.waxTestnet,
        policyAllowed: false,
        signedAntelopeDigest: false,
        dryRunOk: false,
        operatorOptsIntoPush: false,
        senderImplemented: false,
      };
      expect(evaluatePushReadiness(base).curriculumStage).toBe("learn-gate");
      expect(
        evaluatePushReadiness({ ...base, policyAllowed: true }).curriculumStage,
      ).toBe("learn-digest");
      expect(
        evaluatePushReadiness({
          ...base,
          policyAllowed: true,
          signedAntelopeDigest: true,
        }).curriculumStage,
      ).toBe("learn-dry-run");
      const almost = evaluatePushReadiness({
        ...base,
        policyAllowed: true,
        signedAntelopeDigest: true,
        dryRunOk: true,
        operatorOptsIntoPush: true,
        senderImplemented: false,
      });
      expect(almost.ready).toBe(false);
      expect(almost.blockers).toContain("sender-implemented");
      expect(almost.curriculumStage).toBe("learn-push");

      const ready = evaluatePushReadiness({
        ...base,
        policyAllowed: true,
        signedAntelopeDigest: true,
        dryRunOk: true,
        operatorOptsIntoPush: true,
        senderImplemented: true,
      });
      expect(ready.ready).toBe(true);
    },
  );

  it("refuseBroadcast explains end-stage, does not send", () => {
    expect(() => refuseBroadcast(CHAINS.waxTestnet)).toThrow(/final curriculum stage/);
  });
});
