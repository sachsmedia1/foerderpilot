import { describe, it, expect } from 'vitest';
import {
  KOMPASS_DOCUMENT_TYPES,
  getRequiredDocumentTypes,
  getConditionalDocumentTypes,
  getOptionalDocumentTypes,
  getAllDocumentTypesForParticipant,
  getDocumentTypeById,
  validateFile,
} from '../config/kompassDocumentTypes';

describe('KOMPASS Document Types Config', () => {
  describe('KOMPASS_DOCUMENT_TYPES', () => {
    it('should have 10 document types total', () => {
      expect(KOMPASS_DOCUMENT_TYPES.length).toBe(10);
    });

    it('should have correct required document types', () => {
      const requiredIds = KOMPASS_DOCUMENT_TYPES
        .filter(t => t.category === 'required')
        .map(t => t.id);
      
      expect(requiredIds).toContain('personalausweis');
      expect(requiredIds).toContain('lebenslauf');
      expect(requiredIds).toContain('nachweis_selbstaendigkeit');
      expect(requiredIds).toContain('geschaeftsadresse');
      expect(requiredIds).toContain('de_minimis');
      expect(requiredIds).toContain('eigenerklaerung');
      expect(requiredIds.length).toBe(6);
    });

    it('should NOT have kuendigungsbestaetigung', () => {
      const ids = KOMPASS_DOCUMENT_TYPES.map(t => t.id);
      expect(ids).not.toContain('kuendigungsbestaetigung');
    });

    it('should have conditional document types for employees', () => {
      const conditionalIds = KOMPASS_DOCUMENT_TYPES
        .filter(t => t.category === 'conditional')
        .map(t => t.id);
      
      expect(conditionalIds).toContain('arbeitsvertrag');
      expect(conditionalIds).toContain('sozialversicherung');
      expect(conditionalIds.length).toBe(2);
    });

    it('should have optional document types', () => {
      const optionalIds = KOMPASS_DOCUMENT_TYPES
        .filter(t => t.category === 'optional')
        .map(t => t.id);
      
      expect(optionalIds).toContain('zeugnisse');
      expect(optionalIds).toContain('sonstiges');
      expect(optionalIds.length).toBe(2);
    });

    it('should mark de_minimis and eigenerklaerung as generated', () => {
      const deMinimis = KOMPASS_DOCUMENT_TYPES.find(t => t.id === 'de_minimis');
      const eigenerklaerung = KOMPASS_DOCUMENT_TYPES.find(t => t.id === 'eigenerklaerung');
      
      expect(deMinimis?.generated).toBe(true);
      expect(eigenerklaerung?.generated).toBe(true);
    });
  });

  describe('getRequiredDocumentTypes', () => {
    it('should return 6 required document types', () => {
      const required = getRequiredDocumentTypes();
      expect(required.length).toBe(6);
    });
  });

  describe('getConditionalDocumentTypes', () => {
    it('should return 0 conditional types when mitarbeiterAnzahl is 0', () => {
      const conditional = getConditionalDocumentTypes({ mitarbeiterAnzahl: 0 });
      expect(conditional.length).toBe(0);
    });

    it('should return 2 conditional types when mitarbeiterAnzahl > 0', () => {
      const conditional = getConditionalDocumentTypes({ mitarbeiterAnzahl: 3 });
      expect(conditional.length).toBe(2);
      expect(conditional.map(t => t.id)).toContain('arbeitsvertrag');
      expect(conditional.map(t => t.id)).toContain('sozialversicherung');
    });
  });

  describe('getOptionalDocumentTypes', () => {
    it('should return 2 optional document types', () => {
      const optional = getOptionalDocumentTypes();
      expect(optional.length).toBe(2);
    });
  });

  describe('getAllDocumentTypesForParticipant', () => {
    it('should return all categories for participant without employees', () => {
      const result = getAllDocumentTypesForParticipant({ mitarbeiterAnzahl: 0 });
      
      expect(result.required.length).toBe(6);
      expect(result.conditional.length).toBe(0);
      expect(result.optional.length).toBe(2);
    });

    it('should return all categories for participant with employees', () => {
      const result = getAllDocumentTypesForParticipant({ mitarbeiterAnzahl: 5 });
      
      expect(result.required.length).toBe(6);
      expect(result.conditional.length).toBe(2);
      expect(result.optional.length).toBe(2);
    });
  });

  describe('getDocumentTypeById', () => {
    it('should find document type by id', () => {
      const personalausweis = getDocumentTypeById('personalausweis');
      expect(personalausweis).toBeDefined();
      expect(personalausweis?.label).toBe('Personalausweis');
    });

    it('should return undefined for unknown id', () => {
      const unknown = getDocumentTypeById('unknown_type');
      expect(unknown).toBeUndefined();
    });
  });

  describe('validateFile', () => {
    it('should validate correct PDF file for personalausweis', () => {
      const result = validateFile('personalausweis', 5 * 1024 * 1024, 'ausweis.pdf');
      expect(result.valid).toBe(true);
    });

    it('should reject file that is too large', () => {
      const result = validateFile('personalausweis', 15 * 1024 * 1024, 'ausweis.pdf');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('zu groß');
    });

    it('should reject invalid file format for lebenslauf (only PDF allowed)', () => {
      const result = validateFile('lebenslauf', 1 * 1024 * 1024, 'cv.jpg');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Ungültiges Format');
    });

    it('should accept JPG for personalausweis', () => {
      const result = validateFile('personalausweis', 5 * 1024 * 1024, 'ausweis.jpg');
      expect(result.valid).toBe(true);
    });

    it('should reject unknown document type', () => {
      const result = validateFile('unknown_type', 1 * 1024 * 1024, 'file.pdf');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Ungültiger Dokumenttyp');
    });
  });
});
