/**
 * FOERDERPILOT - E-MAIL TEST ROUTER
 * 
 * Test-Endpoint für E-Mail-Templates (nur für Development/Testing)
 */

import { z } from 'zod';
import { router, adminProcedure } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import {
  getStatusChangeEmail,
  getDocumentUploadEmail,
  getDocumentValidationEmail,
  getSammelterminReminderEmail,
} from '../utils/emailTemplates';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailTestRouter = router({
  /**
   * Test basic email sending
   */
  sendTestEmail: adminProcedure
    .input(
      z.object({
        to: z.string().email(),
        subject: z.string().optional(),
        html: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await resend.emails.send({
          from: 'FörderPilot <noreply@app.foerderpilot.io>',
          to: input.to,
          subject: input.subject || 'Test: Passwort zurücksetzen',
          html: input.html || '<p>Das ist ein Test! ✅</p>',
        });

        return {
          success: true,
          messageId: result.data?.id,
          message: 'E-Mail erfolgreich versendet',
        };
      } catch (error) {
        console.error('[Email Test] Failed to send email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'E-Mail-Versand fehlgeschlagen',
          cause: error,
        });
      }
    }),

  /**
   * Test Status-Change Email Template
   */
  testStatusChangeEmail: adminProcedure
    .input(
      z.object({
        to: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      try {
        const branding = {
          name: ctx.tenant.name,
          logoUrl: ctx.tenant.logoUrl || undefined,
          primaryColor: ctx.tenant.primaryColor || '#1E40AF',
          secondaryColor: ctx.tenant.secondaryColor || '#EC4899',
        };

        const emailContent = getStatusChangeEmail(
          {
            participantName: 'Max Mustermann',
            oldStatus: 'documents_pending',
            newStatus: 'documents_approved',
            tenantName: ctx.tenant.name,
            loginUrl: 'https://app.foerderpilot.io/login',
          },
          branding
        );

        const result = await resend.emails.send({
          from: `${ctx.tenant.name} <noreply@app.foerderpilot.io>`,
          to: input.to,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        return {
          success: true,
          messageId: result.data?.id,
          message: 'Status-Change E-Mail erfolgreich versendet',
        };
      } catch (error) {
        console.error('[Email Test] Failed to send status-change email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'E-Mail-Versand fehlgeschlagen',
          cause: error,
        });
      }
    }),

  /**
   * Test Document-Upload Email Template
   */
  testDocumentUploadEmail: adminProcedure
    .input(
      z.object({
        to: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      try {
        const branding = {
          name: ctx.tenant.name,
          logoUrl: ctx.tenant.logoUrl || undefined,
          primaryColor: ctx.tenant.primaryColor || '#1E40AF',
          secondaryColor: ctx.tenant.secondaryColor || '#EC4899',
        };

        const emailContent = getDocumentUploadEmail(
          {
            participantName: 'Max Mustermann',
            documentType: 'Personalausweis',
            tenantName: ctx.tenant.name,
            loginUrl: 'https://app.foerderpilot.io/login',
          },
          branding
        );

        const result = await resend.emails.send({
          from: `${ctx.tenant.name} <noreply@app.foerderpilot.io>`,
          to: input.to,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        return {
          success: true,
          messageId: result.data?.id,
          message: 'Document-Upload E-Mail erfolgreich versendet',
        };
      } catch (error) {
        console.error('[Email Test] Failed to send document-upload email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'E-Mail-Versand fehlgeschlagen',
          cause: error,
        });
      }
    }),

  /**
   * Test Document-Validation Email Template (Valid)
   */
  testDocumentValidationEmailValid: adminProcedure
    .input(
      z.object({
        to: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      try {
        const branding = {
          name: ctx.tenant.name,
          logoUrl: ctx.tenant.logoUrl || undefined,
          primaryColor: ctx.tenant.primaryColor || '#1E40AF',
          secondaryColor: ctx.tenant.secondaryColor || '#EC4899',
        };

        const emailContent = getDocumentValidationEmail(
          {
            participantName: 'Max Mustermann',
            documentType: 'Personalausweis',
            status: 'valid',
            tenantName: ctx.tenant.name,
            loginUrl: 'https://app.foerderpilot.io/login',
          },
          branding
        );

        const result = await resend.emails.send({
          from: `${ctx.tenant.name} <noreply@app.foerderpilot.io>`,
          to: input.to,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        return {
          success: true,
          messageId: result.data?.id,
          message: 'Document-Validation E-Mail (Valid) erfolgreich versendet',
        };
      } catch (error) {
        console.error('[Email Test] Failed to send document-validation email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'E-Mail-Versand fehlgeschlagen',
          cause: error,
        });
      }
    }),

  /**
   * Test Document-Validation Email Template (Invalid)
   */
  testDocumentValidationEmailInvalid: adminProcedure
    .input(
      z.object({
        to: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      try {
        const branding = {
          name: ctx.tenant.name,
          logoUrl: ctx.tenant.logoUrl || undefined,
          primaryColor: ctx.tenant.primaryColor || '#1E40AF',
          secondaryColor: ctx.tenant.secondaryColor || '#EC4899',
        };

        const emailContent = getDocumentValidationEmail(
          {
            participantName: 'Max Mustermann',
            documentType: 'Personalausweis',
            status: 'invalid',
            issues: [
              'Dokument ist nicht lesbar',
              'Ablaufdatum überschritten',
            ],
            recommendations: [
              'Bitte scannen Sie das Dokument mit höherer Auflösung',
              'Bitte laden Sie einen gültigen Personalausweis hoch',
            ],
            tenantName: ctx.tenant.name,
            loginUrl: 'https://app.foerderpilot.io/login',
          },
          branding
        );

        const result = await resend.emails.send({
          from: `${ctx.tenant.name} <noreply@app.foerderpilot.io>`,
          to: input.to,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        return {
          success: true,
          messageId: result.data?.id,
          message: 'Document-Validation E-Mail (Invalid) erfolgreich versendet',
        };
      } catch (error) {
        console.error('[Email Test] Failed to send document-validation email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'E-Mail-Versand fehlgeschlagen',
          cause: error,
        });
      }
    }),

  /**
   * Test Sammeltermin-Reminder Email Template
   */
  testSammelterminReminderEmail: adminProcedure
    .input(
      z.object({
        to: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenant) throw new TRPCError({ code: 'FORBIDDEN', message: 'No tenant context' });

      try {
        const branding = {
          name: ctx.tenant.name,
          logoUrl: ctx.tenant.logoUrl || undefined,
          primaryColor: ctx.tenant.primaryColor || '#1E40AF',
          secondaryColor: ctx.tenant.secondaryColor || '#EC4899',
        };

        // Tomorrow at 10:00 AM
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);

        const emailContent = getSammelterminReminderEmail(
          {
            participantName: 'Max Mustermann',
            sammelterminDate: tomorrow,
            sammelterminLocation: 'https://zoom.us/j/123456789',
            courseName: 'KOMPASS Förderung - Webentwicklung',
            tenantName: ctx.tenant.name,
            loginUrl: 'https://app.foerderpilot.io/login',
          },
          branding
        );

        const result = await resend.emails.send({
          from: `${ctx.tenant.name} <noreply@app.foerderpilot.io>`,
          to: input.to,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        return {
          success: true,
          messageId: result.data?.id,
          message: 'Sammeltermin-Reminder E-Mail erfolgreich versendet',
        };
      } catch (error) {
        console.error('[Email Test] Failed to send sammeltermin-reminder email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'E-Mail-Versand fehlgeschlagen',
          cause: error,
        });
      }
    }),
});
