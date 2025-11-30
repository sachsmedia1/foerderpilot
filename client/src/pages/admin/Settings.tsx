/**
 * FOERDERPILOT - TENANT SETTINGS PAGE
 * 
 * Verwaltung von Mandanten-Einstellungen (Stammdaten, Branding, Custom Domain)
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Building2, Palette, Globe, Loader2, Award } from "lucide-react";

export default function SettingsPage() {
  const { data: tenant, isLoading, refetch } = trpc.tenantSettings.get.useQuery();
  const updateCompanyData = trpc.tenantSettings.updateCompanyData.useMutation();
  const updateBranding = trpc.tenantSettings.updateBranding.useMutation();
  const updateCertification = trpc.tenantSettings.updateCertification.useMutation();
  const updateCustomDomain = trpc.tenantSettings.updateCustomDomain.useMutation();

  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    taxId: "",
    street: "",
    zipCode: "",
    city: "",
    email: "",
    phone: "",
    directorName: "",
    impressumHtml: "",
    privacyPolicyUrl: "",
  });

  const [brandingForm, setBrandingForm] = useState({
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#1E40AF",
    secondaryColor: "#3B82F6",
  });

  const [certificationForm, setCertificationForm] = useState({
    certificationType: "",
    certificationFileUrl: "",
    certificationValidUntil: "",
  });

  const [customDomain, setCustomDomain] = useState("");

  // Initialize forms when tenant data loads
  useEffect(() => {
    if (tenant) {
      setCompanyForm({
        companyName: tenant.companyName || "",
        taxId: tenant.taxId || "",
        street: tenant.street || "",
        zipCode: tenant.zipCode || "",
        city: tenant.city || "",
        email: tenant.email || "",
        phone: tenant.phone || "",
        directorName: tenant.directorName || "",
        impressumHtml: tenant.impressumHtml || "",
        privacyPolicyUrl: tenant.privacyPolicyUrl || "",
      });
      setBrandingForm({
        logoUrl: tenant.logoUrl || "",
        faviconUrl: tenant.faviconUrl || "",
        primaryColor: tenant.primaryColor || "#1E40AF",
        secondaryColor: tenant.secondaryColor || "#3B82F6",
      });
      setCertificationForm({
        certificationType: tenant.certificationType || "",
        certificationFileUrl: tenant.certificationFileUrl || "",
        certificationValidUntil: tenant.certificationValidUntil
          ? new Date(tenant.certificationValidUntil).toISOString().split("T")[0]
          : "",
      });
      setCustomDomain(tenant.customDomain || "");
    }
  }, [tenant]);

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCompanyData.mutateAsync(companyForm);
      toast.success("Stammdaten erfolgreich aktualisiert");
      refetch();
    } catch (error) {
      toast.error("Fehler beim Speichern der Stammdaten");
    }
  };

  const handleBrandingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateBranding.mutateAsync(brandingForm);
      toast.success("Branding erfolgreich aktualisiert");
      refetch();
      // Reload page to apply new branding
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error("Fehler beim Speichern des Brandings");
    }
  };

  const handleCertificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCertification.mutateAsync({
        certificationType: certificationForm.certificationType as "" | "AZAV" | "ISO9001" | "custom" | undefined,
        certificationFileUrl: certificationForm.certificationFileUrl,
        certificationValidUntil: certificationForm.certificationValidUntil,
      });
      toast.success("Zertifizierung erfolgreich aktualisiert");
      refetch();
    } catch (error) {
      toast.error("Fehler beim Speichern der Zertifizierung");
    }
  };

  const handleCustomDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCustomDomain.mutateAsync({ customDomain });
      toast.success("Custom Domain erfolgreich aktualisiert");
      refetch();
    } catch (error) {
      toast.error("Fehler beim Speichern der Custom Domain");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Einstellungen</h1>
          <p className="text-muted-foreground mt-2">
            Verwalten Sie die Einstellungen Ihres Mandanten
          </p>
        </div>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList>
            <TabsTrigger value="company">
              <Building2 className="h-4 w-4 mr-2" />
              Stammdaten
            </TabsTrigger>
            <TabsTrigger value="branding">
              <Palette className="h-4 w-4 mr-2" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="certification">
              <Award className="h-4 w-4 mr-2" />
              Zertifizierung
            </TabsTrigger>
            <TabsTrigger value="domain">
              <Globe className="h-4 w-4 mr-2" />
              Custom Domain
            </TabsTrigger>
          </TabsList>

          {/* Stammdaten Tab */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Firmendaten</CardTitle>
                <CardDescription>
                  Grundlegende Informationen über Ihren Bildungsträger
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCompanySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Firmenname *</Label>
                      <Input
                        id="companyName"
                        value={companyForm.companyName}
                        onChange={(e) =>
                          setCompanyForm({ ...companyForm, companyName: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxId">Steuernummer</Label>
                      <Input
                        id="taxId"
                        value={companyForm.taxId}
                        onChange={(e) =>
                          setCompanyForm({ ...companyForm, taxId: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={companyForm.email}
                        onChange={(e) =>
                          setCompanyForm({ ...companyForm, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        value={companyForm.phone}
                        onChange={(e) =>
                          setCompanyForm({ ...companyForm, phone: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="directorName">Geschäftsführer</Label>
                      <Input
                        id="directorName"
                        value={companyForm.directorName}
                        onChange={(e) =>
                          setCompanyForm({ ...companyForm, directorName: e.target.value })
                        }
                        placeholder="Max Mustermann"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="street">Straße Nr.</Label>
                      <Input
                        id="street"
                        value={companyForm.street}
                        onChange={(e) =>
                          setCompanyForm({ ...companyForm, street: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">PLZ</Label>
                      <Input
                        id="zipCode"
                        value={companyForm.zipCode}
                        onChange={(e) =>
                          setCompanyForm({ ...companyForm, zipCode: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Stadt</Label>
                      <Input
                        id="city"
                        value={companyForm.city}
                        onChange={(e) =>
                          setCompanyForm({ ...companyForm, city: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="privacyPolicyUrl">Datenschutz-URL</Label>
                      <Input
                        id="privacyPolicyUrl"
                        type="url"
                        value={companyForm.privacyPolicyUrl}
                        onChange={(e) =>
                          setCompanyForm({ ...companyForm, privacyPolicyUrl: e.target.value })
                        }
                        placeholder="https://example.com/datenschutz"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="impressumHtml">Impressum (HTML)</Label>
                      <Textarea
                        id="impressumHtml"
                        value={companyForm.impressumHtml}
                        onChange={(e) =>
                          setCompanyForm({ ...companyForm, impressumHtml: e.target.value })
                        }
                        rows={6}
                        placeholder="<p>Firmenname<br>Straße 123<br>12345 Stadt</p>"
                      />
                      <p className="text-sm text-muted-foreground">
                        Verwenden Sie HTML-Tags für Formatierung
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" variant="default" disabled={updateCompanyData.isPending}>
                      {updateCompanyData.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Speichern
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>
                  Passen Sie das Erscheinungsbild Ihrer Plattform an
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBrandingSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="logoUrl">Logo-URL</Label>
                      <Input
                        id="logoUrl"
                        type="url"
                        value={brandingForm.logoUrl}
                        onChange={(e) =>
                          setBrandingForm({ ...brandingForm, logoUrl: e.target.value })
                        }
                        placeholder="https://example.com/logo.png"
                      />
                      <p className="text-sm text-muted-foreground">
                        Laden Sie Ihr Logo auf einen öffentlichen Server hoch und geben Sie die URL ein
                      </p>
                      {brandingForm.logoUrl && (
                        <div className="mt-2 p-4 border rounded-lg bg-muted">
                          <p className="text-sm font-medium mb-2">Vorschau:</p>
                          <img
                            src={brandingForm.logoUrl}
                            alt="Logo Preview"
                            className="h-12 object-contain"
                            onError={(e) => {
                              e.currentTarget.src = "";
                              e.currentTarget.alt = "Fehler beim Laden des Logos";
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="faviconUrl">Favicon-URL</Label>
                      <Input
                        id="faviconUrl"
                        type="url"
                        value={brandingForm.faviconUrl}
                        onChange={(e) =>
                          setBrandingForm({ ...brandingForm, faviconUrl: e.target.value })
                        }
                        placeholder="https://example.com/favicon.ico"
                      />
                      <p className="text-sm text-muted-foreground">
                        Laden Sie Ihr Favicon (16x16 oder 32x32 px) auf einen öffentlichen Server hoch
                      </p>
                      {brandingForm.faviconUrl && (
                        <div className="mt-2 p-4 border rounded-lg bg-muted">
                          <p className="text-sm font-medium mb-2">Vorschau:</p>
                          <img
                            src={brandingForm.faviconUrl}
                            alt="Favicon Preview"
                            className="h-8 w-8 object-contain"
                            onError={(e) => {
                              e.currentTarget.src = "";
                              e.currentTarget.alt = "Fehler beim Laden des Favicons";
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primaryColor">Primärfarbe</Label>
                        <div className="flex gap-2">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={brandingForm.primaryColor}
                            onChange={(e) =>
                              setBrandingForm({ ...brandingForm, primaryColor: e.target.value })
                            }
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            value={brandingForm.primaryColor}
                            onChange={(e) =>
                              setBrandingForm({ ...brandingForm, primaryColor: e.target.value })
                            }
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
                            value={brandingForm.secondaryColor}
                            onChange={(e) =>
                              setBrandingForm({ ...brandingForm, secondaryColor: e.target.value })
                            }
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            value={brandingForm.secondaryColor}
                            onChange={(e) =>
                              setBrandingForm({ ...brandingForm, secondaryColor: e.target.value })
                            }
                            placeholder="#3B82F6"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg bg-muted">
                      <p className="text-sm font-medium mb-2">Hinweis:</p>
                      <p className="text-sm text-muted-foreground">
                        Nach dem Speichern wird die Seite neu geladen, um die neuen Branding-Einstellungen anzuwenden.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" variant="default" disabled={updateBranding.isPending}>
                      {updateBranding.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Speichern
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zertifizierungs Tab */}
          <TabsContent value="certification">
            <Card>
              <CardHeader>
                <CardTitle>Zertifizierung</CardTitle>
                <CardDescription>
                  Verwalten Sie Ihre AZAV- oder ISO9001-Zertifizierung
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCertificationSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="certificationType">Zertifizierungstyp</Label>
                      <select
                        id="certificationType"
                        value={certificationForm.certificationType}
                        onChange={(e) =>
                          setCertificationForm({ ...certificationForm, certificationType: e.target.value })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Keine Zertifizierung</option>
                        <option value="AZAV">AZAV</option>
                        <option value="ISO9001">ISO 9001</option>
                        <option value="custom">Sonstige</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certificationFileUrl">Zertifikat-URL</Label>
                      <Input
                        id="certificationFileUrl"
                        type="url"
                        value={certificationForm.certificationFileUrl}
                        onChange={(e) =>
                          setCertificationForm({ ...certificationForm, certificationFileUrl: e.target.value })
                        }
                        placeholder="https://example.com/zertifikat.pdf"
                      />
                      <p className="text-sm text-muted-foreground">
                        Laden Sie Ihr Zertifikat auf einen öffentlichen Server hoch und geben Sie die URL ein
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certificationValidUntil">Gültig bis</Label>
                      <Input
                        id="certificationValidUntil"
                        type="date"
                        value={certificationForm.certificationValidUntil}
                        onChange={(e) =>
                          setCertificationForm({ ...certificationForm, certificationValidUntil: e.target.value })
                        }
                      />
                      <p className="text-sm text-muted-foreground">
                        Datum, bis zu dem die Zertifizierung gültig ist
                      </p>
                    </div>

                    {certificationForm.certificationFileUrl && (
                      <div className="p-4 border rounded-lg bg-muted">
                        <p className="text-sm font-medium mb-2">Zertifikat-Link:</p>
                        <a
                          href={certificationForm.certificationFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {certificationForm.certificationFileUrl}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" variant="default" disabled={updateCertification.isPending}>
                      {updateCertification.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Speichern
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Domain Tab */}
          <TabsContent value="domain">
            <Card>
              <CardHeader>
                <CardTitle>Custom Domain</CardTitle>
                <CardDescription>
                  Verbinden Sie Ihre eigene Domain mit dieser Plattform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCustomDomainSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customDomain">Custom Domain</Label>
                      <Input
                        id="customDomain"
                        type="text"
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        placeholder="meine-domain.de"
                      />
                      <p className="text-sm text-muted-foreground">
                        Geben Sie Ihre Domain ohne "https://" oder "www" ein
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg bg-muted space-y-3">
                      <p className="text-sm font-medium">DNS-Konfiguration:</p>
                      <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                        <li>Erstellen Sie einen CNAME-Eintrag bei Ihrem DNS-Provider</li>
                        <li>
                          <span className="font-mono bg-background px-2 py-1 rounded">
                            CNAME @ app.foerderpilot.io
                          </span>
                        </li>
                        <li>Warten Sie bis zu 48 Stunden auf DNS-Propagierung</li>
                        <li>Speichern Sie Ihre Custom Domain hier</li>
                      </ol>
                    </div>

                    {tenant?.subdomain && (
                      <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Aktuelle Subdomain:
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-mono">
                          {tenant.subdomain}.foerderpilot.io
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                          Diese Subdomain bleibt auch nach Einrichtung der Custom Domain aktiv.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" variant="default" disabled={updateCustomDomain.isPending}>
                      {updateCustomDomain.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Speichern
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
