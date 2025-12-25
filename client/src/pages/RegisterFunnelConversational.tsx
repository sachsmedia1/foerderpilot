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
import { useTenant } from "@/hooks/useTenant";

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
  
  // tenantId aus URL-Parameter lesen (z.B. /anmeldung?tenant=5)
  const tenantIdFromUrl = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    const id = params.get('tenant');
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
  
  // Tenant-Branding via useTenant Hook (Query-Parameter oder Context)
  // WICHTIG: tenantIdFromUrl direkt übergeben für sofortiges Laden
  const tenant = useTenant(tenantIdFromUrl || undefined);
  
  // tenantId State - initialisiert mit URL-Parameter oder Fallback
  // useMemo statt useState für sofortige Reaktion auf URL-Änderung
  const effectiveTenantId = tenantIdFromUrl || tenant.tenantId || 1;
  const [tenantId, setTenantId] = useState<number>(effectiveTenantId);
  
  // Sync tenantId wenn sich URL oder tenant ändert
  useEffect(() => {
    const newTenantId = tenantIdFromUrl || tenant.tenantId || 1;
    if (newTenantId !== tenantId) {
      console.log('[RegisterFunnel] TenantId geändert:', tenantId, '->', newTenantId);
      setTenantId(newTenantId);
    }
  }, [tenantIdFromUrl, tenant.tenantId]);
  
  // Dynamisches Favicon laden
  useEffect(() => {
    if (tenant.faviconUrl) {
      const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (link) {
        link.href = tenant.faviconUrl;
      }
    }
  }, [tenant.faviconUrl]);
  
  // Debug: Logge Tenant-Daten
  useEffect(() => {
    console.log('[RegisterFunnel] Tenant geladen:', {
      tenantIdFromUrl,
      tenantId,
      tenant: tenant.tenant,
      companyName: tenant.companyName,
      logoUrl: tenant.logoUrl,
    });
  }, [tenant.tenant, tenantId]);

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
  // FÖRDERCHECK QUESTIONS (7-8 Fragen, dynamisch mit conditional Frage 8b)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const foerdercheckQuestions: Question[] = useMemo(() => {
    const baseQuestions: Question[] = [
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
      id: 'kompassCheck',
      type: 'radio',
      icon: '🎫',
      label: 'Haben Sie innerhalb der letzten 12 Monate bereits einen KOMPASS Qualifizierungscheck erhalten?',
      description: 'KOMPASS-Checks können nur alle 12 Monate beantragt werden',
      helpText: 'Wenn Sie bereits einen KOMPASS-Check erhalten haben, müssen mindestens 12 Monate vergangen sein.',
      value: state.foerdercheck.hadKompassCheck ? 'ja' : 'nein',
      onChange: (v) => updateFoerdercheck({ hadKompassCheck: v === 'ja' }),
      options: [
        { value: 'nein', label: 'Nein, ich habe noch nie einen KOMPASS-Check erhalten', icon: '✅' },
        { value: 'ja', label: 'Ja, ich habe bereits einen KOMPASS-Check erhalten', icon: '📅' },
      ],
    },
  ];

  // Conditional Frage 8b: Datum des letzten KOMPASS-Checks (nur wenn hadKompassCheck === true)
  if (state.foerdercheck.hadKompassCheck) {
    baseQuestions.push({
      id: 'kompassCheckDatum',
      type: 'date',
      icon: '📅',
      label: 'Wann haben Sie den letzten KOMPASS-Check erhalten?',
      description: 'Es müssen mindestens 12 Monate vergangen sein',
      helpText: 'Bitte geben Sie das Datum des letzten KOMPASS Qualifizierungschecks an.',
      value: state.foerdercheck.letzterKompassScheckDatum,
      onChange: (v) => updateFoerdercheck({ letzterKompassScheckDatum: v }),
      placeholder: 'TT.MM.JJJJ',
      required: true,
    });
  }

  return baseQuestions;
}, [state.foerdercheck]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEP 1: FÖRDERCHECK SUBMIT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleFoerdercheckSubmit = async () => {
    // Validierung 1: Selbständigkeit seit Datum vorhanden
    if (!state.foerdercheck.selbststaendigkeitSeit) {
      toast.error("Bitte geben Sie das Datum Ihrer Selbständigkeit an.");
      return;
    }

    // Validierung 2: Mindestens 6 Monate selbständig
    const selfEmployedDate = new Date(state.foerdercheck.selbststaendigkeitSeit);
    const monthsSinceSelfEmployed = (Date.now() - selfEmployedDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsSinceSelfEmployed < 6) {
      toast.error(
        `Sie müssen mindestens 6 Monate selbständig sein. Aktuell: ${Math.floor(monthsSinceSelfEmployed)} Monate.`
      );
      return;
    }

    // Validierung 3: KOMPASS-Check Datum vorhanden (wenn hadKompassCheck === true)
    if (state.foerdercheck.hadKompassCheck && !state.foerdercheck.letzterKompassScheckDatum) {
      toast.error("Bitte geben Sie das Datum des letzten KOMPASS-Schecks an.");
      return;
    }

    // Validierung 4: Mindestens 12 Monate seit letztem KOMPASS-Check
    if (state.foerdercheck.hadKompassCheck && state.foerdercheck.letzterKompassScheckDatum) {
      const lastCheckDate = new Date(state.foerdercheck.letzterKompassScheckDatum);
      const monthsSinceLastCheck = (Date.now() - lastCheckDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsSinceLastCheck < 12) {
        toast.error(
          `Sie können erst wieder einen KOMPASS-Check beantragen, wenn mindestens 12 Monate vergangen sind. Aktuell: ${Math.floor(monthsSinceLastCheck)} Monate.`
        );
        return;
      }
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
        {/* Header mit Tenant-Branding */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          {/* Logo oder Firmenname */}
          {tenant.logoUrl ? (
            <img 
              src={tenant.logoUrl} 
              alt={tenant.companyName} 
              className="h-12 mx-auto mb-3 object-contain"
            />
          ) : (
            <h2 
              className="text-lg font-semibold mb-2"
              style={{ color: tenant.primaryColor }}
            >
              {tenant.companyName}
            </h2>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            KOMPASS-Förderung beantragen
          </h1>
          <p className="text-sm text-gray-600">In 4 Schritten zu Ihrer Weiterbildung</p>
        </motion.div>

        {/* Progress Bar wird IN jedem Step separat gerendert */}

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
            className="w-full max-w-3xl mx-auto px-4"
          >
            
            {/* Progress Indicator */}
            <div className="mb-6">
              <Progress value={(2 / 4) * 100} className="h-2 mb-2" />
              <div className="flex justify-between items-center text-xs md:text-sm">
                <span className="font-medium text-indigo-600">Schritt 2 von 4</span>
                <span className="text-gray-500">Kursauswahl</span>
              </div>
            </div>

            {/* Card */}
            <Card className="shadow-lg border border-gray-200">
              <CardContent className="p-6 md:p-8 space-y-6">
                
                {/* Success Message */}
                {foerdercheckErgebnis && (
                  <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">✅</span>
                      <div>
                        <p className="font-semibold text-green-900">
                          Sie qualifizieren sich für {foerdercheckErgebnis.foerderprozent}% Förderung
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          Fördersumme: bis zu €{foerdercheckErgebnis.foerderbetrag}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Headline */}
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                    Wählen Sie Ihren Wunschkurs
                  </h2>
                  <p className="text-sm text-gray-600">
                    Alle Kurse sind KOMPASS-förderfähig
                  </p>
                </div>

                {/* Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kurs auswählen
                  </label>
                  <Select
                    value={state.selectedCourseId?.toString() || ''}
                    onValueChange={(v) => setCourseId(parseInt(v))}
                  >
                    <SelectTrigger className="h-12 md:h-14 text-base border hover:border-indigo-400">
                      <SelectValue placeholder="Bitte wählen Sie einen Kurs" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses?.map((course: any) => (
                        <SelectItem
                          key={course.id}
                          value={course.id.toString()}
                          className="text-base py-2"
                        >
                          {course.name} - €{(course.priceNet / 100).toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                          <h3 className="font-semibold text-base mb-2">{course.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {course.shortDescription || 'Keine Beschreibung verfügbar'}
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Kurspreis:</span>
                              <span className="font-semibold">€{priceInEuro.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-green-700">
                              <span>Förderung ({foerderprozent}%):</span>
                              <span className="font-semibold">-€{foerderbetrag.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold border-t border-blue-300 pt-2">
                              <span>Ihr Eigenanteil:</span>
                              <span>€{eigenanteil.toFixed(2)}</span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1 h-11 md:h-12 text-base"
                  >
                    ← Zurück
                  </Button>
                  <Button
                    onClick={handleKursauswahlSubmit}
                    disabled={!state.selectedCourseId || kursauswahlMutation.isPending}
                    className="flex-1 h-11 md:h-12 text-base font-medium bg-indigo-600 hover:bg-indigo-700"
                  >
                    {kursauswahlMutation.isPending ? 'Speichere...' : 'Weiter →'}
                  </Button>
                </div>

              </CardContent>
            </Card>

            {/* Trust-Signale */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="text-sm">🔒</span> SSL-verschlüsselt
              </span>
              <span className="flex items-center gap-1">
                <span className="text-sm">🛡️</span> DSGVO-konform
              </span>
            </div>

          </motion.div>
        )}

        {/* STEP 3: PERSÖNLICHE DATEN */}
        {state.currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-3xl mx-auto px-4"
          >
            
            {/* Progress Indicator */}
            <div className="mb-6">
              <Progress value={(3 / 4) * 100} className="h-2 mb-2" />
              <div className="flex justify-between items-center text-xs md:text-sm">
                <span className="font-medium text-indigo-600">Schritt 3 von 4</span>
                <span className="text-gray-500">Ihre Daten</span>
              </div>
            </div>

            {/* Card */}
            <Card className="shadow-lg border border-gray-200">
              <CardContent className="p-6 md:p-8 space-y-6">
                
                {/* Headline */}
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                    Ihre persönlichen Daten
                  </h2>
                  <p className="text-sm text-gray-600">
                    Bitte füllen Sie alle Pflichtfelder aus
                  </p>
                </div>

                {/* Formular */}
                <div className="space-y-4">
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

                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1 h-11 md:h-12 text-base"
                  >
                    ← Zurück
                  </Button>
                  <Button
                    onClick={handlePersoenlicheDatenSubmit}
                    disabled={persoenlicheDatenMutation.isPending}
                    className="flex-1 h-11 md:h-12 text-base font-medium bg-indigo-600 hover:bg-indigo-700"
                  >
                    {persoenlicheDatenMutation.isPending ? 'Speichere...' : 'Weiter →'}
                  </Button>
                </div>

              </CardContent>
            </Card>

            {/* Trust-Signale */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="text-sm">🔒</span> SSL-verschlüsselt
              </span>
              <span className="flex items-center gap-1">
                <span className="text-sm">🛡️</span> DSGVO-konform
              </span>
            </div>

          </motion.div>
        )}

        {/* STEP 4: VORVERTRAG-BESTÄTIGUNG */}
        {state.currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-3xl mx-auto px-4"
          >
            
            {/* Progress Indicator */}
            <div className="mb-6">
              <Progress value={(4 / 4) * 100} className="h-2 mb-2" />
              <div className="flex justify-between items-center text-xs md:text-sm">
                <span className="font-medium text-indigo-600">Schritt 4 von 4</span>
                <span className="text-gray-500">Bestätigung</span>
              </div>
            </div>

            {/* Card */}
            <Card className="shadow-lg border border-gray-200">
              <CardContent className="p-6 md:p-8 space-y-6">
                
                {/* Headline */}
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                    Vorvertrag bestätigen
                  </h2>
                  <p className="text-sm text-gray-600">
                    Bitte lesen und bestätigen Sie die folgenden Punkte
                  </p>
                </div>

                {/* Zusammenfassung */}
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

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1 h-11 md:h-12 text-base"
                  >
                    ← Zurück
                  </Button>
                  <Button
                    onClick={handleVorvertragSubmit}
                    disabled={vorvertragMutation.isPending}
                    className="flex-1 h-11 md:h-12 text-base font-medium bg-green-600 hover:bg-green-700"
                  >
                    {vorvertragMutation.isPending ? 'Erstelle Account...' : 'Verbindlich anmelden ✓'}
                  </Button>
                </div>

              </CardContent>
            </Card>

            {/* Trust-Signale */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="text-sm">🔒</span> SSL-verschlüsselt
              </span>
              <span className="flex items-center gap-1">
                <span className="text-sm">🛡️</span> DSGVO-konform
              </span>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
