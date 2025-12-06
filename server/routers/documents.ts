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
import { validateTenantAccess, validateResourceOwnership } from '../_core/security';
import { sendDocumentUploadNotification, sendDocumentValidationNotification } from '../utils/emailNotifications';

// Validation Schemas
// KOMPASS-konforme Dokumenttypen
const documentTypes = [
  // Phase 1: Förderberechtigung (vor Kurs)
  'personalausweis',
  'einkommensteuerbescheid',
  'gewerbeanmeldung',
  'vzae_rechner',
  'deminimis_erklaerung',
  'bankbestaetigung',
  
  // Phase 2: Rückerstattung (nach Kurs)
  'teilnahmebescheinigung',
  'rechnung_kurs',
  'zahlungsnachweis',
  
  // Fallback
  'other'
] as const;

// Deutsche Labels für Dokumenttypen
export const documentLabels: Record<typeof documentTypes[number], string> = {
  personalausweis: 'Personalausweis',
  einkommensteuerbescheid: 'Einkommensteuerbescheid (letzte 2 Jahre)',
  gewerbeanmeldung: 'Gewerbeanmeldung / Freiberufleranmeldung',
  vzae_rechner: 'VZÄ-Rechner (Selbsterklärung)',
  deminimis_erklaerung: 'De-minimis-Erklärung',
  bankbestaetigung: 'Bankbestätigung Geschäftskonto',
  teilnahmebescheinigung: 'Teilnahmebescheinigung',
  rechnung_kurs: 'Kursrechnung',
  zahlungsnachweis: 'Zahlungsnachweis (Kontoauszug)',
  other: 'Sonstiges Dokument'
};

// Hilfe-Texte für Dokumenttypen
export const documentHelp: Record<typeof documentTypes[number], string> = {
  personalausweis: 'Kopie beider Seiten Ihres gültigen Personalausweises oder Reisepasses',
  einkommensteuerbescheid: 'Einkommensteuerbescheide der letzten 2 Jahre als Nachweis der Hauptberuflichkeit (>51% Einkommen aus Selbstständigkeit)',
  gewerbeanmeldung: 'Gewerbeanmeldung oder Anmeldung als Freiberufler als Nachweis der mindestens 2-jährigen Selbstständigkeit',
  vzae_rechner: 'Selbsterklärung über Vollzeitäquivalente (max. 1 VZÄ erlaubt) - wird über Z-EU-S Portal erstellt',
  deminimis_erklaerung: 'Erklärung über erhaltene De-minimis-Beihilfen (max. €300.000 in 3 Jahren)',
  bankbestaetigung: 'Bestätigung der Bank über Ihr Geschäftskonto',
  teilnahmebescheinigung: 'Bescheinigung des Bildungsträgers über vollständige Kursteilnahme',
  rechnung_kurs: 'Originalrechnung des Bildungsträgers für den absolvierten Kurs',
  zahlungsnachweis: 'Kontoauszug als Nachweis der Kursgebührenzahlung',
  other: 'Weitere relevante Dokumente'
};

// Phasen-Definitionen
export const documentPhases = {
  FOERDERBERECHTIGUNG: [
    'personalausweis',
    'einkommensteuerbescheid',
    'gewerbeanmeldung',
    'vzae_rechner',
    'deminimis_erklaerung',
    'bankbestaetigung'
  ] as const,
  RUECKERSTATTUNG: [
    'teilnahmebescheinigung',
    'rechnung_kurs',
    'zahlungsnachweis'
  ] as const
};

