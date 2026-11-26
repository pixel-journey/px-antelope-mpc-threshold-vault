import { describe, expect, it } from "vitest";
import {
  activeMpcAuthority,
  coldOwnerAuthority,
  hybridCustodyPlan,
  linkAuthPayload,
  updateAuthPayload,
} from "./permissions.js";

const K1_A = "PUB_K1_6LPN8xGye86wme4PwqN8TSxAfGTQvqBcN5jGnURJPHyqn3a973";
const K1_B = "PUB_K1_5AWABL23YzbJad4gNKGYi23Y6uTrxqYoTkSbJdzwenwfjw84eW";
const K1_C = "PUB_K1_6RrvujLQN1x5Tacbep1KAk8zzKpSThAQXBCKYFfGUYeACcSRFs";
const R1 = "PUB_R1_7WVsSeomUhZL8FFHZWTLjBNJPxYuvEjjxuQRAq8hVaq768i8Wa";

describe("hybrid permission shapes", () => {
  it("builds a single-key active MPC authority", () => {
    const auth = activeMpcAuthority(K1_A);
    expect(auth.threshold).toBe(1);
    expect(auth.keys).toHaveLength(1);
    expect(activeMpcAuthority(R1).keys[0]!.key.startsWith("PUB_R1_")).toBe(true);
    expect(() => activeMpcAuthority("EOS6LPN8")).toThrow(/PUB_K1_/);
  });

  it("builds a 2-of-3 cold owner", () => {
    const auth = coldOwnerAuthority([K1_A, K1_B, K1_C]);
    expect(auth.threshold).toBe(2);
    expect(auth.keys).toHaveLength(3);
  });

  it("marks updateauth and linkauth as not executed", () => {
    const update = updateAuthPayload("treasury.pxj", "active", "owner", activeMpcAuthority(K1_A));
    expect(update.executed).toBe(false);
    const link = linkAuthPayload("treasury.pxj", "eosio.token", "transfer", "agent");
    expect(link.executed).toBe(false);
    expect(link.requirement).toBe("agent");
  });

  it("returns a full hybrid plan for agent planning", () => {
    const plan = hybridCustodyPlan("treasury.pxj", K1_A, [K1_A, K1_B, K1_C]);
    expect(plan.owner.auth.threshold).toBe(2);
    expect(plan.active.auth.keys[0]!.key).toBe(K1_A);
    expect(plan.agentLink.code).toBe("eosio.token");
    expect(plan.owner.executed).toBe(false);
  });
});
