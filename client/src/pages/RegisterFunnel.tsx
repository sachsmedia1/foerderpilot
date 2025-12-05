/**
 * REGISTER FUNNEL - Öffentlicher 4-Step-Funnel für Teilnehmer-Registrierung
 * 
 * Steps:
 * 1. Fördercheck (7 Fragen)
 * 2. Kursauswahl (Dropdown + Details)
 * 3. Persönliche Daten (Formular)
 * 4. Vorvertrag-Bestätigung (4 Checkboxen)
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useEffect } from "react";

// UUID Generator
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function RegisterFunnel() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionId] = useState(() => generateUUID());
  const tenantId = 1; // TODO: Get from subdomain/URL

  // Check for courseId in URL
  const [preselectedCourseId, setPreselectedCourseId] = useState<number | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const courseIdParam = params.get('courseId');
    if (courseIdParam) {
      const courseId = parseInt(courseIdParam, 10);
      if (!isNaN(courseId)) {
        setPreselectedCourseId(courseId);
        setSelectedCourseId(courseId);
      }
    }
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 1: FÖRDERCHECK STATE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [foerdercheck, setFoerdercheck] = useState({
    wohnsitzDeutschland: true,
    hauptberuflichSelbststaendig: true,
    mindestens51ProzentEinkuenfte: true,
    mitarbeiterVzae: 0,
    selbststaendigkeitSeit: "",
    deminimisBeihilfen: 0,
    kompassSchecksAnzahl: 0,
    letzterKompassScheckDatum: "",
  });

  const [foerdercheckErgebnis, setFoerdercheckErgebnis] = useState<any>(null);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 2: KURSAUSWAHL STATE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 3: PERSÖNLICHE DATEN STATE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [persoenlicheDaten, setPersoenlicheDaten] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    zipCode: "",
    city: "",
    company: "",
    dateOfBirth: "",
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 4: VORVERTRAG STATE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [checkboxes, setCheckboxes] = useState({
    zuarbeit: false,
    teilnahme: false,
    datenschutz: false,
    agb: false,
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRPC MUTATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const foerdercheckMutation = trpc.register.foerdercheck.useMutation();
  const kursauswahlMutation = trpc.register.kursauswahl.useMutation();
  const persoenlicheDatenMutation = trpc.register.persoenlicheDaten.useMutation();
  const vorvertragMutation = trpc.register.vorvertragBestaetigen.useMutation();

  const { data: courses } = trpc.register.getCourses.useQuery({ tenantId });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 1: FÖRDERCHECK SUBMIT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleFoerdercheckSubmit = async () => {
    // Validierung
    if (!foerdercheck.selbststaendigkeitSeit) {
      toast.error("Bitte geben Sie das Datum Ihrer Selbstständigkeit an.");
      return;
    }

    if (foerdercheck.kompassSchecksAnzahl > 0 && !foerdercheck.letzterKompassScheckDatum) {
      toast.error("Bitte geben Sie das Datum des letzten KOMPASS-Schecks an.");
      return;
    }

    try {
      const result = await foerdercheckMutation.mutateAsync({
        sessionId,
        tenantId,
        ...foerdercheck,
      });

      setFoerdercheckErgebnis(result);

      if (result.ergebnis === "nicht_foerderfaehig") {
        toast.error(result.message);
        // Nicht weitergehen
      } else {
        toast.success(result.message);
        // Skip step 2 if courseId is preselected
        if (preselectedCourseId) {
          setCurrentStep(3);
        } else {
          setCurrentStep(2);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Fördercheck");
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 2: KURSAUSWAHL SUBMIT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleKursauswahlSubmit = async () => {
    if (!selectedCourseId) {
      toast.error("Bitte wählen Sie einen Kurs aus.");
      return;
    }

    try {
      const result = await kursauswahlMutation.mutateAsync({
        sessionId,
        courseId: selectedCourseId,
      });

      setSelectedCourse(result.course);
      toast.success("Kurs ausgewählt!");
      setCurrentStep(3);
    } catch (error: any) {
      toast.error(error.message || "Fehler bei der Kursauswahl");
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 3: PERSÖNLICHE DATEN SUBMIT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handlePersoenlicheDatenSubmit = async () => {
    // Validierung
    if (
      !persoenlicheDaten.firstName ||
      !persoenlicheDaten.lastName ||
      !persoenlicheDaten.email ||
      !persoenlicheDaten.phone ||
      !persoenlicheDaten.street ||
      !persoenlicheDaten.zipCode ||
      !persoenlicheDaten.city ||
      !persoenlicheDaten.dateOfBirth
    ) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }

    try {
      await persoenlicheDatenMutation.mutateAsync({
        sessionId,
        ...persoenlicheDaten,
      });

      toast.success("Daten gespeichert!");
      setCurrentStep(4);
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Speichern der Daten");
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 4: VORVERTRAG SUBMIT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleVorvertragSubmit = async () => {
    if (!checkboxes.zuarbeit || !checkboxes.teilnahme || !checkboxes.datenschutz || !checkboxes.agb) {
      toast.error("Bitte bestätigen Sie alle Checkboxen.");
      return;
    }

    try {
      const result = await vorvertragMutation.mutateAsync({
        sessionId,
        checkboxZuarbeit: checkboxes.zuarbeit,
        checkboxTeilnahme: checkboxes.teilnahme,
        checkboxDatenschutz: checkboxes.datenschutz,
        checkboxAgb: checkboxes.agb,
        ipAddress: "0.0.0.0", // TODO: Get real IP
        userAgent: navigator.userAgent,
      });

      toast.success("Account erfolgreich erstellt!");
      
      // Weiterleitung zu Password-Set-Seite
      setLocation(`/set-password?token=${result.resetToken}`);
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Erstellen des Accounts");
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROGRESS BAR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const progress = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">KOMPASS-Förderung beantragen</h1>
          <p className="text-gray-600">In 4 Schritten zu Ihrer Weiterbildung</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span className={currentStep >= 1 ? "font-semibold text-indigo-600" : ""}>1. Fördercheck</span>
            <span className={currentStep >= 2 ? "font-semibold text-indigo-600" : ""}>2. Kursauswahl</span>
            <span className={currentStep >= 3 ? "font-semibold text-indigo-600" : ""}>3. Ihre Daten</span>
            <span className={currentStep >= 4 ? "font-semibold text-indigo-600" : ""}>4. Bestätigung</span>
          </div>
        </div>

        {/* STEP 1: FÖRDERCHECK */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Schritt 1: Fördercheck</CardTitle>
              <CardDescription>Prüfen Sie Ihre Förderfähigkeit in wenigen Fragen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Frage 1: Wohnsitz */}
              <div>
                <Label className="text-base font-semibold">1. Haben Sie Ihren Wohnsitz in Deutschland?</Label>
                <RadioGroup
                  value={foerdercheck.wohnsitzDeutschland ? "ja" : "nein"}
                  onValueChange={(v) => setFoerdercheck({ ...foerdercheck, wohnsitzDeutschland: v === "ja" })}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ja" id="wohnsitz-ja" />
                    <Label htmlFor="wohnsitz-ja">Ja</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nein" id="wohnsitz-nein" />
                    <Label htmlFor="wohnsitz-nein">Nein</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Frage 2: Hauptberuflich selbstständig */}
              <div>
                <Label className="text-base font-semibold">2. Sind Sie hauptberuflich selbstständig?</Label>
                <RadioGroup
                  value={foerdercheck.hauptberuflichSelbststaendig ? "ja" : "nein"}
                  onValueChange={(v) => setFoerdercheck({ ...foerdercheck, hauptberuflichSelbststaendig: v === "ja" })}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ja" id="hauptberuflich-ja" />
                    <Label htmlFor="hauptberuflich-ja">Ja</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nein" id="hauptberuflich-nein" />
                    <Label htmlFor="hauptberuflich-nein">Nein</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Frage 3: 51% Einkünfte */}
              <div>
                <Label className="text-base font-semibold">3. Erzielen Sie mindestens 51% Ihrer Einkünfte aus Ihrer selbstständigen Tätigkeit?</Label>
                <RadioGroup
                  value={foerdercheck.mindestens51ProzentEinkuenfte ? "ja" : "nein"}
                  onValueChange={(v) => setFoerdercheck({ ...foerdercheck, mindestens51ProzentEinkuenfte: v === "ja" })}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ja" id="einkuenfte-ja" />
                    <Label htmlFor="einkuenfte-ja">Ja</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nein" id="einkuenfte-nein" />
                    <Label htmlFor="einkuenfte-nein">Nein</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Frage 4: Mitarbeiter VZÄ */}
              <div>
                <Label htmlFor="mitarbeiter" className="text-base font-semibold">
                  4. Wie viele Mitarbeiter beschäftigen Sie (Vollzeitäquivalente)?
                </Label>
                <Select
                  value={foerdercheck.mitarbeiterVzae.toString()}
                  onValueChange={(v) => setFoerdercheck({ ...foerdercheck, mitarbeiterVzae: parseFloat(v) })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Bitte wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 (Solo-Selbstständig)</SelectItem>
                    <SelectItem value="0.5">0,5 VZÄ</SelectItem>
                    <SelectItem value="1">1 VZÄ</SelectItem>
                    <SelectItem value="1.5">1,5 VZÄ</SelectItem>
                    <SelectItem value="2">2 VZÄ oder mehr</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Frage 5: Selbstständigkeit seit */}
              <div>
                <Label htmlFor="selbststaendigkeitSeit" className="text-base font-semibold">
                  5. Seit wann sind Sie selbstständig?
                </Label>
                <Input
                  id="selbststaendigkeitSeit"
                  type="date"
                  value={foerdercheck.selbststaendigkeitSeit}
                  onChange={(e) => setFoerdercheck({ ...foerdercheck, selbststaendigkeitSeit: e.target.value })}
                  className="mt-2"
                />
              </div>

              {/* Frage 6: De-minimis-Beihilfen */}
              <div>
                <Label htmlFor="deminimis" className="text-base font-semibold">
                  6. Haben Sie in den letzten 3 Jahren De-minimis-Beihilfen erhalten?
                </Label>
                <p className="text-sm text-gray-600 mt-1">Summe aller erhaltenen Förderungen (z.B. KOMPASS, BAFA, etc.)</p>
                <Input
                  id="deminimis"
                  type="number"
                  value={foerdercheck.deminimisBeihilfen}
                  onChange={(e) => setFoerdercheck({ ...foerdercheck, deminimisBeihilfen: parseFloat(e.target.value) })}
                  placeholder="0"
                  className="mt-2"
                />
              </div>

              {/* Frage 7: KOMPASS-Schecks */}
              <div>
                <Label htmlFor="kompassSchecks" className="text-base font-semibold">
                  7. Wie viele KOMPASS-Gutscheine haben Sie bereits genutzt?
                </Label>
                <Select
                  value={foerdercheck.kompassSchecksAnzahl.toString()}
                  onValueChange={(v) => setFoerdercheck({ ...foerdercheck, kompassSchecksAnzahl: parseInt(v) })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Bitte wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 (Erstantrag)</SelectItem>
                    <SelectItem value="1">1 (Zweitantrag)</SelectItem>
                    <SelectItem value="2">2 (Kontingent ausgeschöpft)</SelectItem>
                  </SelectContent>
                </Select>

                {foerdercheck.kompassSchecksAnzahl > 0 && (
                  <div className="mt-4">
                    <Label htmlFor="letzterScheck">Datum des letzten KOMPASS-Schecks</Label>
                    <Input
                      id="letzterScheck"
                      type="date"
                      value={foerdercheck.letzterKompassScheckDatum}
                      onChange={(e) => setFoerdercheck({ ...foerdercheck, letzterKompassScheckDatum: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  onClick={handleFoerdercheckSubmit}
                  disabled={foerdercheckMutation.isPending}
                  className="w-full"
                >
                  {foerdercheckMutation.isPending ? "Prüfe..." : "Förderfähigkeit prüfen"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: KURSAUSWAHL */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Schritt 2: Kursauswahl</CardTitle>
              <CardDescription>Wählen Sie Ihren Wunschkurs aus</CardDescription>
              
              {/* Fördercheck-Ergebnis */}
              {foerdercheckErgebnis && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-semibold text-green-900">✅ {foerdercheckErgebnis.message}</p>
                  <p className="text-sm text-green-700 mt-1">
                    Förderung: {foerdercheckErgebnis.foerderprozent}% (€{foerdercheckErgebnis.foerderbetrag})
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="course">Kurs auswählen</Label>
                <Select
                  value={selectedCourseId?.toString() || ""}
                  onValueChange={(v) => setSelectedCourseId(parseInt(v))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Bitte wählen Sie einen Kurs" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((course: any) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name} - €{(course.priceNet / 100).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Kurs-Details */}
              {selectedCourseId && courses && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  {(() => {
                    const course = courses.find((c: any) => c.id === selectedCourseId);
                    if (!course) return null;

                    const priceInEuro = course.priceNet / 100;
                    const foerderprozent = foerdercheckErgebnis?.foerderprozent || 0;
                    const foerderbetrag = (priceInEuro * foerderprozent) / 100;
                    const eigenanteil = priceInEuro - foerderbetrag;

                    return (
                      <>
                        <h3 className="font-semibold text-lg">{course.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{course.shortDescription || 'Keine Beschreibung verfügbar'}</p>
                        <div className="mt-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Kurspreis:</span>
                            <span className="font-semibold">€{priceInEuro.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-green-700">
                            <span>Förderung ({foerderprozent}%):</span>
                            <span className="font-semibold">-€{foerderbetrag.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold border-t pt-2">
                            <span>Ihr Eigenanteil:</span>
                            <span>€{eigenanteil.toFixed(2)}</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                  Zurück
                </Button>
                <Button
                  onClick={handleKursauswahlSubmit}
                  disabled={!selectedCourseId || kursauswahlMutation.isPending}
                  className="flex-1"
                >
                  {kursauswahlMutation.isPending ? "Speichere..." : "Weiter"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: PERSÖNLICHE DATEN */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Schritt 3: Ihre persönlichen Daten</CardTitle>
              <CardDescription>Bitte füllen Sie alle Felder aus</CardDescription>
              
              {/* Kurs-Info wenn über Direct-Link */}
              {preselectedCourseId && courses && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  {(() => {
                    const course = courses.find((c: any) => c.id === preselectedCourseId);
                    if (!course || !foerdercheckErgebnis) return null;
                    
                    const priceInEuro = course.priceNet / 100;
                    const foerderprozent = foerdercheckErgebnis.foerderprozent || 0;
                    const foerderbetrag = (priceInEuro * foerderprozent) / 100;
                    const eigenanteil = priceInEuro - foerderbetrag;
                    
                    return (
                      <>
                        <div className="flex items-start gap-2">
                          <span className="text-2xl">📚</span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{course.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{course.shortDescription || 'Keine Beschreibung verfügbar'}</p>
                            <div className="mt-3 space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Kurspreis:</span>
                                <span className="font-semibold">€{priceInEuro.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-green-700">
                                <span>Förderung ({foerderprozent}%):</span>
                                <span className="font-semibold">-€{foerderbetrag.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-lg font-bold border-t pt-1">
                                <span>Ihr Eigenanteil:</span>
                                <span>€{eigenanteil.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Vorname *</Label>
                  <Input
                    id="firstName"
                    value={persoenlicheDaten.firstName}
                    onChange={(e) => setPersoenlicheDaten({ ...persoenlicheDaten, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nachname *</Label>
                  <Input
                    id="lastName"
                    value={persoenlicheDaten.lastName}
                    onChange={(e) => setPersoenlicheDaten({ ...persoenlicheDaten, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">E-Mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={persoenlicheDaten.email}
                  onChange={(e) => setPersoenlicheDaten({ ...persoenlicheDaten, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={persoenlicheDaten.phone}
                  onChange={(e) => setPersoenlicheDaten({ ...persoenlicheDaten, phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="street">Straße & Hausnummer *</Label>
                <Input
                  id="street"
                  value={persoenlicheDaten.street}
                  onChange={(e) => setPersoenlicheDaten({ ...persoenlicheDaten, street: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode">PLZ *</Label>
                  <Input
                    id="zipCode"
                    value={persoenlicheDaten.zipCode}
                    onChange={(e) => setPersoenlicheDaten({ ...persoenlicheDaten, zipCode: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ort *</Label>
                  <Input
                    id="city"
                    value={persoenlicheDaten.city}
                    onChange={(e) => setPersoenlicheDaten({ ...persoenlicheDaten, city: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company">Firma (optional)</Label>
                <Input
                  id="company"
                  value={persoenlicheDaten.company}
                  onChange={(e) => setPersoenlicheDaten({ ...persoenlicheDaten, company: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Geburtsdatum *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={persoenlicheDaten.dateOfBirth}
                  onChange={(e) => setPersoenlicheDaten({ ...persoenlicheDaten, dateOfBirth: e.target.value })}
                />
              </div>

              {/* Navigation */}
              <div className="flex gap-4 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(preselectedCourseId ? 1 : 2)} 
                  className="flex-1"
                >
                  Zurück
                </Button>
                <Button
                  onClick={handlePersoenlicheDatenSubmit}
                  disabled={persoenlicheDatenMutation.isPending}
                  className="flex-1"
                >
                  {persoenlicheDatenMutation.isPending ? "Speichere..." : "Weiter"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 4: VORVERTRAG-BESTÄTIGUNG */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Schritt 4: Vorvertrag bestätigen</CardTitle>
              <CardDescription>Bitte lesen und bestätigen Sie die folgenden Punkte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vorvertrag-Zusammenfassung */}
              <div className="p-4 bg-gray-50 border rounded-lg text-sm space-y-2">
                <h3 className="font-semibold">Zusammenfassung:</h3>
                <p>
                  <strong>Name:</strong> {persoenlicheDaten.firstName} {persoenlicheDaten.lastName}
                </p>
                {(() => {
                  const course = courses?.find((c: any) => c.id === selectedCourseId);
                  if (!course || !foerdercheckErgebnis) return null;
                  
                  const priceInEuro = course.priceNet / 100;
                  const foerderprozent = foerdercheckErgebnis.foerderprozent || 0;
                  const foerderbetrag = (priceInEuro * foerderprozent) / 100;
                  const eigenanteil = priceInEuro - foerderbetrag;
                  
                  return (
                    <>
                      <p>
                        <strong>Kurs:</strong> {course.name}
                      </p>
                      <p>
                        <strong>Kurspreis:</strong> €{priceInEuro.toFixed(2)}
                      </p>
                      <p>
                        <strong>Förderung:</strong> €{foerderbetrag.toFixed(2)} ({foerderprozent}%)
                      </p>
                      <p className="text-lg font-bold">
                        <strong>Ihr Eigenanteil:</strong> €{eigenanteil.toFixed(2)}
                      </p>
                    </>
                  );
                })()}
              </div>

              {/* Checkboxen */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="zuarbeit"
                    checked={checkboxes.zuarbeit}
                    onCheckedChange={(checked) => setCheckboxes({ ...checkboxes, zuarbeit: checked as boolean })}
                    className="mt-0.5"
                  />
                  <Label htmlFor="zuarbeit" className="text-sm leading-relaxed cursor-pointer">
                    Ich verpflichte mich, alle angeforderten Dokumente innerhalb von 7 Kalendertagen nach dem
                    Erstberatungsgespräch einzureichen. Bei Verzögerung: €499 Gebühr (exkl. USt.).
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="teilnahme"
                    checked={checkboxes.teilnahme}
                    onCheckedChange={(checked) => setCheckboxes({ ...checkboxes, teilnahme: checked as boolean })}
                    className="mt-0.5"
                  />
                  <Label htmlFor="teilnahme" className="text-sm leading-relaxed cursor-pointer">
                    Ich nehme verbindlich am Starttermin teil. Bei Verzögerung (nicht von mir verschuldet): Teilnahme am
                    nächstmöglichen Folgetermin.
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="datenschutz"
                    checked={checkboxes.datenschutz}
                    onCheckedChange={(checked) => setCheckboxes({ ...checkboxes, datenschutz: checked as boolean })}
                    className="mt-0.5"
                  />
                  <Label htmlFor="datenschutz" className="text-sm leading-relaxed cursor-pointer">
                    Ich willige in die Datenverarbeitung durch Sachs Consulting Ltd. und Entscheiderakademie GmbH ein.
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agb"
                    checked={checkboxes.agb}
                    onCheckedChange={(checked) => setCheckboxes({ ...checkboxes, agb: checked as boolean })}
                    className="mt-0.5"
                  />
                  <Label htmlFor="agb" className="text-sm leading-relaxed cursor-pointer">
                    Ich habe die AGB und Widerrufsbelehrung zur Kenntnis genommen und akzeptiere diese.
                  </Label>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(3)} className="flex-1">
                  Zurück
                </Button>
                <Button
                  onClick={handleVorvertragSubmit}
                  disabled={vorvertragMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {vorvertragMutation.isPending ? "Erstelle Account..." : "Verbindlich anmelden"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
