/**
 * FOERDERPILOT - useTenant Hook
 * 
 * Hook zum Laden des aktuellen Tenants für Branding im RegisterFunnel
 * 
 * 3 Wege, wie Tenant erkannt wird:
 * 1. Custom Domain (automatisch via Middleware)
 * 2. Query-Parameter ?tenant=5
 * 3. User-Session (eingeloggt)
 */

import { trpc } from '@/lib/trpc';
import { useEffect, useState } from 'react';

export function useTenant(initialTenantId?: number) {
  // Lese Query-Parameter synchron beim ersten Render
  const getInitialTenantId = () => {
    if (initialTenantId) return initialTenantId;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tenantParam = params.get('tenant');
      if (tenantParam) {
        const parsedId = parseInt(tenantParam);
        if (!isNaN(parsedId)) return parsedId;
      }
    }
    return null;
  };
  
  const [tenantIdOverride, setTenantIdOverride] = useState<number | null>(getInitialTenantId);
  
  // Update wenn sich initialTenantId ändert
  useEffect(() => {
    if (initialTenantId && initialTenantId !== tenantIdOverride) {
      setTenantIdOverride(initialTenantId);
    }
  }, [initialTenantId]);
  
  // Lade Tenant (entweder via Override oder via Context)
  const { data: tenant, isLoading, error } = trpc.tenant.getCurrent.useQuery(
    { tenantId: tenantIdOverride ?? undefined },
    { 
      enabled: true,
      staleTime: 5 * 60 * 1000, // 5 Minuten cachen
      retry: 1,
    }
  );
  
  // Debug logging
  useEffect(() => {
    console.log('[useTenant] State:', { initialTenantId, tenantIdOverride, tenant });
  }, [initialTenantId, tenantIdOverride, tenant]);
  
  return {
    tenant,
    isLoading,
    error,
    tenantId: tenant?.id || tenantIdOverride,
    
    // Branding-Werte mit Fallbacks
    name: tenant?.name || 'FörderPilot',
    companyName: tenant?.companyName || 'FörderPilot',
    logoUrl: tenant?.logoUrl || null,
    faviconUrl: tenant?.faviconUrl || null,
    primaryColor: tenant?.primaryColor || '#667eea',
    secondaryColor: tenant?.secondaryColor || '#764ba2',
    email: tenant?.email || 'info@foerderpilot.io',
    phone: tenant?.phone || null,
    
    // Helper: Tenant setzen via Query-Parameter
    setTenantId: setTenantIdOverride,
  };
}
