/**
 * FOERDERPILOT - E-MAIL NOTIFICATIONS SERVICE
 * 
 * Zentraler Service für E-Mail-Benachrichtigungen
 */

import { Resend } from 'resend';
import { getDb } from '../db';
import { tenants, participants, users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import {
  getStatusChangeEmail,
  getDocumentUploadEmail,
  getDocumentValidationEmail,
  getSammelterminReminderEmail,
} from './emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Generic Send Email Function
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = 'FörderPilot <noreply@app.foerderpilot.io>',
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}): Promise<boolean> {
  try {
    await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });
    console.log(`[Email] Sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return false;
  }
}

interface TenantBranding {
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
}

/**
 * Get Tenant Branding from Database
 */
async function getTenantBranding(tenantId: number): Promise<TenantBranding> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  if (!tenant) throw new Error('Tenant not found');

  return {
    name: tenant.name,
    logoUrl: tenant.logoUrl || undefined,
    primaryColor: tenant.primaryColor || '#1E40AF',
    secondaryColor: tenant.secondaryColor || '#EC4899',
  };
}

/**
 * Get Participant Email
 */
async function getParticipantEmail(participantId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  const [participant] = await db
    .select()
    .from(participants)
    .where(eq(participants.id, participantId))
    .limit(1);

  if (!participant || !participant.userId) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, participant.userId))
    .limit(1);

  return user?.email || null;
}

/**
 * Send Status-Change Notification
 */
export async function sendStatusChangeNotification(
  participantId: number,
  tenantId: number,
  oldStatus: string,
  newStatus: string
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    // Get participant
    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1);

    if (!participant) return false;

    const email = await getParticipantEmail(participantId);
    if (!email) return false;

    const branding = await getTenantBranding(tenantId);
    const loginUrl = `https://app.foerderpilot.io/login`;

    const emailContent = getStatusChangeEmail(
      {
        participantName: `${participant.firstName} ${participant.lastName}`,
        oldStatus,
        newStatus,
        tenantName: branding.name,
        loginUrl,
      },
      branding
    );

    await resend.emails.send({
      from: `${branding.name} <noreply@app.foerderpilot.io>`,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    console.log(`[Email] Status-Change notification sent to ${email}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send status-change notification:', error);
    return false;
  }
}

/**
 * Send Document-Upload Notification
 */
export async function sendDocumentUploadNotification(
  participantId: number,
  tenantId: number,
  documentType: string
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1);

    if (!participant) return false;

    const email = await getParticipantEmail(participantId);
    if (!email) return false;

    const branding = await getTenantBranding(tenantId);
    const loginUrl = `https://app.foerderpilot.io/login`;

    const documentTypeLabels: Record<string, string> = {
      personalausweis: 'Personalausweis',
      lebenslauf: 'Lebenslauf',
      zeugnisse: 'Zeugnisse',
      arbeitsvertrag: 'Arbeitsvertrag',
      kuendigungsbestaetigung: 'Kündigungsbestätigung',
      other: 'Sonstiges',
    };

    const emailContent = getDocumentUploadEmail(
      {
        participantName: `${participant.firstName} ${participant.lastName}`,
        documentType: documentTypeLabels[documentType] || documentType,
        tenantName: branding.name,
        loginUrl,
      },
      branding
    );

    await resend.emails.send({
      from: `${branding.name} <noreply@app.foerderpilot.io>`,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    console.log(`[Email] Document-Upload notification sent to ${email}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send document-upload notification:', error);
    return false;
  }
}

/**
 * Send Document-Validation Notification
 */
export async function sendDocumentValidationNotification(
  participantId: number,
  tenantId: number,
  documentType: string,
  status: 'valid' | 'invalid',
  validationResult?: { issues?: string[]; recommendations?: string[] }
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1);

    if (!participant) return false;

    const email = await getParticipantEmail(participantId);
    if (!email) return false;

    const branding = await getTenantBranding(tenantId);
    const loginUrl = `https://app.foerderpilot.io/login`;

    const documentTypeLabels: Record<string, string> = {
      personalausweis: 'Personalausweis',
      lebenslauf: 'Lebenslauf',
      zeugnisse: 'Zeugnisse',
      arbeitsvertrag: 'Arbeitsvertrag',
      kuendigungsbestaetigung: 'Kündigungsbestätigung',
      other: 'Sonstiges',
    };

    const emailContent = getDocumentValidationEmail(
      {
        participantName: `${participant.firstName} ${participant.lastName}`,
        documentType: documentTypeLabels[documentType] || documentType,
        status,
        issues: validationResult?.issues,
        recommendations: validationResult?.recommendations,
        tenantName: branding.name,
        loginUrl,
      },
      branding
    );

    await resend.emails.send({
      from: `${branding.name} <noreply@app.foerderpilot.io>`,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    console.log(`[Email] Document-Validation notification sent to ${email}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send document-validation notification:', error);
    return false;
  }
}

/**
 * Send Sammeltermin-Reminder Notification
 */
export async function sendSammelterminReminderNotification(
  participantId: number,
  tenantId: number,
  sammelterminDate: Date,
  sammelterminLocation: string,
  courseName: string
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1);

    if (!participant) return false;

    const email = await getParticipantEmail(participantId);
    if (!email) return false;

    const branding = await getTenantBranding(tenantId);
    const loginUrl = `https://app.foerderpilot.io/login`;

    const emailContent = getSammelterminReminderEmail(
      {
        participantName: `${participant.firstName} ${participant.lastName}`,
        sammelterminDate,
        sammelterminLocation,
        courseName,
        tenantName: branding.name,
        loginUrl,
      },
      branding
    );

    await resend.emails.send({
      from: `${branding.name} <noreply@app.foerderpilot.io>`,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    console.log(`[Email] Sammeltermin-Reminder sent to ${email}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send sammeltermin-reminder:', error);
    return false;
  }
}
