/**
 * KOMPASS-DOKUMENTTYPEN KONFIGURATION
 * 
 * Definiert alle erforderlichen Dokumenttypen für die KOMPASS-Förderung
 * gemäß offiziellen Förderrichtlinien 2024
 * 
 * Phase 1: Förderberechtigung (vor Kurs) - 4 Dokumente
 * Phase 2: Rückerstattung (nach Kurs) - 3 Dokumente
 */

export interface DocumentTypeConfig {
  id: string;
  label: string;
  description: string;
  phase: 1 | 2; // Phase 1 = vor Kurs, Phase 2 = nach Kurs
  generated?: boolean; // Wird automatisch vom System generiert
  validationRules: {
    maxSize: number; // in Bytes
    allowedFormats: string[]; // Dateiendungen
  };
  helpText?: string; // Zusätzliche Hilfe für Teilnehmer
}

export const KOMPASS_DOCUMENT_TYPES: DocumentTypeConfig[] = [
  // ============================================================================
  // PHASE 1: FÖRDERBERECHTIGUNG (vor Kurs)
  // ============================================================================
  {
    id: 'nachweis_haupterwerb',
    label: 'Nachweis Haupterwerb',
    description: 'Steuerberater-Erklärung oder Einkommensteuerbescheid der letzten 2 Jahre',
    phase: 1,
    validationRules: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
    },
    helpText: 'Nachweis, dass Ihre selbständige Tätigkeit Ihr Haupterwerb ist. Akzeptiert werden: Steuerberater-Erklärung oder Einkommensteuerbescheide der letzten 2 Jahre.',
  },
  {
    id: 'vzae_rechner',
    label: 'VZÄ-Rechner',
    description: 'Ausgefüllter VZÄ-Rechner (Vollzeitäquivalente)',
    phase: 1,
    validationRules: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedFormats: ['pdf', 'xlsx', 'xls'],
    },
    helpText: 'Laden Sie die Excel-Vorlage herunter, füllen Sie sie aus und laden Sie sie hier hoch. Der VZÄ-Rechner dokumentiert Ihre Mitarbeiteranzahl.',
  },
  {
    id: 'nachweis_beginn_selbststaendigkeit',
    label: 'Nachweis Beginn Selbstständigkeit',
    description: 'Gewerbeanmeldung, Finanzamtsbescheid oder KSK-Bestätigung',
    phase: 1,
    validationRules: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
    },
    helpText: 'Offizieller Nachweis über den Beginn Ihrer selbständigen Tätigkeit. Akzeptiert werden: Gewerbeanmeldung, Finanzamtsbescheid oder Künstlersozialkasse-Bestätigung.',
  },
  {
    id: 'de_minimis_erklaerung',
    label: 'De-minimis-Erklärung',
    description: 'Erklärung über erhaltene De-minimis-Beihilfen (automatisch generiert)',
    phase: 1,
    generated: true, // Wird vom System erstellt
    validationRules: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedFormats: ['pdf'],
    },
    helpText: 'Dieses Dokument wird automatisch nach Ihrer Anmeldung erstellt. Bitte ausdrucken, unterschreiben und hier hochladen.',
  },
  
  // ============================================================================
  // PHASE 2: RÜCKERSTATTUNG (nach Kurs)
  // ============================================================================
  {
    id: 'teilnahmebescheinigung',
    label: 'Teilnahmebescheinigung',
    description: 'Vom Bildungsträger ausgestellte Teilnahmebescheinigung',
    phase: 2,
    validationRules: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
    },
    helpText: 'Die Teilnahmebescheinigung erhalten Sie nach erfolgreichem Abschluss des Kurses vom Bildungsträger.',
  },
  {
    id: 'kursrechnung',
    label: 'Kursrechnung',
    description: 'Rechnung des Bildungsträgers über die Kurskosten',
    phase: 2,
    validationRules: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedFormats: ['pdf'],
    },
    helpText: 'Die offizielle Rechnung des Bildungsträgers mit allen Kurskosten.',
  },
  {
    id: 'zahlungsnachweis',
    label: 'Zahlungsnachweis',
    description: 'Kontoauszug oder Überweisungsbeleg als Zahlungsnachweis',
    phase: 2,
    validationRules: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
    },
    helpText: 'Nachweis, dass Sie die Kursgebühr bezahlt haben. Kontoauszug oder Überweisungsbeleg.',
  },
];

/**
 * Helper: Phase 1 Dokumente (vor Kurs)
 */
export function getPhase1DocumentTypes(): DocumentTypeConfig[] {
  return KOMPASS_DOCUMENT_TYPES.filter(type => type.phase === 1);
}

/**
 * Helper: Phase 2 Dokumente (nach Kurs)
 */
export function getPhase2DocumentTypes(): DocumentTypeConfig[] {
  return KOMPASS_DOCUMENT_TYPES.filter(type => type.phase === 2);
}

/**
 * Helper: Alle Dokumenttypen
 */
export function getAllDocumentTypes(): DocumentTypeConfig[] {
  return KOMPASS_DOCUMENT_TYPES;
}

