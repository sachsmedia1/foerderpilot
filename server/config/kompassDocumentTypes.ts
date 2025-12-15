/**
 * KOMPASS-DOKUMENTTYPEN KONFIGURATION
 * 
 * Definiert alle erforderlichen, bedingten und optionalen Dokumenttypen
 * für die KOMPASS-Förderung gemäß Förderrichtlinien 2024
 */

export interface DocumentTypeConfig {
  id: string;
  label: string;
  description: string;
  category: 'required' | 'conditional' | 'optional';
  generated?: boolean; // Wird automatisch vom System generiert
  condition?: (participant: { mitarbeiterAnzahl: number }) => boolean;
  validationRules: {
    maxSize: number; // in Bytes
    allowedFormats: string[]; // Dateiendungen
  };
  helpText?: string; // Zusätzliche Hilfe für Teilnehmer
}

export const KOMPASS_DOCUMENT_TYPES: DocumentTypeConfig[] = [
  // ============================================================================
  // PFLICHTDOKUMENTE (für alle Teilnehmer)
  // ============================================================================
  {
    id: 'personalausweis',
    label: 'Personalausweis',
    description: 'Kopie Ihres gültigen Personalausweises (Vorder- und Rückseite)',
    category: 'required',
    validationRules: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedFormats: ['pdf', 'jpg', 'jpeg', 'png', 'heic'],
    },
    helpText: 'Bitte beide Seiten in einem Dokument hochladen. Der Ausweis muss gültig sein.',
  },
  {
    id: 'lebenslauf',
    label: 'Lebenslauf',
    description: 'Aktueller tabellarischer Lebenslauf (max. 3 Monate alt)',
    category: 'required',
    validationRules: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedFormats: ['pdf'],
    },
    helpText: 'Der Lebenslauf sollte lückenlos und aktuell sein.',
  },
  {
    id: 'nachweis_selbstaendigkeit',
    label: 'Nachweis Selbständigkeit',
    description: 'Gewerbeanmeldung, Handelsregisterauszug oder Steuernummer-Bescheid',
    category: 'required',
    validationRules: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
    },
    helpText: 'Ein offizielles Dokument, das Ihre selbständige Tätigkeit nachweist. Bei Freiberuflern: Steuernummer-Bescheid.',
  },
  {
    id: 'geschaeftsadresse',
    label: 'Geschäftsadresse-Nachweis',
    description: 'Mietvertrag Büro, Eigentumsurkunde oder Gewerbeanmeldung mit Adresse',
    category: 'required',
    validationRules: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
    },
    helpText: 'Nachweis Ihrer Geschäftsadresse. Bei Home-Office: Gewerbeanmeldung mit Wohnadresse.',
  },
  {
    id: 'de_minimis',
    label: 'De-minimis-Erklärung',
    description: 'Automatisch generiert nach Vorvertrag-Bestätigung',
    category: 'required',
    generated: true, // Wird vom System erstellt
    validationRules: {
      maxSize: 5 * 1024 * 1024,
      allowedFormats: ['pdf'],
    },
    helpText: 'Dieses Dokument wird automatisch nach der Vorvertrag-Bestätigung erstellt und muss nur unterschrieben hochgeladen werden.',
  },
  {
    id: 'eigenerklaerung',
    label: 'Eigenerklärung Förderfähigkeit',
    description: 'Automatisch generiert nach Vorvertrag-Bestätigung',
    category: 'required',
    generated: true, // Wird vom System erstellt
    validationRules: {
      maxSize: 5 * 1024 * 1024,
      allowedFormats: ['pdf'],
    },
    helpText: 'Dieses Dokument wird automatisch basierend auf Ihrem Fördercheck erstellt und muss nur unterschrieben hochgeladen werden.',
  },
  
  // ============================================================================
  // BEDINGTE DOKUMENTE (nur bei Mitarbeitern)
  // ============================================================================
  {
    id: 'arbeitsvertrag',
    label: 'Arbeitsvertrag (Mitarbeiter)',
    description: 'Arbeitsvertrag eines sozialversicherungspflichtigen Mitarbeiters',
    category: 'conditional',
    condition: (participant) => {
      // Nur erforderlich wenn Teilnehmer Mitarbeiter hat
      return participant.mitarbeiterAnzahl > 0;
    },
    validationRules: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedFormats: ['pdf'],
    },
    helpText: 'Arbeitsvertrag eines Mitarbeiters als Nachweis für Ihre Personalverantwortung.',
  },
  {
    id: 'sozialversicherung',
    label: 'Sozialversicherungsnachweis',
    description: 'Sozialversicherungsnachweis eines Mitarbeiters',
    category: 'conditional',
    condition: (participant) => {
      return participant.mitarbeiterAnzahl > 0;
    },
    validationRules: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
    },
    helpText: 'Nachweis der Sozialversicherungspflicht eines Mitarbeiters (z.B. Bescheinigung der Krankenkasse).',
  },
  
  // ============================================================================
  // OPTIONALE DOKUMENTE
  // ============================================================================
  {
    id: 'zeugnisse',
    label: 'Zeugnisse',
    description: 'Abschlusszeugnisse, Arbeitszeugnisse (optional)',
    category: 'optional',
    validationRules: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedFormats: ['pdf'],
    },
    helpText: 'Optional: Relevante Zeugnisse können Ihre Bewerbung unterstützen.',
  },
  {
    id: 'sonstiges',
    label: 'Sonstiges',
    description: 'Weitere relevante Dokumente',
    category: 'optional',
    validationRules: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedFormats: ['pdf', 'jpg', 'jpeg', 'png', 'heic'],
    },
    helpText: 'Optional: Weitere Dokumente, die für Ihre Förderung relevant sein könnten.',
  },
];

