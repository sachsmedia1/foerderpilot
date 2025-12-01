import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";

export default function TenantForm() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const isEditing = !!id;
  const tenantId = id ? parseInt(id) : undefined;

  const [formData, setFormData] = useState({
    companyName: "",
    directorName: "",
    email: "",
    phone: "",
    street: "",
    zipCode: "",
    city: "",
    primaryColor: "#1E40AF",
    secondaryColor: "#3B82F6",
    logoUrl: "",
    faviconUrl: "",
    customDomain: "",
    isActive: true,
  });

  // Load existing tenant data if editing
  const { data: tenant, isLoading } = trpc.superadmin.getTenant.useQuery(
    { id: tenantId! },
    { enabled: isEditing && !!tenantId }
  );

  useEffect(() => {
    if (tenant) {
      setFormData({
        companyName: tenant.companyName || "",
        directorName: tenant.directorName || "",
        email: tenant.email || "",
        phone: tenant.phone || "",
        street: tenant.street || "",
        zipCode: tenant.zipCode || "",
        city: tenant.city || "",
        primaryColor: tenant.primaryColor || "#1E40AF",
        secondaryColor: tenant.secondaryColor || "#3B82F6",
        logoUrl: tenant.logoUrl || "",
        faviconUrl: tenant.faviconUrl || "",
        customDomain: tenant.customDomain || "",
        isActive: tenant.isActive,
      });
    }
  }, [tenant]);

  const createMutation = trpc.superadmin.createTenant.useMutation({
    onSuccess: () => {
      toast.success("Bildungsträger erfolgreich erstellt");
      setLocation("/superadmin");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const updateMutation = trpc.superadmin.updateTenant.useMutation({
    onSuccess: () => {
      toast.success("Bildungsträger erfolgreich aktualisiert");
      setLocation("/superadmin");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && tenantId) {
      updateMutation.mutate({
        id: tenantId,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" onClick={() => setLocation("/superadmin")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Bildungsträger bearbeiten" : "Neuer Bildungsträger"}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Grundinformationen</CardTitle>
              <CardDescription>
                Firmenname und Geschäftsführer des Bildungsträgers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Firmenname *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="Offizieller Firmenname"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="directorName">Geschäftsführer</Label>
                <Input
                  id="directorName"
                  value={formData.directorName}
                  onChange={(e) => handleChange("directorName", e.target.value)}
                  placeholder="Max Mustermann"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Kontaktdaten</CardTitle>
              <CardDescription>
                E-Mail, Telefon und Adresse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="kontakt@beispiel.de"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+49 123 456789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Straße Nr.</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => handleChange("street", e.target.value)}
                  placeholder="Musterstraße 123"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">PLZ</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleChange("zipCode", e.target.value)}
                    placeholder="12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Stadt</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="München"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Logo und Farben für den Bildungsträger
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo-URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => handleChange("logoUrl", e.target.value)}
                  placeholder="https://beispiel.de/logo.png"
                />
                <p className="text-xs text-muted-foreground">
                  URL zum Logo-Bild (PNG, JPG oder SVG)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="faviconUrl">Favicon-URL</Label>
                <Input
                  id="faviconUrl"
                  type="url"
                  value={formData.faviconUrl}
                  onChange={(e) => handleChange("faviconUrl", e.target.value)}
                  placeholder="https://beispiel.de/favicon.ico"
                />
                <p className="text-xs text-muted-foreground">
                  URL zum Favicon (ICO, PNG oder SVG, empfohlen 32x32px)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primärfarbe</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => handleChange("primaryColor", e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => handleChange("primaryColor", e.target.value)}
                      placeholder="#1E40AF"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Sekundärfarbe</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => handleChange("secondaryColor", e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) => handleChange("secondaryColor", e.target.value)}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Domain */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Domain</CardTitle>
              <CardDescription>
                Optionale eigene Domain für den Bildungsträger
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customDomain">Custom Domain</Label>
                <Input
                  id="customDomain"
                  value={formData.customDomain}
                  onChange={(e) => handleChange("customDomain", e.target.value)}
                  placeholder="www.beispiel.de"
                />
                <p className="text-xs text-muted-foreground">
                  Eigene Domain, die auf diesen Bildungsträger zeigt
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>
                  Bildungsträger aktivieren oder deaktivieren
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isActive">Aktiv</Label>
                    <p className="text-sm text-muted-foreground">
                      Deaktivierte Bildungsträger können sich nicht einloggen
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleChange("isActive", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/superadmin")}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Speichere..."
                : isEditing
                ? "Änderungen speichern"
                : "Bildungsträger erstellen"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
