/**
 * FOERDERPILOT - VORVERTRAG ROUTER
 * 
 * tRPC Router für Vorverträge (Pre-Contracts):
 * - Vorvertrag abrufen
 * - Vorvertrag unterschreiben
 * - Status-Tracking
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { vorvertraege } from '../../drizzle/schema';
import { getDb } from '../db';
import { eq, and } from 'drizzle-orm';
import { validateTenantAccess, validateResourceOwnership } from '../_core/security';
import { TRPCError } from '@trpc/server';

export const vorvertragRouter = router({
  /**
   * Get Vorvertrag by Participant ID
   * 
   * Returns the pre-contract for a specific participant
   */
  getByParticipantId: protectedProcedure
    .input(z.object({
      participantId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      validateTenantAccess(ctx, ctx.tenant!.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const [vorvertrag] = await db
        .select()
        .from(vorvertraege)
        .where(
          and(
            eq(vorvertraege.tenantId, ctx.tenant!.id),
            eq(vorvertraege.participantId, input.participantId)
          )
        )
        .limit(1);

      return vorvertrag || null;
    }),

  /**
   * Sign Vorvertrag
   * 
   * Creates or updates a pre-contract with signature data
   */
  sign: protectedProcedure
    .input(z.object({
      participantId: z.number(),
      signatureData: z.string(), // Base64-encoded signature or text
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      validateTenantAccess(ctx, ctx.tenant!.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Check if vorvertrag already exists
      const [existing] = await db
        .select()
        .from(vorvertraege)
        .where(
          and(
            eq(vorvertraege.tenantId, ctx.tenant!.id),
            eq(vorvertraege.participantId, input.participantId)
          )
        )
        .limit(1);

      if (existing) {
        // Update existing vorvertrag
        await db
          .update(vorvertraege)
          .set({
            status: 'signed',
            signedAt: new Date(),
            signatureData: input.signatureData,
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
            updatedAt: new Date(),
          })
          .where(eq(vorvertraege.id, existing.id));

        return { success: true, vorvertragId: existing.id };
      } else {
        // Create new vorvertrag
        const [result] = await db
          .insert(vorvertraege)
          .values({
            tenantId: ctx.tenant!.id,
            participantId: input.participantId,
            status: 'signed',
            signedAt: new Date(),
            signatureData: input.signatureData,
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
          });

        return { success: true, vorvertragId: result.insertId };
      }
    }),

  /**
   * Decline Vorvertrag
   * 
   * Marks a pre-contract as declined
   */
  decline: protectedProcedure
    .input(z.object({
      participantId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      validateTenantAccess(ctx, ctx.tenant!.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Check if vorvertrag exists
      const [existing] = await db
        .select()
        .from(vorvertraege)
        .where(
          and(
            eq(vorvertraege.tenantId, ctx.tenant!.id),
            eq(vorvertraege.participantId, input.participantId)
          )
        )
        .limit(1);

      if (existing) {
        // Update existing vorvertrag
        await db
          .update(vorvertraege)
          .set({
            status: 'declined',
            updatedAt: new Date(),
          })
          .where(eq(vorvertraege.id, existing.id));

        return { success: true, vorvertragId: existing.id };
      } else {
        // Create new vorvertrag with declined status
        const [result] = await db
          .insert(vorvertraege)
          .values({
            tenantId: ctx.tenant!.id,
            participantId: input.participantId,
            status: 'declined',
          });

        return { success: true, vorvertragId: result.insertId };
      }
    }),
});
