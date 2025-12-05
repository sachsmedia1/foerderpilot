/**
 * FOERDERPILOT - PARTICIPANTS ROUTER
 * 
 * tRPC Router für Teilnehmerverwaltung mit:
 * - CRUD-Operationen
 * - Status-Pipeline-Management
 * - Document-Integration
 */

import { z } from "zod";
import { router, adminProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { participants, courses } from "../../drizzle/schema";
import { eq, and, like, or, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { validateTenantAccess, validateResourceOwnership } from "../_core/security";
import { sendStatusChangeNotification, sendEmail } from "../utils/emailNotifications";
import { generateWelcomeEmail } from "../utils/emailTemplates";
import bcrypt from "bcrypt";
import crypto from "crypto";

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

      const oldStatus = existing[0].status;

      await db
        .update(participants)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(participants.id, input.id));

      // Send status-change notification email (async, don't wait)
      if (oldStatus !== input.status) {
        sendStatusChangeNotification(
          input.id,
          existing[0].tenantId,
          oldStatus,
          input.status
        ).catch((error) => {
          console.error('[updateStatus] Failed to send email notification:', error);
        });
      }

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

  /**
   * Assign participant to course schedule
   */
  assignToSchedule: adminProcedure
    .input(
      z.object({
        participantId: z.number().int().positive(),
        courseScheduleId: z.number().int().positive().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      // Verify participant belongs to tenant
      const [participant] = await db
        .select()
        .from(participants)
        .where(
          and(
            eq(participants.id, input.participantId),
            eq(participants.tenantId, ctx.tenant.id)
          )
        );

      if (!participant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Teilnehmer nicht gefunden" });
      }

      // If courseScheduleId is provided, verify it belongs to the same course and tenant
      if (input.courseScheduleId) {
        const { courseSchedules } = await import('../../drizzle/schema');
        const [schedule] = await db
          .select()
          .from(courseSchedules)
          .where(
            and(
              eq(courseSchedules.id, input.courseScheduleId),
              eq(courseSchedules.tenantId, ctx.tenant.id),
              eq(courseSchedules.courseId, participant.courseId)
            )
          );

        if (!schedule) {
          throw new TRPCError({ 
            code: "NOT_FOUND", 
            message: "Kurstermin nicht gefunden oder gehört nicht zum Kurs des Teilnehmers" 
          });
        }
      }

      // Update participant's courseScheduleId
      await db
        .update(participants)
        .set({ courseScheduleId: input.courseScheduleId })
        .where(eq(participants.id, input.participantId));

      return { success: true };
    }),

  /**
   * Set password for participant (Admin only)
   */
  setPassword: adminProcedure
    .input(
      z.object({
        participantId: z.number(),
        password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      // Verify participant belongs to tenant
      const [participant] = await db
        .select()
        .from(participants)
        .where(
          and(
            eq(participants.id, input.participantId),
            eq(participants.tenantId, ctx.tenant.id)
          )
        );

      if (!participant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Teilnehmer nicht gefunden" });
      }

      if (!participant.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Teilnehmer hat keinen User-Account" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 10);

      // Update user password
      const { users } = await import('../../drizzle/schema');
      await db
        .update(users)
        .set({ 
          passwordHash,
          resetToken: null,
          resetTokenExpiry: null
        })
        .where(eq(users.id, participant.userId));

      return { success: true };
    }),

  /**
   * Send password reset email to participant
   */
  sendPasswordReset: adminProcedure
    .input(
      z.object({
        participantId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      // Verify participant belongs to tenant
      const [participant] = await db
        .select()
        .from(participants)
        .where(
          and(
            eq(participants.id, input.participantId),
            eq(participants.tenantId, ctx.tenant.id)
          )
        );

      if (!participant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Teilnehmer nicht gefunden" });
      }

      if (!participant.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Teilnehmer hat keinen User-Account" });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update user with reset token
      const { users } = await import('../../drizzle/schema');
      await db
        .update(users)
        .set({ 
          resetToken,
          resetTokenExpiry
        })
        .where(eq(users.id, participant.userId));

      // Get course info for email
      const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, participant.courseId));

      // Send reset email
      const passwordResetLink = `${process.env.VITE_OAUTH_PORTAL_URL?.replace('/oauth/portal', '')}/reset-password?token=${resetToken}`;
      
      const emailHtml = generateWelcomeEmail({
        teilnehmername: `${participant.firstName} ${participant.lastName}`,
        kurstitel: course?.name || 'Ihr Kurs',
        starttermin: 'Wird noch bekannt gegeben',
        passwordResetLink,
      });

      await sendEmail({
        to: participant.email,
        subject: `Passwort zurücksetzen - ${ctx.tenant.name}`,
        html: emailHtml,
      });

      return { success: true };
    }),

  /**
   * Get current participant's data (for participant dashboard)
   */
  getMyData: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });

    // Find participant by userId
    const [participant] = await db
      .select({
        id: participants.id,
        firstName: participants.firstName,
        lastName: participants.lastName,
        email: participants.email,
        phone: participants.phone,
        dateOfBirth: participants.dateOfBirth,
        street: participants.street,
        zipCode: participants.zipCode,
        city: participants.city,
        country: participants.country,
        status: participants.status,
        courseId: participants.courseId,
        courseName: courses.name,
        courseDescription: courses.description,
        coursePriceNet: courses.priceNet,
        createdAt: participants.createdAt,
      })
      .from(participants)
      .leftJoin(courses, eq(participants.courseId, courses.id))
      .where(eq(participants.userId, ctx.user.id))
      .orderBy(desc(participants.courseId)) // Prefer participants with course assignment
      .limit(1);

    if (!participant) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Teilnehmerdaten nicht gefunden" });
    }

    return participant;
  }),
});
