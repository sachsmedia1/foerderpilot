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
  isMaintenanceMode: boolean;
}

/**
 * Prüft ob die Domain die Root-Domain ist (foerderpilot.io)
 * 
 * Beispiele:
 * - foerderpilot.io → true
 * - app.foerderpilot.io → false
 * - demo.foerderpilot.io → false
 * - localhost:3000 → false
 */
function isRootDomain(host: string): boolean {
  const hostWithoutPort = host.split(':')[0] || host;
  return hostWithoutPort === 'foerderpilot.io';
}

/**
 * Extrahiert die Subdomain aus dem Host-Header
 * 
 * Beispiele:
 * - demo.foerderpilot.io → demo
 * - app.foerderpilot.io → app
 * - localhost:3000 → localhost
 * - foerderpilot.io → null (Root-Domain hat keine Subdomain)
 */
function extractSubdomain(host: string): string | null {
  // Entferne Port falls vorhanden
  const hostWithoutPort = host.split(':')[0] || host;
  
  // Splitte nach Punkten
  const parts = hostWithoutPort.split('.');
  
  // Wenn nur ein Teil (z.B. localhost), gib diesen zurück
  if (parts.length === 1) {
    return parts[0] || null;
  }
  
  // Wenn zwei Teile (z.B. foerderpilot.io), keine Subdomain
  if (parts.length === 2) {
    return null;
  }
  
  // Wenn drei oder mehr Teile (z.B. demo.foerderpilot.io), gib ersten Teil zurück
  return parts[0] || null;
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
 * 1. Prüfe ob Root-Domain (foerderpilot.io) → Wartungsmodus
 * 2. Prüfe ob Super Admin Route → kein Tenant nötig
 * 3. Prüfe Custom Domain
 * 4. Prüfe Subdomain
 * 5. Fehler wenn kein Tenant gefunden
 */
export async function getTenantFromRequest(req: Request): Promise<TenantInfo> {
  const host = req.headers.host || '';
  const path = req.path || '';
  
  console.log('[TenantMiddleware] Request:', { host, path });
  
  // 1. Root-Domain zeigt Wartungsseite
  if (isRootDomain(host)) {
    console.log('[TenantMiddleware] Root domain detected, returning maintenance mode');
    return {
      tenant: null,
      isSuperAdminRoute: false,
      isMaintenanceMode: true,
    };
  }
  
  // 2. Super Admin Routen benötigen keinen Tenant
  if (isSuperAdminRoute(path)) {
    console.log('[TenantMiddleware] Super admin route detected');
    return {
      tenant: null,
      isSuperAdminRoute: true,
      isMaintenanceMode: false,
    };
  }
  
  // 3. Versuche Custom Domain
  console.log('[TenantMiddleware] Trying custom domain lookup for:', host);
  let tenant = await getTenantByCustomDomain(host);
  if (tenant) {
    console.log('[TenantMiddleware] Tenant found via custom domain:', tenant.id, tenant.name);
  }
  
  // 4. Versuche Subdomain
  if (!tenant) {
    const subdomain = extractSubdomain(host);
    console.log('[TenantMiddleware] Extracted subdomain:', subdomain);
    if (subdomain) {
      tenant = await getTenantBySubdomain(subdomain);
      if (tenant) {
        console.log('[TenantMiddleware] Tenant found via subdomain:', tenant.id, tenant.name);
      } else {
        console.log('[TenantMiddleware] No tenant found for subdomain:', subdomain);
      }
    }
  }
  
  // 5. Fallback für Entwicklung (localhost + Manus Cloud) → "app" Tenant
  if (!tenant && (host.includes('localhost') || host.includes('127.0.0.1') || host.includes('manus.space') || host.includes('manusvm.computer'))) {
    console.log('[TenantMiddleware] Development fallback: using "app" tenant for host:', host);
    tenant = await getTenantBySubdomain('app');
    console.log('[TenantMiddleware] Tenant after fallback:', tenant ? `ID=${tenant.id}, name=${tenant.name}` : 'null');
  }
  
  // 6. Kein Tenant gefunden
  if (!tenant) {
    console.log('[TenantMiddleware] No tenant found for host:', host);
    return {
      tenant: null,
      isSuperAdminRoute: false,
      isMaintenanceMode: false,
    };
  }
  
  // 6. Prüfe ob Tenant aktiv ist
  if (!tenant.isActive) {
    throw new Error('Tenant is inactive');
  }
  
  return {
    tenant,
    isSuperAdminRoute: false,
    isMaintenanceMode: false,
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
