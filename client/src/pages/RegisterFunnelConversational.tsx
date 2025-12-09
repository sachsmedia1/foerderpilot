/**
 * REGISTER FUNNEL - Conversational 4-Step-Funnel (REDESIGNED)
 * 
 * Features:
 * - Eine Frage pro Screen (Typeform-Style)
 * - Framer Motion Animations
 * - localStorage Persistence (Felder bleiben bei Reload)
 * - Visual Progress Bar (animiert)
 * - Trust-Signale (🔒 Sicher, ⏱️ ~2 Min)
 * - Mobile-First Design
 * 
 * Steps:
 * 1. Fördercheck (7 Einzelfragen)
 * 2. Kursauswahl (Visual Cards)
 * 3. Persönliche Daten (Progressive Form)
 * 4. Vorvertrag-Bestätigung
 */

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useLocation, useSearch } from "wouter";
import { useFunnelState } from "@/hooks/useFunnelState";
import { FunnelQuestion, type Question } from "@/components/funnel/FunnelQuestion";
import { FunnelResult } from "@/components/funnel/FunnelResult";

// UUID Generator
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function RegisterFunnelConversational() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  
  // courseId aus URL-Parameter lesen (z.B. /anmeldung-neu?courseId=450001)
  const courseIdFromUrl = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    const id = params.get('courseId');
    return id ? parseInt(id) : null;
  }, [searchParams]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATE MANAGEMENT (mit localStorage Persistence)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const {
    state,
    updateFoerdercheck,
    updatePersoenlicheDaten,
    updateCheckboxes,
    nextStep,
    prevStep,
    nextQuestion,
    prevQuestion,
    setStep,
    setCourseId,
    clearState,
  } = useFunnelState();

  const [sessionId] = useState(() => generateUUID());
  const [foerdercheckErgebnis, setFoerdercheckErgebnis] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [tenantId, setTenantId] = useState<number>(1); // Default: FörderPilot App

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRPC MUTATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const foerdercheckMutation = trpc.register.foerdercheck.useMutation();
  const kursauswahlMutation = trpc.register.kursauswahl.useMutation();
  const persoenlicheDatenMutation = trpc.register.persoenlicheDaten.useMutation();
  const vorvertragMutation = trpc.register.vorvertragBestaetigen.useMutation();

  const { data: courses } = trpc.register.getCourses.useQuery({ tenantId });
  const { data: tenantInfo } = trpc.register.getTenantPublicInfo.useQuery({ tenantId });

  // Lade tenantId aus courseId wenn Direktlink
  const { data: courseFromUrl } = trpc.register.getCourseById.useQuery(
    { courseId: courseIdFromUrl! },
    { enabled: !!courseIdFromUrl }
  );

  useEffect(() => {
    if (courseFromUrl) {
      setTenantId(courseFromUrl.tenantId);
    }
  }, [courseFromUrl]);

  // Auto-select Kurs wenn courseId in URL
  useEffect(() => {
    if (courseIdFromUrl && state.currentStep === 2 && !state.selectedCourseId) {
      setCourseId(courseIdFromUrl);
    }
  }, [courseIdFromUrl, state.currentStep, state.selectedCourseId, setCourseId]);

  // Setze selectedCourse wenn selectedCourseId sich ändert
  useEffect(() => {
    if (state.selectedCourseId && courses) {
      const course = courses.find((c: any) => c.id === state.selectedCourseId);
      if (course) {
        setSelectedCourse(course);
      }
    }
  }, [state.selectedCourseId, courses]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FÖRDERCHECK QUESTIONS (7 Fragen als Array)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const foerdercheckQuestions: Question[] = [
    {
      id: 'wohnsitz',
      type: 'radio',
      icon: '🏠',
      label: 'Haben Sie Ihren Wohnsitz in Deutschland?',
      description: 'Für KOMPASS-Förderung ist ein deutscher Wohnsitz Voraussetzung',
      value: state.foerdercheck.wohnsitzDeutschland ? 'ja' : 'nein',
      onChange: (v) => updateFoerdercheck({ wohnsitzDeutschland: v === 'ja' }),
      options: [
        { value: 'ja', label: 'Ja, ich wohne in Deutschland', icon: '✅' },
        { value: 'nein', label: 'Nein, ich wohne im Ausland', icon: '❌' },
      ],
    },
    {
      id: 'hauptberuflich',
      type: 'radio',
      icon: '💼',
      label: 'Sind Sie hauptberuflich selbstständig?',
      description: 'Sie müssen hauptberuflich selbstständig sein',
      helpText: 'Hauptberuflich bedeutet: Mehr als 50% Ihrer Arbeitszeit ist selbstständige Tätigkeit',
      value: state.foerdercheck.hauptberuflichSelbststaendig ? 'ja' : 'nein',
      onChange: (v) => updateFoerdercheck({ hauptberuflichSelbststaendig: v === 'ja' }),
      options: [
        { value: 'ja', label: 'Ja, hauptberuflich selbstständig', icon: '👔' },
        { value: 'nein', label: 'Nein, angestellt/nebenberuflich', icon: '💼' },
      ],
    },
    {
      id: 'einkuenfte',
      type: 'radio',
      icon: '💰',
      label: 'Erzielen Sie mindestens 51% Ihrer Einkünfte aus Ihrer selbstständigen Tätigkeit?',
      helpText: 'Berechnung: (Einkünfte aus Selbstständigkeit / Gesamteinkünfte) × 100 ≥ 51%',
      value: state.foerdercheck.mindestens51ProzentEinkuenfte ? 'ja' : 'nein',
      onChange: (v) => updateFoerdercheck({ mindestens51ProzentEinkuenfte: v === 'ja' }),
      options: [
        { value: 'ja', label: 'Ja, mindestens 51%', icon: '✅' },
        { value: 'nein', label: 'Nein, weniger als 51%', icon: '❌' },
      ],
    },
    {
      id: 'mitarbeiter',
      type: 'select',
      icon: '👥',
      label: 'Wie viele Mitarbeiter beschäftigen Sie (Vollzeitäquivalente)?',
      helpText: 'VZÄ = Vollzeitäquivalent. Beispiel: 2 Teilzeitkräfte à 20h/Woche = 1 VZÄ',
      value: state.foerdercheck.mitarbeiterVzae.toString(),
      onChange: (v) => updateFoerdercheck({ mitarbeiterVzae: parseFloat(v) }),
      options: [
        { value: '0', label: '0 (Solo-Selbstständig)' },
        { value: '0.5', label: '0,5 VZÄ' },
        { value: '1', label: '1 VZÄ' },
        { value: '1.5', label: '1,5 VZÄ' },
        { value: '2', label: '2 VZÄ oder mehr' },
      ],
    },
    {
      id: 'selbststaendigkeitSeit',
      type: 'date',
      icon: '📅',
      label: 'Seit wann sind Sie selbstständig?',
      description: 'Geben Sie das Datum Ihrer Gewerbeanmeldung an',
      helpText: 'Sie müssen mindestens 6 Monate selbstständig sein, um förderfähig zu sein',
      value: state.foerdercheck.selbststaendigkeitSeit,
      onChange: (v) => updateFoerdercheck({ selbststaendigkeitSeit: v }),
      placeholder: 'TT.MM.JJJJ',
      required: true,
    },
    {
      id: 'deminimis',
      type: 'number',
      icon: '💶',
      label: 'Haben Sie in den letzten 3 Jahren De-minimis-Beihilfen erhalten?',
      description: 'Summe aller erhaltenen Förderungen (z.B. KOMPASS, BAFA, etc.)',
      helpText: 'De-minimis-Grenze: Max. 300.000€ in 3 Jahren. Wenn Sie unsicher sind, geben Sie 0 ein.',
      value: state.foerdercheck.deminimisBeihilfen.toString(),
      onChange: (v) => updateFoerdercheck({ deminimisBeihilfen: parseFloat(v) || 0 }),
      placeholder: '0',
    },
    {
      id: 'kompassSchecks',
      type: 'select',
      icon: '🎫',
      label: 'Wie viele KOMPASS-Gutscheine haben Sie bereits genutzt?',
      helpText: 'Sie können maximal 2 KOMPASS-Gutscheine nutzen. Bei Erstantrag wählen Sie "0".',
      value: state.foerdercheck.kompassSchecksAnzahl.toString(),
      onChange: (v) => updateFoerdercheck({ kompassSchecksAnzahl: parseInt(v) }),
      options: [
        { value: '0', label: '0 (Erstantrag)' },
        { value: '1', label: '1 (Zweitantrag)' },
        { value: '2', label: '2 (Kontingent ausgeschöpft)' },
      ],
    },
  ];

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 1: FÖRDERCHECK SUBMIT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleFoerdercheckSubmit = async () => {
    // Validierung
    if (!state.foerdercheck.selbststaendigkeitSeit) {
      toast.error("Bitte geben Sie das Datum Ihrer Selbstständigkeit an.");
      return;
    }

    if (state.foerdercheck.kompassSchecksAnzahl > 0 && !state.foerdercheck.letzterKompassScheckDatum) {
      toast.error("Bitte geben Sie das Datum des letzten KOMPASS-Schecks an.");
      return;
    }

    try {
      const result = await foerdercheckMutation.mutateAsync({
        sessionId,
        tenantId,
        ...state.foerdercheck,
      });

      setFoerdercheckErgebnis(result);

      if (result.ergebnis === "nicht_foerderfaehig") {
        toast.error(result.message);
        // Nicht weitergehen
      } else {
        toast.success(result.message);
        nextStep();
      }
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Fördercheck");
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 2: KURSAUSWAHL SUBMIT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleKursauswahlSubmit = async () => {
    if (!state.selectedCourseId) {
      toast.error("Bitte wählen Sie einen Kurs aus.");
      return;
    }

    try {
      await kursauswahlMutation.mutateAsync({
        sessionId,
        courseId: state.selectedCourseId,
      });

      toast.success("Kurs ausgewählt!");
      nextStep();
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
      !state.persoenlicheDaten.firstName ||
      !state.persoenlicheDaten.lastName ||
      !state.persoenlicheDaten.email ||
      !state.persoenlicheDaten.phone ||
      !state.persoenlicheDaten.street ||
      !state.persoenlicheDaten.zipCode ||
      !state.persoenlicheDaten.city ||
      !state.persoenlicheDaten.dateOfBirth
    ) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }

    try {
      await persoenlicheDatenMutation.mutateAsync({
        sessionId,
        ...state.persoenlicheDaten,
      });

      toast.success("Daten gespeichert!");
      nextStep();
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Speichern der Daten");
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 4: VORVERTRAG SUBMIT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleVorvertragSubmit = async () => {
    if (!state.checkboxes.zuarbeit || !state.checkboxes.teilnahme || !state.checkboxes.datenschutz || !state.checkboxes.agb) {
      toast.error("Bitte bestätigen Sie alle Checkboxen.");
      return;
    }

    try {
      const result = await vorvertragMutation.mutateAsync({
        sessionId,
        checkboxZuarbeit: state.checkboxes.zuarbeit,
        checkboxTeilnahme: state.checkboxes.teilnahme,
        checkboxDatenschutz: state.checkboxes.datenschutz,
        checkboxAgb: state.checkboxes.agb,
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
  const totalSteps = 4;
  const progress = (state.currentStep / totalSteps) * 100;

  // Substep Progress für Fördercheck (7 Fragen)
  let detailedProgress = progress;
  if (state.currentStep === 1) {
    const questionProgress = (state.currentQuestion / foerdercheckQuestions.length) * (100 / totalSteps);
    detailedProgress = questionProgress;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">
            KOMPASS-Förderung beantragen
          </h1>
          <p className="text-gray-600 text-sm md:text-base">In 4 Schritten zu Ihrer Weiterbildung</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-12">
          <Progress value={detailedProgress} className="h-3" />
          <div className="flex justify-between mt-3 text-xs md:text-sm text-gray-600">
            <span className={state.currentStep >= 1 ? "font-semibold text-indigo-600" : ""}>1. Fördercheck</span>
            <span className={state.currentStep >= 2 ? "font-semibold text-indigo-600" : ""}>2. Kursauswahl</span>
            <span className={state.currentStep >= 3 ? "font-semibold text-indigo-600" : ""}>3. Ihre Daten</span>
            <span className={state.currentStep >= 4 ? "font-semibold text-indigo-600" : ""}>4. Bestätigung</span>
          </div>
        </div>

        {/* STEP 1: FÖRDERCHECK (Conversational) */}
        {state.currentStep === 1 && state.currentQuestion < foerdercheckQuestions.length && (
          <AnimatePresence mode="wait">
            <FunnelQuestion
              key={`question-${state.currentQuestion}`}
              question={foerdercheckQuestions[state.currentQuestion]}
              onNext={nextQuestion}
              onBack={state.currentQuestion > 0 ? prevQuestion : undefined}
              currentIndex={state.currentQuestion}
              totalQuestions={foerdercheckQuestions.length}
              isLastQuestion={state.currentQuestion === foerdercheckQuestions.length - 1}
              onSubmit={handleFoerdercheckSubmit}
              isSubmitting={foerdercheckMutation.isPending}
            />
          </AnimatePresence>
        )}

        {/* FÖRDERCHECK RESULT */}
        {foerdercheckErgebnis && state.currentStep === 1 && state.currentQuestion >= foerdercheckQuestions.length && (
          <FunnelResult
            ergebnis={foerdercheckErgebnis}
            onNext={nextStep}
          />
        )}

        {/* STEP 2: KURSAUSWAHL */}
        {state.currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Schritt 2: Kursauswahl</CardTitle>
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
                {/* Kursauswahl-Dropdown nur anzeigen wenn NICHT über Direktlink vorselektiert */}
                {!(courseIdFromUrl && state.selectedCourseId === courseIdFromUrl) && (
                  <div>
                    <Label htmlFor="course">Kurs auswählen</Label>
                    <Select
                      value={state.selectedCourseId?.toString() || ""}
                      onValueChange={(v) => setCourseId(parseInt(v))}
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
                )}

                {/* Kurs-Details */}
                {state.selectedCourseId && courses && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    {(() => {
                      const course = courses.find((c: any) => c.id === state.selectedCourseId);
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
                  <Button variant="outline" onClick={prevStep} className="flex-1">
                    Zurück
                  </Button>
                  <Button
                    onClick={handleKursauswahlSubmit}
                    disabled={!state.selectedCourseId || kursauswahlMutation.isPending}
                    className="flex-1"
                  >
                    {kursauswahlMutation.isPending ? "Speichere..." : "Weiter"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 3: PERSÖNLICHE DATEN */}
        {state.currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Schritt 3: Ihre persönlichen Daten</CardTitle>
                <CardDescription>Bitte füllen Sie alle Felder aus</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Vorname *</Label>
                    <Input
                      id="firstName"
                      value={state.persoenlicheDaten.firstName}
                      onChange={(e) => updatePersoenlicheDaten({ firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nachname *</Label>
                    <Input
                      id="lastName"
                      value={state.persoenlicheDaten.lastName}
                      onChange={(e) => updatePersoenlicheDaten({ lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={state.persoenlicheDaten.email}
                    onChange={(e) => updatePersoenlicheDaten({ email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={state.persoenlicheDaten.phone}
                    onChange={(e) => updatePersoenlicheDaten({ phone: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="street">Straße & Hausnummer *</Label>
                  <Input
                    id="street"
                    value={state.persoenlicheDaten.street}
                    onChange={(e) => updatePersoenlicheDaten({ street: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">PLZ *</Label>
                    <Input
                      id="zipCode"
                      value={state.persoenlicheDaten.zipCode}
                      onChange={(e) => updatePersoenlicheDaten({ zipCode: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Ort *</Label>
                    <Input
                      id="city"
                      value={state.persoenlicheDaten.city}
                      onChange={(e) => updatePersoenlicheDaten({ city: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="company">Firma (optional)</Label>
                  <Input
                    id="company"
                    value={state.persoenlicheDaten.company}
                    onChange={(e) => updatePersoenlicheDaten({ company: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">Geburtsdatum *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={state.persoenlicheDaten.dateOfBirth}
                    onChange={(e) => updatePersoenlicheDaten({ dateOfBirth: e.target.value })}
                  />
                </div>

                {/* Navigation */}
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={prevStep} className="flex-1">
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
          </motion.div>
        )}

        {/* STEP 4: VORVERTRAG-BESTÄTIGUNG */}
        {state.currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Schritt 4: Vorvertrag bestätigen</CardTitle>
                <CardDescription>Bitte lesen und bestätigen Sie die folgenden Punkte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Vorvertrag-Zusammenfassung */}
                <div className="p-4 bg-gray-50 border rounded-lg text-sm space-y-2">
                  <h3 className="font-semibold">Zusammenfassung:</h3>
                  <p>
                    <strong>Name:</strong> {state.persoenlicheDaten.firstName} {state.persoenlicheDaten.lastName}
                  </p>
                  {(() => {
                    const course = courses?.find((c: any) => c.id === state.selectedCourseId);
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
                      checked={state.checkboxes.zuarbeit}
                      onCheckedChange={(checked) => updateCheckboxes({ zuarbeit: checked as boolean })}
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
                      checked={state.checkboxes.teilnahme}
                      onCheckedChange={(checked) => updateCheckboxes({ teilnahme: checked as boolean })}
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
                      checked={state.checkboxes.datenschutz}
                      onCheckedChange={(checked) => updateCheckboxes({ datenschutz: checked as boolean })}
                      className="mt-0.5"
                    />
                    <Label htmlFor="datenschutz" className="text-sm leading-relaxed cursor-pointer">
                      Ich willige in die Datenverarbeitung durch {tenantInfo?.companyName || "den Bildungsträger"} ein.
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="agb"
                      checked={state.checkboxes.agb}
                      onCheckedChange={(checked) => updateCheckboxes({ agb: checked as boolean })}
                      className="mt-0.5"
                    />
                    <Label htmlFor="agb" className="text-sm leading-relaxed cursor-pointer">
                      Ich habe die{" "}
                      {tenantInfo?.agbUrl ? (
                        <a href={tenantInfo.agbUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          AGB
                        </a>
                      ) : (
                        "AGB"
                      )}
                      {" "}und{" "}
                      {tenantInfo?.widerrufsbelehrungUrl ? (
                        <a href={tenantInfo.widerrufsbelehrungUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Widerrufsbelehrung
                        </a>
                      ) : (
                        "Widerrufsbelehrung"
                      )}
                      {" "}zur Kenntnis genommen und akzeptiere diese.
                    </Label>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={prevStep} className="flex-1">
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
          </motion.div>
        )}
      </div>
    </div>
  );
}
