/**
 * FOERDERPILOT - PARTICIPANTS ROUTER
 * 
 * tRPC Router für Teilnehmerverwaltung mit:
 * - CRUD-Operationen
 * - Status-Pipeline-Management
 * - Document-Integration
 */

import { z } from "zod";
import { router, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { participants, courses } from "../../drizzle/schema";
import { eq, and, like, or, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { validateTenantAccess, validateResourceOwnership } from "../_core/security";

export const participantsRouter = router({
  /**
   * List participants with filtering
   */
  list: adminProcedure
    .input(
      z.object({
        courseId: z.number().optional(),
        status: z.enum([
          "registered",
          "documents_pending",
          "documents_submitted",
          "documents_approved",
          "documents_rejected",
          "enrolled",
          "completed",
          "dropped_out",
        ]).optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      // ✅ RLS: Validate tenant access
      validateTenantAccess(ctx, ctx.tenant.id);

      const conditions = [eq(participants.tenantId, ctx.tenant.id)];

      if (input?.courseId) {
        conditions.push(eq(participants.courseId, input.courseId));
      }

      if (input?.status) {
        conditions.push(eq(participants.status, input.status));
      }

      if (input?.search) {
        conditions.push(
          or(
            like(participants.firstName, `%${input.search}%`),
            like(participants.lastName, `%${input.search}%`),
            like(participants.email, `%${input.search}%`)
          )!
        );
      }

      const result = await db
        .select()
        .from(participants)
        .where(and(...conditions))
        .orderBy(desc(participants.createdAt));

      return result;
    }),

  /**
   * Get participant by ID
   */
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      const result = await db
        .select()
        .from(participants)
        .where(eq(participants.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Participant not found" });
      }

      // ✅ RLS: Validate resource ownership
      validateResourceOwnership(ctx, result[0].tenantId, 'Participant');

      return result[0];
    }),

  /**
   * Create new participant
   */
  create: adminProcedure
    .input(
      z.object({
        courseId: z.number(),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        dateOfBirth: z.string().optional(),
        street: z.string().optional(),
        zipCode: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verify course belongs to tenant
      const courseResult = await db
        .select()
        .from(courses)
        .where(
          and(
            eq(courses.id, input.courseId),
            eq(courses.tenantId, ctx.tenant!.id)
          )
        )
        .limit(1);

      if (courseResult.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
      }

      const [newParticipant] = await db.insert(participants).values({
        tenantId: ctx.tenant!.id,
        userId: ctx.user.id, // Required field
        courseId: input.courseId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone || null,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        street: input.street || null,
        zipCode: input.zipCode || null,
        city: input.city || null,
        country: input.country || "Deutschland",
        notes: input.notes || null,
        status: "registered",
      }).$returningId();

      return { id: newParticipant.id, status: "registered" as const };
    }),

  /**
   * Update participant
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        dateOfBirth: z.string().optional(),
        street: z.string().optional(),
        zipCode: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verify participant belongs to tenant
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      const existing = await db
        .select()
        .from(participants)
        .where(eq(participants.id, input.id))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Participant not found" });
      }

      // ✅ RLS: Validate resource ownership
      validateResourceOwnership(ctx, existing[0].tenantId, 'Participant');

      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.firstName) updateData.firstName = input.firstName;
      if (input.lastName) updateData.lastName = input.lastName;
      if (input.email) updateData.email = input.email;
      if (input.phone !== undefined) updateData.phone = input.phone || null;
      if (input.dateOfBirth !== undefined) {
        updateData.dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth) : null;
      }
      if (input.street !== undefined) updateData.street = input.street || null;
      if (input.zipCode !== undefined) updateData.zipCode = input.zipCode || null;
      if (input.city !== undefined) updateData.city = input.city || null;
      if (input.country !== undefined) updateData.country = input.country || null;
      if (input.notes !== undefined) updateData.notes = input.notes || null;

      await db
        .update(participants)
        .set(updateData)
        .where(eq(participants.id, input.id));

      return { success: true };
    }),

  /**
   * Update participant status
   */
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum([
          "registered",
          "documents_pending",
          "documents_submitted",
          "documents_approved",
          "documents_rejected",
          "enrolled",
          "completed",
          "dropped_out",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verify participant belongs to tenant
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      const existing = await db
        .select()
        .from(participants)
        .where(eq(participants.id, input.id))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Participant not found" });
      }

      // ✅ RLS: Validate resource ownership
      validateResourceOwnership(ctx, existing[0].tenantId, 'Participant');

      await db
        .update(participants)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(participants.id, input.id));

      return { success: true, status: input.status };
    }),

  /**
   * Delete participant
   */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verify participant belongs to tenant
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      const existing = await db
        .select()
        .from(participants)
        .where(eq(participants.id, input.id))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Participant not found" });
      }

      // ✅ RLS: Validate resource ownership
      validateResourceOwnership(ctx, existing[0].tenantId, 'Participant');

      await db.delete(participants).where(eq(participants.id, input.id));

      return { success: true };
    }),

  /**
   * Get statistics
   */
  getStats: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

    // ✅ RLS: Validate tenant access
    validateTenantAccess(ctx, ctx.tenant.id);

    const allParticipants = await db
      .select()
      .from(participants)
      .where(eq(participants.tenantId, ctx.tenant.id));

    return {
      total: allParticipants.length,
      registered: allParticipants.filter(p => p.status === "registered").length,
      documents_pending: allParticipants.filter(p => p.status === "documents_pending").length,
      documents_submitted: allParticipants.filter(p => p.status === "documents_submitted").length,
      documents_approved: allParticipants.filter(p => p.status === "documents_approved").length,
      enrolled: allParticipants.filter(p => p.status === "enrolled").length,
      completed: allParticipants.filter(p => p.status === "completed").length,
    };
  }),
});
