/**
 * Tests for Dashboard Router
 */

import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { createInnerContext } from "./_core/context";
import { getDb } from "./db";
import { tenants, users, courses, participants, documents } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Dashboard Router", () => {
  let testTenantId: number;
  let testUserId: number;
  let testCourseId: number;
  let testParticipantId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test tenant
    await db.insert(tenants).values({
      name: "Test Tenant Dashboard",
      subdomain: "test-dashboard",
      companyName: "Test Company Dashboard",
      email: "dashboard@test.com",
      primaryColor: "#1E40AF",
      secondaryColor: "#EC4899",
    });
    
    const [tenant] = await db.select().from(tenants).where(eq(tenants.email, "dashboard@test.com"));
    testTenantId = tenant.id;

    // Create test user
    await db.insert(users).values({
      tenantId: testTenantId,
      openId: "test-dashboard-user",
      email: "dashboard-user@test.com",
      name: "Dashboard Test User",
      role: "admin",
    });
    
    const [user] = await db.select().from(users).where(eq(users.email, "dashboard-user@test.com"));
    testUserId = user.id;

    // Create test course
    await db.insert(courses).values({
      tenantId: testTenantId,
      name: "Test Course Dashboard",
      description: "Test Description",
      priceNet: 1000,
      priceGross: 1190,
      duration: 40,
    });
    
    const [course] = await db.select().from(courses).where(eq(courses.name, "Test Course Dashboard"));
    testCourseId = course.id;

    // Create test participant
    await db.insert(participants).values({
      tenantId: testTenantId,
      userId: testUserId,
      courseId: testCourseId,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@test.com",
      status: "registered",
    });
    
    const [participant] = await db.select().from(participants).where(eq(participants.email, "john.doe@test.com"));
    testParticipantId = participant.id;

    // Create test document
    await db.insert(documents).values({
      tenantId: testTenantId,
      participantId: testParticipantId,
      documentType: "id_card",
      fileUrl: "https://example.com/test-document.pdf",
      fileSize: 1024,
      validationStatus: "valid",
    });
  });

  it("should get dashboard stats", async () => {
    const ctx = await createInnerContext({});
    const caller = appRouter.createCaller({
      ...ctx,
      user: {
        id: testUserId,
        tenantId: testTenantId,
        email: "dashboard-user@test.com",
        name: "Dashboard Test User",
        role: "admin",
        openId: "test-dashboard-user",
        loginMethod: "email",
        isActive: true,
        createdAt: new Date(),
        lastSignedIn: new Date(),
      },
      tenant: {
        id: testTenantId,
        name: "Test Tenant Dashboard",
        companyName: "Test Company Dashboard",
        email: "dashboard@test.com",
        primaryColor: "#1E40AF",
        secondaryColor: "#EC4899",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const stats = await caller.dashboard.getStats();

    expect(stats).toBeDefined();
    expect(stats.participantCount).toBeGreaterThanOrEqual(1);
    expect(stats.courseCount).toBeGreaterThanOrEqual(1);
    expect(stats.validationRate).toBeGreaterThanOrEqual(0);
    expect(stats.validationRate).toBeLessThanOrEqual(100);
    expect(stats.statusDistribution).toBeInstanceOf(Array);
  });

  it("should get recent activities", async () => {
    const ctx = await createInnerContext({});
    const caller = appRouter.createCaller({
      ...ctx,
      user: {
        id: testUserId,
        tenantId: testTenantId,
        email: "dashboard-user@test.com",
        name: "Dashboard Test User",
        role: "admin",
        openId: "test-dashboard-user",
        loginMethod: "email",
        isActive: true,
        createdAt: new Date(),
        lastSignedIn: new Date(),
      },
      tenant: {
        id: testTenantId,
        name: "Test Tenant Dashboard",
        companyName: "Test Company Dashboard",
        email: "dashboard@test.com",
        primaryColor: "#1E40AF",
        secondaryColor: "#EC4899",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const activities = await caller.dashboard.getRecentActivities();

    expect(activities).toBeInstanceOf(Array);
    expect(activities.length).toBeGreaterThanOrEqual(1);
    
    const firstActivity = activities[0];
    expect(firstActivity).toHaveProperty("firstName");
    expect(firstActivity).toHaveProperty("lastName");
    expect(firstActivity).toHaveProperty("email");
    expect(firstActivity).toHaveProperty("status");
    expect(firstActivity).toHaveProperty("courseName");
  });

  it("should get pending validations", async () => {
    const ctx = await createInnerContext({});
    const caller = appRouter.createCaller({
      ...ctx,
      user: {
        id: testUserId,
        tenantId: testTenantId,
        email: "dashboard-user@test.com",
        name: "Dashboard Test User",
        role: "admin",
        openId: "test-dashboard-user",
        loginMethod: "email",
        isActive: true,
        createdAt: new Date(),
        lastSignedIn: new Date(),
      },
      tenant: {
        id: testTenantId,
        name: "Test Tenant Dashboard",
        companyName: "Test Company Dashboard",
        email: "dashboard@test.com",
        primaryColor: "#1E40AF",
        secondaryColor: "#EC4899",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const validations = await caller.dashboard.getPendingValidations();

    expect(validations).toBeDefined();
    expect(validations).toHaveProperty("pending");
    expect(validations).toHaveProperty("manualReview");
    expect(validations).toHaveProperty("total");
    expect(typeof validations.pending).toBe("number");
    expect(typeof validations.manualReview).toBe("number");
    expect(validations.total).toBe(validations.pending + validations.manualReview);
  });
});
