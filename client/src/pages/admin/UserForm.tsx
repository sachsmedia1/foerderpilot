import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function UserForm() {
  const [, navigate] = useLocation();
  const params = useParams();
  const userId = params.id ? parseInt(params.id) : null;
  const isEdit = userId !== null;

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "user" as "admin" | "kompass_reviewer" | "user",
    password: "",
  });

  // Lade User-Daten beim Bearbeiten
  const { data: user, isLoading } = trpc.userManagement.getById.useQuery(
    { id: userId! },
    { enabled: isEdit }
  );

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        name: user.name || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        role: user.role as any,
        password: "", // Passwort wird beim Bearbeiten nicht angezeigt
      });
    }
  }, [user]);

  const createMutation = trpc.userManagement.create.useMutation({
    onSuccess: () => {
      toast.success("User erfolgreich erstellt");
      navigate("/admin/users");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const updateMutation = trpc.userManagement.update.useMutation({
    onSuccess: () => {
      toast.success("User erfolgreich aktualisiert");
      navigate("/admin/users");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit) {
      updateMutation.mutate({
        id: userId!,
        email: formData.email || undefined,
        name: formData.name || undefined,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        phone: formData.phone || undefined,
        role: formData.role,
      });
    } else {
      if (!formData.password || formData.password.length < 8) {
        toast.error("Passwort muss mindestens 8 Zeichen lang sein");
        return;
      }
      createMutation.mutate(formData);
    }
  };

  if (isEdit && isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Lade User-Daten...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Button variant="ghost" onClick={() => navigate("/admin/users")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Übersicht
          </Button>
          <h1 className="text-3xl font-bold">{isEdit ? "User bearbeiten" : "Neuer User"}</h1>
          <p className="text-muted-foreground mt-1">
            {isEdit
              ? "Bearbeiten Sie die User-Daten"
              : "Erstellen Sie einen neuen Team-Mitarbeiter"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>User-Informationen</CardTitle>
              <CardDescription>
                {isEdit
                  ? "Aktualisieren Sie die Informationen des Users"
                  : "Geben Sie die Informationen für den neuen User ein"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* E-Mail */}
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Vollständiger Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Vorname & Nachname */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              {/* Telefon */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              {/* Rolle */}
              <div className="space-y-2">
                <Label htmlFor="role">Rolle *</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as any })}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="kompass_reviewer">KOMPASS Reviewer</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {formData.role === "admin" && "Voller Zugriff auf alle Funktionen"}
                  {formData.role === "kompass_reviewer" && "Kann Dokumente validieren"}
                  {formData.role === "user" && "Basis-Zugriff"}
                </p>
              </div>

              {/* Passwort (nur beim Erstellen) */}
              {!isEdit && (
                <div className="space-y-2">
                  <Label htmlFor="password">Passwort *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                  />
                  <p className="text-sm text-muted-foreground">Mindestens 8 Zeichen</p>
                </div>
              )}

              {isEdit && (
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  💡 Das Passwort kann aus Sicherheitsgründen nicht bearbeitet werden. Der User kann
                  über "Passwort vergessen" ein neues Passwort setzen.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 mt-6">
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {isEdit ? "Speichern" : "User erstellen"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/admin/users")}>
              Abbrechen
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
