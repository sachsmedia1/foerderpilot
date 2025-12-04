/**
 * FOERDERPILOT - UNIT TESTS: FILE VALIDATION
 * 
 * Tests File-Upload-Validierung (MIME-Type, Size)
 */

import { describe, it, expect } from 'vitest';

// Mock file validation functions (these would be in your actual code)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/heic',
];

function validateFileSize(size: number): { valid: boolean; error?: string } {
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Datei zu groß. Maximal ${MAX_FILE_SIZE / 1024 / 1024} MB erlaubt.`,
    };
  }
  return { valid: true };
}

function validateMimeType(mimeType: string): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: `Dateityp nicht erlaubt. Erlaubte Typen: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }
  return { valid: true };
}

function validateFile(file: { size: number; mimeType: string }): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const sizeValidation = validateFileSize(file.size);
  if (!sizeValidation.valid && sizeValidation.error) {
    errors.push(sizeValidation.error);
  }
  
  const mimeValidation = validateMimeType(file.mimeType);
  if (!mimeValidation.valid && mimeValidation.error) {
    errors.push(mimeValidation.error);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

describe('File Validation', () => {
  describe('File Size Validation', () => {
    it('should accept files under 10 MB', () => {
      const result = validateFileSize(5 * 1024 * 1024); // 5 MB
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept files exactly 10 MB', () => {
      const result = validateFileSize(10 * 1024 * 1024); // 10 MB
      expect(result.valid).toBe(true);
    });

    it('should reject files over 10 MB', () => {
      const result = validateFileSize(15 * 1024 * 1024); // 15 MB
      expect(result.valid).toBe(false);
      expect(result.error).toContain('zu groß');
    });

    it('should reject very large files', () => {
      const result = validateFileSize(100 * 1024 * 1024); // 100 MB
      expect(result.valid).toBe(false);
    });
  });

  describe('MIME Type Validation', () => {
    it('should accept PDF files', () => {
      const result = validateMimeType('application/pdf');
      expect(result.valid).toBe(true);
    });

    it('should accept JPEG files', () => {
      const result = validateMimeType('image/jpeg');
      expect(result.valid).toBe(true);
    });

    it('should accept JPG files', () => {
      const result = validateMimeType('image/jpg');
      expect(result.valid).toBe(true);
    });

    it('should accept PNG files', () => {
      const result = validateMimeType('image/png');
      expect(result.valid).toBe(true);
    });

    it('should accept HEIC files', () => {
      const result = validateMimeType('image/heic');
      expect(result.valid).toBe(true);
    });

    it('should reject unsupported file types', () => {
      const result = validateMimeType('application/msword');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('nicht erlaubt');
    });

    it('should reject executable files', () => {
      const result = validateMimeType('application/x-msdownload');
      expect(result.valid).toBe(false);
    });

    it('should be case-insensitive', () => {
      const result = validateMimeType('IMAGE/JPEG');
      expect(result.valid).toBe(true);
    });
  });

  describe('Combined File Validation', () => {
    it('should accept valid file (PDF, 5 MB)', () => {
      const result = validateFile({
        size: 5 * 1024 * 1024,
        mimeType: 'application/pdf',
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject file with invalid size', () => {
      const result = validateFile({
        size: 15 * 1024 * 1024,
        mimeType: 'application/pdf',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('zu groß');
    });

    it('should reject file with invalid MIME type', () => {
      const result = validateFile({
        size: 5 * 1024 * 1024,
        mimeType: 'application/msword',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('nicht erlaubt');
    });

    it('should reject file with both invalid size and MIME type', () => {
      const result = validateFile({
        size: 15 * 1024 * 1024,
        mimeType: 'application/msword',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });
});
