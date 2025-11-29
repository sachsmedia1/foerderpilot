/**
 * FOERDERPILOT - SAMMELTERMIN ROUTER
 * 
 * tRPC Router für Sammeltermin-Verwaltung mit:
 * - Liste
 * - Erstellen
 * - Bearbeiten
 * - Löschen
 * - Details
 */

import { z } from 'zod';
import { router, adminProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { sammeltermins, courses } from '../../drizzle/schema';
import { eq, and, desc, gte } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

// Validation Schemas
const sammelterminCreateSchema = z.object({
  courseId: z.number().int().positive('Kurs ist erforderlich'),
  date: z.date(),
  submissionDeadline: z.date(),
  zoomLink: z.string().url('Ungültiger Zoom-Link').optional(),
  kompassReviewerEmail: z.string().email('Ungültige E-Mail').optional(),
  notes: z.string().optional(),
});

const sammelterminUpdateSchema = sammelterminCreateSchema.partial().extend({
  id: z.number().int().positive(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
});

export const sammelterminsRouter = router({
  /**
   * Liste aller Sammeltermine
   */
  list: adminProcedure
    .input(z.object({
      upcoming: z.boolean().optional(), // Nur zukünftige Termine
      courseId: z.number().int().positive().optional(), // Filter nach Kurs
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      let query = db
        .select({
          sammeltermin: sammeltermins,
          course: courses,
        })
        .from(sammeltermins)
        .leftJoin(courses, eq(sammeltermins.courseId, courses.id))
        .where(eq(sammeltermins.tenantId, ctx.tenant.id))
        .$dynamic();

      // Filter nach zukünftigen Terminen
      if (input?.upcoming) {
        query = query.where(gte(sammeltermins.date, new Date()));
      }

      // Filter nach Kurs
      if (input?.courseId) {
        query = query.where(eq(sammeltermins.courseId, input.courseId));
      }

      const result = await query.orderBy(desc(sammeltermins.date));

      return result.map(row => ({
        ...row.sammeltermin,
        course: row.course,
      }));
    }),

  /**
   * Sammeltermin-Details abrufen
   */
  getById: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      const result = await db
        .select({
          sammeltermin: sammeltermins,
          course: courses,
        })
        .from(sammeltermins)
        .leftJoin(courses, eq(sammeltermins.courseId, courses.id))
        .where(and(
          eq(sammeltermins.id, input.id),
          eq(sammeltermins.tenantId, ctx.tenant.id)
        ))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Sammeltermin nicht gefunden' });
      }

      return {
        ...result[0].sammeltermin,
        course: result[0].course,
      };
    }),

  /**
   * Neuen Sammeltermin erstellen
   */
  create: adminProcedure
    .input(sammelterminCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      // Verify course belongs to tenant
      const course = await db
        .select()
        .from(courses)
        .where(and(
          eq(courses.id, input.courseId),
          eq(courses.tenantId, ctx.tenant.id)
        ))
        .limit(1);

      if (course.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Kurs nicht gefunden' });
      }

      const [newSammeltermin] = await db.insert(sammeltermins).values({
        tenantId: ctx.tenant.id,
        courseId: input.courseId,
        date: input.date,
        submissionDeadline: input.submissionDeadline,
        zoomLink: input.zoomLink || null,
        kompassReviewerEmail: input.kompassReviewerEmail || null,
        status: 'scheduled',
        notes: input.notes || null,
      }).$returningId();

      return { id: newSammeltermin.id, success: true };
    }),

  /**
   * Sammeltermin bearbeiten
   */
  update: adminProcedure
    .input(sammelterminUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      // Verify ownership
      const existing = await db
        .select()
        .from(sammeltermins)
        .where(and(
          eq(sammeltermins.id, input.id),
          eq(sammeltermins.tenantId, ctx.tenant.id)
        ))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Sammeltermin nicht gefunden' });
      }

      // If courseId is being updated, verify it belongs to tenant
      if (input.courseId) {
        const course = await db
          .select()
          .from(courses)
          .where(and(
            eq(courses.id, input.courseId),
            eq(courses.tenantId, ctx.tenant.id)
          ))
          .limit(1);

        if (course.length === 0) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Kurs nicht gefunden' });
        }
      }

      const { id, ...updateData } = input;

      await db
        .update(sammeltermins)
        .set(updateData)
        .where(eq(sammeltermins.id, id));

      return { success: true };
    }),

  /**
   * Sammeltermin löschen
   */
  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      // Verify ownership
      const existing = await db
        .select()
        .from(sammeltermins)
        .where(and(
          eq(sammeltermins.id, input.id),
          eq(sammeltermins.tenantId, ctx.tenant.id)
        ))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Sammeltermin nicht gefunden' });
      }

      await db
        .delete(sammeltermins)
        .where(eq(sammeltermins.id, input.id));

      return { success: true };
    }),

  /**
   * Sammeltermin-Status ändern
   */
  updateStatus: adminProcedure
    .input(z.object({
      id: z.number().int().positive(),
      status: z.enum(['scheduled', 'completed', 'cancelled']),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      // Verify ownership
      const existing = await db
        .select()
        .from(sammeltermins)
        .where(and(
          eq(sammeltermins.id, input.id),
          eq(sammeltermins.tenantId, ctx.tenant.id)
        ))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Sammeltermin nicht gefunden' });
      }

      await db
        .update(sammeltermins)
        .set({ status: input.status })
        .where(eq(sammeltermins.id, input.id));

      return { success: true };
    }),
});
