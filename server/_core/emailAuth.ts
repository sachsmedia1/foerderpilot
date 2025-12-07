/**
 * FOERDERPILOT - EMAIL/PASSWORD AUTHENTICATION ROUTES
 * 
 * Express-Routes für E-Mail/Passwort-Authentifizierung
 * Verwendet Cookie-Sessions (wie OAuth)
 */

import type { Express, Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import * as schema from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const SALT_ROUNDS = 10;

interface RegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantId?: number;
}

interface LoginBody {
  email: string;
  password: string;
}

interface ResetRequestBody {
  email: string;
}

interface ResetPasswordBody {
  token: string;
  newPassword: string;
}

export function registerEmailAuthRoutes(app: Express) {
  /**
   * POST /api/auth/register - Registrierung mit E-Mail/Passwort
   */
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName, tenantId }: RegisterBody = req.body;

      // Validierung
      if (!email || !password || !firstName || !lastName) {
        res.status(400).json({ error: "Alle Felder sind erforderlich" });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({ error: "Passwort muss mindestens 8 Zeichen lang sein" });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(500).json({ error: "Database not available" });
        return;
      }

      // Prüfe ob E-Mail bereits existiert
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser) {
        res.status(409).json({ error: "E-Mail-Adresse ist bereits registriert" });
        return;
      }

      // Hash Passwort
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Erstelle User
      // ✅ FIX: openId = email für E-Mail/Passwort Auth (damit getUserByOpenId funktioniert)
      const [result] = await db.insert(users).values({
        email,
        openId: email, // ← WICHTIG: openId = email für E-Mail Auth
        passwordHash,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        loginMethod: "email",
        role: "user",
        tenantId: tenantId || null,
        isActive: true,
      });

      // Erstelle Session-Token (verwende E-Mail als Identifier)
      const sessionToken = await sdk.createSessionToken(email, {
        name: `${firstName} ${lastName}`,
        expiresInMs: ONE_YEAR_MS,
      });

      // Setze Cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        success: true,
        user: {
          id: result.insertId,
          email,
          name: `${firstName} ${lastName}`,
          role: "user",
        },
      });
    } catch (error) {
      console.error("[EmailAuth] Registration failed:", error);
      res.status(500).json({ 
        error: "Registrierung fehlgeschlagen",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * POST /api/auth/login - Login mit E-Mail/Passwort
   */
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password }: LoginBody = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "E-Mail und Passwort sind erforderlich" });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(500).json({ error: "Database not available" });
        return;
      }

      // Finde User
      const [user] = await db
        .select()
        .from(users)
        .where(and(
          eq(users.email, email),
          eq(users.loginMethod, "email")
        ))
        .limit(1);

      if (!user || !user.passwordHash) {
        res.status(401).json({ error: "Ungültige E-Mail-Adresse oder Passwort" });
        return;
      }

      // Prüfe Passwort
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        res.status(401).json({ error: "Ungültige E-Mail-Adresse oder Passwort" });
        return;
      }

      // Prüfe ob User aktiv ist
      if (!user.isActive) {
        res.status(403).json({ error: "Ihr Konto wurde deaktiviert" });
        return;
      }

      // Update lastSignedIn
      await db.update(users)
        .set({ lastSignedIn: new Date() })
        .where(eq(users.id, user.id));

      // Erstelle Session-Token
      const sessionToken = await sdk.createSessionToken(email, {
        name: user.name || email,
        expiresInMs: ONE_YEAR_MS,
      });

      // Setze Cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[EmailAuth] Login failed:", error);
      res.status(500).json({ 
        error: "Login fehlgeschlagen",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * POST /api/auth/request-reset - Passwort-Reset anfordern
   */
  app.post("/api/auth/request-reset", async (req: Request, res: Response) => {
    try {
      const { email }: ResetRequestBody = req.body;

      if (!email) {
        res.status(400).json({ error: "E-Mail ist erforderlich" });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(500).json({ error: "Database not available" });
        return;
      }

      // Finde User
      const [user] = await db
        .select()
        .from(users)
        .where(and(
          eq(users.email, email),
          eq(users.loginMethod, "email")
        ))
        .limit(1);

      // Aus Sicherheitsgründen immer success zurückgeben
      if (!user) {
        res.json({
          success: true,
          message: "Wenn ein Konto existiert, wurde eine E-Mail gesendet.",
        });
        return;
      }

      // Generiere Reset-Token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 Stunde

      // Speichere Token
      await db.update(users)
        .set({
          resetToken,
          resetTokenExpiry,
        })
        .where(eq(users.id, user.id));

      // E-Mail senden
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        const resetLink = `https://app.foerderpilot.io/reset-password/${resetToken}`;
        
        await resend.emails.send({
          from: "FörderPilot <noreply@app.foerderpilot.io>",
          to: email,
          subject: "Passwort zurücksetzen - FörderPilot",
          html: `
            <h2>Passwort zurücksetzen</h2>
            <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt.</p>
            <p><a href="${resetLink}">Klicken Sie hier, um Ihr Passwort zurückzusetzen</a></p>
            <p>Dieser Link ist nur 1 Stunde gültig.</p>
            <p>Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.</p>
          `,
        });
        
        console.log(`[PASSWORD RESET] E-Mail gesendet an ${email}`);
      } catch (emailError) {
        console.error("[PASSWORD RESET] E-Mail-Versand fehlgeschlagen:", emailError);
        // Fehler nicht an User weitergeben aus Sicherheitsgründen
      }

      res.json({
        success: true,
        message: "Wenn ein Konto existiert, wurde eine E-Mail gesendet.",
        // Nur für Development
        ...(process.env.NODE_ENV === "development" && { resetToken }),
      });
    } catch (error) {
      console.error("[EmailAuth] Reset request failed:", error);
      res.status(500).json({ error: "Anfrage fehlgeschlagen" });
    }
  });

  /**
   * POST /api/auth/reset-password - Passwort zurücksetzen
   */
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, newPassword }: ResetPasswordBody = req.body;

      if (!token || !newPassword) {
        res.status(400).json({ error: "Token und neues Passwort sind erforderlich" });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({ error: "Passwort muss mindestens 8 Zeichen lang sein" });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(500).json({ error: "Database not available" });
        return;
      }

      // Finde User mit Token
      const [user] = await db
        .select()
        .from(users)
        .where(and(
          eq(users.resetToken, token),
          eq(users.loginMethod, "email")
        ))
        .limit(1);

      if (!user || !user.resetTokenExpiry) {
        res.status(400).json({ error: "Ungültiger oder abgelaufener Token" });
        return;
      }

      // Prüfe Ablauf
      if (new Date() > user.resetTokenExpiry) {
        res.status(400).json({ error: "Token ist abgelaufen" });
        return;
      }

      // Hash neues Passwort
      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

      // Update Passwort
      await db.update(users)
        .set({
          passwordHash,
          resetToken: null,
          resetTokenExpiry: null,
        })
        .where(eq(users.id, user.id));

      res.json({
        success: true,
        message: "Passwort wurde zurückgesetzt",
      });
    } catch (error) {
      console.error("[EmailAuth] Password reset failed:", error);
      res.status(500).json({ error: "Zurücksetzen fehlgeschlagen" });
    }
  });

  /**
   * POST /api/auth/set-password - Erstes Passwort setzen (nach Registrierung)
   */
  app.post("/api/auth/set-password", async (req: Request, res: Response) => {
    try {
      const { token, newPassword }: ResetPasswordBody = req.body;

      if (!token || !newPassword) {
        res.status(400).json({ error: "Token und neues Passwort sind erforderlich" });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({ error: "Passwort muss mindestens 8 Zeichen lang sein" });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(500).json({ error: "Database not available" });
        return;
      }

      // Finde User mit Token (auch Teilnehmer ohne loginMethod)
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.resetToken, token))
        .limit(1);

      if (!user || !user.resetTokenExpiry) {
        res.status(400).json({ error: "Ungültiger oder abgelaufener Token" });
        return;
      }

      // Prüfe Ablauf
      if (new Date() > user.resetTokenExpiry) {
        res.status(400).json({ error: "Token ist abgelaufen" });
        return;
      }

      // Hash neues Passwort
      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

      // Update Passwort + aktiviere Account
      await db.update(users)
        .set({
          passwordHash,
          loginMethod: "email",
          resetToken: null,
          resetTokenExpiry: null,
        })
        .where(eq(users.id, user.id));

      res.json({
        success: true,
        message: "Passwort wurde gesetzt",
      });
    } catch (error) {
      console.error("[EmailAuth] Set password failed:", error);
      res.status(500).json({ error: "Passwort-Erstellung fehlgeschlagen" });
    }
  });
}
