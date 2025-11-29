/**
 * FOERDERPILOT - DOCUMENT ROUTER
 * 
 * tRPC Router für Dokumentenverwaltung mit:
 * - Upload (S3)
 * - Liste (mit Filterung)
 * - AI-Validierung
 * - Status-Management
 */

import { z } from 'zod';
import { router, adminProcedure, protectedProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { documents, participants } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { storagePut } from '../storage';
import { invokeLLM } from '../_core/llm';

// Validation Schemas
const documentUploadSchema = z.object({
  participantId: z.number().int().positive(),
  documentType: z.enum([
    'personalausweis',
    'lebenslauf',
    'zeugnisse',
    'arbeitsvertrag',
    'kuendigungsbestaetigung',
    'other'
  ]),
  filename: z.string().min(1),
  fileData: z.string(), // Base64-encoded file data
  mimeType: z.string(),
});

const documentFilterSchema = z.object({
  participantId: z.number().int().optional(),
  documentType: z.string().optional(),
  validationStatus: z.enum(['pending', 'validating', 'valid', 'invalid', 'manual_review']).optional(),
});

const validateDocumentSchema = z.object({
  documentId: z.number().int().positive(),
});

export const documentsRouter = router({
  /**
   * Liste aller Dokumente (mit Filterung)
   */
  list: adminProcedure
    .input(documentFilterSchema.optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      // Build WHERE conditions
      const conditions = [eq(documents.tenantId, ctx.tenant.id)];
      
      if (input?.participantId) {
        conditions.push(eq(documents.participantId, input.participantId));
      }
      if (input?.documentType) {
        conditions.push(eq(documents.documentType, input.documentType));
      }
      if (input?.validationStatus) {
        conditions.push(eq(documents.validationStatus, input.validationStatus));
      }

      const result = await db
        .select()
        .from(documents)
        .where(and(...conditions))
        .orderBy(desc(documents.createdAt));

      return result;
    }),

  /**
   * Dokument hochladen (S3)
   */
  upload: protectedProcedure
    .input(documentUploadSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      // Verify participant belongs to tenant
      const participant = await db
        .select()
        .from(participants)
        .where(and(
          eq(participants.id, input.participantId),
          eq(participants.tenantId, ctx.tenant.id)
        ))
        .limit(1);

      if (participant.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Participant not found' });
      }

      // Decode base64 file data
      const fileBuffer = Buffer.from(input.fileData, 'base64');

      // Generate unique file key
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileExtension = input.filename.split('.').pop() || 'bin';
      const fileKey = `tenant-${ctx.tenant.id}/participant-${input.participantId}/${input.documentType}-${timestamp}-${randomSuffix}.${fileExtension}`;

      // Upload to S3
      const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);

      // Save to database
      const [document] = await db.insert(documents).values({
        tenantId: ctx.tenant.id,
        participantId: input.participantId,
        documentType: input.documentType,
        filename: input.filename,
        fileUrl: url,
        fileKey: fileKey,
        mimeType: input.mimeType,
        fileSize: fileBuffer.length,
        validationStatus: 'pending',
      });

      return {
        success: true,
        documentId: document.insertId,
        fileUrl: url,
      };
    }),

  /**
   * Dokument mit AI validieren
   */
  validate: adminProcedure
    .input(validateDocumentSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      // Get document
      const [document] = await db
        .select()
        .from(documents)
        .where(and(
          eq(documents.id, input.documentId),
          eq(documents.tenantId, ctx.tenant.id)
        ))
        .limit(1);

      if (!document) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
      }

      // Update status to validating
      await db
        .update(documents)
        .set({ validationStatus: 'validating' })
        .where(eq(documents.id, input.documentId));

      try {
        // Call GPT-4o-mini Vision for validation
        const validationPrompt = getValidationPrompt(document.documentType);
        
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: 'Du bist ein Experte für die Validierung von Dokumenten im KOMPASS-Förderungsprogramm. Prüfe das Dokument sorgfältig und gib eine strukturierte Bewertung ab.',
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: validationPrompt,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: document.fileUrl,
                    detail: 'high',
                  },
                },
              ],
            },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'document_validation',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  isValid: { type: 'boolean', description: 'Ist das Dokument gültig?' },
                  confidence: { type: 'number', description: 'Konfidenz der Validierung (0-100)' },
                  issues: {
                    type: 'array',
                    description: 'Liste der gefundenen Probleme',
                    items: { type: 'string' },
                  },
                  recommendations: {
                    type: 'array',
                    description: 'Empfehlungen zur Verbesserung',
                    items: { type: 'string' },
                  },
                },
                required: ['isValid', 'confidence', 'issues', 'recommendations'],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message.content;
        const validationResult = JSON.parse(typeof content === 'string' ? content : '{}');

        // Determine final status
        let finalStatus: 'valid' | 'invalid' | 'manual_review' = 'valid';
        if (!validationResult.isValid) {
          finalStatus = 'invalid';
        } else if (validationResult.confidence < 80) {
          finalStatus = 'manual_review';
        }

        // Update document with validation result
        await db
          .update(documents)
          .set({
            validationStatus: finalStatus,
            validationResult: JSON.stringify(validationResult),
            validatedAt: new Date(),
          })
          .where(eq(documents.id, input.documentId));

        return {
          success: true,
          status: finalStatus,
          result: validationResult,
        };
      } catch (error) {
        // Update status to manual_review on error
        await db
          .update(documents)
          .set({
            validationStatus: 'manual_review',
            validationResult: JSON.stringify({ error: String(error) }),
          })
          .where(eq(documents.id, input.documentId));

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Validation failed',
          cause: error,
        });
      }
    }),

  /**
   * Dokument löschen
   */
  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      await db
        .delete(documents)
        .where(and(
          eq(documents.id, input.id),
          eq(documents.tenantId, ctx.tenant.id)
        ));

      return { success: true };
    }),
});

