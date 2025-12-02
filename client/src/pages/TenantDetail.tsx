import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, Users, BookOpen, FileText, Calendar, UserPlus, MoreVertical, KeyRound, UserCog, Ban, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export default function TenantDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const tenantId = id ? parseInt(id) : undefined;

  // User Creation Form State
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "user" | "kompass_reviewer">("user");

  const { data: tenant, isLoading } = trpc.superadmin.getTenant.useQuery(
    { id: tenantId! },
    { enabled: !!tenantId }
  );

  const { data: tenantUsers } = trpc.superadmin.getTenantUsers.useQuery(
    { tenantId: tenantId! },
    { enabled: !!tenantId }
  );

  const toggleStatusMutation = trpc.superadmin.toggleTenantStatus.useMutation({
    onSuccess: (data) => {
      toast.success(
        data.isActive
          ? "Bildungsträger aktiviert"
          : "Bildungsträger deaktiviert"
      );
      window.location.reload(); // Reload to update status
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleToggleStatus = () => {
    if (!tenantId) return;
    toggleStatusMutation.mutate({ id: tenantId });
  };

  const utils = trpc.useUtils();
  const createUserMutation = trpc.superadmin.createTenantUser.useMutation({
    onSuccess: () => {
      toast.success("Benutzer erfolgreich erstellt");
      setShowUserForm(false);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserName("");
      setNewUserRole("user");
      utils.superadmin.getTenantUsers.invalidate({ tenantId: tenantId! });
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    createUserMutation.mutate({
      tenantId,
      email: newUserEmail,
      password: newUserPassword,
      name: newUserName || undefined,
      role: newUserRole,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Bildungsträger...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Bildungsträger nicht gefunden</CardTitle>
            <CardDescription>
              Der angeforderte Bildungsträger existiert nicht.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/superadmin")} className="w-full">
              Zurück zur Übersicht
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/superadmin")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{tenant.name}</h1>
              <p className="text-sm text-muted-foreground">
                {tenant.subdomain}.foerderpilot.io
              </p>
            </div>
            <Badge variant={tenant.isActive ? "default" : "secondary"}>
              {tenant.isActive ? "Aktiv" : "Inaktiv"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleToggleStatus}
              disabled={toggleStatusMutation.isPending}
            >
              {tenant.isActive ? "Deaktivieren" : "Aktivieren"}
            </Button>
            <Button onClick={() => setLocation(`/superadmin/tenants/${tenant.id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Bearbeiten
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Benutzer</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenantUsers?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Registrierte Benutzer
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kurse</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Aktive Kurse
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teilnehmer</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Registrierte Teilnehmer
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dokumente</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Hochgeladene Dokumente
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Firmendaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Firmenname</p>
                <p className="text-base">{tenant.companyName || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">E-Mail</p>
                <p className="text-base">{tenant.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Telefon</p>
                <p className="text-base">{tenant.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Adresse</p>
                <p className="text-base">
                  {tenant.street && tenant.zipCode && tenant.city
                    ? `${tenant.street}, ${tenant.zipCode} ${tenant.city}`
                    : "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Logo</p>
                  {tenant.logoUrl ? (
                    <div className="mt-2">
                      <img
                        src={tenant.logoUrl}
                        alt="Logo"
                        className="h-16 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <a
                        href={tenant.logoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {tenant.logoUrl}
                      </a>
                    </div>
                  ) : (
                    <p className="text-base">-</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Favicon</p>
                  {tenant.faviconUrl ? (
                    <div className="mt-2">
                      <img
                        src={tenant.faviconUrl}
                        alt="Favicon"
                        className="h-8 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <a
                        href={tenant.faviconUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {tenant.faviconUrl}
                      </a>
                    </div>
                  ) : (
                    <p className="text-base">-</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Primärfarbe</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: tenant.primaryColor || "#1E40AF" }}
                    ></div>
                    <code className="text-sm">{tenant.primaryColor || "#1E40AF"}</code>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sekundärfarbe</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: tenant.secondaryColor || "#3B82F6" }}
                    ></div>
                    <code className="text-sm">{tenant.secondaryColor || "#3B82F6"}</code>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custom Domain</p>
                <p className="text-base">{tenant.customDomain || "-"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Benutzer</CardTitle>
                <CardDescription>
                  Alle Benutzer dieses Bildungsträgers
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUserForm(!showUserForm)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Neuer Benutzer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* User Creation Form */}
            {showUserForm && (
              <form onSubmit={handleCreateUser} className="mb-6 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-4">Neuen Benutzer erstellen</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-Mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Passwort * (min. 8 Zeichen)</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name (optional)</Label>
                    <Input
                      id="name"
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Rolle *</Label>
                    <Select value={newUserRole} onValueChange={(value: any) => setNewUserRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Benutzer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="kompass_reviewer">KOMPASS Reviewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createUserMutation.isPending}>
                      {createUserMutation.isPending ? "Erstelle..." : "Benutzer erstellen"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowUserForm(false)}
                    >
                      Abbrechen
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* User List */}
            {tenantUsers && tenantUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>E-Mail</TableHead>
                    <TableHead>Rolle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenantUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.role === "admin"
                            ? "Admin"
                            : user.role === "kompass_reviewer"
                            ? "KOMPASS Reviewer"
                            : "Benutzer"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <Badge variant="default">Aktiv</Badge>
                        ) : (
                          <Badge variant="secondary">Inaktiv</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                toast.info("Passwort-Reset-Funktion wird in Kürze implementiert");
                              }}
                            >
                              <KeyRound className="w-4 h-4 mr-2" />
                              Passwort zurücksetzen
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                toast.info("Rollen-Änderungs-Funktion wird in Kürze implementiert");
                              }}
                            >
                              <UserCog className="w-4 h-4 mr-2" />
                              Rolle ändern
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                toast.info("Status-Änderungs-Funktion wird in Kürze implementiert");
                              }}
                            >
                              {user.isActive ? (
                                <>
                                  <Ban className="w-4 h-4 mr-2" />
                                  Deaktivieren
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-2" />
                                  Aktivieren
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Noch keine Benutzer vorhanden
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>System-Informationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tenant-ID</span>
              <span className="text-sm font-mono">{tenant.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Erstellt am</span>
              <span className="text-sm">
                {new Date(tenant.createdAt).toLocaleString("de-DE")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Zuletzt aktualisiert</span>
              <span className="text-sm">
                {new Date(tenant.updatedAt).toLocaleString("de-DE")}
              </span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
