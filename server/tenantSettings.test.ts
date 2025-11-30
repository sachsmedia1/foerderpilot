/**
 * FOERDERPILOT - TENANT SETTINGS TESTS
 */

import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User, Tenant } from "../drizzle/schema";

describe("Tenant Settings Router", () => {
  // Mock admin context with tenant
  function createAdminContext(): TrpcContext {
    const user: User = {
      id: 1,
      openId: "test-admin",
      email: "admin@test.com",
      name: "Test Admin",
      firstName: "Test",
      lastName: "Admin",
      phone: null,
      loginMethod: "email",
      role: "admin",
      tenantId: 1,
      passwordHash: null,
      resetToken: null,
      resetTokenExpiry: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const tenant: Tenant = {
      id: 1,
      name: "Test Tenant",
      subdomain: "app",
      customDomain: null,
      logoUrl: null,
      faviconUrl: null,
      primaryColor: "#1E40AF",
      secondaryColor: "#3B82F6",
      companyName: "Test Company",
      taxId: null,
      street: null,
      zipCode: null,
      city: null,
      email: "test@example.com",
      phone: null,
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
      req: {} as any,
      res: {} as any,
      user,
      tenant,
      isSuperAdminRoute: false,
      isMaintenanceMode: false,
    };
  }

  it("should get current tenant settings", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.tenantSettings.get();
    expect(result).toBeDefined();
    expect(result.id).toBe(1);
    expect(result.name).toBe("Test Tenant");
    expect(result.subdomain).toBe("app");
  });

  it("should update company data", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.tenantSettings.updateCompanyData({
      companyName: "Updated Company",
      taxId: "DE123456789",
      street: "Teststraße 123",
      zipCode: "12345",
      city: "Berlin",
      email: "updated@example.com",
      phone: "+49 30 12345678",
      impressumHtml: "<p>Test Impressum</p>",
      privacyPolicyUrl: "https://example.com/privacy",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("erfolgreich");
  });

  it("should update branding", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.tenantSettings.updateBranding({
      logoUrl: "https://example.com/logo.png",
      faviconUrl: "https://example.com/favicon.ico",
      primaryColor: "#FF0000",
      secondaryColor: "#00FF00",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("erfolgreich");
  });

  it("should update custom domain", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.tenantSettings.updateCustomDomain({
      customDomain: "meine-domain.de",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("erfolgreich");
  });

  it("should reject invalid email in company data", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.tenantSettings.updateCompanyData({
        companyName: "Test",
        email: "invalid-email",
      })
    ).rejects.toThrow();
  });

  it("should reject invalid color format in branding", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.tenantSettings.updateBranding({
        primaryColor: "not-a-color",
      })
    ).rejects.toThrow();
  });

  it("should reject invalid domain format", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.tenantSettings.updateCustomDomain({
        customDomain: "invalid domain with spaces",
      })
    ).rejects.toThrow();
  });

  it("should allow clearing custom domain", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.tenantSettings.updateCustomDomain({
      customDomain: "",
    });

    expect(result.success).toBe(true);
  });

  it("should update certification", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.tenantSettings.updateCertification({
      certificationType: "AZAV",
      certificationFileUrl: "https://example.com/cert.pdf",
      certificationValidUntil: "2025-12-31",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("erfolgreich");
  });

  it("should allow clearing certification", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.tenantSettings.updateCertification({
      certificationType: "",
      certificationFileUrl: "",
      certificationValidUntil: "",
    });

    expect(result.success).toBe(true);
  });

  it("should reject invalid certification URL", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.tenantSettings.updateCertification({
        certificationType: "AZAV",
        certificationFileUrl: "not-a-url",
      })
    ).rejects.toThrow();
  });

  it("should reject invalid certification date", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.tenantSettings.updateCertification({
        certificationType: "AZAV",
        certificationValidUntil: "invalid-date",
      })
    ).rejects.toThrow();
  });
});
