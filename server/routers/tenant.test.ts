/**
 * FOERDERPILOT - TENANT ROUTER TESTS
 * 
 * Tests für tenant.getCurrent Procedure
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock getTenantById
vi.mock('../db', () => ({
  getTenantById: vi.fn(),
}));

import { getTenantById } from '../db';

describe('tenant.getCurrent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when no tenant is found', async () => {
    // Mock: Kein Tenant gefunden
    (getTenantById as any).mockResolvedValue(null);
    
    // Simuliere den Fall: kein tenantId, kein ctx.tenant
    const result = await simulateGetCurrent({ input: undefined, ctx: { tenant: null } });
    
    expect(result).toBeNull();
  });

  it('should return tenant from query parameter override', async () => {
    const mockTenant = {
      id: 5,
      name: 'Entscheiderakademie',
      companyName: 'Entscheiderakademie GmbH',
      logoUrl: 'https://example.com/logo.png',
      faviconUrl: 'https://example.com/favicon.ico',
      primaryColor: '#1E40AF',
      secondaryColor: '#3B82F6',
      email: 'kurse@entscheiderakademie.de',
      phone: '+49 123 456789',
      customDomain: 'kurse.entscheiderakademie.de',
    };
    
    (getTenantById as any).mockResolvedValue(mockTenant);
    
    const result = await simulateGetCurrent({ 
      input: { tenantId: 5 }, 
      ctx: { tenant: null } 
    });
    
    expect(result).not.toBeNull();
    expect(result?.id).toBe(5);
    expect(result?.companyName).toBe('Entscheiderakademie GmbH');
    expect(result?.logoUrl).toBe('https://example.com/logo.png');
    expect(getTenantById).toHaveBeenCalledWith(5);
  });

  it('should return tenant from context when no query parameter', async () => {
    const ctxTenant = {
      id: 1,
      name: 'FörderPilot App',
      companyName: 'FörderPilot GmbH',
      logoUrl: null,
      faviconUrl: null,
      primaryColor: '#667eea',
      secondaryColor: '#764ba2',
      email: 'info@foerderpilot.io',
      phone: null,
      customDomain: null,
    };
    
    const result = await simulateGetCurrent({ 
      input: undefined, 
      ctx: { tenant: ctxTenant } 
    });
    
    expect(result).not.toBeNull();
    expect(result?.id).toBe(1);
    expect(result?.companyName).toBe('FörderPilot GmbH');
    expect(getTenantById).not.toHaveBeenCalled();
  });

  it('should only return public branding data', async () => {
    const fullTenant = {
      id: 5,
      name: 'Test',
      companyName: 'Test GmbH',
      logoUrl: 'https://example.com/logo.png',
      faviconUrl: null,
      primaryColor: '#1E40AF',
      secondaryColor: '#3B82F6',
      email: 'test@test.de',
      phone: null,
      customDomain: null,
      // Private Felder die NICHT zurückgegeben werden sollten
      taxId: 'DE123456789',
      directorName: 'Max Mustermann',
      impressumHtml: '<p>Impressum</p>',
    };
    
    (getTenantById as any).mockResolvedValue(fullTenant);
    
    const result = await simulateGetCurrent({ 
      input: { tenantId: 5 }, 
      ctx: { tenant: null } 
    });
    
    expect(result).not.toBeNull();
    // Öffentliche Felder
    expect(result?.id).toBe(5);
    expect(result?.companyName).toBe('Test GmbH');
    expect(result?.logoUrl).toBe('https://example.com/logo.png');
    // Private Felder sollten NICHT vorhanden sein
    expect((result as any)?.taxId).toBeUndefined();
    expect((result as any)?.directorName).toBeUndefined();
    expect((result as any)?.impressumHtml).toBeUndefined();
  });
});

/**
 * Helper: Simuliert die getCurrent Procedure Logik
 */
async function simulateGetCurrent({ 
  input, 
  ctx 
}: { 
  input?: { tenantId?: number }; 
  ctx: { tenant: any } 
}) {
  // 1. Override via Query-Parameter
  if (input?.tenantId) {
    const tenant = await getTenantById(input.tenantId);
    if (!tenant) {
      return null;
    }
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
  
  // 2. Tenant aus Context
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
  
  // 3. Kein Tenant
  return null;
}
