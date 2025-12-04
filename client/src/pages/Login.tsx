/**
 * FOERDERPILOT - LOGIN PAGE
 * 
 * E-Mail/Passwort Login-Seite
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Get tenant branding based on hostname
  const hostname = window.location.hostname;
  const { data: branding } = trpc.public.getLoginBranding.useQuery({ hostname });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login fehlgeschlagen");
        setIsLoading(false);
        return;
      }

      toast.success("Erfolgreich angemeldet!");
      
      // Role-based redirect
      if (data.user?.role === 'admin') {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/teilnehmer";
      }
    } catch (err) {
      setError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            {branding?.logoUrl ? (
              <img 
                src={branding.logoUrl} 
                alt={branding.companyName || 'Logo'} 
                className="h-16 max-w-[200px] object-contain"
              />
            ) : (
              <img 
                src="/logo.png" 
                alt="FörderPilot" 
                className="h-20 max-w-[240px] object-contain"
              />
            )}
          </div>
          <CardTitle className="text-2xl text-center">
            {branding ? `Willkommen bei ${branding.companyName}` : 'Willkommen zurück'}
          </CardTitle>
          <CardDescription className="text-center">
            Melden Sie sich mit Ihrer E-Mail-Adresse an
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ihre.email@beispiel.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                className="px-0 text-sm"
                onClick={() => navigate("/forgot-password")}
              >
                Passwort vergessen?
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Anmelden..." : "Anmelden"}
            </Button>

            <div className="text-sm text-center text-muted-foreground">
              Noch kein Konto?{" "}
              <Button
                type="button"
                variant="link"
                className="px-0"
                onClick={() => navigate("/register")}
              >
                Jetzt registrieren
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
