/**
 * FOERDERPILOT - UNIT TESTS: E-MAIL TEMPLATES
 * 
 * Tests E-Mail-Template-Generierung mit Tenant-Branding
 */

import { describe, it, expect } from 'vitest';
import {
  getStatusChangeEmail,
  getDocumentUploadEmail,
  getDocumentValidationEmail,
  getSammelterminReminderEmail,
} from './utils/emailTemplates';

describe('E-Mail Templates', () => {
  const mockBranding = {
    name: 'Test Bildungsträger',
    logoUrl: 'https://example.com/logo.png',
    primaryColor: '#1E40AF',
    secondaryColor: '#EC4899',
  };

  describe('Status-Change Email', () => {
    it('should generate status-change email with correct subject', () => {
      const email = getStatusChangeEmail(
        {
          participantName: 'Max Mustermann',
          oldStatus: 'documents_pending',
          newStatus: 'documents_approved',
          tenantName: 'Test Bildungsträger',
          loginUrl: 'https://app.foerderpilot.io/login',
        },
        mockBranding
      );

      expect(email.subject.toLowerCase()).toContain('status');
      // Tenant name is in body, not subject
    });

    it('should include participant name in email body', () => {
      const email = getStatusChangeEmail(
        {
          participantName: 'Max Mustermann',
          oldStatus: 'documents_pending',
          newStatus: 'documents_approved',
          tenantName: 'Test Bildungsträger',
          loginUrl: 'https://app.foerderpilot.io/login',
        },
        mockBranding
      );

      expect(email.html).toContain('Max Mustermann');
      expect(email.text).toContain('Max Mustermann');
    });

    it('should include login URL in email body', () => {
      const email = getStatusChangeEmail(
        {
          participantName: 'Max Mustermann',
          oldStatus: 'documents_pending',
          newStatus: 'documents_approved',
          tenantName: 'Test Bildungsträger',
          loginUrl: 'https://app.foerderpilot.io/login',
        },
        mockBranding
      );

      expect(email.html).toContain('https://app.foerderpilot.io/login');
      expect(email.text).toContain('https://app.foerderpilot.io/login');
    });

    it('should apply tenant branding colors', () => {
      const email = getStatusChangeEmail(
        {
          participantName: 'Max Mustermann',
          oldStatus: 'documents_pending',
          newStatus: 'documents_approved',
          tenantName: 'Test Bildungsträger',
          loginUrl: 'https://app.foerderpilot.io/login',
        },
        mockBranding
      );

      expect(email.html).toContain(mockBranding.primaryColor);
    });
  });

  describe('Document-Upload Email', () => {
    it('should generate document-upload email with correct subject', () => {
      const email = getDocumentUploadEmail(
        {
          participantName: 'Max Mustermann',
          documentType: 'Personalausweis',
          tenantName: 'Test Bildungsträger',
          loginUrl: 'https://app.foerderpilot.io/login',
        },
        mockBranding
      );

      expect(email.subject.toLowerCase()).toContain('dokument');
      // Tenant name is in body, not subject
    });

    it('should include document type in email body', () => {
      const email = getDocumentUploadEmail(
        {
          participantName: 'Max Mustermann',
          documentType: 'Personalausweis',
          tenantName: 'Test Bildungsträger',
          loginUrl: 'https://app.foerderpilot.io/login',
        },
        mockBranding
      );

      expect(email.html).toContain('Personalausweis');
      expect(email.text).toContain('Personalausweis');
    });
  });

  describe('Document-Validation Email', () => {
    it('should generate validation email for valid document', () => {
      const email = getDocumentValidationEmail(
        {
          participantName: 'Max Mustermann',
          documentType: 'Personalausweis',
          status: 'valid',
          tenantName: 'Test Bildungsträger',
          loginUrl: 'https://app.foerderpilot.io/login',
        },
        mockBranding
      );

      expect(email.subject.toLowerCase()).toContain('genehmigt');
      expect(email.html.toLowerCase()).toContain('genehmigt');
    });

    it('should generate validation email for invalid document with issues', () => {
      const email = getDocumentValidationEmail(
        {
          participantName: 'Max Mustermann',
          documentType: 'Personalausweis',
          status: 'invalid',
          issues: ['Dokument ist nicht lesbar', 'Ablaufdatum überschritten'],
          recommendations: ['Bitte scannen Sie das Dokument mit höherer Auflösung'],
          tenantName: 'Test Bildungsträger',
          loginUrl: 'https://app.foerderpilot.io/login',
        },
        mockBranding
      );

      expect(email.subject.toLowerCase()).toContain('abgelehnt');
      // Check that issues and recommendations are present
      expect(email.html).toContain('Dokument ist nicht lesbar');
      expect(email.html).toContain('Ablaufdatum');
      expect(email.html).toContain('scannen');
    });
  });

  describe('Sammeltermin-Reminder Email', () => {
    it('should generate reminder email with correct subject', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const email = getSammelterminReminderEmail(
        {
          participantName: 'Max Mustermann',
          sammelterminDate: tomorrow,
          sammelterminLocation: 'https://zoom.us/j/123456789',
          courseName: 'KOMPASS Förderung - Webentwicklung',
          tenantName: 'Test Bildungsträger',
          loginUrl: 'https://app.foerderpilot.io/login',
        },
        mockBranding
      );

      expect(email.subject).toContain('Erinnerung');
      expect(email.subject).toContain('Sammeltermin');
    });

    it('should include course name and location in email body', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const email = getSammelterminReminderEmail(
        {
          participantName: 'Max Mustermann',
          sammelterminDate: tomorrow,
          sammelterminLocation: 'https://zoom.us/j/123456789',
          courseName: 'KOMPASS Förderung - Webentwicklung',
          tenantName: 'Test Bildungsträger',
          loginUrl: 'https://app.foerderpilot.io/login',
        },
        mockBranding
      );

      expect(email.html).toContain('KOMPASS Förderung - Webentwicklung');
      expect(email.html).toContain('https://zoom.us/j/123456789');
      expect(email.text).toContain('KOMPASS Förderung - Webentwicklung');
      expect(email.text).toContain('https://zoom.us/j/123456789');
    });
  });
});
