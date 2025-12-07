/**
 * REGISTER ROUTER - Öffentlicher Funnel für Teilnehmer-Registrierung
 * 
 * 4 Steps:
 * 1. Fördercheck (7 Fragen → 90% KOMPASS / 50% BAFA / Nicht förderfähig)
 * 2. Kursauswahl (Dropdown + Kurs-Details + Förderhöhe)
 * 3. Persönliche Daten (Formular)
 * 4. Vorvertrag-Bestätigung (4 Checkboxen + Account-Erstellung)
 */

import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../utils/emailNotifications";
import { generateWelcomeEmail, generateAdminNotificationEmail } from "../utils/emailTemplates";
import { registrationSessions, courses, users, participants, vorvertraege, vorvertragTemplates } from "../../drizzle/schema";
import { eq, and, sql, desc } from "drizzle-orm";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Upsert Registration Session
 */
async function upsertSession(db: any, data: {
  sessionId: string;
  tenantId: number;
  foerdercheck?: any;
  foerdercheckErgebnis?: string;
  courseId?: number | null;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  street?: string;
  zipCode?: string;
  city?: string;
  company?: string;
  dateOfBirth?: string;
}) {
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
  
  // Check if session exists
  const existing = await db
    .select()
    .from(registrationSessions)
    .where(eq(registrationSessions.sessionId, data.sessionId))
    .limit(1);
  
  if (existing.length > 0) {
    // Update
    await db
      .update(registrationSessions)
      .set({ ...data, expiresAt })
      .where(eq(registrationSessions.sessionId, data.sessionId));
  } else {
    // Insert
    await db
      .insert(registrationSessions)
      .values({ ...data, expiresAt });
  }
}

// ============================================================================
// STEP 1: FÖRDERCHECK
// ============================================================================

