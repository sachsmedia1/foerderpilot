import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { Resend } from "resend";
import { readFileSync } from "fs";
import { join } from "path";

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function to load email templates
function loadTemplate(templateName: string, type: "html" | "txt"): string {
  const templatePath = join(__dirname, "../emails", `${templateName}.${type}`);
  try {
    return readFileSync(templatePath, "utf-8");
  } catch (error) {
    console.error(`Failed to load template: ${templatePath}`, error);
    return "";
  }
}

// Helper function to replace placeholders in templates
function replacePlaceholders(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
  }
  return result;
}

export const emailRouter = router({
  /**
   * Send password reset email
   */
  sendPasswordReset: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const resetLink = `https://app.foerderpilot.io/reset-password/${input.token}`;

      const htmlTemplate = loadTemplate("password-reset", "html");
      const textTemplate = loadTemplate("password-reset", "txt");

      const html = replacePlaceholders(htmlTemplate, {
        resetLink,
        email: input.email,
      });

      const text = replacePlaceholders(textTemplate, {
        resetLink,
        email: input.email,
      });

      try {
        const result = await resend.emails.send({
          from: "FörderPilot <noreply@app.foerderpilot.io>",
          to: input.email,
          subject: "Passwort zurücksetzen - FörderPilot",
          html,
          text,
        });

        console.log("[EMAIL] Password reset sent:", result);
        return { success: true, messageId: result.data?.id };
      } catch (error) {
        console.error("[EMAIL] Failed to send password reset:", error);
        throw new Error("Failed to send password reset email");
      }
    }),

  /**
   * Send participant registration welcome email
   */
  sendParticipantRegistration: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string(),
        courseName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const htmlTemplate = loadTemplate("participant-registration", "html");
      const textTemplate = loadTemplate("participant-registration", "txt");

      const html = replacePlaceholders(htmlTemplate, {
        name: input.name,
        courseName: input.courseName || "Ihr Kurs",
        loginLink: "https://app.foerderpilot.io/login",
      });

      const text = replacePlaceholders(textTemplate, {
        name: input.name,
        courseName: input.courseName || "Ihr Kurs",
        loginLink: "https://app.foerderpilot.io/login",
      });

      try {
        const result = await resend.emails.send({
          from: "FörderPilot <noreply@app.foerderpilot.io>",
          to: input.email,
          subject: "Willkommen bei FörderPilot!",
          html,
          text,
        });

        console.log("[EMAIL] Participant registration sent:", result);
        return { success: true, messageId: result.data?.id };
      } catch (error) {
        console.error("[EMAIL] Failed to send participant registration:", error);
        throw new Error("Failed to send participant registration email");
      }
    }),

  /**
   * Send document validation result email
   */
  sendDocumentValidation: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string(),
        documentType: z.string(),
        status: z.enum(["valid", "invalid", "manual_review"]),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const htmlTemplate = loadTemplate("document-validation", "html");
      const textTemplate = loadTemplate("document-validation", "txt");

      const statusText =
        input.status === "valid"
          ? "✅ Genehmigt"
          : input.status === "invalid"
          ? "❌ Abgelehnt"
          : "⏳ Manuelle Prüfung";

      const html = replacePlaceholders(htmlTemplate, {
        name: input.name,
        documentType: input.documentType,
        status: statusText,
        reason: input.reason || "Keine weiteren Informationen",
        dashboardLink: "https://app.foerderpilot.io/documents",
      });

      const text = replacePlaceholders(textTemplate, {
        name: input.name,
        documentType: input.documentType,
        status: statusText,
        reason: input.reason || "Keine weiteren Informationen",
        dashboardLink: "https://app.foerderpilot.io/documents",
      });

      try {
        const result = await resend.emails.send({
          from: "FörderPilot <noreply@app.foerderpilot.io>",
          to: input.email,
          subject: `Dokument-Validierung: ${input.documentType}`,
          html,
          text,
        });

        console.log("[EMAIL] Document validation sent:", result);
        return { success: true, messageId: result.data?.id };
      } catch (error) {
        console.error("[EMAIL] Failed to send document validation:", error);
        throw new Error("Failed to send document validation email");
      }
    }),
});
