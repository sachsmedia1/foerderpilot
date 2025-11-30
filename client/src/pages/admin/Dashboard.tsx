/**
 * FOERDERPILOT - ADMIN DASHBOARD
 * 
 * Haupt-Dashboard für Tenant-Admins mit:
 * - Statistiken (Kurse, Teilnehmer, Sammeltermine)
 * - Schnellzugriff auf wichtige Funktionen
 * - Aktuelle Sammeltermine
 */

import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Calendar, Plus, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function AdminDashboard() {
  // Queries für Statistiken
  const { data: courses } = trpc.courses.list.useQuery({});
  const { data: participants } = trpc.participants.list.useQuery({});
  const { data: sammeltermine } = trpc.sammeltermins.list.useQuery({ upcoming: true });

  const stats = {
    courses: courses?.filter(c => c.isActive).length || 0,
    participants: participants?.length || 0,
    sammeltermine: sammeltermine?.length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Willkommen im FörderPilot Admin-Bereich
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive Kurse</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.courses}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Veröffentlichte Kurse
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teilnehmer</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.participants}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Registrierte Teilnehmer
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sammeltermine</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sammeltermine}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Geplante Termine
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Schnellzugriff</CardTitle>
            <CardDescription>
              Häufig verwendete Aktionen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/admin/courses/new">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Neuer Kurs
                </Button>
              </Link>
              <Link href="/admin/sammeltermine/new">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Neuer Sammeltermin
                </Button>
              </Link>
              <Link href="/admin/courses">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Alle Kurse
                </Button>
              </Link>
              <Link href="/admin/participants">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Alle Teilnehmer
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Sammeltermine */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Anstehende Sammeltermine</CardTitle>
                <CardDescription>
                  Nächste KOMPASS-Termine
                </CardDescription>
              </div>
              <Link href="/admin/sammeltermine">
                <Button variant="ghost" size="sm">
                  Alle anzeigen
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {sammeltermine && sammeltermine.length > 0 ? (
              <div className="space-y-4">
                {sammeltermine.slice(0, 3).map((termin) => (
                  <div key={termin.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-2 min-w-[60px]">
                        <div className="text-2xl font-bold text-primary">
                          {new Date(termin.date).getDate()}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">
                          {new Date(termin.date).toLocaleDateString('de-DE', { month: 'short' })}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">{termin.course?.name || 'Kein Kurs'}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(termin.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Einreichungsfrist: {new Date(termin.submissionDeadline).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <Link href={`/admin/sammeltermine/${termin.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Keine anstehenden Sammeltermine</p>
                <Link href="/admin/sammeltermine/new">
                  <Button variant="link" size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-1" />
                    Ersten Termin erstellen
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
