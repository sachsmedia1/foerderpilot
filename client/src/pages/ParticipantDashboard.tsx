/**
 * FOERDERPILOT - TEILNEHMER DASHBOARD
 * 
 * Dashboard für Teilnehmer mit Kursübersicht, Dokumenten und Profil
 */

import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Download,
  LogOut
} from "lucide-react";
import { useLocation } from "wouter";

export default function ParticipantDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { data: participantData, isLoading } = trpc.participants.getMyData.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!participantData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Keine Teilnehmerdaten gefunden</CardTitle>
            <CardDescription>
              Es konnten keine Teilnehmerdaten für Ihren Account gefunden werden.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    anmeldung_eingegangen: "Anmeldung eingegangen",
    dokumente_ausstehend: "Dokumente ausstehend",
    dokumente_eingereicht: "Dokumente eingereicht",
    dokumente_genehmigt: "Dokumente genehmigt",
    dokumente_abgelehnt: "Dokumente abgelehnt",
    eingeschrieben: "Eingeschrieben",
    abgeschlossen: "Abgeschlossen",
    abgebrochen: "Abgebrochen",
  };

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    anmeldung_eingegangen: "secondary",
    dokumente_ausstehend: "outline",
    dokumente_eingereicht: "secondary",
    dokumente_genehmigt: "default",
    dokumente_abgelehnt: "destructive",
    eingeschrieben: "default",
    abgeschlossen: "default",
    abgebrochen: "destructive",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">FörderPilot</h1>
            <p className="text-sm text-muted-foreground">Teilnehmer-Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Kursübersicht */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle>Mein Kurs</CardTitle>
                </div>
                <Badge variant={statusColors[participantData.status || ""] || "default"}>
                  {statusLabels[participantData.status || ""] || participantData.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{participantData.courseName || "Kein Kurs zugewiesen"}</h3>
                {participantData.courseDescription && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {participantData.courseDescription}
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Angemeldet am:</span>
                  <span className="font-medium">
                    {participantData.createdAt 
                      ? new Date(participantData.createdAt).toLocaleDateString("de-DE")
                      : "N/A"}
                  </span>
                </div>
                {participantData.coursePriceNet && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Kurspreis:</span>
                    <span className="font-medium">
                      €{(participantData.coursePriceNet / 100).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dokumente */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Dokumente</CardTitle>
              </div>
              <CardDescription>
                Ihre Verträge und Bescheinigungen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Vorvertrag</p>
                    <p className="text-xs text-muted-foreground">Ihre Anmeldungsbestätigung</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>

              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground text-center">
                  Weitere Dokumente werden hier angezeigt, sobald verfügbar
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Profil */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Mein Profil</CardTitle>
              </div>
              <CardDescription>
                Ihre persönlichen Daten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">
                        {participantData.firstName} {participantData.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">E-Mail</p>
                      <p className="font-medium">{participantData.email}</p>
                    </div>
                  </div>

                  {participantData.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Telefon</p>
                        <p className="font-medium">{participantData.phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {(participantData.street || participantData.city) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Adresse</p>
                        <div className="font-medium">
                          {participantData.street && <p>{participantData.street}</p>}
                          {(participantData.zipCode || participantData.city) && (
                            <p>
                              {participantData.zipCode} {participantData.city}
                            </p>
                          )}
                          {participantData.country && <p>{participantData.country}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-end">
                <Button variant="outline" disabled>
                  Profil bearbeiten (Demnächst verfügbar)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
