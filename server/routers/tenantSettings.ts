/**
 * FOERDERPILOT - TENANT SETTINGS ROUTER
 * 
 * Verwaltung von Mandanten-Einstellungen (Stammdaten, Branding, Custom Domain)
 */

import { router, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { tenants } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const tenantSettingsRouter = router({
  /**
   * GET /tenantSettings.get - Aktuelle Tenant-Einstellungen abrufen
   */
  get: adminProcedure.query(async ({ ctx }) => {
    if (!ctx.tenant) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Tenant not found" });
    }

    return ctx.tenant;
  }),

  /**
   * PUT /tenantSettings.updateCompanyData - Stammdaten aktualisieren
   */
  updateCompanyData: adminProcedure
    .input(
      z.object({
        companyName: z.string().optional(),
        taxId: z.string().optional(),
        street: z.string().optional(),
        zipCode: z.string().optional(),
        city: z.string().optional(),
        email: z.string().email("Ungültige E-Mail").optional(),
        phone: z.string().optional(),
        directorName: z.string().optional(),
        impressumHtml: z.string().optional(),
        privacyPolicyUrl: z.string().url("Ungültige URL").optional().or(z.literal("")),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tenant not found" });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      await db
        .update(tenants)
        .set({
          companyName: input.companyName,
          taxId: input.taxId,
          street: input.street,
          zipCode: input.zipCode,
          city: input.city,
          email: input.email,
          phone: input.phone,
          directorName: input.directorName,
          impressumHtml: input.impressumHtml,
          privacyPolicyUrl: input.privacyPolicyUrl || null,
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, ctx.tenant.id));

      return { success: true, message: "Stammdaten erfolgreich aktualisiert" };
    }),

  /**
   * PUT /tenantSettings.updateBranding - Branding aktualisieren
   */
  updateBranding: adminProcedure
    .input(
      z.object({
        logoUrl: z.string().url("Ungültige Logo-URL").optional().or(z.literal("")),
        faviconUrl: z.string().url("Ungültige Favicon-URL").optional().or(z.literal("")),
        primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Ungültiger Hex-Farbcode").optional(),
        secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Ungültiger Hex-Farbcode").optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tenant not found" });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      await db
        .update(tenants)
        .set({
          logoUrl: input.logoUrl || null,
          faviconUrl: input.faviconUrl || null,
          primaryColor: input.primaryColor || ctx.tenant.primaryColor,
          secondaryColor: input.secondaryColor || ctx.tenant.secondaryColor,
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, ctx.tenant.id));

      return { success: true, message: "Branding erfolgreich aktualisiert" };
    }),

  /**
   * PUT /tenantSettings.updateCertification - Zertifizierung aktualisieren
   */
  updateCertification: adminProcedure
    .input(
      z.object({
        certificationType: z.enum(["AZAV", "ISO9001", "custom"]).optional().or(z.literal("")),
        certificationFileUrl: z.string().url("Ungültige URL").optional().or(z.literal("")),
        certificationValidUntil: z.string().optional().or(z.literal("")), // ISO date string
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tenant not found" });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      // Parse date if provided
      let validUntil: Date | null = null;
      if (input.certificationValidUntil && input.certificationValidUntil.trim() !== "") {
        validUntil = new Date(input.certificationValidUntil);
        if (isNaN(validUntil.getTime())) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Ungültiges Datum" });
        }
      }

      await db
        .update(tenants)
        .set({
          certificationType: input.certificationType || null,
          certificationFileUrl: input.certificationFileUrl || null,
          certificationValidUntil: validUntil,
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, ctx.tenant.id));

      return { success: true, message: "Zertifizierung erfolgreich aktualisiert" };
    }),

  /**
   * PUT /tenantSettings.updateCustomDomain - Custom Domain aktualisieren
   */
  updateCustomDomain: adminProcedure
    .input(
      z.object({
        customDomain: z.string().optional().or(z.literal("")),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tenant not found" });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      // Validierung: Custom Domain darf nicht leer sein wenn gesetzt
      if (input.customDomain && input.customDomain.trim() === "") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Custom Domain darf nicht leer sein" });
      }

      // Validierung: Custom Domain Format
      if (input.customDomain) {
        const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
        if (!domainRegex.test(input.customDomain)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Ungültiges Domain-Format" });
        }
      }

      await db
        .update(tenants)
        .set({
          customDomain: input.customDomain || null,
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, ctx.tenant.id));

      return { success: true, message: "Custom Domain erfolgreich aktualisiert" };
    }),
});
