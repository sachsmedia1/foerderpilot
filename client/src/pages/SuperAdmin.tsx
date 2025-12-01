/**
 * FOERDERPILOT - SUPER ADMIN DASHBOARD
 * 
 * Dashboard für Super Admins mit:
 * - System-Übersicht (Statistiken)
 * - Tenant-Verwaltung (CRUD)
 * - User-Management
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Building2, Users, Activity, Plus, Settings, Eye, Edit } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SuperAdmin() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();

  // System-Statistiken
  const { data: stats, isLoading: statsLoading } = trpc.superadmin.getSystemStats.useQuery();

  // Tenant-Liste
  const { data: tenants, isLoading: tenantsLoading } = trpc.superadmin.listTenants.useQuery();

  // Prüfe ob User Super Admin ist
  if (!loading && user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Zugriff verweigert</CardTitle>
            <CardDescription>
              Sie haben keine Berechtigung für diesen Bereich.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Zurück zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">FörderPilot</h1>
            <Badge variant="secondary">Super Admin</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name || user?.email}</span>
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              Zur Startseite
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Super Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Verwalten Sie alle Bildungsträger, Benutzer und System-Einstellungen
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bildungsträger</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.tenants.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.tenants.active || 0} aktiv, {stats?.tenants.inactive || 0} inaktiv
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Benutzer</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.users.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.users.admins || 0} Admins, {stats?.users.regularUsers || 0} User
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground">
                Alle Systeme funktionieren
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tenants" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tenants">Bildungsträger</TabsTrigger>
            <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          </TabsList>

          <TabsContent value="tenants" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Bildungsträger-Verwaltung</CardTitle>
                    <CardDescription>
                      Alle Bildungsträger im System
                    </CardDescription>
                  </div>
                  <Button onClick={() => navigate('/superadmin/tenants/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Neuer Bildungsträger
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {tenantsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : tenants && tenants.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Subdomain</TableHead>
                        <TableHead>E-Mail</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Erstellt</TableHead>
                        <TableHead className="text-right">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenants.map((tenant) => (
                        <TableRow key={tenant.id}>
                          <TableCell className="font-medium">{tenant.name}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {tenant.subdomain}.foerderpilot.io
                            </code>
                          </TableCell>
                          <TableCell>{tenant.email}</TableCell>
                          <TableCell>
                            {tenant.isActive ? (
                              <Badge variant="default">Aktiv</Badge>
                            ) : (
                              <Badge variant="secondary">Inaktiv</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(tenant.createdAt).toLocaleDateString('de-DE')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/superadmin/tenants/${tenant.id}`)}
                                title="Details anzeigen"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/superadmin/tenants/${tenant.id}/edit`)}
                                title="Bearbeiten"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Noch keine Bildungsträger vorhanden
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System-Einstellungen</CardTitle>
                <CardDescription>
                  Globale Einstellungen für das gesamte System
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  System-Einstellungen werden in einer späteren Phase implementiert.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
