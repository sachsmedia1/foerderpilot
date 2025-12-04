/**
 * FOERDERPILOT - PARTICIPANT PASSWORD MANAGEMENT TESTS
 * 
 * Tests für:
 * - setPassword (Admin setzt Passwort für Teilnehmer)
 * - sendPasswordReset (Admin sendet Reset-E-Mail)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './_core/trpc';
import { getDb } from './db';
import bcrypt from 'bcryptjs';
import { users, participants, tenants } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Participant Password Management', () => {
  let testTenantId: number;
  let testAdminUserId: number;
  let testParticipantId: number;
  let testParticipantUserId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Get test tenant
    const [tenant] = await db.select().from(tenants).where(eq(tenants.subdomain, 'app')).limit(1);
    testTenantId = tenant.id;

    // Get admin user
    const [admin] = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
    testAdminUserId = admin.id;

    // Get participant with userId
    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.tenantId, testTenantId))
      .limit(1);
    
    if (!participant || !participant.userId) {
      throw new Error('No participant with userId found for testing');
    }

    testParticipantId = participant.id;
    testParticipantUserId = participant.userId;
  });

  it('should set password for participant', async () => {
    const caller = appRouter.createCaller({
      user: { id: testAdminUserId, role: 'admin', tenantId: testTenantId },
      tenant: { id: testTenantId, name: 'Test Tenant', subdomain: 'app' },
    } as any);

    const result = await caller.participants.setPassword({
      participantId: testParticipantId,
      password: 'NewSecurePassword123!',
    });

    expect(result.success).toBe(true);

    // Verify password was hashed and saved
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, testParticipantUserId));

    expect(user.passwordHash).toBeTruthy();
    const isValid = await bcrypt.compare('NewSecurePassword123!', user.passwordHash!);
    expect(isValid).toBe(true);

    // Verify reset token was cleared
    expect(user.resetToken).toBeNull();
    expect(user.resetTokenExpiry).toBeNull();
  });

  it('should reject password shorter than 8 characters', async () => {
    const caller = appRouter.createCaller({
      user: { id: testAdminUserId, role: 'admin', tenantId: testTenantId },
      tenant: { id: testTenantId, name: 'Test Tenant', subdomain: 'app' },
    } as any);

    await expect(
      caller.participants.setPassword({
        participantId: testParticipantId,
        password: 'short',
      })
    ).rejects.toThrow();
  });

  it('should send password reset email', async () => {
    const caller = appRouter.createCaller({
      user: { id: testAdminUserId, role: 'admin', tenantId: testTenantId },
      tenant: { id: testTenantId, name: 'Test Tenant', subdomain: 'app' },
    } as any);

    const result = await caller.participants.sendPasswordReset({
      participantId: testParticipantId,
    });

    expect(result.success).toBe(true);

    // Verify reset token was generated
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, testParticipantUserId));

    expect(user.resetToken).toBeTruthy();
    expect(user.resetToken).toHaveLength(64); // 32 bytes hex = 64 chars
    expect(user.resetTokenExpiry).toBeTruthy();
    expect(user.resetTokenExpiry!.getTime()).toBeGreaterThan(Date.now());
  });

  it('should reject password management for participant without user account', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Find or create participant without userId
    const [participantWithoutUser] = await db
      .select()
      .from(participants)
      .where(eq(participants.userId, null as any))
      .limit(1);

    if (!participantWithoutUser) {
      // Skip test if no participant without user exists
      return;
    }

    const caller = appRouter.createCaller({
      user: { id: testAdminUserId, role: 'admin', tenantId: testTenantId },
      tenant: { id: testTenantId, name: 'Test Tenant', subdomain: 'app' },
    } as any);

    await expect(
      caller.participants.setPassword({
        participantId: participantWithoutUser.id,
        password: 'NewPassword123!',
      })
    ).rejects.toThrow('keinen User-Account');
  });
});
