/**
 * FOERDERPILOT - COURSE ROUTER
 * 
 * tRPC Router für Kursverwaltung mit:
 * - Liste (mit Filterung)
 * - Erstellen
 * - Bearbeiten
 * - Löschen
 * - Details
 */

import { z } from 'zod';
import { router, adminProcedure, publicProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { courses } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

// Validation Schemas
const courseCreateSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  shortDescription: z.string().min(1, 'Kurzbeschreibung ist erforderlich'),
  detailedDescription: z.string().optional(),
  topics: z.array(z.string()).optional(),
  duration: z.number().int().positive('Dauer muss positiv sein'),
  scheduleType: z.enum(['weeks', 'days', 'custom']),
  scheduleDetails: z.object({
    weeks: z.number().optional(),
    days: z.number().optional(),
    sessionsPerWeek: z.number().optional(),
    hoursPerSession: z.number().optional(),
    hoursPerDay: z.number().optional(),
    customSchedule: z.string().optional(),
  }).optional(),
  priceNet: z.number().int().nonnegative('Preis muss >= 0 sein'),
  priceGross: z.number().int().nonnegative('Preis muss >= 0 sein'),
  subsidyPercentage: z.number().min(0).max(100, 'Förderung muss zwischen 0-100% sein'),
  trainerNames: z.string().optional(),
  trainerQualifications: z.string().optional(),
  maxParticipants: z.number().int().positive().optional(),
  isPublished: z.boolean().default(false),
});

const courseUpdateSchema = courseCreateSchema.partial().extend({
  id: z.number().int().positive(),
});

const courseFilterSchema = z.object({
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  search: z.string().optional(),
});

export const coursesRouter = router({
  /**
   * Liste aller Kurse (mit Filterung)
   */
  list: adminProcedure
    .input(courseFilterSchema.optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      // Build WHERE conditions
      const conditions = [eq(courses.tenantId, ctx.tenant.id)];
      
      if (input?.isActive !== undefined) {
        conditions.push(eq(courses.isActive, input.isActive));
      }
      if (input?.isPublished !== undefined) {
        conditions.push(eq(courses.isPublished, input.isPublished));
      }

      const result = await db
        .select()
        .from(courses)
        .where(and(...conditions))
        .orderBy(desc(courses.createdAt));

      // Client-side search filtering (simple implementation)
      if (input?.search) {
        const searchLower = input.search.toLowerCase();
        return result.filter(course => 
          course.name.toLowerCase().includes(searchLower) ||
          (course.shortDescription && course.shortDescription.toLowerCase().includes(searchLower))
        );
      }

      return result;
    }),

  /**
   * Kurs-Details abrufen
   */
  getById: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      const result = await db
        .select()
        .from(courses)
        .where(and(
          eq(courses.id, input.id),
          eq(courses.tenantId, ctx.tenant.id)
        ))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Kurs nicht gefunden' });
      }

      return result[0];
    }),

  /**
   * Neuen Kurs erstellen
   */
  create: adminProcedure
    .input(courseCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      const [newCourse] = await db.insert(courses).values({
        tenantId: ctx.tenant.id,
        name: input.name,
        shortDescription: input.shortDescription,
        detailedDescription: input.detailedDescription || null,
        topics: input.topics ? JSON.stringify(input.topics) : null,
        duration: input.duration,
        scheduleType: input.scheduleType,
        scheduleDetails: input.scheduleDetails ? JSON.stringify(input.scheduleDetails) : null,
        priceNet: input.priceNet,
        priceGross: input.priceGross,
        subsidyPercentage: input.subsidyPercentage,
        trainerNames: input.trainerNames || null,
        trainerQualifications: input.trainerQualifications || null,
        maxParticipants: input.maxParticipants || null,
        isPublished: input.isPublished,
        isActive: true,
      }).$returningId();

      return { id: newCourse.id, success: true };
    }),

  /**
   * Kurs bearbeiten
   */
  update: adminProcedure
    .input(courseUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      // Verify ownership
      const existing = await db
        .select()
        .from(courses)
        .where(and(
          eq(courses.id, input.id),
          eq(courses.tenantId, ctx.tenant.id)
        ))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Kurs nicht gefunden' });
      }

      const { id, ...updateData } = input;
      
      // Convert arrays to JSON strings
      const processedData: any = { ...updateData };
      if (updateData.topics) {
        processedData.topics = JSON.stringify(updateData.topics);
      }
      if (updateData.scheduleDetails) {
        processedData.scheduleDetails = JSON.stringify(updateData.scheduleDetails);
      }

      await db
        .update(courses)
        .set(processedData)
        .where(eq(courses.id, id));

      return { success: true };
    }),

  /**
   * Kurs löschen (Soft Delete - setzt isActive auf false)
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
        .from(courses)
        .where(and(
          eq(courses.id, input.id),
          eq(courses.tenantId, ctx.tenant.id)
        ))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Kurs nicht gefunden' });
      }

      await db
        .update(courses)
        .set({ isActive: false })
        .where(eq(courses.id, input.id));

      return { success: true };
    }),

  /**
   * Kurs aktivieren/deaktivieren
   */
  toggleActive: adminProcedure
    .input(z.object({ 
      id: z.number().int().positive(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      // Verify ownership
      const existing = await db
        .select()
        .from(courses)
        .where(and(
          eq(courses.id, input.id),
          eq(courses.tenantId, ctx.tenant.id)
        ))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Kurs nicht gefunden' });
      }

      await db
        .update(courses)
        .set({ isActive: input.isActive })
        .where(eq(courses.id, input.id));

      return { success: true };
    }),

  /**
   * Öffentliche Kurs-Liste (ohne Login)
   */
  listPublic: publicProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      const result = await db
        .select()
        .from(courses)
        .where(and(
          eq(courses.tenantId, ctx.tenant.id),
          eq(courses.isActive, true),
          eq(courses.isPublished, true)
        ))
        .orderBy(desc(courses.createdAt));

      return result;
    }),
});
