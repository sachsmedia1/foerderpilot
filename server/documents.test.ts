import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;
type Tenant = NonNullable<TrpcContext["tenant"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@foerderpilot.io",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    tenantId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const tenant: Tenant = {
    id: 1,
    subdomain: "app",
    name: "FörderPilot",
    primaryColor: "#3b82f6",
    secondaryColor: "#10b981",
    logoUrl: null,
    customDomain: null,
    isActive: true,
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
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("documents.list", () => {
  it("returns empty array when no documents exist", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.documents.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("filters documents by validation status", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.documents.list({
      validationStatus: "pending",
    });

    expect(Array.isArray(result)).toBe(true);
    // All returned documents should have pending status
    result.forEach((doc) => {
      expect(doc.validationStatus).toBe("pending");
    });
  });
});

describe("documents.upload", () => {
  it("requires authentication", async () => {
    const ctx: TrpcContext = {
      user: null,
      tenant: null,
      isSuperAdminRoute: false,
      isMaintenanceMode: false,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.documents.upload({
        participantId: 1,
        documentType: "personalausweis",
        filename: "test.pdf",
        fileData: "base64data",
        mimeType: "application/pdf",
      })
    ).rejects.toThrow();
  });

  it("requires tenant context", async () => {
    const user: AuthenticatedUser = {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const ctx: TrpcContext = {
      user,
      tenant: null,
      isSuperAdminRoute: false,
      isMaintenanceMode: false,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.documents.upload({
        participantId: 1,
        documentType: "personalausweis",
        filename: "test.pdf",
        fileData: "base64data",
        mimeType: "application/pdf",
      })
    ).rejects.toThrow("No tenant context");
  });
});

describe("documents.validate", () => {
  it("requires admin role", async () => {
    const user: AuthenticatedUser = {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const tenant: Tenant = {
      id: 1,
      subdomain: "app",
      name: "FörderPilot",
      primaryColor: "#3b82f6",
      secondaryColor: "#10b981",
      logoUrl: null,
      customDomain: null,
      isActive: true,
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
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.documents.validate({
        documentId: 1,
      })
    ).rejects.toThrow();
  });
});

describe("documents.delete", () => {
  it("requires admin role", async () => {
    const user: AuthenticatedUser = {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const tenant: Tenant = {
      id: 1,
      subdomain: "app",
      name: "FörderPilot",
      primaryColor: "#3b82f6",
      secondaryColor: "#10b981",
      logoUrl: null,
      customDomain: null,
      isActive: true,
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
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.documents.delete({
        id: 1,
      })
    ).rejects.toThrow();
  });
});
