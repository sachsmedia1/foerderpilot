/**
 * FOERDERPILOT - PARTICIPANTS ROUTER TESTS
 */

import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;
type Tenant = NonNullable<TrpcContext["tenant"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const tenant: Tenant = {
    id: 1,
    subdomain: "test",
    customDomain: null,
    name: "Test Bildungsträger",
    logoUrl: null,
    primaryColor: "#000000",
    secondaryColor: "#FFFFFF",
    contactEmail: "test@example.com",
    contactPhone: null,
    impressumHtml: null,
    privacyPolicyUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const user: AuthenticatedUser = {
    id: 1,
    tenantId: 1,
    openId: "test-admin",
    email: "admin@test.com",
    name: "Test Admin",
    firstName: "Test",
    lastName: "Admin",
    phone: null,
    loginMethod: "manus",
    role: "admin",
    isActive: true,
    lastSignedIn: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    tenant,
    isSuperAdminRoute: false,
    isMaintenanceMode: false,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("participants router", () => {
  it("should list participants for tenant", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.participants.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter participants by status", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.participants.list({
      status: "registered",
    });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((p) => {
      expect(p.status).toBe("registered");
    });
  });

  it("should get participant statistics", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.participants.getStats();

    expect(stats).toHaveProperty("total");
    expect(stats).toHaveProperty("registered");
    expect(stats).toHaveProperty("enrolled");
    expect(typeof stats.total).toBe("number");
  });

  it("should throw error when getting non-existent participant", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.participants.getById({ id: 999999 })
    ).rejects.toThrow("Participant not found");
  });

  it("should throw error when deleting non-existent participant", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.participants.delete({ id: 999999 })
    ).rejects.toThrow("Participant not found");
  });

  it("should throw error when updating non-existent participant", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.participants.update({
        id: 999999,
        firstName: "Test",
      })
    ).rejects.toThrow("Participant not found");
  });

  it("should throw error when updating status of non-existent participant", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.participants.updateStatus({
        id: 999999,
        status: "enrolled",
      })
    ).rejects.toThrow("Participant not found");
  });
});