/**
 * Helper: Pflichtdokumente abrufen
 */
export function getRequiredDocumentTypes(): DocumentTypeConfig[] {
  return KOMPASS_DOCUMENT_TYPES.filter(type => type.category === 'required');
}

/**
 * Helper: Bedingte Dokumenttypen für einen Teilnehmer filtern
 */
export function getConditionalDocumentTypes(participant: { mitarbeiterAnzahl: number }): DocumentTypeConfig[] {
  return KOMPASS_DOCUMENT_TYPES.filter(type => {
    if (type.category === 'conditional' && type.condition) {
      return type.condition(participant);
    }
    return false;
  });
}

/**
 * Helper: Optionale Dokumenttypen abrufen
 */
export function getOptionalDocumentTypes(): DocumentTypeConfig[] {
  return KOMPASS_DOCUMENT_TYPES.filter(type => type.category === 'optional');
}

/**
 * Helper: Alle relevanten Dokumenttypen für einen Teilnehmer
 */
export function getAllDocumentTypesForParticipant(participant: { mitarbeiterAnzahl: number }): {
  required: DocumentTypeConfig[];
  conditional: DocumentTypeConfig[];
  optional: DocumentTypeConfig[];
} {
  return {
    required: getRequiredDocumentTypes(),
    conditional: getConditionalDocumentTypes(participant),
    optional: getOptionalDocumentTypes(),
  };
}

/**
 * Helper: Dokumenttyp nach ID finden
 */
export function getDocumentTypeById(id: string): DocumentTypeConfig | undefined {
  return KOMPASS_DOCUMENT_TYPES.find(type => type.id === id);
}

/**
 * Helper: Datei validieren
 */
export function validateFile(
  documentTypeId: string,
  fileSize: number,
  fileName: string
): { valid: boolean; error?: string } {
  const docType = getDocumentTypeById(documentTypeId);
  
  if (!docType) {
    return { valid: false, error: `Ungültiger Dokumenttyp: ${documentTypeId}` };
  }
  
  // Validiere Dateigröße
  if (fileSize > docType.validationRules.maxSize) {
    const maxMB = docType.validationRules.maxSize / 1024 / 1024;
    return { valid: false, error: `Datei zu groß. Maximal ${maxMB}MB erlaubt.` };
  }
  
  // Validiere Format
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
  if (!docType.validationRules.allowedFormats.includes(fileExtension)) {
    return { 
      valid: false, 
      error: `Ungültiges Format. Erlaubt: ${docType.validationRules.allowedFormats.join(', ').toUpperCase()}` 
    };
  }
  
  return { valid: true };
}
