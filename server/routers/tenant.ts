/**
 * FOERDERPILOT - TENANT ROUTER
 * 
 * Öffentliche Routen für Tenant-Informationen
 * (für Branding in RegisterFunnel)
 */

import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getTenantById } from "../db";

export const tenantRouter = router({
  /**
   * Aktuellen Tenant abrufen
   * 
   * 3 Quellen (Priorität):
   * 1. Query-Parameter ?tenant=5 (input.tenantId)
   * 2. Custom Domain (ctx.tenant via Middleware)
   * 3. User-Session (ctx.tenant via user.tenantId)
   */
  getCurrent: publicProcedure
    .input(
      z.object({
        tenantId: z.number().optional(), // Query-Parameter Override
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      // 1. Override via Query-Parameter
      if (input?.tenantId) {
        const tenant = await getTenantById(input.tenantId);
        if (!tenant) {
          // Fallback auf Default-Tenant statt Error
          return null;
        }
        // Nur öffentliche Branding-Daten zurückgeben
        return {
          id: tenant.id,
          name: tenant.name,
          companyName: tenant.companyName,
          logoUrl: tenant.logoUrl,
          faviconUrl: tenant.faviconUrl,
          primaryColor: tenant.primaryColor,
          secondaryColor: tenant.secondaryColor,
          email: tenant.email,
          phone: tenant.phone,
          customDomain: tenant.customDomain,
        };
      }
      
      // 2. Tenant aus Context (Custom Domain oder User-Session)
      if (ctx.tenant) {
        return {
          id: ctx.tenant.id,
          name: ctx.tenant.name,
          companyName: ctx.tenant.companyName,
          logoUrl: ctx.tenant.logoUrl,
          faviconUrl: ctx.tenant.faviconUrl,
          primaryColor: ctx.tenant.primaryColor,
          secondaryColor: ctx.tenant.secondaryColor,
          email: ctx.tenant.email,
          phone: ctx.tenant.phone,
          customDomain: ctx.tenant.customDomain,
        };
      }
      
      // 3. Kein Tenant gefunden (OK für öffentliche Seiten)
      return null;
    }),
});
