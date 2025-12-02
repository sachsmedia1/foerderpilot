/**
 * FOERDERPILOT - ROW-LEVEL-SECURITY (RLS)
 * 
 * Zentrale Validierungs-Funktionen für Cross-Tenant-Data-Leakage-Schutz
 * 
 * Verwendung:
 * - validateTenantAccess: Prüft ob User Zugriff auf Tenant hat (in list-Procedures)
 * - validateResourceOwnership: Prüft ob Ressource zum aktuellen Tenant gehört (in getById/update/delete)
 */

import { TRPCError } from '@trpc/server';
import type { TrpcContext } from './context';

/**
 * Validate that user belongs to tenant
 * 
 * @param ctx - tRPC Context
 * @param requiredTenantId - Tenant ID die benötigt wird
 * @throws TRPCError - FORBIDDEN wenn kein Tenant-Context oder Tenant-Mismatch
 */
export function validateTenantAccess(ctx: TrpcContext, requiredTenantId: number) {
  if (!ctx.tenant) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });
  }
  
  // Super Admins können alle Tenants sehen
  if (ctx.user?.role === 'super_admin') return;
  
  if (ctx.tenant.id !== requiredTenantId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Tenant access denied' });
  }
}

/**
 * Validate that resource belongs to current tenant
 * 
 * @param ctx - tRPC Context
 * @param resourceTenantId - Tenant ID der Ressource
 * @param resourceName - Name der Ressource (für Fehlermeldung)
 * @throws TRPCError - FORBIDDEN wenn kein Tenant-Context oder Tenant-Mismatch
 */
export function validateResourceOwnership(
  ctx: TrpcContext,
  resourceTenantId: number | undefined,
  resourceName: string
) {
  if (!ctx.tenant) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });
  }
  
  if (!resourceTenantId) {
    throw new TRPCError({ code: 'NOT_FOUND', message: `${resourceName} not found` });
  }
  
  // Super Admins können alle Ressourcen sehen
  if (ctx.user?.role === 'super_admin') return;
  
  if (ctx.tenant.id !== resourceTenantId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: `Access to ${resourceName} denied` });
  }
}
