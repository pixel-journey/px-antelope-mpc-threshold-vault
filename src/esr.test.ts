import { describe, expect, it } from "vitest";
import { CHAINS } from "./digest.js";
import { buildUnsignedHandoff, encodeEducationalEsr } from "./esr.js";

const tip = {
  account: "eosio.token",
  name: "transfer",
  authorization: [{ actor: "human.wam", permission: "active" }],
  data: {
    from: "human.wam",
    to: "treasury.pxj",
    quantity: "1.00000000 WAX",
    memo: "human-sign",
  },
};

describe("unsigned ESR handoff", () => {
  it("builds a mainnet handoff without claiming agent push", () => {
    const h = buildUnsignedHandoff({
      chainId: CHAINS.waxMainnet,
      actions: [tip],
      summary: "Tip treasury 1 WAX",
      allowMainnetHandoff: true,
    });
    expect(h.kind).toBe("unsigned-human-sign");
    expect(h.broadcastLocked).toBe(true);
    expect(h.esrUri.startsWith("esr://edu/")).toBe(true);
    expect(h.warnings.some((w) => /human must sign/i.test(w))).toBe(true);
  });

  it("refuses empty actions", () => {
    expect(() =>
      buildUnsignedHandoff({
        chainId: CHAINS.waxTestnet,
        actions: [],
        summary: "empty",
      }),
    ).toThrow(/at least one/);
  });

  it("flags updateauth for human review", () => {
    const h = buildUnsignedHandoff({
      chainId: CHAINS.waxTestnet,
      actions: [
        {
          account: "eosio",
          name: "updateauth",
          authorization: [{ actor: "human.wam", permission: "owner" }],
          data: { account: "human.wam" },
        },
      ],
      summary: "Rotate active",
    });
    expect(h.warnings.some((w) => /updateauth/.test(w))).toBe(true);
  });

  it("encodeEducationalEsr is stable for same payload shape", () => {
    const a = encodeEducationalEsr({
      chainId: CHAINS.jungle4,
      actions: [tip],
      summary: "x",
    });
    const b = encodeEducationalEsr({
      chainId: CHAINS.jungle4,
      actions: [tip],
      summary: "x",
    });
    expect(a).toBe(b);
  });
});
