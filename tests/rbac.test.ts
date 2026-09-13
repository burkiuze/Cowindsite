import { describe, expect, it } from "vitest";
import { ALL_PERMISSIONS, can, effectivePermissions, permissionsFor, type Role } from "@/lib/workspace/rbac";

describe("roles", () => {
  it("gives the owner everything and the viewer almost nothing", () => {
    expect(permissionsFor("owner")).toHaveLength(ALL_PERMISSIONS.length);
    expect(permissionsFor("viewer")).toEqual(["knowledge:read"]);
  });

  it("keeps roles strictly nested", () => {
    const order: Role[] = ["viewer", "member", "manager", "admin", "owner"];
    for (let index = 1; index < order.length; index += 1) {
      const narrower = permissionsFor(order[index - 1]);
      const wider = permissionsFor(order[index]);
      for (const permission of narrower) expect(wider).toContain(permission);
    }
  });

  it("only lets managers and above decide approvals", () => {
    expect(can("member", "approvals:decide")).toBe(false);
    expect(can("manager", "approvals:decide")).toBe(true);
  });
});

describe("agent authority", () => {
  it("never exceeds the person who started the run", () => {
    const granted = ALL_PERMISSIONS;
    const effective = effectivePermissions("member", granted);
    expect(effective).toEqual(permissionsFor("member"));
    expect(effective).not.toContain("approvals:decide");
  });

  it("lets an agent be narrower than its initiator", () => {
    const effective = effectivePermissions("owner", ["knowledge:read"]);
    expect(effective).toEqual(["knowledge:read"]);
  });

  it("drops a grant the initiator does not hold", () => {
    expect(effectivePermissions("viewer", ["integrations:use", "knowledge:read"])).toEqual(["knowledge:read"]);
  });
});
