import { describe, expect, it } from "vitest";
import { CHAINS } from "./digest.js";
import {
  buildUnsignedHandoff,
  decodeTokenTransferChainId,
  encodeEducationalEsr,
  encodeTokenTransferEsr,
} from "./esr.js";

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
  it("packs a real esr:// for token transfers and locks mainnet push", async () => {
    const h = await buildUnsignedHandoff({
      chainId: CHAINS.waxMainnet,
      actions: [tip],
      summary: "Tip treasury 1 WAX",
      allowMainnetHandoff: true,
    });
    expect(h.kind).toBe("unsigned-human-sign");
    expect(h.broadcastLocked).toBe(true);
    expect(h.esrProtocol).toBe("wharfkit-4.0.2");
    expect(h.esrUri.startsWith("esr://")).toBe(true);
    expect(h.esrUri.startsWith("esr://edu/")).toBe(false);
    expect(await decodeTokenTransferChainId(h.esrUri)).toBe(CHAINS.waxMainnet);
    expect(h.warnings.some((w) => /human must sign/i.test(w))).toBe(true);
  });

  it("refuses empty actions", async () => {
    await expect(
      buildUnsignedHandoff({
        chainId: CHAINS.waxTestnet,
        actions: [],
        summary: "empty",
      }),
    ).rejects.toThrow(/at least one/);
  });

  it("flags updateauth and falls back to educational URI", async () => {
    const h = await buildUnsignedHandoff({
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
    expect(h.esrProtocol).toBe("educational");
    expect(h.esrUri.startsWith("esr://edu/")).toBe(true);
    expect(h.warnings.some((w) => /updateauth/.test(w))).toBe(true);
  });

  it("encodeEducationalEsr is stable", () => {
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

  it("encodeTokenTransferEsr rejects non-transfer", async () => {
    await expect(
      encodeTokenTransferEsr({
        chainId: CHAINS.jungle4,
        actions: [{ ...tip, name: "issue" }],
      }),
    ).rejects.toThrow(/only packs/);
  });
});
