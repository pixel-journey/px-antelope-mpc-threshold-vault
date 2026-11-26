import { describe, expect, it } from "vitest";
import {
  createEducationalEngine,
  createEngine,
  listEngines,
} from "./threshold.js";

describe("educational threshold flow", () => {
  it("lists roadmap without claiming production engines", () => {
    const rows = listEngines();
    expect(rows.some((e) => e.id === "educational-mock" && e.status === "available")).toBe(
      true,
    );
    expect(rows.some((e) => e.id === "cggmp24" && e.status === "planned-r2")).toBe(true);
  });

  it("runs DKG and presign without assembling a key", async () => {
    const engine = createEducationalEngine();
    expect(engine.productionReady).toBe(false);
    const [a, b, c] = await engine.dkg("K1");
    expect([a.party, b.party, c.party]).toEqual([1, 2, 3]);
    expect(a.token).not.toContain("private");
    const presign = await engine.presign([a, b], "K1");
    expect(presign.rFiltered).toBe(true);
    expect(presign.parties).toEqual([1, 2]);
  });

  it("refuses to sign", async () => {
    const engine = createEducationalEngine();
    const [a, b] = await engine.dkg("R1");
    const presign = await engine.presign([a, b], "R1");
    await expect(engine.sign(presign, new Uint8Array(32))).rejects.toThrow(/does not sign/);
  });

  it("rejects a mixed-curve presign", async () => {
    const engine = createEducationalEngine();
    const [k1] = await engine.dkg("K1");
    const [r1] = await engine.dkg("R1");
    await expect(engine.presign([k1, r1], "K1")).rejects.toThrow(/curve/);
  });

  it("createEngine refuses R.2 ids", () => {
    expect(() => createEngine("dkls23")).toThrow(/R\.2/);
    expect(() => createEngine("cggmp24")).toThrow(/R\.2/);
  });
});