export const registerRouter = router({
  /**
   * Step 1: Fördercheck
   * Prüft Förderfähigkeit anhand von 7 Kriterien
   */
  foerdercheck: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        tenantId: z.number(),
        wohnsitzDeutschland: z.boolean(),
        hauptberuflichSelbststaendig: z.boolean(),
        mindestens51ProzentEinkuenfte: z.boolean(),
        mitarbeiterVzae: z.number().min(0).max(10), // 0, 0.5, 1, etc.
        selbststaendigkeitSeit: z.string(), // ISO Date
        deminimisBeihilfen: z.number().min(0),
        kompassSchecksAnzahl: z.number().min(0).max(2),
        letzterKompassScheckDatum: z.string().optional(), // ISO Date
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // FÖRDERCHECK-LOGIK (Decision Tree)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      // 1. K.O.-Kriterien prüfen (sofortiger Abbruch)
      if (
        !input.wohnsitzDeutschland ||
        !input.hauptberuflichSelbststaendig ||
        !input.mindestens51ProzentEinkuenfte
      ) {
        const ergebnis = "nicht_foerderfaehig";
        
        // Session speichern
        await upsertSession(db, {
          sessionId: input.sessionId,
          tenantId: input.tenantId,
          foerdercheck: input,
          foerdercheckErgebnis: ergebnis,
        });

        return {
          success: true,
          ergebnis,
          message: "Sie erfüllen nicht alle Voraussetzungen für eine Förderung.",
          foerderprozent: 0,
          foerderbetrag: 0,
        };
      }

      // 2. Selbstständigkeit <2 Jahre? → BAFA 50% (nicht KOMPASS-fähig)
      const selbststaendigkeitDauer =
        new Date().getFullYear() -
        new Date(input.selbststaendigkeitSeit).getFullYear();
      const istKompassFaehig = selbststaendigkeitDauer >= 2;

      // 3. Mehr als 1 VZÄ? → K.O.
      if (input.mitarbeiterVzae > 1) {
        const ergebnis = "nicht_foerderfaehig";
        
        await upsertSession(db, {
          sessionId: input.sessionId,
          tenantId: input.tenantId,
          foerdercheck: input,
          foerdercheckErgebnis: ergebnis,
        });

        return {
          success: true,
          ergebnis,
          message: "Förderung nur für Solo-Selbstständige (max. 1 Vollzeitäquivalent).",
          foerderprozent: 0,
          foerderbetrag: 0,
        };
      }

      // 4. De-minimis-Grenze überschritten? → Warnung (praktisch nie)
      if (input.deminimisBeihilfen > 300000) {
        const ergebnis = "nicht_foerderfaehig";
        
        await upsertSession(db, {
          sessionId: input.sessionId,
          tenantId: input.tenantId,
          foerdercheck: input,
          foerdercheckErgebnis: ergebnis,
        });

        return {
          success: true,
          ergebnis,
          message: "De-minimis-Grenze (€300.000) überschritten. Bitte kontaktieren Sie uns.",
          foerderprozent: 0,
          foerderbetrag: 0,
        };
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // KOMPASS vs. BAFA Entscheidung
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      let ergebnis: string;
      let message: string;
      let foerderprozent: number;
      let foerderbetrag: number = 4500; // Default KOMPASS

      // 5. Weniger als 2 Jahre selbstständig? → BAFA 50%
      if (!istKompassFaehig) {
        ergebnis = "50_bafa_zu_jung";
        message = "Sie qualifizieren sich für 50% BAFA-Förderung (Selbstständigkeit unter 2 Jahren).";
        foerderprozent = 50;
        foerderbetrag = 2500;
      }
      // 6. 1 VZÄ? → BAFA-Fallback
      else if (input.mitarbeiterVzae === 1) {
        ergebnis = "50_bafa_mitarbeiter";
        message = "Sie qualifizieren sich für 50% BAFA-Förderung (1 Mitarbeiter).";
        foerderprozent = 50;
        foerderbetrag = 2500; // Beispiel BAFA-Betrag
      }
      // 7. 2 KOMPASS-Schecks bereits genutzt? → BAFA-Fallback
      else if (input.kompassSchecksAnzahl >= 2) {
        ergebnis = "50_bafa_ausgeschoepft";
        message = "KOMPASS-Kontingent ausgeschöpft. Sie qualifizieren sich für 50% BAFA-Förderung.";
        foerderprozent = 50;
        foerderbetrag = 2500;
      }
      // 8. Letzter KOMPASS-Scheck <12 Monate? → BAFA-Fallback
      else if (input.kompassSchecksAnzahl > 0 && input.letzterKompassScheckDatum) {
        const letzterScheckDatum = new Date(input.letzterKompassScheckDatum);
        const monateVergangen =
          (new Date().getTime() - letzterScheckDatum.getTime()) /
          (1000 * 60 * 60 * 24 * 30);

        if (monateVergangen < 12) {
          ergebnis = "50_bafa_zeitsperre";
          message = `KOMPASS-Zeitsperre aktiv (noch ${Math.ceil(12 - monateVergangen)} Monate). Sie qualifizieren sich für 50% BAFA-Förderung.`;
          foerderprozent = 50;
          foerderbetrag = 2500;
        } else {
          // 9. KOMPASS-Zweitantrag (≥12 Monate + 1 Scheck)
          ergebnis = "90_kompass_zweit";
          message = "Sie qualifizieren sich für Ihren zweiten KOMPASS-Gutschein (90%).";
          foerderprozent = 90;
          foerderbetrag = 4500;
        }
      }
      // 10. KOMPASS-Erstantrag (0 Schecks)
      else {
        ergebnis = "90_kompass_erst";
        message = "Sie qualifizieren sich für Ihren ersten KOMPASS-Gutschein (90%).";
        foerderprozent = 90;
        foerderbetrag = 4500;
      }

      // Session speichern
      await upsertSession(db, {
        sessionId: input.sessionId,
        tenantId: input.tenantId,
        foerdercheck: input,
        foerdercheckErgebnis: ergebnis,
      });

      return {
        success: true,
        ergebnis,
        message,
        foerderprozent,
        foerderbetrag,
      };
    }),

  // ============================================================================
  // STEP 2: KURSAUSWAHL
  // ============================================================================

  kursauswahl: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        courseId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Session abrufen
      const sessionData = await db
        .select()
        .from(registrationSessions)
        .where(eq(registrationSessions.sessionId, input.sessionId))
        .limit(1);

      if (sessionData.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session nicht gefunden. Bitte starten Sie den Fördercheck erneut.",
        });
      }

      const session = sessionData[0];

      // Kurs abrufen
      const courseData = await db
        .select()
        .from(courses)
        .where(and(
          eq(courses.id, input.courseId),
          eq(courses.tenantId, session.tenantId)
        ))
        .limit(1);

      if (courseData.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kurs nicht gefunden.",
        });
      }

      const course = courseData[0];

      // Session aktualisieren
      await upsertSession(db, {
        sessionId: input.sessionId,
        tenantId: session.tenantId,
        courseId: input.courseId,
      });

      return {
        success: true,
        course: {
          id: course.id,
          name: course.name,
          shortDescription: course.shortDescription,
          priceNet: course.priceNet,
          priceGross: course.priceGross,
          subsidyPercentage: course.subsidyPercentage,
          duration: course.duration,
        },
      };
    }),

  // ============================================================================
  // STEP 3: PERSÖNLICHE DATEN
  // ============================================================================

  persoenlicheDaten: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        street: z.string().min(1),
        zipCode: z.string().min(1),
        city: z.string().min(1),
        company: z.string().optional(),
        dateOfBirth: z.string(), // ISO Date
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Session abrufen
      const sessionData = await db
        .select()
        .from(registrationSessions)
        .where(eq(registrationSessions.sessionId, input.sessionId))
        .limit(1);

      if (sessionData.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session nicht gefunden.",
        });
      }

      const session = sessionData[0];

      // E-Mail-Duplikat-Check
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Diese E-Mail-Adresse ist bereits registriert.",
        });
      }

      // Session aktualisieren
      await upsertSession(db, {
        sessionId: input.sessionId,
        tenantId: session.tenantId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        street: input.street,
        zipCode: input.zipCode,
        city: input.city,
        company: input.company || null,
        dateOfBirth: input.dateOfBirth,
      });

      return {
        success: true,
        message: "Daten gespeichert.",
      };
    }),

  // ============================================================================
  // STEP 4: VORVERTRAG-BESTÄTIGUNG + ACCOUNT-ERSTELLUNG
  // ============================================================================

  vorvertragBestaetigen: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        checkboxZuarbeit: z.boolean(),
        checkboxTeilnahme: z.boolean(),
        checkboxDatenschutz: z.boolean(),
        checkboxAgb: z.boolean(),
        ipAddress: z.string(),
        userAgent: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Session abrufen
      const sessionData = await db
        .select()
        .from(registrationSessions)
        .where(eq(registrationSessions.sessionId, input.sessionId))
        .limit(1);

      if (sessionData.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session nicht gefunden.",
        });
      }

      const session = sessionData[0];

      // Validierung: Alle Daten vorhanden?
      if (!session.firstName || !session.lastName || !session.email || !session.courseId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unvollständige Session-Daten. Bitte durchlaufen Sie alle Schritte.",
        });
      }

      // Kurs abrufen
      const courseData = await db
        .select()
        .from(courses)
        .where(eq(courses.id, session.courseId))
        .limit(1);

      if (courseData.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kurs nicht gefunden.",
        });
      }

      const course = courseData[0];

      // Vorvertrag-Template abrufen
      const templateData = await db
        .select()
        .from(vorvertragTemplates)
        .where(and(
          eq(vorvertragTemplates.tenantId, session.tenantId),
          eq(vorvertragTemplates.isActive, true)
        ))
        .orderBy(desc(vorvertragTemplates.id))
        .limit(1);

      let vorvertragText = "Standard-Vorvertrag (kein Template gefunden)";
      if (templateData.length > 0) {
        vorvertragText = templateData[0].templateText;
      }

      // Platzhalter ersetzen
      vorvertragText = vorvertragText
        .replace(/{{vorname}}/g, session.firstName)
        .replace(/{{nachname}}/g, session.lastName)
        .replace(/{{email}}/g, session.email)
        .replace(/{{kursname}}/g, course.name)
        .replace(/{{kurspreis}}/g, (course.priceNet / 100).toFixed(2))
        .replace(/{{foerderbetrag}}/g, ((course.priceNet * course.subsidyPercentage) / 10000).toFixed(2))
        .replace(/{{eigenanteil}}/g, ((course.priceNet - (course.priceNet * course.subsidyPercentage) / 100) / 100).toFixed(2));

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ACCOUNT ERSTELLEN
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      // Password-Reset-Token generieren (für initiales Passwort-Setzen)
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      // User erstellen
      const [newUser] = await db
        .insert(users)
        .values({
          email: session.email,
          openId: session.email, // Wichtig für E-Mail/Passwort-Auth
          name: `${session.firstName} ${session.lastName}`,
          firstName: session.firstName,
          lastName: session.lastName,
          phone: session.phone,
          role: "user",
          tenantId: session.tenantId,
          loginMethod: "email",
          passwordHash: null, // Wird beim ersten Login gesetzt
          resetToken: resetToken,
          resetTokenExpiry: resetTokenExpiry,
        });

      // Participant erstellen
      const [newParticipant] = await db
        .insert(participants)
        .values({
          tenantId: session.tenantId,
          userId: newUser.insertId,
          courseId: session.courseId,
          firstName: session.firstName,
          lastName: session.lastName,
          email: session.email,
          phone: session.phone || null,
          dateOfBirth: session.dateOfBirth ? new Date(session.dateOfBirth) : null,
          street: session.street || null,
          zipCode: session.zipCode || null,
          city: session.city || null,
          status: "anmeldung_eingegangen",
        });

      // Vorvertrag erstellen
      const [newVorvertrag] = await db
        .insert(vorvertraege)
        .values({
          participantId: newParticipant.insertId,
          tenantId: session.tenantId,
          vorvertragText,
          checkboxZuarbeit: input.checkboxZuarbeit,
          checkboxTeilnahme: input.checkboxTeilnahme,
          checkboxDatenschutz: input.checkboxDatenschutz,
          checkboxAgb: input.checkboxAgb,
          signedAt: new Date(),
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        });

      // Session löschen (nicht mehr benötigt)
      await db
        .delete(registrationSessions)
        .where(eq(registrationSessions.sessionId, input.sessionId));

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // E-MAILS VERSENDEN
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      // Tenant-Daten abrufen für E-Mail
      const { tenants } = await import("../../drizzle/schema");
      const tenantData = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, session.tenantId))
        .limit(1);

      const tenant = tenantData[0];

      // Welcome-E-Mail mit Vorvertrag
      const welcomeEmail = generateWelcomeEmail({
        vorname: session.firstName,
        nachname: session.lastName,
        email: session.email,
        kurstitel: course.name,
        starttermin: "Wird noch bekannt gegeben",
        kurspreis: course.priceNet / 100,
        foerderbetrag: (course.priceNet * course.subsidyPercentage) / 10000,
        vorvertragText,
        passwordResetLink: `https://app.foerderpilot.io/reset-password?token=${resetToken}`,
        tenantName: tenant.companyName || tenant.name,
      });

      await sendEmail({
        to: session.email,
        subject: "Willkommen bei FörderPilot - Ihre Anmeldung",
        html: welcomeEmail.html,
        text: welcomeEmail.text,
      });

      // Admin-Benachrichtigung
      const adminUsers = await db
        .select()
        .from(users)
        .where(and(
          eq(users.tenantId, session.tenantId),
          eq(users.role, "admin")
        ))
        .limit(1);

      if (adminUsers.length > 0) {
        const adminEmail = adminUsers[0].email;

        const adminNotification = generateAdminNotificationEmail({
          vorname: session.firstName,
          nachname: session.lastName,
          email: session.email,
          kursname: course.name,
          kurspreis: course.priceNet / 100,
          foerderbetrag: (course.priceNet * course.subsidyPercentage) / 10000,
          tenantName: tenant.companyName || tenant.name,
        });

        await sendEmail({
          to: adminEmail,
          subject: "Neue Anmeldung - FörderPilot",
          html: adminNotification.html,
          text: adminNotification.text,
        });
      }

      return {
        success: true,
        message: "Account erfolgreich erstellt!",
        resetToken, // Für Weiterleitung zu Password-Set-Seite
      };
    }),

  // ============================================================================
  // HELPER: GET COURSES (für Dropdown)
  // ============================================================================

  getCourses: publicProcedure
    .input(
      z.object({
        tenantId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const courseList = await db
        .select()
        .from(courses)
        .where(and(
          eq(courses.tenantId, input.tenantId),
          eq(courses.isActive, true),
          eq(courses.isPublished, true)
        ));

      return courseList;
    }),

  // ============================================================================
  // HELPER: GET COURSE BY ID (für Direktlinks - tenantId ableiten)
  // ============================================================================

  getCourseById: publicProcedure
    .input(
      z.object({
        courseId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const courseData = await db
        .select()
        .from(courses)
        .where(and(
          eq(courses.id, input.courseId),
          eq(courses.isActive, true),
          eq(courses.isPublished, true)
        ))
        .limit(1);

      if (courseData.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kurs nicht gefunden.",
        });
      }

      return courseData[0];
    }),

  // ============================================================================
  // HELPER: GET TENANT PUBLIC INFO (für Vorvertrag-Text)
  // ============================================================================

  getTenantPublicInfo: publicProcedure
    .input(
      z.object({
        tenantId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const { tenants } = await import('../../drizzle/schema');
      const tenantData = await db
        .select({
          companyName: tenants.companyName,
          agbUrl: tenants.agbUrl,
          widerrufsbelehrungUrl: tenants.widerrufsbelehrungUrl,
        })
        .from(tenants)
        .where(eq(tenants.id, input.tenantId))
        .limit(1);

      if (tenantData.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bildungsträger nicht gefunden.",
        });
      }

      return tenantData[0];
    }),
});
