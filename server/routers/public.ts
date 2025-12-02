/**
 * FOERDERPILOT - PUBLIC ROUTER
 * 
 * tRPC Router für öffentliche Endpoints (ohne Authentifizierung):
 * - Login-Branding (Tenant-Logo/Farben bei Custom Domain)
 * - Tenant-Lookup via Custom Domain
 */

import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';
import { getTenantByCustomDomain } from '../db';

export const publicRouter = router({
  /**
   * Get Tenant Branding für Login-Seite
   * 
   * Wird aufgerufen wenn:
   * 1. User besucht Custom Domain (z.B. bildung-muenchen.de)
   * 2. Login-Seite soll Tenant-Branding anzeigen (Logo, Farben)
   * 
   * Returns:
   * - null: Kein Tenant gefunden (Standard FörderPilot Branding)
   * - Tenant: Tenant-Daten (Logo, Farben, Name)
   */
  getLoginBranding: publicProcedure
    .input(z.object({
      hostname: z.string(), // z.B. "bildung-muenchen.de" oder "app.foerderpilot.io"
    }))
    .query(async ({ input }) => {
      // Hauptdomain → kein Tenant-Branding
      if (input.hostname === 'app.foerderpilot.io' || 
          input.hostname === 'localhost' ||
          input.hostname.includes('manusvm.computer')) {
        return null;
      }

      // Custom Domain → Tenant-Lookup
      const tenant = await getTenantByCustomDomain(input.hostname);
      
      if (!tenant) {
        return null;
      }

      // Return nur Branding-Daten (keine sensiblen Infos)
      return {
        id: tenant.id,
        companyName: tenant.companyName,
        logoUrl: tenant.logoUrl,
        faviconUrl: tenant.faviconUrl,
        primaryColor: tenant.primaryColor,
        secondaryColor: tenant.secondaryColor,
      };
    }),
});
