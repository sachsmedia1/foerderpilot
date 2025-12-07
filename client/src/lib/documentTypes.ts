/**
 * FOERDERPILOT - KOMPASS DOCUMENT TYPES
 * 
 * Definiert die 9 offiziellen KOMPASS-Dokumenttypen in 2 Phasen:
 * - Phase 1 (VOR Kurs): 6 Dokumente für Förderberechtigung
 * - Phase 2 (NACH Kurs): 3 Dokumente für Rückerstattung
 */

export type DocumentType = 
  // Phase 1 (VOR Kurs-Beginn)
  | 'personalausweis'
  | 'einkommensteuerbescheid'
  | 'gewerbeanmeldung'
  | 'vzae_rechner'
  | 'de_minimis_erklaerung'
  | 'bankkonto_bestaetigung'
  // Phase 2 (NACH Kurs-Abschluss)
  | 'teilnahmebescheinigung'
  | 'kursrechnung'
  | 'zahlungsnachweis';

export interface DocumentConfig {
  type: DocumentType;
  label: string;
  description: string;
  phase: 1 | 2; // 1 = VOR Kurs, 2 = NACH Kurs
  required: boolean;
  helpText: string;
  acceptedFormats: string[]; // MIME types für file input
  icon: string; // Lucide icon name
}

export const DOCUMENT_CONFIGS: Record<DocumentType, DocumentConfig> = {
  // ========== PHASE 1: VOR KURS-BEGINN ==========
  personalausweis: {
    type: 'personalausweis',
    label: 'Personalausweis oder Reisepass',
    description: 'Gültiger Lichtbildausweis (Vorder- und Rückseite)',
    phase: 1,
    required: true,
    helpText: 'Bitte laden Sie beide Seiten Ihres Personalausweises oder Reisepasses hoch. Das Dokument muss gültig sein.',
    acceptedFormats: ['image/*', 'application/pdf'],
    icon: 'IdCard',
  },
  
  einkommensteuerbescheid: {
    type: 'einkommensteuerbescheid',
    label: 'Einkommensteuerbescheid',
    description: 'Einkommensteuerbescheid der letzten 2 Jahre',
    phase: 1,
    required: true,
    helpText: 'Nachweis über Ihr Einkommen als Solo-Selbstständige/r. Laden Sie die Bescheide der letzten beiden Jahre hoch (2 separate Dateien oder 1 kombinierte PDF).',
    acceptedFormats: ['application/pdf'],
    icon: 'FileText',
  },
  
  gewerbeanmeldung: {
    type: 'gewerbeanmeldung',
    label: 'Gewerbeanmeldung / Freiberufleranmeldung',
    description: 'Nachweis Ihrer selbstständigen Tätigkeit',
    phase: 1,
    required: true,
    helpText: 'Gewerbeanmeldung vom Gewerbeamt oder Nachweis über freiberufliche Tätigkeit (z.B. Finanzamt-Bescheid, Anmeldung beim Finanzamt).',
    acceptedFormats: ['application/pdf', 'image/*'],
    icon: 'Briefcase',
  },
  
  vzae_rechner: {
    type: 'vzae_rechner',
    label: 'VZÄ-Rechner (Vollzeitäquivalent)',
    description: 'Berechnung Ihrer Mitarbeiter-Kapazität',
    phase: 1,
    required: true,
    helpText: 'Excel-Datei oder PDF mit Berechnung Ihrer VZÄ (Vollzeitäquivalente). Wichtig: Sie dürfen maximal 1 VZÄ haben, um für KOMPASS-Förderung berechtigt zu sein.',
    acceptedFormats: ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    icon: 'Calculator',
  },
  
  de_minimis_erklaerung: {
    type: 'de_minimis_erklaerung',
    label: 'De-minimis-Erklärung',
    description: 'Erklärung über erhaltene Beihilfen (max. €300.000 in 3 Jahren)',
    phase: 1,
    required: true,
    helpText: 'Nachweis, dass Sie in den letzten 3 Jahren nicht mehr als €300.000 an De-minimis-Beihilfen erhalten haben. Formular erhalten Sie vom Bildungsträger.',
    acceptedFormats: ['application/pdf'],
    icon: 'FileCheck',
  },
  
  bankkonto_bestaetigung: {
    type: 'bankkonto_bestaetigung',
    label: 'Bankbestätigung Geschäftskonto',
    description: 'Nachweis Ihres geschäftlichen Bankkontos',
    phase: 1,
    required: true,
    helpText: 'Kontoauszug oder Bestätigung Ihrer Bank über Ihr geschäftliches Bankkonto. Das Konto muss auf Ihren Namen oder Ihre Firma lauten.',
    acceptedFormats: ['application/pdf', 'image/*'],
    icon: 'Building2',
  },

  // ========== PHASE 2: NACH KURS-ABSCHLUSS ==========
  teilnahmebescheinigung: {
    type: 'teilnahmebescheinigung',
    label: 'Teilnahmebescheinigung',
    description: 'Bestätigung über erfolgreiche Kursteilnahme',
    phase: 2,
    required: true,
    helpText: 'Vom Bildungsträger ausgestellte Teilnahmebescheinigung nach Kurs-Abschluss. Diese erhalten Sie automatisch nach erfolgreicher Teilnahme.',
    acceptedFormats: ['application/pdf'],
    icon: 'Award',
  },
  
  kursrechnung: {
    type: 'kursrechnung',
    label: 'Kursrechnung',
    description: 'Rechnung des Bildungsträgers (max. €5.000 netto)',
    phase: 2,
    required: true,
    helpText: 'Rechnung über die Kurskosten. Maximal €5.000 netto sind förderfähig. Die Rechnung muss auf Ihren Namen oder Ihre Firma ausgestellt sein.',
    acceptedFormats: ['application/pdf'],
    icon: 'Receipt',
  },
  
  zahlungsnachweis: {
    type: 'zahlungsnachweis',
    label: 'Zahlungsnachweis',
    description: 'Nachweis über Bezahlung der Kursrechnung',
    phase: 2,
    required: true,
    helpText: 'Kontoauszug oder Überweisungsbeleg als Nachweis der Zahlung. Die Zahlung muss von Ihrem Geschäftskonto erfolgt sein.',
    acceptedFormats: ['application/pdf', 'image/*'],
    icon: 'CreditCard',
  },
};

