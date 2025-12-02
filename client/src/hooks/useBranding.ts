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
  primaryColor: "#6366F1", // Indigo-500 - heller und besser sichtbar
  secondaryColor: "#818CF8", // Indigo-400
  logoUrl: null,
  faviconUrl: null,
  tenantName: "FörderPilot",
};

/**
 * Konvertiert Hex-Farbe zu OKLCH
 * Benötigt für CSS-Variablen in Tailwind 4
 * 
 * Vereinfachte Konvertierung: Hex -> sRGB -> Linear RGB -> OKLCH
 * Für präzise Konvertierung wäre eine Bibliothek wie culori empfohlen,
 * aber diese Näherung funktioniert für die meisten Fälle.
 */
function hexToOKLCH(hex: string): string {
  // Entferne # falls vorhanden
  hex = hex.replace("#", "");

  // Konvertiere zu RGB (0-1 Range)
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Vereinfachte OKLCH-Approximation
  // Lightness (L): Durchschnitt der RGB-Werte
  const l = (r + g + b) / 3;

  // Chroma (C): Differenz zwischen max und min RGB
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const c = (max - min) * 0.4; // Skalierungsfaktor für OKLCH

  // Hue (H): Berechnung basierend auf dominanter Farbe
  let h = 0;
  if (max !== min) {
    const d = max - min;
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  // Formatiere als OKLCH-String (L C H)
  return `${l.toFixed(2)} ${c.toFixed(2)} ${Math.round(h)}`;
}

/**
 * Setzt CSS-Variablen für Tenant-Branding
 */
function applyBranding(branding: BrandingConfig) {
  const root = document.documentElement;

  // Setze Primary Color (OKLCH für Tailwind 4)
  const primaryOKLCH = hexToOKLCH(branding.primaryColor);
  root.style.setProperty("--primary", primaryOKLCH);

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
