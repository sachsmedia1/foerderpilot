/**
 * FOERDERPILOT - RESET PASSWORD PAGE
 * 
 * Passwort mit Token zurücksetzen
 */

import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
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
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get("token") || "";

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validierung
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwörter stimmen nicht überein");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Zurücksetzen fehlgeschlagen");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
    } catch (err) {
      setError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Ungültiger Link</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Dieser Reset-Link ist ungültig. Bitte fordern Sie einen neuen an.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/forgot-password")}
            >
              Neuen Link anfordern
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Passwort zurückgesetzt</CardTitle>
            <CardDescription className="text-center">
              Ihr Passwort wurde erfolgreich geändert
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription className="text-center">
                Sie können sich jetzt mit Ihrem neuen Passwort anmelden.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => navigate("/login")}
            >
              Zur Anmeldung
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Neues Passwort</CardTitle>
          <CardDescription className="text-center">
            Geben Sie Ihr neues Passwort ein
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
              <Label htmlFor="newPassword">Neues Passwort</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Mindestens 8 Zeichen"
                  value={formData.newPassword}
                  onChange={(e) => handleChange("newPassword", e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  minLength={8}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Passwort wiederholen"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Speichern..." : "Passwort ändern"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