// ========== HELPER FUNCTIONS ==========

/**
 * Get all documents for a specific phase
 */
export function getDocumentsByPhase(phase: 1 | 2): DocumentConfig[] {
  return Object.values(DOCUMENT_CONFIGS).filter(doc => doc.phase === phase);
}

/**
 * Get all required documents
 */
export function getRequiredDocuments(): DocumentConfig[] {
  return Object.values(DOCUMENT_CONFIGS).filter(doc => doc.required);
}

/**
 * Get document label by type
 */
export function getDocumentLabel(type: DocumentType): string {
  return DOCUMENT_CONFIGS[type]?.label || type;
}

/**
 * Get document config by type
 */
export function getDocumentConfig(type: DocumentType): DocumentConfig | undefined {
  return DOCUMENT_CONFIGS[type];
}

/**
 * Check if all Phase 1 documents are complete
 */
export function isPhase1Complete(uploadedTypes: DocumentType[]): boolean {
  const phase1Types = getDocumentsByPhase(1).map(d => d.type);
  return phase1Types.every(type => uploadedTypes.includes(type));
}

/**
 * Check if all Phase 2 documents are complete
 */
export function isPhase2Complete(uploadedTypes: DocumentType[]): boolean {
  const phase2Types = getDocumentsByPhase(2).map(d => d.type);
  return phase2Types.every(type => uploadedTypes.includes(type));
}

/**
 * Get progress for a phase (0-100%)
 */
export function getPhaseProgress(phase: 1 | 2, uploadedTypes: DocumentType[]): number {
  const phaseTypes = getDocumentsByPhase(phase).map(d => d.type);
  const uploaded = phaseTypes.filter(type => uploadedTypes.includes(type)).length;
  return Math.round((uploaded / phaseTypes.length) * 100);
}
