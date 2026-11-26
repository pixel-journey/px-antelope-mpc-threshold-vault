import { describe, expect, it } from "vitest";
import { CHAINS } from "./digest.js";
import { pluginConfig, pluginLogin, pluginSign, WALLET_PLUGIN_ID } from "./walletPlugin.js";

describe("WalletPluginMPC educational stub", () => {
  it("logs in only on lab chains", () => {
    const login = pluginLogin({
      chainId: CHAINS.waxTestnet,
      account: "agent.pxj",
      permission: "active",
    });
    expect(login.pluginId).toBe(WALLET_PLUGIN_ID);
    expect(login.permissionLevel).toBe("agent.pxj@active");
    expect(() =>
      pluginLogin({ chainId: CHAINS.waxMainnet, account: "agent.pxj", permission: "active" }),
    ).toThrow(/lab chain/);
  });

  it("refuses model digests and refuses threshold sign", () => {
    const withDigest = pluginSign({
      chainId: CHAINS.waxTestnet,
      packedTransactionHex: "aabb",
      claimedDigestHex: "00".repeat(32),
    });
    expect(withDigest.ok).toBe(false);
    if (!withDigest.ok) expect(withDigest.reason).toMatch(/digest/);

    const honest = pluginSign({
      chainId: CHAINS.waxTestnet,
      packedTransactionHex: "aabbcc",
    });
    expect(honest.ok).toBe(false);
    if (!honest.ok) expect(honest.reason).toMatch(/does not threshold-sign/);
  });

  it("advertises no prehashed digest acceptance", () => {
    const cfg = pluginConfig();
    expect(cfg.acceptsPrehashedDigest).toBe(false);
    expect(cfg.requiresReviewedEngine).toBe(true);
    expect(cfg.metadata.educationalOnly).toBe(true);
  });
});
