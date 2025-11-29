/**
 * FOERDERPILOT - BRANDING PROVIDER
 * 
 * Provider-Component für globales Tenant-Branding
 * Wird in App.tsx eingebunden
 */

import { useBranding } from "@/hooks/useBranding";
import type { ReactNode } from "react";

interface BrandingProviderProps {
  children: ReactNode;
}

export function BrandingProvider({ children }: BrandingProviderProps) {
  // Hook wird aufgerufen, um Branding anzuwenden
  useBranding();

  // Provider rendert nur Children
  return <>{children}</>;
}
