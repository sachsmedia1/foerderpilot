import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { emailTemplates } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const emailTemplatesRouter = router({
  // GET: Alle Templates für aktuellen Tenant
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    // @ts-ignore - Drizzle ORM type issue
    const templates = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.tenantId, ctx.user.tenantId as any));

    return { success: true, templates };
  }),

  // GET: Einzelnes Template
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      // @ts-ignore - Drizzle ORM type issue
      const [template] = await db
        .select()
        .from(emailTemplates)
        .where(
          and(
            eq(emailTemplates.id, input.id as any),
            eq(emailTemplates.tenantId, ctx.user.tenantId as any)
          )
        );

      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });
      }

      return { success: true, template };
    }),

  // PUT: Template editieren
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        subject: z.string().min(1).max(500),
        bodyHtml: z.string().min(1),
        bodyText: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      // Prüfe ob Template zum Tenant gehört
      // @ts-ignore - Drizzle ORM type issue
      const [existing] = await db
        .select()
        .from(emailTemplates)
        .where(
          and(
            eq(emailTemplates.id, input.id as any),
            eq(emailTemplates.tenantId, ctx.user.tenantId as any)
          )
        );

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found or access denied",
        });
      }

      // Update Template
      await db
        .update(emailTemplates)
        .set({
          subject: input.subject,
          bodyHtml: input.bodyHtml,
          bodyText: input.bodyText,
          updatedAt: new Date(),
        })
        .where(eq(emailTemplates.id, input.id as any));

      return { success: true, message: "Template updated successfully" };
    }),

  // POST: Preview mit Test-Daten generieren
  preview: protectedProcedure
    .input(
      z.object({
        templateType: z.string(),
        subject: z.string(),
        bodyHtml: z.string(),
        testData: z.record(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const testData = input.testData || {
        vorname: "Max",
        nachname: "Mustermann",
        email: "max@example.com",
        kurstitel: "Digitales Marketing",
        starttermin: "15.01.2025",
        kurspreis: "2.500 €",
        foerderbetrag: "2.000 €",
        passwordResetLink: "https://app.foerderpilot.io/reset-password?token=abc123",
      };

      // Platzhalter ersetzen
      let previewSubject = input.subject;
      let previewBodyHtml = input.bodyHtml;

      Object.entries(testData).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        previewSubject = previewSubject.replaceAll(placeholder, value);
        previewBodyHtml = previewBodyHtml.replaceAll(placeholder, value);
      });

      return {
        success: true,
        preview: {
          subject: previewSubject,
          bodyHtml: previewBodyHtml,
        },
      };
    }),
});
