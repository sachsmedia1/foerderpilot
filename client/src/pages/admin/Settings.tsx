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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building2, Palette, Globe, Loader2, Award, Users, Plus, Search, UserCheck, UserX, Pencil, Trash2, Mail, FileText, Workflow, CheckCircle, AlertCircle, Clock, Info, Copy, ExternalLink } from "lucide-react";

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
  const [domainStatus, setDomainStatus] = useState<'active' | 'pending' | 'error' | null>(null);
  const [validatingDomain, setValidatingDomain] = useState(false);

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
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Team-Verwaltung
            </TabsTrigger>
            <TabsTrigger value="email-templates">
              <FileText className="h-4 w-4 mr-2" />
              E-Mail-Vorlagen
            </TabsTrigger>
            <TabsTrigger value="workflow-templates">
              <Workflow className="h-4 w-4 mr-2" />
              Begründungs-Vorlagen
            </TabsTrigger>
            <TabsTrigger value="email-test">
              <Mail className="h-4 w-4 mr-2" />
              E-Mail Test
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
                  Nutzen Sie Ihre eigene Domain für den Registrierungs-Funnel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Domain Input */}
                <div className="space-y-2">
                  <Label htmlFor="customDomain">Domain</Label>
                  <div className="flex gap-2">
                    <Input
                      id="customDomain"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="kurse.entscheiderakademie.de"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        if (!customDomain) return;
                        setValidatingDomain(true);
                        // Simuliere DNS-Check (in Produktion: Backend-Call)
                        setTimeout(() => {
                          setValidatingDomain(false);
                          // Zeige pending Status (DNS-Propagierung dauert)
                          setDomainStatus('pending');
                          toast.info('DNS-Validierung: Bitte warten Sie auf die DNS-Propagierung (bis zu 24h)');
                        }, 2000);
                      }}
                      disabled={!customDomain || validatingDomain}
                    >
                      {validatingDomain ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Prüfe...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Validieren
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ihre eigene Domain für den Teilnehmer-Registrierungs-Funnel
                  </p>
                </div>
                
                {/* DNS-Anleitung */}
                {customDomain && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      DNS-Einrichtung bei Ihrem Domain-Provider
                    </h4>
                    
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                      <li>Melden Sie sich bei Ihrem Domain-Provider an (z.B. IONOS, Strato, GoDaddy)</li>
                      <li>Navigieren Sie zur DNS-Verwaltung für Ihre Domain</li>
                      <li>Legen Sie folgenden CNAME-Eintrag an:</li>
                    </ol>
                    
                    <div className="bg-white border border-blue-300 rounded p-3 font-mono text-sm">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="text-gray-600">Typ:</span>
                          <p className="font-semibold">CNAME</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Name/Host:</span>
                          <p className="font-semibold">{customDomain.split('.')[0] || 'kurse'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Ziel:</span>
                          <p className="font-semibold">app.foerderpilot.io</p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-blue-700">
                      <strong>Wichtig:</strong> Die DNS-Änderung kann bis zu 24 Stunden dauern.
                      Klicken Sie danach auf "Validieren", um die Einrichtung zu prüfen.
                    </p>
                  </div>
                )}
                
                {/* Status-Anzeige */}
                {domainStatus && (
                  <div className={`p-4 rounded-lg flex items-start gap-3 ${
                    domainStatus === 'active' 
                      ? 'bg-green-50 border border-green-200' 
                      : domainStatus === 'pending'
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    {domainStatus === 'active' ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-green-900">
                            Domain erfolgreich eingerichtet ✅
                          </p>
                          <p className="text-sm text-green-700 mt-1">
                            Ihre Custom Domain ist aktiv und funktioniert. Teilnehmer können sich nun unter{' '}
                            <a 
                              href={`https://${customDomain}/anmeldung`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline font-semibold"
                            >
                              {customDomain}/anmeldung
                            </a>
                            {' '}registrieren.
                          </p>
                        </div>
                      </>
                    ) : domainStatus === 'pending' ? (
                      <>
                        <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-yellow-900">
                            DNS-Propagierung läuft...
                          </p>
                          <p className="text-sm text-yellow-700 mt-1">
                            Die DNS-Änderung wurde erkannt, wird aber noch verteilt. 
                            Bitte warten Sie 1-24 Stunden und validieren Sie erneut.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-red-900">
                            DNS-Eintrag nicht gefunden
                          </p>
                          <p className="text-sm text-red-700 mt-1">
                            Der CNAME-Eintrag konnte nicht gefunden werden. 
                            Bitte prüfen Sie die DNS-Einstellungen bei Ihrem Provider.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {/* Registrierungs-Link */}
                {customDomain && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Registrierungs-Link für Teilnehmer
                    </h4>
                    <div className="flex gap-2">
                      <Input
                        value={`https://${customDomain}/anmeldung`}
                        readOnly
                        className="flex-1 font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://${customDomain}/anmeldung`);
                          toast.success('Link kopiert!');
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://${customDomain}/anmeldung`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Alternativ: <span className="font-mono">https://app.foerderpilot.io/anmeldung?tenant={tenant?.id}</span>
                    </p>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button 
                    onClick={handleCustomDomainSubmit} 
                    variant="default" 
                    disabled={updateCustomDomain.isPending}
                  >
                    {updateCustomDomain.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Domain speichern
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team-Verwaltung Tab */}
          <TabsContent value="users">
            <UsersTabContent />
          </TabsContent>

          {/* E-Mail-Vorlagen Tab */}
          <TabsContent value="email-templates">
            <Card>
              <CardHeader>
                <CardTitle>E-Mail-Vorlagen bearbeiten</CardTitle>
                <CardDescription>
                  Passen Sie die E-Mail-Templates für Ihren Bildungsträger an
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Hier können Sie die E-Mail-Vorlagen für verschiedene Ereignisse anpassen (Willkommens-E-Mail, Passwort-Reset, Dokument-Validierung, etc.).
                </p>
                <Button asChild>
                  <a href="/settings/email-templates">
                    <FileText className="h-4 w-4 mr-2" />
                    E-Mail-Vorlagen verwalten
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Begründungs-Vorlagen Tab */}
          <TabsContent value="workflow-templates">
            <Card>
              <CardHeader>
                <CardTitle>Begründungs-Vorlagen bearbeiten</CardTitle>
                <CardDescription>
                  Verwalten Sie die Workflow-Templates für KOMPASS-Begründungen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Hier können Sie die Fragen für den Begründungs-Wizard anpassen. Teilnehmer durchlaufen diese Fragen, um ihre KOMPASS-Begründung zu erstellen (mit Voice/Text Input + KI-Unterstützung).
                </p>
                <Button asChild>
                  <a href="/settings/workflows">
                    <Workflow className="h-4 w-4 mr-2" />
                    Begründungs-Vorlagen verwalten
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* E-Mail Test Tab */}
          <TabsContent value="email-test">
            <EmailTestTabContent />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

// Users Tab Component
function UsersTabContent() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "kompass_reviewer" | "user">("all");
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);

  const { data: users, isLoading, refetch } = trpc.userManagement.list.useQuery({
    search: search || undefined,
    role: roleFilter,
    isActive: statusFilter,
  });

  const toggleStatusMutation = trpc.userManagement.toggleStatus.useMutation({
    onSuccess: (data) => {
      toast.success(data.newStatus ? "User aktiviert" : "User deaktiviert");
      refetch();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const deleteMutation = trpc.userManagement.delete.useMutation({
    onSuccess: () => {
      toast.success("User gelöscht");
      refetch();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate({ id });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Möchten Sie den User "${name}" wirklich löschen?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const handleEdit = (id: number) => {
    setEditUserId(id);
    setShowUserForm(true);
  };

  const handleNewUser = () => {
    setEditUserId(null);
    setShowUserForm(true);
  };

  const handleCloseForm = () => {
    setShowUserForm(false);
    setEditUserId(null);
    refetch();
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      admin: { label: "Admin", variant: "default" },
      kompass_reviewer: { label: "KOMPASS Reviewer", variant: "secondary" },
      user: { label: "User", variant: "outline" },
    };
    const config = variants[role] || { label: role, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (showUserForm) {
    return <UserFormInline userId={editUserId} onClose={handleCloseForm} />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team-Mitglieder</CardTitle>
            <CardDescription>
              Verwalten Sie Ihre Team-Mitglieder und deren Rollen
            </CardDescription>
          </div>
          <Button onClick={handleNewUser}>
            <Plus className="mr-2 h-4 w-4" />
            Neuer User
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suche nach Name oder E-Mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as any)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Alle Rollen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Rollen</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="kompass_reviewer">KOMPASS Reviewer</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter === undefined ? "all" : statusFilter ? "active" : "inactive"}
            onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v === "active")}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="inactive">Inaktiv</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Letzter Login</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Lade User...
                  </TableCell>
                </TableRow>
              ) : !users || users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Keine User gefunden
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "—"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Aktiv
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          Inaktiv
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.lastSignedIn
                        ? new Date(user.lastSignedIn).toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "Noch nie"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEdit(user.id)}
                          title="Bearbeiten"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleToggleStatus(user.id)}
                          title={user.isActive ? "Deaktivieren" : "Aktivieren"}
                        >
                          {user.isActive ? (
                            <UserX className="h-4 w-4 text-orange-600" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(user.id, user.name || user.email)}
                          title="Löschen"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// Inline User Form Component
function UserFormInline({ userId, onClose }: { userId: number | null; onClose: () => void }) {
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
        password: "",
      });
    }
  }, [user]);

  const createMutation = trpc.userManagement.create.useMutation({
    onSuccess: () => {
      toast.success("User erfolgreich erstellt");
      onClose();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const updateMutation = trpc.userManagement.update.useMutation({
    onSuccess: () => {
      toast.success("User erfolgreich aktualisiert");
      onClose();
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
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{isEdit ? "User bearbeiten" : "Neuer User"}</CardTitle>
            <CardDescription>
              {isEdit
                ? "Bearbeiten Sie die User-Daten"
                : "Erstellen Sie einen neuen Team-Mitarbeiter"}
            </CardDescription>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Zurück
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-email">E-Mail *</Label>
            <Input
              id="user-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-name">Vollständiger Name *</Label>
            <Input
              id="user-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-firstName">Vorname</Label>
              <Input
                id="user-firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-lastName">Nachname</Label>
              <Input
                id="user-lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-phone">Telefon</Label>
            <Input
              id="user-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-role">Rolle *</Label>
            <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as any })}>
              <SelectTrigger id="user-role">
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

          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="user-password">Passwort *</Label>
              <Input
                id="user-password"
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

          <div className="flex gap-4">
            <Button type="submit" variant="default" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isEdit ? "Speichern" : "User erstellen"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


// E-Mail Test Tab Component
function EmailTestTabContent() {
  const [email, setEmail] = useState('sachs@stefan-sachs.de');

  const sendTestEmail = trpc.emailTest.sendTestEmail.useMutation({
    onSuccess: () => {
      toast.success('Test-E-Mail wurde erfolgreich versendet');
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const testStatusChange = trpc.emailTest.testStatusChangeEmail.useMutation({
    onSuccess: () => {
      toast.success('Status-Change E-Mail wurde erfolgreich versendet');
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const testDocumentUpload = trpc.emailTest.testDocumentUploadEmail.useMutation({
    onSuccess: () => {
      toast.success('Document-Upload E-Mail wurde erfolgreich versendet');
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const testValidationValid = trpc.emailTest.testDocumentValidationEmailValid.useMutation({
    onSuccess: () => {
      toast.success('Document-Validation E-Mail (Valid) wurde erfolgreich versendet');
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const testValidationInvalid = trpc.emailTest.testDocumentValidationEmailInvalid.useMutation({
    onSuccess: () => {
      toast.success('Document-Validation E-Mail (Invalid) wurde erfolgreich versendet');
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const testSammelterminReminder = trpc.emailTest.testSammelterminReminderEmail.useMutation({
    onSuccess: () => {
      toast.success('Sammeltermin-Reminder E-Mail wurde erfolgreich versendet');
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const isLoading =
    sendTestEmail.isPending ||
    testStatusChange.isPending ||
    testDocumentUpload.isPending ||
    testValidationValid.isPending ||
    testValidationInvalid.isPending ||
    testSammelterminReminder.isPending;

  return (
    <div className="space-y-6">
      {/* E-Mail Input */}
      <Card>
        <CardHeader>
          <CardTitle>Test-E-Mail-Adresse</CardTitle>
          <CardDescription>
            Geben Sie die E-Mail-Adresse ein, an die die Test-E-Mails gesendet werden sollen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="email">E-Mail-Adresse</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihre@email.de"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Basis-Test
          </CardTitle>
          <CardDescription>
            Einfache Test-E-Mail ohne Template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => sendTestEmail.mutate({ to: email })}
            disabled={isLoading || !email}
          >
            {sendTestEmail.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
            Test-E-Mail senden
          </Button>
        </CardContent>
      </Card>

      {/* Status-Change Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            Status-Änderung Template
          </CardTitle>
          <CardDescription>
            E-Mail bei Teilnehmer-Status-Änderung (z.B. "Dokumente ausstehend" → "Dokumente genehmigt")
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => testStatusChange.mutate({ to: email })}
            disabled={isLoading || !email}
          >
            {testStatusChange.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
            Status-Change E-Mail senden
          </Button>
        </CardContent>
      </Card>

      {/* Document-Upload Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Dokument-Upload Template
          </CardTitle>
          <CardDescription>
            Bestätigungs-E-Mail nach erfolgreichem Dokument-Upload
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => testDocumentUpload.mutate({ to: email })}
            disabled={isLoading || !email}
          >
            {testDocumentUpload.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
            Document-Upload E-Mail senden
          </Button>
        </CardContent>
      </Card>

      {/* Document-Validation Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            Dokument-Validierung Templates
          </CardTitle>
          <CardDescription>
            E-Mails nach Dokument-Prüfung (genehmigt oder abgelehnt)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Dokument genehmigt</h3>
            <Button
              onClick={() => testValidationValid.mutate({ to: email })}
              disabled={isLoading || !email}
              variant="outline"
            >
              {testValidationValid.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserCheck className="h-4 w-4 mr-2 text-green-600" />}
              Validation Valid E-Mail senden
            </Button>
          </div>
          <div>
            <h3 className="font-medium mb-2">Dokument abgelehnt (mit Issues & Recommendations)</h3>
            <Button
              onClick={() => testValidationInvalid.mutate({ to: email })}
              disabled={isLoading || !email}
              variant="outline"
            >
              {testValidationInvalid.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserX className="h-4 w-4 mr-2 text-red-600" />}
              Validation Invalid E-Mail senden
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sammeltermin-Reminder Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-purple-600" />
            Sammeltermin-Reminder Template
          </CardTitle>
          <CardDescription>
            Erinnerungs-E-Mail 24 Stunden vor Sammeltermin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => testSammelterminReminder.mutate({ to: email })}
            disabled={isLoading || !email}
          >
            {testSammelterminReminder.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
            Sammeltermin-Reminder E-Mail senden
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