/**
 * Helper: Dokumenttyp nach ID finden
 */
export function getDocumentTypeById(id: string): DocumentTypeConfig | undefined {
  return KOMPASS_DOCUMENT_TYPES.find(type => type.id === id);
}

/**
 * Validierung: Datei vor Upload prüfen
 */
export function validateFile(
  documentTypeId: string,
  fileSize: number,
  fileName: string
): { valid: boolean; error?: string } {
  const documentType = getDocumentTypeById(documentTypeId);
  
  if (!documentType) {
    return { valid: false, error: `Ungültiger Dokumenttyp: ${documentTypeId}` };
  }

  // Größe prüfen
  if (fileSize > documentType.validationRules.maxSize) {
    const maxMB = Math.round(documentType.validationRules.maxSize / 1024 / 1024);
    return { valid: false, error: `Datei zu groß. Maximal ${maxMB}MB erlaubt.` };
  }

  // Format prüfen
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  if (!fileExtension || !documentType.validationRules.allowedFormats.includes(fileExtension)) {
    return {
      valid: false,
      error: `Ungültiges Dateiformat. Erlaubt: ${documentType.validationRules.allowedFormats.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * AI-Validierungs-Prompts für jeden Dokumenttyp
 */
export const AI_VALIDATION_PROMPTS: Record<string, string> = {
  nachweis_haupterwerb: `Prüfe, ob das Dokument ein gültiger Nachweis für Haupterwerb ist:
- Steuerberater-Erklärung ODER Einkommensteuerbescheid der letzten 2 Jahre
- Muss Einkünfte aus selbständiger Tätigkeit zeigen
- Dokument muss aktuell sein (nicht älter als 2 Jahre)
- Muss Name und Adresse des Antragstellers enthalten

Gib zurück:
- "valid" wenn alle Kriterien erfüllt sind
- "invalid" wenn offensichtlich falsch
- "manual_review" wenn unklar`,

  vzae_rechner: `Prüfe, ob das Dokument ein ausgefüllter VZÄ-Rechner ist:
- Excel-Datei oder PDF mit VZÄ-Berechnung
- Muss Mitarbeiteranzahl und Arbeitsstunden enthalten
- Formular muss vollständig ausgefüllt sein
- Unterschrift/Datum vorhanden

Gib zurück:
- "valid" wenn alle Kriterien erfüllt sind
- "invalid" wenn offensichtlich falsch
- "manual_review" wenn unklar`,

  nachweis_beginn_selbststaendigkeit: `Prüfe, ob das Dokument ein gültiger Nachweis für Beginn der Selbstständigkeit ist:
- Gewerbeanmeldung ODER Finanzamtsbescheid ODER KSK-Bestätigung
- Muss Datum des Beginns der selbständigen Tätigkeit enthalten
- Muss Name und Adresse des Antragstellers enthalten
- Dokument muss offiziell sein (Behörden-Stempel/Logo)

Gib zurück:
- "valid" wenn alle Kriterien erfüllt sind
- "invalid" wenn offensichtlich falsch
- "manual_review" wenn unklar`,

  de_minimis_erklaerung: `Prüfe, ob das Dokument eine unterschriebene De-minimis-Erklärung ist:
- Muss De-minimis-Erklärung sein (erkennbar am Titel)
- Muss unterschrieben sein
- Muss Datum enthalten
- Muss Name und Adresse des Antragstellers enthalten

Gib zurück:
- "valid" wenn alle Kriterien erfüllt sind
- "invalid" wenn offensichtlich falsch
- "manual_review" wenn unklar`,

  teilnahmebescheinigung: `Prüfe, ob das Dokument eine gültige Teilnahmebescheinigung ist:
- Muss vom Bildungsträger ausgestellt sein
- Muss Name des Teilnehmers enthalten
- Muss Kursname und Zeitraum enthalten
- Muss Unterschrift/Stempel des Bildungsträgers haben

Gib zurück:
- "valid" wenn alle Kriterien erfüllt sind
- "invalid" wenn offensichtlich falsch
- "manual_review" wenn unklar`,

  kursrechnung: `Prüfe, ob das Dokument eine gültige Kursrechnung ist:
- Muss vom Bildungsträger ausgestellt sein
- Muss Rechnungsnummer enthalten
- Muss Kursname und Preis enthalten
- Muss Name des Teilnehmers enthalten
- Muss Datum enthalten

Gib zurück:
- "valid" wenn alle Kriterien erfüllt sind
- "invalid" wenn offensichtlich falsch
- "manual_review" wenn unklar`,

  zahlungsnachweis: `Prüfe, ob das Dokument ein gültiger Zahlungsnachweis ist:
- Kontoauszug ODER Überweisungsbeleg
- Muss Zahlungsempfänger (Bildungsträger) zeigen
- Muss Betrag enthalten
- Muss Datum enthalten
- Muss Name des Zahlers enthalten

Gib zurück:
- "valid" wenn alle Kriterien erfüllt sind
- "invalid" wenn offensichtlich falsch
- "manual_review" wenn unklar`,
};
