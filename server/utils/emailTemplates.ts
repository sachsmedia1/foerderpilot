/**
 * FOERDERPILOT - E-MAIL TEMPLATES
 * 
 * HTML/Text E-Mail-Templates mit Tenant-Branding
 */

interface TenantBranding {
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
}

interface StatusChangeEmailData {
  participantName: string;
  oldStatus: string;
  newStatus: string;
  tenantName: string;
  loginUrl: string;
}

interface DocumentUploadEmailData {
  participantName: string;
  documentType: string;
  tenantName: string;
  loginUrl: string;
}

interface DocumentValidationEmailData {
  participantName: string;
  documentType: string;
  status: 'valid' | 'invalid';
  issues?: string[];
  recommendations?: string[];
  tenantName: string;
  loginUrl: string;
}

interface SammelterminReminderEmailData {
  participantName: string;
  sammelterminDate: Date;
  sammelterminLocation: string;
  courseName: string;
  tenantName: string;
  loginUrl: string;
}

/**
 * Base HTML Template mit Tenant-Branding
 */
function getBaseTemplate(branding: TenantBranding, content: string): string {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${branding.name}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: ${branding.primaryColor};
      padding: 30px 20px;
      text-align: center;
    }
    .header img {
      max-width: 200px;
      height: auto;
    }
    .header h1 {
      color: #ffffff;
      margin: 10px 0 0 0;
      font-size: 24px;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: ${branding.primaryColor};
      margin-top: 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: ${branding.primaryColor};
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .info-box {
      background-color: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
    }
    .success-box {
      background-color: #f0fdf4;
      border-left: 4px solid #16a34a;
      padding: 15px;
      margin: 20px 0;
    }
    .warning-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${branding.logoUrl ? `<img src="${branding.logoUrl}" alt="${branding.name}">` : ''}
      <h1>${branding.name}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${branding.name}. Alle Rechte vorbehalten.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATUS-ÄNDERUNGS-E-MAIL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getStatusChangeEmail(
  data: StatusChangeEmailData,
  branding: TenantBranding
): { subject: string; html: string; text: string } {
  const content = `
    <h2>Status-Änderung</h2>
    <p>Hallo ${data.participantName},</p>
    <p>Ihr Status wurde aktualisiert:</p>
    <div class="info-box">
      <p><strong>Alter Status:</strong> ${data.oldStatus}</p>
      <p><strong>Neuer Status:</strong> ${data.newStatus}</p>
    </div>
    <p>Bitte loggen Sie sich ein, um weitere Details zu sehen:</p>
    <a href="${data.loginUrl}" class="button">Zum Dashboard</a>
    <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
  `;

  const html = getBaseTemplate(branding, content);

  const text = `
Status-Änderung

Hallo ${data.participantName},

Ihr Status wurde aktualisiert:
- Alter Status: ${data.oldStatus}
- Neuer Status: ${data.newStatus}

Bitte loggen Sie sich ein, um weitere Details zu sehen:
${data.loginUrl}

Bei Fragen stehen wir Ihnen gerne zur Verfügung.

${data.tenantName}
  `;

  return {
    subject: `Status-Änderung: ${data.newStatus}`,
    html,
    text,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOKUMENT-UPLOAD-E-MAIL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getDocumentUploadEmail(
  data: DocumentUploadEmailData,
  branding: TenantBranding
): { subject: string; html: string; text: string } {
  const content = `
    <h2>Dokument hochgeladen</h2>
    <p>Hallo ${data.participantName},</p>
    <p>Ihr Dokument wurde erfolgreich hochgeladen:</p>
    <div class="success-box">
      <p><strong>Dokumenttyp:</strong> ${data.documentType}</p>
      <p><strong>Status:</strong> Wird geprüft...</p>
    </div>
    <p>Wir prüfen Ihr Dokument und melden uns bei Ihnen, sobald die Validierung abgeschlossen ist.</p>
    <a href="${data.loginUrl}" class="button">Zum Dashboard</a>
  `;

  const html = getBaseTemplate(branding, content);

  const text = `
Dokument hochgeladen

Hallo ${data.participantName},

Ihr Dokument wurde erfolgreich hochgeladen:
- Dokumenttyp: ${data.documentType}
- Status: Wird geprüft...

Wir prüfen Ihr Dokument und melden uns bei Ihnen, sobald die Validierung abgeschlossen ist.

${data.loginUrl}

${data.tenantName}
  `;

  return {
    subject: `Dokument hochgeladen: ${data.documentType}`,
    html,
    text,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOKUMENT-VALIDIERUNGS-E-MAIL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getDocumentValidationEmail(
  data: DocumentValidationEmailData,
  branding: TenantBranding
): { subject: string; html: string; text: string } {
  const isValid = data.status === 'valid';

  const content = `
    <h2>Dokument ${isValid ? 'gültig' : 'ungültig'}</h2>
    <p>Hallo ${data.participantName},</p>
    <p>Ihr Dokument wurde validiert:</p>
    <div class="${isValid ? 'success-box' : 'warning-box'}">
      <p><strong>Dokumenttyp:</strong> ${data.documentType}</p>
      <p><strong>Status:</strong> ${isValid ? '✅ Gültig' : '❌ Ungültig'}</p>
    </div>
    ${!isValid && data.issues && data.issues.length > 0 ? `
      <h3>Probleme:</h3>
      <ul>
        ${data.issues.map(issue => `<li>${issue}</li>`).join('')}
      </ul>
    ` : ''}
    ${!isValid && data.recommendations && data.recommendations.length > 0 ? `
      <h3>Empfehlungen:</h3>
      <ul>
        ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
    ` : ''}
    <p>${isValid ? 'Ihr Dokument wurde akzeptiert.' : 'Bitte laden Sie ein korrigiertes Dokument hoch.'}</p>
    <a href="${data.loginUrl}" class="button">Zum Dashboard</a>
  `;

  const html = getBaseTemplate(branding, content);

  const text = `
Dokument ${isValid ? 'gültig' : 'ungültig'}

Hallo ${data.participantName},

Ihr Dokument wurde validiert:
- Dokumenttyp: ${data.documentType}
- Status: ${isValid ? '✅ Gültig' : '❌ Ungültig'}

${!isValid && data.issues && data.issues.length > 0 ? `
Probleme:
${data.issues.map(issue => `- ${issue}`).join('\n')}
` : ''}

${!isValid && data.recommendations && data.recommendations.length > 0 ? `
Empfehlungen:
${data.recommendations.map(rec => `- ${rec}`).join('\n')}
` : ''}

${isValid ? 'Ihr Dokument wurde akzeptiert.' : 'Bitte laden Sie ein korrigiertes Dokument hoch.'}

${data.loginUrl}

${data.tenantName}
  `;

  return {
    subject: `Dokument ${isValid ? 'gültig' : 'ungültig'}: ${data.documentType}`,
    html,
    text,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SAMMELTERMIN-ERINNERUNGS-E-MAIL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getSammelterminReminderEmail(
  data: SammelterminReminderEmailData,
  branding: TenantBranding
): { subject: string; html: string; text: string } {
  const formattedDate = data.sammelterminDate.toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const content = `
    <h2>Erinnerung: Sammeltermin morgen</h2>
    <p>Hallo ${data.participantName},</p>
    <p>Wir möchten Sie an Ihren Sammeltermin erinnern:</p>
    <div class="info-box">
      <p><strong>Kurs:</strong> ${data.courseName}</p>
      <p><strong>Datum:</strong> ${formattedDate}</p>
      <p><strong>Ort:</strong> ${data.sammelterminLocation}</p>
    </div>
    <p>Bitte stellen Sie sicher, dass alle erforderlichen Dokumente hochgeladen sind.</p>
    <a href="${data.loginUrl}" class="button">Zum Dashboard</a>
  `;

  const html = getBaseTemplate(branding, content);

  const text = `
Erinnerung: Sammeltermin morgen

Hallo ${data.participantName},

Wir möchten Sie an Ihren Sammeltermin erinnern:
- Kurs: ${data.courseName}
- Datum: ${formattedDate}
- Ort: ${data.sammelterminLocation}

Bitte stellen Sie sicher, dass alle erforderlichen Dokumente hochgeladen sind.

${data.loginUrl}

${data.tenantName}
  `;

  return {
    subject: `Erinnerung: Sammeltermin morgen - ${data.courseName}`,
    html,
    text,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FUNNEL: WILLKOMMENS-E-MAIL (mit vollständiger Anmeldebestätigung)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface WelcomeEmailData {
  vorname: string;
  nachname: string;
  email: string;
  telefon?: string;
  strasse: string;
  plz: string;
  ort: string;
  geburtsdatum: string;
  kurstitel: string;
  starttermin: string;
  kurspreis: number;
  foerderquote: number; // z.B. 0.90 für 90%
  passwordResetLink: string;
  tenantName: string;
  senderEmail: string;
  senderName: string;
}

export function generateWelcomeEmail(data: WelcomeEmailData) {
  // Korrekte Förderberechnung (90% KOMPASS)
  const foerderungBetrag = data.kurspreis * data.foerderquote;
  const eigenanteil = data.kurspreis - foerderungBetrag;

  const html = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Willkommen bei ${data.senderName}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f3f4f6;">
      
      <!-- Container -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🎉 Willkommen bei ${data.senderName}!</h1>
                </td>
              </tr>
              
              <!-- Hauptinhalt -->
              <tr>
                <td style="padding: 40px 30px;">
                  
                  <!-- Begrüßung -->
                  <p style="font-size: 16px; margin-bottom: 20px; color: #1f2937;">
                    Hallo <strong>${data.vorname} ${data.nachname}</strong>,
                  </p>
                  
                  <p style="margin-bottom: 24px; line-height: 1.6;">
                    vielen Dank für Ihre Anmeldung! Ihr Account wurde erfolgreich erstellt und 
                    Sie sind nur noch einen Schritt von Ihrer Weiterbildung entfernt.
                  </p>
                  
                  <!-- Kursdetails -->
                  <h2 style="color: #1f2937; margin-top: 30px; margin-bottom: 16px; font-size: 20px;">📚 Ihre Kursdetails</h2>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                      <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; width: 45%;"><strong>Kurs:</strong></td>
                      <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;">${data.kurstitel}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;"><strong>Startdatum:</strong></td>
                      <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;">${data.starttermin}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;"><strong>Kurspreis:</strong></td>
                      <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;">€${data.kurspreis.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr style="background-color: #f0fdf4;">
                      <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;"><strong>KOMPASS-Förderung (${(data.foerderquote * 100).toFixed(0)}%):</strong></td>
                      <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; color: #16a34a; font-weight: 600;">-€${foerderungBetrag.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr style="background-color: #fef3c7;">
                      <td style="padding: 12px 8px; font-weight: bold; font-size: 16px;"><strong>Ihr Eigenanteil:</strong></td>
                      <td style="padding: 12px 8px; font-weight: bold; font-size: 18px; color: #f59e0b;">€${eigenanteil.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  </table>
                  
                  <!-- Wichtiger Zahlungshinweis -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px; margin-bottom: 30px;">
                    <tr>
                      <td style="padding: 16px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1e40af;">
                          <strong>💡 Wichtiger Zahlungshinweis:</strong><br>
                          Sie zahlen zunächst den vollen Kurspreis von <strong>€${data.kurspreis.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> an uns. 
                          Nach erfolgreichem Kursabschluss erhalten Sie die KOMPASS-Förderung in Höhe von <strong>€${foerderungBetrag.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> 
                          direkt vom Fördermittelgeber zurückerstattet.<br><br>
                          <strong>Ihr finaler Eigenanteil nach Auszahlung der Förderung beträgt somit nur €${eigenanteil.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.</strong>
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Anmeldebestätigung -->
                  <h2 style="color: #1f2937; margin-top: 40px; margin-bottom: 16px; font-size: 20px;">✅ Ihre verbindliche Anmeldebestätigung</h2>
                  
                  <p style="margin-bottom: 20px; line-height: 1.6;">
                    Hiermit bestätigen wir Ihre Anmeldung zum Kurs <strong>"${data.kurstitel}"</strong>. 
                    Ihre Anmeldung ist rechtlich verbindlich und basiert auf folgenden Angaben:
                  </p>
                  
                  <!-- Persönliche Daten -->
                  <h3 style="color: #374151; margin-top: 24px; margin-bottom: 12px; font-size: 16px;">👤 Persönliche Daten</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px; background-color: #f9fafb; border-radius: 4px;">
                    <tr>
                      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; width: 40%;">Name:</td>
                      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${data.vorname} ${data.nachname}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">E-Mail:</td>
                      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${data.email}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Telefon:</td>
                      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${data.telefon || 'Nicht angegeben'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Adresse:</td>
                      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${data.strasse}, ${data.plz} ${data.ort}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px;">Geburtsdatum:</td>
                      <td style="padding: 10px;">${new Date(data.geburtsdatum).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                    </tr>
                  </table>
                  
                  <!-- Kursdetails (Zusammenfassung) -->
                  <h3 style="color: #374151; margin-top: 24px; margin-bottom: 12px; font-size: 16px;">🎓 Gebuchter Kurs</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px; background-color: #f9fafb; border-radius: 4px;">
                    <tr>
                      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; width: 40%;">Kursname:</td>
                      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${data.kurstitel}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Startdatum:</td>
                      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${data.starttermin}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Kurspreis (brutto):</td>
                      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">€${data.kurspreis.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr style="background-color: #fef3c7;">
                      <td style="padding: 10px; font-weight: bold;">Eigenanteil (nach Förderung):</td>
                      <td style="padding: 10px; font-weight: bold; color: #f59e0b;">€${eigenanteil.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  </table>
                  
                  <!-- Bestätigungen -->
                  <h3 style="color: #374151; margin-top: 24px; margin-bottom: 12px; font-size: 16px;">☑️ Ihre Bestätigungen</h3>
                  <ul style="list-style: none; padding-left: 0; margin-bottom: 24px;">
                    <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">✅ AGB und Datenschutzerklärung akzeptiert</li>
                    <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">✅ De-minimis-Erklärung abgegeben</li>
                    <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">✅ Widerrufsbelehrung zur Kenntnis genommen (14 Tage)</li>
                  </ul>
                  
                  <!-- Rechtlicher Hinweis -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                    <tr>
                      <td style="padding: 16px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px;">
                        <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #6b7280;">
                          <strong style="color: #374151;">⚖️ Rechtlicher Hinweis:</strong><br>
                          Diese Anmeldebestätigung stellt einen rechtlich verbindlichen Vertrag zwischen Ihnen und 
                          <strong>${data.senderName}</strong> dar. Sie haben ein gesetzliches Widerrufsrecht von 14 Tagen 
                          ab dem Datum dieser Bestätigung. Details finden Sie in unserer Widerrufsbelehrung.
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Nächste Schritte -->
                  <h2 style="color: #1f2937; margin-top: 40px; margin-bottom: 16px; font-size: 20px;">🚀 Nächste Schritte</h2>
                  
                  <ol style="line-height: 1.8; padding-left: 20px;">
                    <li><strong>Passwort festlegen:</strong> Klicken Sie auf den Button unten, um Ihr Passwort zu setzen</li>
                    <li><strong>Dokumente hochladen:</strong> Laden Sie die erforderlichen Dokumente in Ihrem Dashboard hoch</li>
                    <li><strong>Bestätigung abwarten:</strong> Wir prüfen Ihre Unterlagen und melden uns bei Ihnen</li>
                  </ol>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px; margin-bottom: 30px;">
                    <tr>
                      <td align="center">
                        <a href="${data.passwordResetLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Passwort jetzt festlegen →
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Footer -->
                  <p style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Bei Fragen stehen wir Ihnen gerne zur Verfügung.<br>
                    <strong>Ihr ${data.senderName} Team</strong>
                  </p>
                  
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
      
    </body>
    </html>
  `;

  const text = `
Willkommen bei ${data.senderName}!

Hallo ${data.vorname} ${data.nachname},

vielen Dank für Ihre Anmeldung! Ihr Account wurde erfolgreich erstellt und Sie sind nur noch einen Schritt von Ihrer Weiterbildung entfernt.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 IHRE KURSDETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Kurs:                ${data.kurstitel}
Startdatum:          ${data.starttermin}
Kurspreis:           €${data.kurspreis.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
KOMPASS-Förderung:   -€${foerderungBetrag.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${(data.foerderquote * 100).toFixed(0)}%)
Ihr Eigenanteil:     €${eigenanteil.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

💡 WICHTIGER ZAHLUNGSHINWEIS:
Sie zahlen zunächst den vollen Kurspreis von €${data.kurspreis.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} an uns. Nach erfolgreichem Kursabschluss erhalten Sie die KOMPASS-Förderung in Höhe von €${foerderungBetrag.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} direkt vom Fördermittelgeber zurückerstattet.

Ihr finaler Eigenanteil nach Auszahlung der Förderung beträgt somit nur €${eigenanteil.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ IHRE VERBINDLICHE ANMELDEBESTÄTIGUNG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hiermit bestätigen wir Ihre Anmeldung zum Kurs "${data.kurstitel}". Ihre Anmeldung ist rechtlich verbindlich und basiert auf folgenden Angaben:

👤 PERSÖNLICHE DATEN
Name:          ${data.vorname} ${data.nachname}
E-Mail:        ${data.email}
Telefon:       ${data.telefon || 'Nicht angegeben'}
Adresse:       ${data.strasse}, ${data.plz} ${data.ort}
Geburtsdatum:  ${new Date(data.geburtsdatum).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}

🎓 GEBUCHTER KURS
Kursname:                   ${data.kurstitel}
Startdatum:                 ${data.starttermin}
Kurspreis (brutto):         €${data.kurspreis.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Eigenanteil (nach Förderung): €${eigenanteil.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

☑️ IHRE BESTÄTIGUNGEN
✅ AGB und Datenschutzerklärung akzeptiert
✅ De-minimis-Erklärung abgegeben
✅ Widerrufsbelehrung zur Kenntnis genommen (14 Tage)

⚖️ RECHTLICHER HINWEIS:
Diese Anmeldebestätigung stellt einen rechtlich verbindlichen Vertrag zwischen Ihnen und ${data.senderName} dar. Sie haben ein gesetzliches Widerrufsrecht von 14 Tagen ab dem Datum dieser Bestätigung. Details finden Sie in unserer Widerrufsbelehrung.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 NÄCHSTE SCHRITTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Passwort festlegen: ${data.passwordResetLink}
2. Dokumente hochladen: Laden Sie die erforderlichen Dokumente in Ihrem Dashboard hoch
3. Bestätigung abwarten: Wir prüfen Ihre Unterlagen und melden uns bei Ihnen

Bei Fragen stehen wir Ihnen gerne zur Verfügung.
Ihr ${data.senderName} Team
  `;

  return {
    subject: `Willkommen bei ${data.senderName} - Ihre Anmeldung für ${data.kurstitel}`,
    html,
    text,
    senderEmail: data.senderEmail,
    senderName: data.senderName,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FUNNEL: ADMIN-BENACHRICHTIGUNG (neue Anmeldung)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface AdminNotificationEmailData {
  vorname: string;
  nachname: string;
  email: string;
  kurstitel: string;
  starttermin: string;
  kurspreis: number;
  foerderbetrag: number;
  tenantName: string;
}

export function generateAdminNotificationEmail(data: AdminNotificationEmailData) {
  const eigenanteil = data.kurspreis - data.foerderbetrag;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2563eb;">Neue Anmeldung!</h1>
      
      <p>Ein neuer Teilnehmer hat sich über den Funnel angemeldet:</p>
      
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Teilnehmer-Details:</h3>
        <p><strong>Name:</strong> ${data.vorname} ${data.nachname}</p>
        <p><strong>E-Mail:</strong> ${data.email}</p>
        <p><strong>Kurs:</strong> ${data.kurstitel}</p>
        <p><strong>Starttermin:</strong> ${data.starttermin}</p>
        <p><strong>Kurspreis:</strong> €${data.kurspreis.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p><strong>Förderung:</strong> €${data.foerderbetrag.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p><strong>Eigenanteil:</strong> €${eigenanteil.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
      
      <p>Bitte prüfen Sie die Unterlagen und kontaktieren Sie den Teilnehmer bei Bedarf.</p>
      
      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        ${data.tenantName} Admin-System
      </p>
    </div>
  `;

  const text = `
Neue Anmeldung!

Ein neuer Teilnehmer hat sich über den Funnel angemeldet:

Teilnehmer-Details:
- Name: ${data.vorname} ${data.nachname}
- E-Mail: ${data.email}
- Kurs: ${data.kurstitel}
- Starttermin: ${data.starttermin}
- Kurspreis: €${data.kurspreis.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Förderung: €${data.foerderbetrag.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Eigenanteil: €${eigenanteil.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

Bitte prüfen Sie die Unterlagen und kontaktieren Sie den Teilnehmer bei Bedarf.

${data.tenantName} Admin-System
  `;

  return {
    subject: `Neue Anmeldung: ${data.vorname} ${data.nachname} - ${data.kurstitel}`,
    html,
    text,
  };
}
