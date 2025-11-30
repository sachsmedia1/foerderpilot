/**
 * FOERDERPILOT - COURSE SCHEDULES ROUTER
 * 
 * tRPC Router für Kurstermine-Verwaltung mit:
 * - Liste (mit Filterung nach Kurs)
 * - Erstellen
 * - Bearbeiten
 * - Löschen
 * - Details
 */

import { z } from 'zod';
import { router, adminProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { courseSchedules } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

// Validation Schemas
const courseScheduleCreateSchema = z.object({
  courseId: z.number().int().positive(),
  startDate: z.string().or(z.date()), // ISO string or Date
  endDate: z.string().or(z.date()).optional(),
  maxParticipants: z.number().int().positive().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).default('scheduled'),
  notes: z.string().optional(),
});

const courseScheduleUpdateSchema = courseScheduleCreateSchema.partial().extend({
  id: z.number().int().positive(),
});

export const courseSchedulesRouter = router({
  // List course schedules (optionally filtered by courseId)
  list: adminProcedure
    .input(z.object({
      courseId: z.number().int().positive().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      const conditions = [eq(courseSchedules.tenantId, ctx.tenant.id)];
      if (input.courseId) {
        conditions.push(eq(courseSchedules.courseId, input.courseId));
      }

      const schedules = await db
        .select()
        .from(courseSchedules)
        .where(and(...conditions))
        .orderBy(desc(courseSchedules.startDate));

      return schedules;
    }),

  // Get single course schedule by ID
  getById: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      const [schedule] = await db
        .select()
        .from(courseSchedules)
        .where(and(
          eq(courseSchedules.id, input.id),
          eq(courseSchedules.tenantId, ctx.tenant.id)
        ));

      if (!schedule) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Kurstermin nicht gefunden' });
      }

      return schedule;
    }),

  // Create new course schedule
  create: adminProcedure
    .input(courseScheduleCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      // Verify course belongs to tenant
      const { courses } = await import('../../drizzle/schema');
      const [course] = await db
        .select()
        .from(courses)
        .where(and(
          eq(courses.id, input.courseId),
          eq(courses.tenantId, ctx.tenant.id)
        ));

      if (!course) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Kurs nicht gefunden' });
      }

      const [{ id }] = await db
        .insert(courseSchedules)
        .values({
          ...input,
          tenantId: ctx.tenant.id,
          startDate: new Date(input.startDate),
          endDate: input.endDate ? new Date(input.endDate) : null,
        })
        .$returningId();

      return { id };
    }),

  // Update course schedule
  update: adminProcedure
    .input(courseScheduleUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      const { id, ...updates } = input;

      // Verify schedule belongs to tenant
      const [existing] = await db
        .select()
        .from(courseSchedules)
        .where(and(
          eq(courseSchedules.id, id),
          eq(courseSchedules.tenantId, ctx.tenant.id)
        ));

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Kurstermin nicht gefunden' });
      }

      await db
        .update(courseSchedules)
        .set({
          ...updates,
          startDate: updates.startDate ? new Date(updates.startDate) : undefined,
          endDate: updates.endDate ? new Date(updates.endDate) : undefined,
        })
        .where(eq(courseSchedules.id, id));

      return { success: true };
    }),

  // Delete course schedule
  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      // Verify schedule belongs to tenant
      const [existing] = await db
        .select()
        .from(courseSchedules)
        .where(and(
          eq(courseSchedules.id, input.id),
          eq(courseSchedules.tenantId, ctx.tenant.id)
        ));

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Kurstermin nicht gefunden' });
      }

      await db
        .delete(courseSchedules)
        .where(eq(courseSchedules.id, input.id));

      return { success: true };
    }),
});
