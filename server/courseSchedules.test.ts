/**
 * FOERDERPILOT - COURSE SCHEDULES TESTS
 * 
 * Tests für Kurstermin-Verwaltung:
 * - CRUD-Operationen
 * - Teilnehmer-Zuweisung
 * - Validierung
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import { getDb } from './db';
import { users, tenants, courses, courseSchedules, participants } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';

describe('Course Schedules Management', () => {
  let testTenantId: number;
  let testUserId: number;
  let testCourseId: number;
  let testScheduleId: number;
  let testParticipantId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Create test tenant
    const timestamp = Date.now();
    const [{ id: tenantId }] = await db.insert(tenants).values({
      name: `Test Tenant ${timestamp}`,
      subdomain: `test-${timestamp}`,
      companyName: `Test Company ${timestamp}`,
      email: `test-${timestamp}@example.com`,
      isActive: true,
    }).$returningId();
    testTenantId = tenantId;

    // Create test user
    const [{ id: userId }] = await db.insert(users).values({
      tenantId: testTenantId,
      email: `test-${Date.now()}@example.com`,
      openId: `test-${Date.now()}@example.com`,
      name: 'Test User',
      role: 'admin',
      loginMethod: 'email',
      isActive: true,
    }).$returningId();
    testUserId = userId;

    // Create test course
    const [{ id: courseId }] = await db.insert(courses).values({
      tenantId: testTenantId,
      name: 'Test Course',
      shortDescription: 'Test Description',
      priceNet: 100000,
      priceGross: 119000,
      isActive: true,
    }).$returningId();
    testCourseId = courseId;

    // Create test participant
    const [{ id: participantId }] = await db.insert(participants).values({
      tenantId: testTenantId,
      userId: testUserId,
      courseId: testCourseId,
      firstName: 'Max',
      lastName: 'Mustermann',
      email: `participant-${Date.now()}@example.com`,
      status: 'registered',
    }).$returningId();
    testParticipantId = participantId;
  });

  it('should create a course schedule', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, role: 'admin', tenantId: testTenantId },
      tenant: { id: testTenantId },
      req: {} as any,
      res: {} as any,
      isSuperAdminRoute: false,
      isMaintenanceMode: false,
    });

    const result = await caller.courseSchedules.create({
      courseId: testCourseId,
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-30'),
      maxParticipants: 20,
      status: 'scheduled',
      notes: 'Test schedule',
    });

    expect(result.id).toBeDefined();
    testScheduleId = result.id;

    // Verify in database
    const db = await getDb();
    const [schedule] = await db!
      .select()
      .from(courseSchedules)
      .where(eq(courseSchedules.id, testScheduleId));

    expect(schedule).toBeDefined();
    expect(schedule.courseId).toBe(testCourseId);
    expect(schedule.maxParticipants).toBe(20);
    expect(schedule.status).toBe('scheduled');
  });

  it('should list course schedules', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, role: 'admin', tenantId: testTenantId },
      tenant: { id: testTenantId },
      req: {} as any,
      res: {} as any,
      isSuperAdminRoute: false,
      isMaintenanceMode: false,
    });

    const schedules = await caller.courseSchedules.list({
      courseId: testCourseId,
    });

    expect(schedules.length).toBeGreaterThan(0);
    expect(schedules[0].courseId).toBe(testCourseId);
  });

  it('should get course schedule by ID', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, role: 'admin', tenantId: testTenantId },
      tenant: { id: testTenantId },
      req: {} as any,
      res: {} as any,
      isSuperAdminRoute: false,
      isMaintenanceMode: false,
    });

    const schedule = await caller.courseSchedules.getById({
      id: testScheduleId,
    });

    expect(schedule).toBeDefined();
    expect(schedule.id).toBe(testScheduleId);
    expect(schedule.courseId).toBe(testCourseId);
  });

  it('should update course schedule', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, role: 'admin', tenantId: testTenantId },
      tenant: { id: testTenantId },
      req: {} as any,
      res: {} as any,
      isSuperAdminRoute: false,
      isMaintenanceMode: false,
    });

    const result = await caller.courseSchedules.update({
      id: testScheduleId,
      maxParticipants: 25,
      status: 'in_progress',
    });

    expect(result.success).toBe(true);

    // Verify in database
    const db = await getDb();
    const [schedule] = await db!
      .select()
      .from(courseSchedules)
      .where(eq(courseSchedules.id, testScheduleId));

    expect(schedule.maxParticipants).toBe(25);
    expect(schedule.status).toBe('in_progress');
  });

  it('should assign participant to course schedule', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, role: 'admin', tenantId: testTenantId },
      tenant: { id: testTenantId },
      req: {} as any,
      res: {} as any,
      isSuperAdminRoute: false,
      isMaintenanceMode: false,
    });

    const result = await caller.participants.assignToSchedule({
      participantId: testParticipantId,
      courseScheduleId: testScheduleId,
    });

    expect(result.success).toBe(true);

    // Verify in database
    const db = await getDb();
    const [participant] = await db!
      .select()
      .from(participants)
      .where(eq(participants.id, testParticipantId));

    expect(participant.courseScheduleId).toBe(testScheduleId);
  });

  it('should unassign participant from course schedule', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, role: 'admin', tenantId: testTenantId },
      tenant: { id: testTenantId },
      req: {} as any,
      res: {} as any,
      isSuperAdminRoute: false,
      isMaintenanceMode: false,
    });

    const result = await caller.participants.assignToSchedule({
      participantId: testParticipantId,
      courseScheduleId: null,
    });

    expect(result.success).toBe(true);

    // Verify in database
    const db = await getDb();
    const [participant] = await db!
      .select()
      .from(participants)
      .where(eq(participants.id, testParticipantId));

    expect(participant.courseScheduleId).toBeNull();
  });

  it('should prevent assigning participant to schedule from different course', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Create another course
    const [{ id: otherCourseId }] = await db.insert(courses).values({
      tenantId: testTenantId,
      name: 'Other Course',
      shortDescription: 'Other Description',
      priceNet: 50000,
      priceGross: 59500,
      isActive: true,
    }).$returningId();

    // Create schedule for other course
    const [{ id: otherScheduleId }] = await db.insert(courseSchedules).values({
      tenantId: testTenantId,
      courseId: otherCourseId,
      startDate: new Date('2025-07-01'),
      status: 'scheduled',
    }).$returningId();

    const caller = appRouter.createCaller({
      user: { id: testUserId, role: 'admin', tenantId: testTenantId },
      tenant: { id: testTenantId },
      req: {} as any,
      res: {} as any,
      isSuperAdminRoute: false,
      isMaintenanceMode: false,
    });

    // Try to assign participant from testCourse to schedule from otherCourse
    await expect(
      caller.participants.assignToSchedule({
        participantId: testParticipantId,
        courseScheduleId: otherScheduleId,
      })
    ).rejects.toThrow();
  });

  it('should delete course schedule', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, role: 'admin', tenantId: testTenantId },
      tenant: { id: testTenantId },
      req: {} as any,
      res: {} as any,
      isSuperAdminRoute: false,
      isMaintenanceMode: false,
    });

    const result = await caller.courseSchedules.delete({
      id: testScheduleId,
    });

    expect(result.success).toBe(true);

    // Verify in database
    const db = await getDb();
    const [schedule] = await db!
      .select()
      .from(courseSchedules)
      .where(eq(courseSchedules.id, testScheduleId));

    expect(schedule).toBeUndefined();
  });
});