/**
 * Helper: Get validation prompt for document type
 */
function getValidationPrompt(documentType: string): string {
  const prompts: Record<string, string> = {
    personalausweis: `
Prüfe diesen Personalausweis auf folgende Kriterien:
- Ist das Dokument lesbar und vollständig?
- Sind alle Pflichtfelder (Name, Geburtsdatum, Ausweisnummer) erkennbar?
- Ist das Dokument gültig (nicht abgelaufen)?
- Gibt es Anzeichen für Fälschungen oder Manipulationen?
    `,
    lebenslauf: `
Prüfe diesen Lebenslauf auf folgende Kriterien:
- Ist das Dokument vollständig und strukturiert?
- Enthält es persönliche Daten (Name, Kontakt)?
- Sind Bildungs- und Berufserfahrung aufgeführt?
- Ist das Dokument aktuell (nicht älter als 6 Monate)?
    `,
    zeugnisse: `
Prüfe diese Zeugnisse auf folgende Kriterien:
- Sind die Dokumente lesbar und vollständig?
- Sind Ausstellungsdatum und Institution erkennbar?
- Gibt es Anzeichen für Fälschungen?
    `,
    arbeitsvertrag: `
Prüfe diesen Arbeitsvertrag auf folgende Kriterien:
- Ist das Dokument vollständig?
- Sind Arbeitgeber und Arbeitnehmer erkennbar?
- Ist das Datum und die Unterschrift vorhanden?
    `,
    kuendigungsbestaetigung: `
Prüfe diese Kündigungsbestätigung auf folgende Kriterien:
- Ist das Dokument vollständig?
- Sind Arbeitgeber und Arbeitnehmer erkennbar?
- Ist das Kündigungsdatum erkennbar?
- Ist eine Unterschrift vorhanden?
    `,
    other: `
Prüfe dieses Dokument auf folgende Kriterien:
- Ist das Dokument lesbar und vollständig?
- Gibt es offensichtliche Probleme oder Mängel?
    `,
  };

  return prompts[documentType] || prompts.other;
}
