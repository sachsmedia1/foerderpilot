/**
 * FOERDERPILOT - TENANT MIDDLEWARE
 * 
 * Multi-Tenancy-Middleware für die Erkennung von Tenants via:
 * - Subdomain (z.B. demo.foerderpilot.io)
 * - Custom Domain (z.B. www.bildungstraeger.de)
 * 
 * Der erkannte Tenant wird in den tRPC-Context eingefügt und ist
 * in allen Procedures verfügbar.
 */

import type { Request } from 'express';
import { getTenantBySubdomain, getTenantByCustomDomain } from '../db';
import type { Tenant } from '../../drizzle/schema';

export interface TenantInfo {
  tenant: Tenant | null;
  isSuperAdminRoute: boolean;
}

/**
 * Extrahiert die Subdomain aus dem Host-Header
 * 
 * Beispiele:
 * - demo.foerderpilot.io → demo
 * - localhost:3000 → localhost
 * - foerderpilot.io → foerderpilot
 */
function extractSubdomain(host: string): string {
  // Entferne Port falls vorhanden
  const hostWithoutPort = host.split(':')[0] || host;
  
  // Splitte nach Punkten
  const parts = hostWithoutPort.split('.');
  
  // Wenn nur ein Teil (z.B. localhost), gib diesen zurück
  if (parts.length === 1) {
    return parts[0] || '';
  }
  
  // Wenn zwei Teile (z.B. foerderpilot.io), gib ersten Teil zurück
  if (parts.length === 2) {
    return parts[0] || '';
  }
  
  // Wenn drei oder mehr Teile (z.B. demo.foerderpilot.io), gib ersten Teil zurück
  return parts[0] || '';
}

/**
 * Prüft ob die Route eine Super Admin Route ist
 * 
 * Super Admin Routen:
 * - /api/superadmin/*
 * - /superadmin/*
 */
function isSuperAdminRoute(path: string): boolean {
  return path.startsWith('/api/superadmin') || path.startsWith('/superadmin');
}

/**
 * Erkennt den Tenant basierend auf dem Request
 * 
 * Reihenfolge:
 * 1. Prüfe ob Super Admin Route → kein Tenant nötig
 * 2. Prüfe Custom Domain
 * 3. Prüfe Subdomain
 * 4. Fehler wenn kein Tenant gefunden
 */
export async function getTenantFromRequest(req: Request): Promise<TenantInfo> {
  const host = req.headers.host || '';
  const path = req.path || '';
  
  // Super Admin Routen benötigen keinen Tenant
  if (isSuperAdminRoute(path)) {
    return {
      tenant: null,
      isSuperAdminRoute: true,
    };
  }
  
  // 1. Versuche Custom Domain
  let tenant = await getTenantByCustomDomain(host);
  
  // 2. Versuche Subdomain
  if (!tenant) {
    const subdomain = extractSubdomain(host);
    tenant = await getTenantBySubdomain(subdomain);
  }
  
  // 3. Kein Tenant gefunden
  if (!tenant) {
    return {
      tenant: null,
      isSuperAdminRoute: false,
    };
  }
  
  // 4. Prüfe ob Tenant aktiv ist
  if (!tenant.isActive) {
    throw new Error('Tenant is inactive');
  }
  
  return {
    tenant,
    isSuperAdminRoute: false,
  };
}

/**
 * Validiert ob ein User Zugriff auf einen Tenant hat
 */
export function validateTenantAccess(
  userTenantId: number | null,
  requestedTenantId: number | null,
  userRole: string
): boolean {
  // Super Admin hat Zugriff auf alle Tenants
  if (userRole === 'super_admin') {
    return true;
  }
  
  // KOMPASS Reviewer hat Read-Only Zugriff auf alle Tenants
  if (userRole === 'kompass_reviewer') {
    return true;
  }
  
  // Andere Rollen müssen zum gleichen Tenant gehören
  return userTenantId === requestedTenantId;
}
