import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

describe("User Management", () => {
  let adminCaller: ReturnType<typeof appRouter.createCaller>;
  let testUserId: number;

  beforeAll(() => {
    const mockContext: Context = {
      req: {} as any,
      res: {} as any,
      user: {
        id: 1,
        openId: "test-admin",
        email: "admin@test.com",
        name: "Test Admin",
        role: "admin",
        tenantId: 1,
        isActive: true,
      } as any,
      tenant: {
        id: 1,
        subdomain: "test",
        name: "Test Tenant",
        isActive: true,
      } as any,
      isSuperAdminRoute: false,
      isMaintenanceMode: false,
    };

    adminCaller = appRouter.createCaller(mockContext);
  });

  it("should list users for tenant", async () => {
    const result = await adminCaller.userManagement.list({
      role: "all",
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a new user", async () => {
    const result = await adminCaller.userManagement.create({
      email: `test-${Date.now()}@example.com`,
      name: "Test User",
      firstName: "Test",
      lastName: "User",
      phone: "+49123456789",
      role: "user",
      password: "testpassword123",
    });

    expect(result.success).toBe(true);
    expect(result.userId).toBeGreaterThan(0);
    testUserId = result.userId;
  });

  it("should prevent duplicate email", async () => {
    const email = `duplicate-${Date.now()}@example.com`;

    await adminCaller.userManagement.create({
      email,
      name: "First User",
      role: "user",
      password: "password123",
    });

    await expect(
      adminCaller.userManagement.create({
        email,
        name: "Second User",
        role: "user",
        password: "password123",
      })
    ).rejects.toThrow("E-Mail-Adresse wird bereits verwendet");
  });

  it("should get user by id", async () => {
    const created = await adminCaller.userManagement.create({
      email: `getbyid-${Date.now()}@example.com`,
      name: "Get By ID Test",
      role: "kompass_reviewer",
      password: "password123",
    });

    const user = await adminCaller.userManagement.getById({
      id: created.userId,
    });

    expect(user.email).toContain("getbyid-");
    expect(user.name).toBe("Get By ID Test");
    expect(user.role).toBe("kompass_reviewer");
  });

  it("should update user", async () => {
    const created = await adminCaller.userManagement.create({
      email: `update-${Date.now()}@example.com`,
      name: "Original Name",
      role: "user",
      password: "password123",
    });

    await adminCaller.userManagement.update({
      id: created.userId,
      name: "Updated Name",
      role: "admin",
    });

    const updated = await adminCaller.userManagement.getById({
      id: created.userId,
    });

    expect(updated.name).toBe("Updated Name");
    expect(updated.role).toBe("admin");
  });

  it("should toggle user status", async () => {
    const created = await adminCaller.userManagement.create({
      email: `toggle-${Date.now()}@example.com`,
      name: "Toggle Test",
      role: "user",
      password: "password123",
    });

    // Warte kurz um sicherzustellen dass User in DB ist
    await new Promise(resolve => setTimeout(resolve, 100));

    // Deaktivieren
    const result1 = await adminCaller.userManagement.toggleStatus({
      id: created.userId,
    });
    expect(result1.success).toBe(true);
    expect(result1.newStatus).toBe(false);

    // Aktivieren
    const result2 = await adminCaller.userManagement.toggleStatus({
      id: created.userId,
    });
    expect(result2.success).toBe(true);
    expect(result2.newStatus).toBe(true);
  });

  it("should delete user (soft delete)", async () => {
    const created = await adminCaller.userManagement.create({
      email: `delete-${Date.now()}@example.com`,
      name: "Delete Test",
      role: "user",
      password: "password123",
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    const result = await adminCaller.userManagement.delete({
      id: created.userId,
    });

    expect(result.success).toBe(true);

    const deleted = await adminCaller.userManagement.getById({
      id: created.userId,
    });

    expect(deleted.isActive).toBe(false);
  });

  it("should filter users by role", async () => {
    // Erstelle User mit verschiedenen Rollen
    await adminCaller.userManagement.create({
      email: `admin-filter-${Date.now()}@example.com`,
      name: "Admin Filter",
      role: "admin",
      password: "password123",
    });

    await adminCaller.userManagement.create({
      email: `reviewer-filter-${Date.now()}@example.com`,
      name: "Reviewer Filter",
      role: "kompass_reviewer",
      password: "password123",
    });

    const admins = await adminCaller.userManagement.list({
      role: "admin",
    });

    const reviewers = await adminCaller.userManagement.list({
      role: "kompass_reviewer",
    });

    expect(admins.every((u) => u.role === "admin")).toBe(true);
    expect(reviewers.every((u) => u.role === "kompass_reviewer")).toBe(true);
  });

  it("should filter users by status", async () => {
    const created = await adminCaller.userManagement.create({
      email: `status-filter-${Date.now()}@example.com`,
      name: "Status Filter",
      role: "user",
      password: "password123",
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Deaktiviere User
    await adminCaller.userManagement.toggleStatus({
      id: created.userId,
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    const activeUsers = await adminCaller.userManagement.list({
      isActive: true,
    });

    const inactiveUsers = await adminCaller.userManagement.list({
      isActive: false,
    });

    expect(activeUsers.every((u) => u.isActive === true)).toBe(true);
    expect(inactiveUsers.some((u) => u.id === created.userId)).toBe(true);
  });

  it("should search users by name or email", async () => {
    const uniqueString = `search-${Date.now()}`;

    await adminCaller.userManagement.create({
      email: `${uniqueString}@example.com`,
      name: "Searchable User",
      role: "user",
      password: "password123",
    });

    const searchResults = await adminCaller.userManagement.list({
      search: uniqueString,
    });

    expect(searchResults.length).toBeGreaterThan(0);
    expect(
      searchResults.some(
        (u) => u.email.includes(uniqueString) || u.name?.includes(uniqueString)
      )
    ).toBe(true);
  });
});
