/**
 * FOERDERPILOT - TEILNEHMER DASHBOARD
 * 
 * Dashboard für Teilnehmer mit Kursübersicht, Dokumenten und Profil
 */

import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ParticipantLayout } from "@/components/ParticipantLayout";
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
  LogOut,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { useLocation } from "wouter";

function ParticipantDashboardContent() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { data: debugData } = trpc.participants.debugUserId.useQuery();
  const { data: participantData, isLoading, error } = trpc.participants.getMyData.useQuery();
  
  // Load workflow progress
  const { data: workflowAnswers } = trpc.workflow.getParticipantAnswers.useQuery(
    { participantId: participantData?.id || 0 },
    { enabled: !!participantData?.id }
  );

  // Debug logging
  console.log('[ParticipantDashboard] Debug User ID:', debugData);
  console.log('[ParticipantDashboard] Participant Data:', participantData);
  console.log('[ParticipantDashboard] Error:', error);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!participantData) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-shrink-0">
                <h1 className="text-xl sm:text-2xl font-bold">FörderPilot</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Teilnehmer-Dashboard</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{user?.email}</p>
                </div>
                <Button variant="outline" size="sm" onClick={logout} className="flex-shrink-0">
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Abmelden</span>
                </Button>
              </div>
            </div>
            {/* Mobile: Show user info below header */}
            <div className="sm:hidden mt-3 pt-3 border-t">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground break-all">{user?.email}</p>
            </div>
          </div>
        </header>

        <div className="container py-16">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Noch kein Kurs zugewiesen</CardTitle>
                <CardDescription>
                  Sie sind noch keinem Kurs zugeordnet. Bitte wenden Sie sich an Ihren Bildungsträger, um sich für einen Kurs anzumelden.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Ihre Account-Informationen:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{user?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">E-Mail:</span>
                      <span className="font-medium">{user?.email}</span>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Sobald Sie einem Kurs zugeordnet wurden, sehen Sie hier Ihre Kursdetails, Dokumente und weitere Informationen.
                  </p>
                  <Button variant="outline" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Abmelden
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
        <div className="container py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-shrink-0">
              <h1 className="text-xl sm:text-2xl font-bold">FörderPilot</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Teilnehmer-Dashboard</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{user?.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={logout} className="flex-shrink-0">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Abmelden</span>
              </Button>
            </div>
          </div>
          {/* Mobile: Show user info below header */}
          <div className="sm:hidden mt-3 pt-3 border-t">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground break-all">{user?.email}</p>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid gap-6 lg:grid-cols-3">
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
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>Dokumente</CardTitle>
                  </div>
                  <CardDescription className="mt-1">
                    Ihre Verträge und Bescheinigungen
                  </CardDescription>
                </div>
                <Button onClick={() => navigate("/teilnehmer/documents")} size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Dokumente verwalten
                </Button>
              </div>
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

          {/* Begründung */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <CardTitle>Begründung</CardTitle>
                  </div>
                  <CardDescription className="mt-1">
                    KOMPASS Förderantrag Begründung
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  {workflowAnswers && workflowAnswers.length > 0 && (
                    <Badge variant="secondary" className="text-sm">
                      {workflowAnswers.length} von 5 Fragen beantwortet
                    </Badge>
                  )}
                  <Button 
                    onClick={() => navigate(`/teilnehmer/${participantData.id}/begruendung`)} 
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {workflowAnswers && workflowAnswers.length > 0 ? "Begründung fortsetzen" : "Begründung erstellen"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm mb-1">KI-gestützte Begründung</p>
                      <p className="text-xs text-muted-foreground">
                        Erstellen Sie Ihre KOMPASS-Begründung mit Hilfe unseres intelligenten Assistenten. 
                        Sprechen Sie einfach Ihre Antworten ein oder tippen Sie sie - die KI hilft Ihnen dabei, 
                        professionelle Texte zu formulieren.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-indigo-600" />
                    <span className="text-muted-foreground">5 Fragen zum Kurs und Ihrer beruflichen Situation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-purple-600" />
                    <span className="text-muted-foreground">Voice Recording oder Text-Eingabe möglich</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-pink-600" />
                    <span className="text-muted-foreground">KI generiert professionelle Formulierungen</span>
                  </div>
                  {workflowAnswers && workflowAnswers.length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        ✓ Sie haben bereits {workflowAnswers.length} von 5 Fragen beantwortet
                      </p>
                    </div>
                  )}
                </div>
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


export default function ParticipantDashboard() {
  return (
    <ParticipantLayout>
      <ParticipantDashboardContent />
    </ParticipantLayout>
  );
}
