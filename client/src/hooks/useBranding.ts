/**
 * FOERDERPILOT - BRANDING HOOK
 * 
 * Hook für dynamisches Tenant-Branding:
 * - Primary/Secondary Colors
 * - Logo
 * - Favicon
 * 
 * CSS-Variablen werden automatisch gesetzt
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";

export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  tenantName: string;
}

const DEFAULT_BRANDING: BrandingConfig = {
  primaryColor: "#1E40AF",
  secondaryColor: "#3B82F6",
  logoUrl: null,
  faviconUrl: null,
  tenantName: "FörderPilot",
};

/**
 * Konvertiert Hex-Farbe zu HSL
 * Benötigt für CSS-Variablen in Tailwind
 */
function hexToHSL(hex: string): string {
  // Entferne # falls vorhanden
  hex = hex.replace("#", "");

  // Konvertiere zu RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  return `${h} ${s}% ${lPercent}%`;
}

/**
 * Setzt CSS-Variablen für Tenant-Branding
 */
function applyBranding(branding: BrandingConfig) {
  const root = document.documentElement;

  // Setze Primary Color
  const primaryHSL = hexToHSL(branding.primaryColor);
  root.style.setProperty("--primary", primaryHSL);

  // Setze Secondary Color (optional, falls benötigt)
  // const secondaryHSL = hexToHSL(branding.secondaryColor);
  // root.style.setProperty("--secondary", secondaryHSL);

  // Setze Favicon
  if (branding.faviconUrl) {
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = branding.faviconUrl;
  }

  // Setze Page Title
  document.title = branding.tenantName;
}

/**
 * Hook für Tenant-Branding
 */
export function useBranding(): BrandingConfig {
  const { tenant } = useAuth();

  const branding: BrandingConfig = tenant
    ? {
        primaryColor: tenant.primaryColor || DEFAULT_BRANDING.primaryColor,
        secondaryColor: tenant.secondaryColor || DEFAULT_BRANDING.secondaryColor,
        logoUrl: tenant.logoUrl || DEFAULT_BRANDING.logoUrl,
        faviconUrl: tenant.faviconUrl || DEFAULT_BRANDING.faviconUrl,
        tenantName: tenant.name || DEFAULT_BRANDING.tenantName,
      }
    : DEFAULT_BRANDING;

  // Wende Branding an
  useEffect(() => {
    applyBranding(branding);
  }, [branding]);

  return branding;
}
