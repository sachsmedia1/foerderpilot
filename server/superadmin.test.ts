/**
 * FOERDERPILOT - SUPER ADMIN ROUTER TESTS
 * 
 * Tests für Super Admin Funktionen:
 * - Tenant-Management
 * - System-Statistiken
 * - Zugriffskontrolle
 */

import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User, Tenant } from "../drizzle/schema";

// Mock Super Admin User
function createSuperAdminContext(): TrpcContext {
  const user: User = {
    id: 1,
    openId: "super-admin-test",
    email: "admin@foerderpilot.io",
    name: "Super Admin",
    firstName: "Super",
    lastName: "Admin",
    phone: null,
    loginMethod: "manus",
    role: "super_admin",
    tenantId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    tenant: null,
    isSuperAdminRoute: true,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

// Mock Regular User
function createRegularUserContext(): TrpcContext {
  const user: User = {
    id: 2,
    openId: "regular-user-test",
    email: "user@example.com",
    name: "Regular User",
    firstName: "Regular",
    lastName: "User",
    phone: null,
    loginMethod: "manus",
    role: "user",
    tenantId: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const tenant: Tenant = {
    id: 1,
    name: "Test Tenant",
    subdomain: "test",
    customDomain: null,
    companyName: "Test Company",
    email: "info@test.com",
    phone: null,
    street: null,
    zipCode: null,
    city: null,
    logoUrl: null,
    faviconUrl: null,
    primaryColor: "#1E40AF",
    secondaryColor: "#3B82F6",
    certificationType: null,
    certificationFileUrl: null,
    certificationValidUntil: null,
    directorName: null,
    directorSignatureUrl: null,
    impressumHtml: null,
    privacyPolicyUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    user,
    tenant,
    isSuperAdminRoute: false,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("superadmin.getSystemStats", () => {
  it("should return system statistics for super admin", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.superadmin.getSystemStats();

    expect(stats).toBeDefined();
    expect(stats.tenants).toBeDefined();
    expect(stats.users).toBeDefined();
    expect(typeof stats.tenants.total).toBe("number");
    expect(typeof stats.users.total).toBe("number");
  });

  it("should deny access to regular users", async () => {
    const ctx = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.superadmin.getSystemStats()).rejects.toThrow();
  });
});

describe("superadmin.listTenants", () => {
  it("should return list of tenants for super admin", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    const tenants = await caller.superadmin.listTenants();

    expect(Array.isArray(tenants)).toBe(true);
    // Mindestens 1 Tenant aus Seed-Daten
    expect(tenants.length).toBeGreaterThanOrEqual(1);
  });

  it("should deny access to regular users", async () => {
    const ctx = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.superadmin.listTenants()).rejects.toThrow();
  });
});

describe("superadmin.getTenant", () => {
  it("should return tenant by id for super admin", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Tenant mit ID 1 aus Seed-Daten
    const tenant = await caller.superadmin.getTenant({ id: 1 });

    expect(tenant).toBeDefined();
    expect(tenant.id).toBe(1);
    expect(tenant.subdomain).toBe("demo");
  });

  it("should throw error for non-existent tenant", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.superadmin.getTenant({ id: 99999 })
    ).rejects.toThrow("Tenant not found");
  });
});

describe("superadmin.toggleTenantStatus", () => {
  it("should toggle tenant active status", async () => {
    const ctx = createSuperAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Hole aktuellen Status
    const tenant = await caller.superadmin.getTenant({ id: 1 });
    const originalStatus = tenant.isActive;

    // Toggle Status
    const result = await caller.superadmin.toggleTenantStatus({ id: 1 });

    expect(result.success).toBe(true);
    expect(result.isActive).toBe(!originalStatus);

    // Toggle zurück
    await caller.superadmin.toggleTenantStatus({ id: 1 });
  });
});
