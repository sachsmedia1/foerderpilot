/**
 * FOERDERPILOT - Z-EU-S EXPORT ROUTER
 * 
 * tRPC Router für Z-EU-S Vorhabenantrag-Datenexport:
 * - Einzelner Teilnehmer
 * - Mehrere Teilnehmer (Bulk)
 * - JSON-Format für manuelle Übertragung ins Z-EU-S Portal
 */

import { z } from 'zod';
import { router, adminProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { participants, courses, documents, participantWorkflowAnswers, workflowQuestions } from '../../drizzle/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { validateResourceOwnership } from '../_core/security';

/**
 * Z-EU-S Vorhabenantrag Datenstruktur
 */
interface VorhabenantragData {
  // Teilnehmer-Daten
  teilnehmer: {
    id: number;
    vorname: string;
    nachname: string;
    email: string;
    telefon: string | null;
    geburtsdatum: string | null;
    adresse: {
      strasse: string | null;
      plz: string | null;
      stadt: string | null;
      land: string;
    };
  };

  // Kurs-Daten
  kurs: {
    id: number;
    name: string;
    beschreibung: string;
    dauer: number;
    kostenNetto: number;
    kostenBrutto: number;
    foerderung: number; // Prozentsatz
  };

  // Begründungstexte (5 Fragen)
  begruendungen: Array<{
    frageNummer: number;
    frage: string;
    antwort: string;
  }>;

  // Dokumente-Status
  dokumente: {
    phase1Komplett: boolean;
    phase2Komplett: boolean;
    liste: Array<{
      typ: string;
      filename: string;
      url: string;
      validiert: boolean;
    }>;
  };

  // Export-Metadaten
  export: {
    datum: string;
    version: string;
    status: 'vollstaendig' | 'unvollstaendig';
  };
}

/**
 * Helper: Generate Vorhabenantrag data for a single participant
 */
async function generateVorhabenantragData(participantId: number, tenantId: number): Promise<VorhabenantragData> {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

  // Get participant
  const [participant] = await db
    .select()
    .from(participants)
    .where(eq(participants.id, participantId));

  if (!participant) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Participant not found' });
  }

  // Validate ownership
  if (participant.tenantId !== tenantId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
  }

  // Get course
  let course = null;
  if (participant.courseId) {
    [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, participant.courseId));
  }

  // Get documents
  const docs = await db
    .select()
    .from(documents)
    .where(eq(documents.participantId, participantId));

  // Get workflow answers
  const answers = await db
    .select({
      answer: participantWorkflowAnswers,
      question: workflowQuestions,
    })
    .from(participantWorkflowAnswers)
    .leftJoin(workflowQuestions, eq(participantWorkflowAnswers.questionId, workflowQuestions.id))
    .where(eq(participantWorkflowAnswers.participantId, participantId));

  // Check phase completion
  const phase1Types = ['personalausweis', 'einkommensteuerbescheid', 'gewerbeanmeldung', 'vzae_rechner', 'de_minimis_erklaerung', 'bankkonto_bestaetigung'];
  const phase2Types = ['teilnahmebescheinigung', 'kursrechnung', 'zahlungsnachweis'];
  
  const phase1Complete = phase1Types.every(type =>
    docs.some(d => d.documentType === type && d.validationStatus === 'valid')
  );
  
  const phase2Complete = phase2Types.every(type =>
    docs.some(d => d.documentType === type && d.validationStatus === 'valid')
  );

  // Build data structure
  const data: VorhabenantragData = {
    teilnehmer: {
      id: participant.id,
      vorname: participant.firstName || '',
      nachname: participant.lastName || '',
      email: participant.email,
      telefon: participant.phone,
      geburtsdatum: participant.dateOfBirth,
      adresse: {
        strasse: participant.streetAddress,
        plz: participant.zipCode,
        stadt: participant.city,
        land: participant.country || 'Deutschland',
      },
    },

    kurs: {
      id: course?.id || 0,
      name: course?.name || '',
      beschreibung: course?.shortDescription || '',
      dauer: course?.duration || 0,
      kostenNetto: course?.priceNet ? course.priceNet / 100 : 0,
      kostenBrutto: course?.priceGross ? course.priceGross / 100 : 0,
      foerderung: course?.subsidyPercentage || 0,
    },

    begruendungen: answers.map((a, index) => ({
      frageNummer: index + 1,
      frage: a.question?.title || '',
      antwort: a.answer.finalText || a.answer.aiGeneratedText || '',
    })),

    dokumente: {
      phase1Komplett: phase1Complete,
      phase2Komplett: phase2Complete,
      liste: docs.map(d => ({
        typ: d.documentType,
        filename: d.filename,
        url: d.fileUrl,
        validiert: d.validationStatus === 'valid',
      })),
    },

    export: {
      datum: new Date().toISOString(),
      version: '1.0',
      status: (phase1Complete && answers.length >= 5) ? 'vollstaendig' : 'unvollstaendig',
    },
  };

  return data;
}

export const zeusRouter = router({
  /**
   * Generate Vorhabenantrag data for a single participant
   */
  generateVorhabenantrag: adminProcedure
    .input(z.object({
      participantId: z.number().int().positive(),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      return await generateVorhabenantragData(input.participantId, ctx.tenant.id);
    }),

  /**
   * Generate Vorhabenantrag data for multiple participants (Bulk Export)
   */
  generateVorhabenantragBulk: adminProcedure
    .input(z.object({
      participantIds: z.array(z.number().int().positive()),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      const results = await Promise.all(
        input.participantIds.map(id => generateVorhabenantragData(id, ctx.tenant!.id))
      );

      return {
        export: {
          datum: new Date().toISOString(),
          version: '1.0',
          anzahl: results.length,
        },
        teilnehmer: results,
      };
    }),
});
