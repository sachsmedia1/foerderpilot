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
      const db = getDb();

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
        await db.execute({
          sql: `INSERT INTO registrationSessions (sessionId, tenantId, foerdercheck, foerdercheckErgebnis, expiresAt)
                VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 2 HOUR))
                ON DUPLICATE KEY UPDATE 
                  foerdercheck = VALUES(foerdercheck),
                  foerdercheckErgebnis = VALUES(foerdercheckErgebnis),
                  expiresAt = VALUES(expiresAt)`,
          args: [
            input.sessionId,
            input.tenantId,
            JSON.stringify(input),
            ergebnis,
          ],
        });

        return {
          success: true,
          ergebnis,
          message: "Sie erfüllen nicht alle Voraussetzungen für eine Förderung.",
          foerderprozent: 0,
          foerderbetrag: 0,
        };
      }

      // 2. Selbstständigkeit <2 Jahre? → K.O.
      const selbststaendigkeitDauer =
        new Date().getFullYear() -
        new Date(input.selbststaendigkeitSeit).getFullYear();
      if (selbststaendigkeitDauer < 2) {
        const ergebnis = "nicht_foerderfaehig";
        
        await db.execute({
          sql: `INSERT INTO registrationSessions (sessionId, tenantId, foerdercheck, foerdercheckErgebnis, expiresAt)
                VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 2 HOUR))
                ON DUPLICATE KEY UPDATE 
                  foerdercheck = VALUES(foerdercheck),
                  foerdercheckErgebnis = VALUES(foerdercheckErgebnis),
                  expiresAt = VALUES(expiresAt)`,
          args: [
            input.sessionId,
            input.tenantId,
            JSON.stringify(input),
            ergebnis,
          ],
        });

        return {
          success: true,
          ergebnis,
          message: "Selbstständigkeit muss mindestens 2 Jahre bestehen.",
          foerderprozent: 0,
          foerderbetrag: 0,
        };
      }

      // 3. Mehr als 1 VZÄ? → K.O.
      if (input.mitarbeiterVzae > 1) {
        const ergebnis = "nicht_foerderfaehig";
        
        await db.execute({
          sql: `INSERT INTO registrationSessions (sessionId, tenantId, foerdercheck, foerdercheckErgebnis, expiresAt)
                VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 2 HOUR))
                ON DUPLICATE KEY UPDATE 
                  foerdercheck = VALUES(foerdercheck),
                  foerdercheckErgebnis = VALUES(foerdercheckErgebnis),
                  expiresAt = VALUES(expiresAt)`,
          args: [
            input.sessionId,
            input.tenantId,
            JSON.stringify(input),
            ergebnis,
          ],
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
        
        await db.execute({
          sql: `INSERT INTO registrationSessions (sessionId, tenantId, foerdercheck, foerdercheckErgebnis, expiresAt)
                VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 2 HOUR))
                ON DUPLICATE KEY UPDATE 
                  foerdercheck = VALUES(foerdercheck),
                  foerdercheckErgebnis = VALUES(foerdercheckErgebnis),
                  expiresAt = VALUES(expiresAt)`,
          args: [
            input.sessionId,
            input.tenantId,
            JSON.stringify(input),
            ergebnis,
          ],
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

      // 5. 1 VZÄ? → BAFA-Fallback
      if (input.mitarbeiterVzae === 1) {
        ergebnis = "50_bafa_mitarbeiter";
        message = "Sie qualifizieren sich für 50% BAFA-Förderung (1 Mitarbeiter).";
        foerderprozent = 50;
        foerderbetrag = 2500; // Beispiel BAFA-Betrag
      }
      // 6. 2 KOMPASS-Schecks bereits genutzt? → BAFA-Fallback
      else if (input.kompassSchecksAnzahl >= 2) {
        ergebnis = "50_bafa_ausgeschoepft";
        message = "KOMPASS-Kontingent ausgeschöpft. Sie qualifizieren sich für 50% BAFA-Förderung.";
        foerderprozent = 50;
        foerderbetrag = 2500;
      }
      // 7. Letzter KOMPASS-Scheck <12 Monate? → BAFA-Fallback
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
          // 8. KOMPASS-Zweitantrag (≥12 Monate + 1 Scheck)
          ergebnis = "90_kompass_zweit";
          message = "Sie qualifizieren sich für Ihren zweiten KOMPASS-Gutschein (90%).";
          foerderprozent = 90;
          foerderbetrag = 4500;
        }
      }
      // 9. KOMPASS-Erstantrag (0 Schecks)
      else {
        ergebnis = "90_kompass_erst";
        message = "Sie qualifizieren sich für Ihren ersten KOMPASS-Gutschein (90%).";
        foerderprozent = 90;
        foerderbetrag = 4500;
      }

      // Session speichern
      await db.execute({
        sql: `INSERT INTO registrationSessions (sessionId, tenantId, foerdercheck, foerdercheckErgebnis, expiresAt)
              VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 2 HOUR))
              ON DUPLICATE KEY UPDATE 
                foerdercheck = VALUES(foerdercheck),
                foerdercheckErgebnis = VALUES(foerdercheckErgebnis),
                expiresAt = VALUES(expiresAt)`,
        args: [
          input.sessionId,
          input.tenantId,
          JSON.stringify(input),
          ergebnis,
        ],
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
      const db = getDb();

      // Session abrufen
      const sessionResult = await db.execute({
        sql: `SELECT * FROM registrationSessions WHERE sessionId = ?`,
        args: [input.sessionId],
      });

      if (sessionResult.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session nicht gefunden. Bitte starten Sie den Fördercheck erneut.",
        });
      }

      const session = sessionResult.rows[0] as any;

      // Kurs abrufen
      const courseResult = await db.execute({
        sql: `SELECT * FROM courses WHERE id = ? AND tenantId = ?`,
        args: [input.courseId, session.tenantId],
      });

      if (courseResult.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kurs nicht gefunden.",
        });
      }

      const course = courseResult.rows[0] as any;

      // Förderhöhe berechnen
      const foerderprozent = session.foerdercheckErgebnis?.startsWith("90_") ? 90 : 50;
      const foerderbetrag = Math.round((course.price * foerderprozent) / 100);
      const eigenanteil = course.price - foerderbetrag;

      // Session aktualisieren
      await db.execute({
        sql: `UPDATE registrationSessions SET courseId = ? WHERE sessionId = ?`,
        args: [input.courseId, input.sessionId],
      });

      return {
        success: true,
        course: {
          id: course.id,
          title: course.title,
          price: course.price,
          foerderprozent,
          foerderbetrag,
          eigenanteil,
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
        phone: z.string().min(5),
        street: z.string().min(1),
        zipCode: z.string().min(4),
        city: z.string().min(1),
        company: z.string().optional(),
        dateOfBirth: z.string(), // ISO Date
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Session abrufen
      const sessionResult = await db.execute({
        sql: `SELECT * FROM registrationSessions WHERE sessionId = ?`,
        args: [input.sessionId],
      });

      if (sessionResult.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session nicht gefunden.",
        });
      }

      // E-Mail bereits registriert?
      const session = sessionResult.rows[0] as any;
      const emailCheck = await db.execute({
        sql: `SELECT id FROM users WHERE email = ? AND tenantId = ?`,
        args: [input.email, session.tenantId],
      });

      if (emailCheck.rows.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Diese E-Mail-Adresse ist bereits registriert.",
        });
      }

      // Session aktualisieren
      await db.execute({
        sql: `UPDATE registrationSessions 
              SET firstName = ?, lastName = ?, email = ?, phone = ?, 
                  street = ?, zipCode = ?, city = ?, company = ?, dateOfBirth = ?
              WHERE sessionId = ?`,
        args: [
          input.firstName,
          input.lastName,
          input.email,
          input.phone,
          input.street,
          input.zipCode,
          input.city,
          input.company || null,
          input.dateOfBirth,
          input.sessionId,
        ],
      });

      return {
        success: true,
        message: "Persönliche Daten gespeichert.",
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
      const db = getDb();

      // Alle Checkboxen müssen true sein
      if (
        !input.checkboxZuarbeit ||
        !input.checkboxTeilnahme ||
        !input.checkboxDatenschutz ||
        !input.checkboxAgb
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bitte bestätigen Sie alle Checkboxen.",
        });
      }

      // Session abrufen
      const sessionResult = await db.execute({
        sql: `SELECT * FROM registrationSessions WHERE sessionId = ?`,
        args: [input.sessionId],
      });

      if (sessionResult.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session nicht gefunden.",
        });
      }

      const session = sessionResult.rows[0] as any;

      // Validierung: Alle Daten vorhanden?
      if (
        !session.foerdercheckErgebnis ||
        !session.courseId ||
        !session.firstName ||
        !session.lastName ||
        !session.email
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bitte vervollständigen Sie alle Schritte.",
        });
      }

      // Kurs abrufen
      const courseResult = await db.execute({
        sql: `SELECT * FROM courses WHERE id = ?`,
        args: [session.courseId],
      });

      if (courseResult.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kurs nicht gefunden.",
        });
      }

      const course = courseResult.rows[0] as any;

      // Vorvertrag-Template abrufen
      const templateResult = await db.execute({
        sql: `SELECT * FROM vorvertragTemplates WHERE tenantId = ? AND isActive = true LIMIT 1`,
        args: [session.tenantId],
      });

      if (templateResult.rows.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vorvertrag-Template nicht gefunden.",
        });
      }

      const template = templateResult.rows[0] as any;

      // Förderhöhe berechnen
      const foerderprozent = session.foerdercheckErgebnis.startsWith("90_") ? 90 : 50;
      const foerderbetrag = Math.round((course.price * foerderprozent) / 100);
      const eigenanteil = course.price - foerderbetrag;

      // Vorvertrag-Text mit Platzhaltern ersetzen
      let contractText = template.templateText;
      contractText = contractText.replace(/{{vorname}}/g, session.firstName);
      contractText = contractText.replace(/{{nachname}}/g, session.lastName);
      contractText = contractText.replace(
        /{{adresse}}/g,
        `${session.street}, ${session.zipCode} ${session.city}`
      );
      contractText = contractText.replace(/{{email}}/g, session.email);
      contractText = contractText.replace(/{{telefon}}/g, session.phone || "");
      contractText = contractText.replace(/{{kurstitel}}/g, course.title);
      contractText = contractText.replace(/{{starttermin}}/g, course.startDate || "TBD");
      contractText = contractText.replace(/{{kurspreis}}/g, course.price.toString());
      contractText = contractText.replace(/{{foerderbetrag}}/g, foerderbetrag.toString());
      contractText = contractText.replace(/{{foerderprozent}}/g, foerderprozent.toString());
      contractText = contractText.replace(/{{eigenanteil}}/g, eigenanteil.toString());
      contractText = contractText.replace(/{{checkboxZuarbeitText}}/g, template.checkboxZuarbeitText);
      contractText = contractText.replace(/{{checkboxTeilnahmeText}}/g, template.checkboxTeilnahmeText);
      contractText = contractText.replace(/{{checkboxDatenschutzText}}/g, template.checkboxDatenschutzText);
      contractText = contractText.replace(/{{checkboxAgbText}}/g, template.checkboxAgbText);
      contractText = contractText.replace(/{{signedAt}}/g, new Date().toLocaleString("de-DE"));
      contractText = contractText.replace(/{{ipAddress}}/g, input.ipAddress);

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ACCOUNT-ERSTELLUNG (User + Participant + Vorvertrag)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      // 1. User erstellen
      const userResult = await db.execute({
        sql: `INSERT INTO users (tenantId, email, firstName, lastName, phone, loginMethod, role, isActive)
              VALUES (?, ?, ?, ?, ?, 'email', 'user', true)`,
        args: [
          session.tenantId,
          session.email,
          session.firstName,
          session.lastName,
          session.phone || null,
        ],
      });

      const userId = Number(userResult.insertId);

      // 2. Participant erstellen
      const foerdercheck = JSON.parse(session.foerdercheck);
      const participantResult = await db.execute({
        sql: `INSERT INTO participants (
                tenantId, userId, courseId, firstName, lastName, email, phone, 
                street, zipCode, city, company, dateOfBirth, status,
                foerdercheck, foerdercheckErgebnis, deminimisBeihilfen, mitarbeiterVzae,
                kompassSchecksAnzahl, letzterKompassScheckDatum, funnelStep
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'registered', ?, ?, ?, ?, ?, ?, 'abgeschlossen')`,
        args: [
          session.tenantId,
          userId,
          session.courseId,
          session.firstName,
          session.lastName,
          session.email,
          session.phone || null,
          session.street,
          session.zipCode,
          session.city,
          session.company || null,
          session.dateOfBirth,
          session.foerdercheck,
          session.foerdercheckErgebnis,
          foerdercheck.deminimisBeihilfen,
          foerdercheck.mitarbeiterVzae,
          foerdercheck.kompassSchecksAnzahl,
          foerdercheck.letzterKompassScheckDatum || null,
        ],
      });

      const participantId = Number(participantResult.insertId);

      // 3. Vorvertrag erstellen
      const vorvertragResult = await db.execute({
        sql: `INSERT INTO vorvertraege (
                tenantId, participantId, status, signedAt,
                checkboxZuarbeit, checkboxTeilnahme, checkboxDatenschutz, checkboxAgb,
                ipAddress, userAgent, contractVersion, contractText
              )
              VALUES (?, ?, 'signed', NOW(), ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          session.tenantId,
          participantId,
          input.checkboxZuarbeit,
          input.checkboxTeilnahme,
          input.checkboxDatenschutz,
          input.checkboxAgb,
          input.ipAddress,
          input.userAgent,
          template.version,
          contractText,
        ],
      });

      const vorvertragId = Number(vorvertragResult.insertId);

      // 4. Password-Reset-Token generieren
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      await db.execute({
        sql: `UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?`,
        args: [resetToken, resetTokenExpiry, userId],
      });

      // 5. Session löschen (Cleanup)
      await db.execute({
        sql: `DELETE FROM registrationSessions WHERE sessionId = ?`,
        args: [input.sessionId],
      });

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // E-MAIL-WORKFLOWS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      // Tenant abrufen für E-Mail-Absender
      const tenantResult = await db.execute({
        sql: `SELECT name, logo FROM tenants WHERE id = ?`,
        args: [session.tenantId],
      });

      const tenant = tenantResult.rows[0] as any;

      // 6. Welcome-E-Mail an Teilnehmer (mit Vorvertrag im Body)
      try {
        const welcomeEmail = generateWelcomeEmail({
          vorname: session.firstName,
          nachname: session.lastName,
          email: session.email,
          kurstitel: course.title,
          starttermin: course.startDate || "TBD",
          kurspreis: course.price,
          foerderbetrag,
          passwordResetLink: `${process.env.VITE_FRONTEND_URL || "https://app.foerderpilot.io"}/reset-password/${resetToken}`,
          tenantName: tenant.name,
          vorvertragText: contractText,
        });

        await sendEmail({
          to: session.email,
          subject: welcomeEmail.subject,
          html: welcomeEmail.html,
          text: welcomeEmail.text,
        });
      } catch (error) {
        console.error("Fehler beim Versenden der Welcome-E-Mail:", error);
        // Nicht blockieren, Account wurde bereits erstellt
      }

      // 7. Admin-Benachrichtigung
      try {
        // Admin-E-Mail abrufen
        const adminResult = await db.execute({
          sql: `SELECT email FROM users WHERE tenantId = ? AND role = 'admin' LIMIT 1`,
          args: [session.tenantId],
        });

        if (adminResult.rows.length > 0) {
          const adminEmail = (adminResult.rows[0] as any).email;

          const adminNotification = generateAdminNotificationEmail({
            vorname: session.firstName,
            nachname: session.lastName,
            email: session.email,
            kurstitel: course.title,
            starttermin: course.startDate || "TBD",
            kurspreis: course.price,
            foerderbetrag,
            tenantName: tenant.name,
          });

          await sendEmail({
            to: adminEmail,
            subject: adminNotification.subject,
            html: adminNotification.html,
            text: adminNotification.text,
          });
        }
      } catch (error) {
        console.error("Fehler beim Versenden der Admin-Benachrichtigung:", error);
        // Nicht blockieren
      }

      return {
        success: true,
        userId,
        participantId,
        vorvertragId,
        resetToken,
        message: "Account erfolgreich erstellt.",
      };
    }),

  // ============================================================================
  // HELPER: Session abrufen
  // ============================================================================

  getSession: publicProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ input }) => {
      const db = getDb();

      const result = await db.execute({
        sql: `SELECT * FROM registrationSessions WHERE sessionId = ?`,
        args: [input.sessionId],
      });

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    }),

  // ============================================================================
  // HELPER: Kurse abrufen (für Dropdown)
  // ============================================================================

  getCourses: publicProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      const result = await db.execute({
        sql: `SELECT id, title, description, price, startDate FROM courses WHERE tenantId = ? AND isActive = true`,
        args: [input.tenantId],
      });

      return result.rows;
    }),
});
