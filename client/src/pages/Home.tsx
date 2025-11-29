import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, FileCheck, Shield } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

/**
 * FOERDERPILOT - HOME PAGE
 * 
 * Landing Page mit:
 * - System-Übersicht
 * - Login/Logout
 * - Navigation zu verschiedenen Bereichen
 */
export default function Home() {
  const { user, tenant, loading, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">FörderPilot</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user?.name || user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Abmelden
                </Button>
              </>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Anmelden</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Willkommen bei FörderPilot
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Die Multi-Tenant SaaS-Plattform zur Automatisierung von Förderanträgen
            für Bildungsträger im KOMPASS-Programm
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
          <Card>
            <CardHeader>
              <Building2 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Multi-Tenancy</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Vollständige Datenisolation zwischen Bildungsträgern mit eigenem Branding
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Teilnehmerverwaltung</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Einfache Verwaltung von Teilnehmern mit automatisierter Status-Pipeline
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileCheck className="h-8 w-8 text-primary mb-2" />
              <CardTitle>AI-Validierung</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatische Dokumentenprüfung mit GPT-4o-mini Vision
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Sicher & DSGVO</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Höchste Sicherheitsstandards und vollständige DSGVO-Konformität
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* User-specific Content */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Lade...</p>
          </div>
        ) : isAuthenticated ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Ihr Bereich</CardTitle>
              <CardDescription>
                Angemeldet als {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Tenant Admin' : 'Benutzer'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.role === 'super_admin' && (
                <Button asChild className="w-full" size="lg">
                  <Link href="/superadmin">
                    <Shield className="h-5 w-5 mr-2" />
                    Super Admin Dashboard
                  </Link>
                </Button>
              )}
              
              {tenant && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Ihr Tenant:</p>
                  <p className="text-lg font-bold">{tenant.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {tenant.subdomain}.foerderpilot.io
                  </p>
                </div>
              )}

              {!user?.role || user?.role === 'user' ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Weitere Funktionen werden in den nächsten Phasen freigeschaltet.</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Jetzt starten</CardTitle>
              <CardDescription>
                Melden Sie sich an, um auf Ihr Dashboard zuzugreifen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <a href={getLoginUrl()}>Jetzt anmelden</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm mt-16">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 FörderPilot - KOMPASS Förderantrag Management System</p>
          <p className="mt-2">Phase 1 MVP - Sprint 1.1 Foundation</p>
        </div>
      </footer>
    </div>
  );
}
