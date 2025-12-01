/**
 * FOERDERPILOT - ROOT REDIRECT
 * 
 * Redirect root (/) to login or admin based on auth status
 */

import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function RootRedirect() {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (user) {
      // Authentifizierter User → Dashboard
      navigate("/dashboard");
    } else {
      // Nicht authentifiziert → Login
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Zeige Loading während Redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Weiterleitung...</p>
      </div>
    </div>
  );
}