const documentUploadSchema = z.object({
  participantId: z.number().int().positive(),
  documentType: z.enum(documentTypes),
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

      // ✅ RLS: Validate tenant access
      validateTenantAccess(ctx, ctx.tenant.id);

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
        .where(eq(participants.id, input.participantId))
        .limit(1);

      if (participant.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Participant not found' });
      }

      // ✅ RLS: Validate resource ownership
      validateResourceOwnership(ctx, participant[0].tenantId, 'Participant');

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

      // Send document-upload notification email (async, don't wait)
      sendDocumentUploadNotification(
        input.participantId,
        ctx.tenant.id,
        input.documentType
      ).catch((error) => {
        console.error('[upload] Failed to send email notification:', error);
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
        .where(eq(documents.id, input.documentId))
        .limit(1);

      if (!document) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
      }

      // ✅ RLS: Validate resource ownership
      validateResourceOwnership(ctx, document.tenantId, 'Document');

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
   * Validierungsstatus manuell aktualisieren
   */
  updateValidationStatus: adminProcedure
    .input(z.object({ 
      id: z.number().int().positive(),
      status: z.enum(['pending', 'validating', 'valid', 'invalid', 'manual_review'])
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      // Get document to validate ownership
      const [document] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, input.id))
        .limit(1);

      if (!document) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
      }

      // ✅ RLS: Validate resource ownership
      validateResourceOwnership(ctx, document.tenantId, 'Document');

      await db
        .update(documents)
        .set({ 
          validationStatus: input.status,
          validatedAt: new Date()
        })
        .where(eq(documents.id, input.id));

      // Send document-validation notification email for valid/invalid status (async, don't wait)
      if (input.status === 'valid' || input.status === 'invalid') {
        let validationResult;
        if (document.validationResult) {
          try {
            validationResult = JSON.parse(document.validationResult);
          } catch (e) {
            validationResult = {};
          }
        }

        sendDocumentValidationNotification(
          document.participantId,
          document.tenantId,
          document.documentType,
          input.status,
          validationResult
        ).catch((error) => {
          console.error('[updateValidationStatus] Failed to send email notification:', error);
        });
      }

      return { success: true };
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

      // Get document to validate ownership
      const [document] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, input.id))
        .limit(1);

      if (!document) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
      }

      // ✅ RLS: Validate resource ownership
      validateResourceOwnership(ctx, document.tenantId, 'Document');

      await db
        .delete(documents)
        .where(eq(documents.id, input.id));

      return { success: true };
    }),

  /**
   * Phasen-Status für Teilnehmer abrufen
   */
  getPhaseStatus: protectedProcedure
    .input(z.object({
      participantId: z.number().int().positive()
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      // Verify participant belongs to tenant
      const participant = await db
        .select()
        .from(participants)
        .where(eq(participants.id, input.participantId))
        .limit(1);

      if (participant.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Participant not found' });
      }

      // ✅ RLS: Validate resource ownership
      validateResourceOwnership(ctx, participant[0].tenantId, 'Participant');

      // Get all documents for participant
      const docs = await db
        .select()
        .from(documents)
        .where(eq(documents.participantId, input.participantId));

      // Check Phase 1 completion
      const phase1Complete = documentPhases.FOERDERBERECHTIGUNG.every(type =>
        docs.some(doc => doc.documentType === type && doc.validationStatus === 'valid')
      );

      const phase1Progress = documentPhases.FOERDERBERECHTIGUNG.filter(type =>
        docs.some(doc => doc.documentType === type && doc.validationStatus === 'valid')
      ).length;

      // Check Phase 2 completion
      const phase2Complete = documentPhases.RUECKERSTATTUNG.every(type =>
        docs.some(doc => doc.documentType === type && doc.validationStatus === 'valid')
      );

      const phase2Progress = documentPhases.RUECKERSTATTUNG.filter(type =>
        docs.some(doc => doc.documentType === type && doc.validationStatus === 'valid')
      ).length;

      return {
        foerderberechtigung: {
          complete: phase1Complete,
          progress: phase1Progress,
          total: documentPhases.FOERDERBERECHTIGUNG.length,
          percentage: Math.round((phase1Progress / documentPhases.FOERDERBERECHTIGUNG.length) * 100)
        },
        rueckerstattung: {
          available: phase1Complete, // Nur verfügbar wenn Phase 1 komplett
          complete: phase2Complete,
          progress: phase2Progress,
          total: documentPhases.RUECKERSTATTUNG.length,
          percentage: phase1Complete ? Math.round((phase2Progress / documentPhases.RUECKERSTATTUNG.length) * 100) : 0
        }
      };
    }),

  /**
   * Dokumenttypen und Labels abrufen
   */
  getDocumentTypes: protectedProcedure
    .query(async () => {
      return {
        types: documentTypes,
        labels: documentLabels,
        help: documentHelp,
        phases: documentPhases
      };
    }),
});

/**
 * Helper: Get validation prompt for document type (KOMPASS-konform)
 */
