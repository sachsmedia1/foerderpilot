/**
 * FOERDERPILOT - WARTUNGSSEITE
 * 
 * Wird angezeigt auf der Root-Domain (foerderpilot.io)
 * während die App auf app.foerderpilot.io läuft
 */

import { Building2, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl mb-2">FörderPilot</CardTitle>
          <CardDescription className="text-lg">
            KOMPASS Förderantrag Management System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">
              Wir bereiten etwas Großartiges vor
            </h2>
            <p className="text-muted-foreground">
              Unsere Plattform befindet sich aktuell in der Entwicklung. 
              Wir arbeiten daran, Bildungsträgern die Automatisierung von 
              Förderanträgen im KOMPASS-Programm zu ermöglichen.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary mb-1">95%+</div>
              <div className="text-sm text-muted-foreground">Completion-Rate</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary mb-1">-90%</div>
              <div className="text-sm text-muted-foreground">Zeitaufwand</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary mb-1">AI</div>
              <div className="text-sm text-muted-foreground">Validierung</div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Sind Sie bereits Kunde oder möchten Sie mehr erfahren?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <a href="https://app.foerderpilot.io">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Zur Anwendung
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="mailto:info@foerderpilot.io">
                    <Mail className="h-4 w-4 mr-2" />
                    Kontakt aufnehmen
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>© 2025 FörderPilot - KOMPASS Förderantrag Management System</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