function getValidationPrompt(documentType: string): string {
  const prompts: Record<string, string> = {
    personalausweis: `
Prüfe diesen Personalausweis/Reisepass:
1. Ist das Dokument vollständig und gut lesbar?
2. Sind Name, Geburtsdatum und Adresse klar erkennbar?
3. Ist das Dokument noch gültig (Ablaufdatum)?
4. Handelt es sich um ein offizielles deutsches Dokument?
5. Sind beide Seiten vorhanden (falls Personalausweis)?

Bewerte Gültigkeit, Vollständigkeit und Lesbarkeit.
    `,
    
    einkommensteuerbescheid: `
Prüfe diesen Einkommensteuerbescheid:
1. Ist das Dokument vollständig lesbar und offiziell?
2. Enthält es Steueridentifikationsnummer?
3. Sind Einkünfte aus selbstständiger Tätigkeit ausgewiesen?
4. Ist der Zeitraum der letzten 2 Jahre abgedeckt?
5. Lässt sich Hauptberuflichkeit (>51% aus Selbstständigkeit) ableiten?
6. Sind Name und Adresse mit anderen Dokumenten konsistent?

Fokus auf Selbstständigkeits-Nachweis und Einkommensverteilung.
    `,
    
    gewerbeanmeldung: `
Prüfe diese Gewerbeanmeldung/Freiberufleranmeldung:
1. Ist das Dokument vollständig lesbar und offiziell?
2. Ist das Anmeldedatum mindestens 2 Jahre alt?
3. Sind Name und Adresse des Antragstellers klar erkennbar?
4. Ist die Art der Tätigkeit/des Gewerbes angegeben?
5. Handelt es sich um ein deutsches Dokument einer Behörde?

Fokus auf 2-Jahres-Nachweis der Selbstständigkeit.
    `,
    
    vzae_rechner: `
Prüfe diese VZÄ-Rechner Selbsterklärung:
1. Ist das Dokument vollständig ausgefüllt?
2. Ist das Ergebnis ≤ 1,0 Vollzeitäquivalente?
3. Sind alle Mitarbeiter/Beschäftigte erfasst?
4. Ist das Dokument aktuell datiert?
5. Ist es unterschrieben/bestätigt?

Fokus auf Max. 1 VZÄ-Grenze.
    `,
    
    deminimis_erklaerung: `
Prüfe diese De-minimis-Erklärung:
1. Ist das Dokument vollständig ausgefüllt?
2. Sind alle erhaltenen Beihilfen der letzten 3 Jahre aufgelistet?
3. Ist die Gesamtsumme ≤ €300.000?
4. Ist das Dokument aktuell datiert und unterschrieben?
5. Sind die Angaben plausibel und vollständig?

Fokus auf €300k-Grenze und Vollständigkeit.
    `,
    
    bankbestaetigung: `
Prüfe diese Bankbestätigung:
1. Ist es ein offizielles Bankdokument mit Briefkopf?
2. Bestätigt es ein Geschäftskonto des Antragstellers?
3. Sind IBAN und Kontoinhaber erkennbar?
4. Ist das Dokument aktuell (nicht älter als 3 Monate)?
5. Ist es von der Bank gestempelt/unterschrieben?

Fokus auf Geschäftskonten-Nachweis.
    `,
    
    teilnahmebescheinigung: `
Prüfe diese Teilnahmebescheinigung:
1. Ist es ein offizielles Dokument des Bildungsträgers?
2. Ist der vollständige Kurstitel und -zeitraum angegeben?
3. Wird vollständige Teilnahme bestätigt (nicht nur Anmeldung)?
4. Sind Teilnehmername und Kursdauer erkennbar?
5. Ist das Dokument gestempelt/unterschrieben?

Fokus auf vollständige Kursteilnahme.
    `,
    
    rechnung_kurs: `
Prüfe diese Kursrechnung:
1. Ist es eine ordnungsgemäße Rechnung mit Rechnungsnummer?
2. Sind Bildungsträger und Rechnungsempfänger klar erkennbar?
3. Ist der Kursbetrag (netto) ausgewiesen und ≤ €5.000?
4. Ist das Rechnungsdatum nach Kursanmeldung?
5. Ist die Rechnung noch unbezahlt oder bereits bezahlt?

Fokus auf Kostennachweis für KOMPASS-Förderung.
    `,
    
    zahlungsnachweis: `
Prüfe diesen Zahlungsnachweis (Kontoauszug):
1. Ist es ein offizieller Kontoauszug der Bank?
2. Ist die Zahlung an den Bildungsträger erkennbar?
3. Stimmt der Betrag mit der Kursrechnung überein?
4. Ist das Zahlungsdatum nach der Rechnung?
5. Ist der Kontoinhaber der Antragsteller?

Fokus auf Zahlungsnachweis für Kursgebühren.
    `,
    
    other: `
Prüfe dieses Dokument:
1. Ist das Dokument vollständig lesbar?
2. Handelt es sich um ein relevantes offizielles Dokument?
3. Sind alle wichtigen Informationen erkennbar?
4. Ist das Dokument aktuell und gültig?

Allgemeine Dokumentenprüfung.
    `
  };

  return prompts[documentType] || prompts.other;
}
