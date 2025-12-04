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
      font-weight: 600;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      font-size: 14px;
      color: #6c757d;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
    }
    .status-success {
      background-color: #d4edda;
      color: #155724;
    }
    .status-warning {
      background-color: #fff3cd;
      color: #856404;
    }
    .status-danger {
      background-color: #f8d7da;
      color: #721c24;
    }
    ul {
      padding-left: 20px;
    }
    li {
      margin: 8px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${branding.logoUrl ? `<img src="${branding.logoUrl}" alt="${branding.name}">` : `<h1>${branding.name}</h1>`}
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${branding.name}. Alle Rechte vorbehalten.</p>
      <p>Diese E-Mail wurde automatisch generiert. Bitte nicht antworten.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Status-Change E-Mail Template
 */
export function getStatusChangeEmail(
  data: StatusChangeEmailData,
  branding: TenantBranding
): { html: string; text: string; subject: string } {
  const statusLabels: Record<string, string> = {
    registered: 'Registriert',
    documents_pending: 'Dokumente ausstehend',
    documents_submitted: 'Dokumente eingereicht',
    documents_approved: 'Dokumente genehmigt',
    documents_rejected: 'Dokumente abgelehnt',
    enrolled: 'Eingeschrieben',
    completed: 'Abgeschlossen',
    dropped_out: 'Abgebrochen',
  };

  const content = `
    <h2>Status-Änderung Ihrer Bewerbung</h2>
    <p>Hallo ${data.participantName},</p>
    <p>der Status Ihrer Bewerbung hat sich geändert:</p>
    <p>
      <span class="status-badge status-warning">${statusLabels[data.oldStatus] || data.oldStatus}</span>
      →
      <span class="status-badge status-success">${statusLabels[data.newStatus] || data.newStatus}</span>
    </p>
    <p>Sie können Ihren aktuellen Status jederzeit in Ihrem Teilnehmer-Portal einsehen.</p>
    <a href="${data.loginUrl}" class="button">Zum Portal</a>
    <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
    <p>Mit freundlichen Grüßen,<br>Ihr ${data.tenantName} Team</p>
  `;

  const text = `
Hallo ${data.participantName},

der Status Ihrer Bewerbung hat sich geändert:
${statusLabels[data.oldStatus] || data.oldStatus} → ${statusLabels[data.newStatus] || data.newStatus}

Sie können Ihren aktuellen Status jederzeit in Ihrem Teilnehmer-Portal einsehen:
${data.loginUrl}

Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen,
Ihr ${data.tenantName} Team
  `.trim();

  return {
    html: getBaseTemplate(branding, content),
    text,
    subject: `Status-Änderung: ${statusLabels[data.newStatus] || data.newStatus}`,
  };
}

/**
 * Document-Upload E-Mail Template
 */
export function getDocumentUploadEmail(
  data: DocumentUploadEmailData,
  branding: TenantBranding
): { html: string; text: string; subject: string } {
  const content = `
    <h2>Dokument erfolgreich hochgeladen</h2>
    <p>Hallo ${data.participantName},</p>
    <p>Ihr Dokument wurde erfolgreich hochgeladen:</p>
    <p><strong>Dokumenttyp:</strong> ${data.documentType}</p>
    <p>Wir werden Ihr Dokument prüfen und Sie über das Ergebnis informieren.</p>
    <a href="${data.loginUrl}" class="button">Zum Portal</a>
    <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
    <p>Mit freundlichen Grüßen,<br>Ihr ${data.tenantName} Team</p>
  `;

  const text = `
Hallo ${data.participantName},

Ihr Dokument wurde erfolgreich hochgeladen:
Dokumenttyp: ${data.documentType}

Wir werden Ihr Dokument prüfen und Sie über das Ergebnis informieren.

Zum Portal: ${data.loginUrl}

Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen,
Ihr ${data.tenantName} Team
  `.trim();

  return {
    html: getBaseTemplate(branding, content),
    text,
    subject: 'Dokument erfolgreich hochgeladen',
  };
}

/**
 * Document-Validation E-Mail Template
 */
export function getDocumentValidationEmail(
  data: DocumentValidationEmailData,
  branding: TenantBranding
): { html: string; text: string; subject: string } {
  const isValid = data.status === 'valid';
  const statusClass = isValid ? 'status-success' : 'status-danger';
  const statusText = isValid ? 'Genehmigt' : 'Abgelehnt';

  let issuesHtml = '';
  let issuesText = '';
  if (data.issues && data.issues.length > 0) {
    issuesHtml = `
      <h3>Gefundene Probleme:</h3>
      <ul>
        ${data.issues.map((issue) => `<li>${issue}</li>`).join('')}
      </ul>
    `;
    issuesText = `\nGefundene Probleme:\n${data.issues.map((issue) => `- ${issue}`).join('\n')}`;
  }

  let recommendationsHtml = '';
  let recommendationsText = '';
  if (data.recommendations && data.recommendations.length > 0) {
    recommendationsHtml = `
      <h3>Empfehlungen:</h3>
      <ul>
        ${data.recommendations.map((rec) => `<li>${rec}</li>`).join('')}
      </ul>
    `;
    recommendationsText = `\nEmpfehlungen:\n${data.recommendations.map((rec) => `- ${rec}`).join('\n')}`;
  }

  const content = `
    <h2>Dokument-Prüfung abgeschlossen</h2>
    <p>Hallo ${data.participantName},</p>
    <p>Die Prüfung Ihres Dokuments ist abgeschlossen:</p>
    <p><strong>Dokumenttyp:</strong> ${data.documentType}</p>
    <p><strong>Status:</strong> <span class="status-badge ${statusClass}">${statusText}</span></p>
    ${issuesHtml}
    ${recommendationsHtml}
    ${!isValid ? '<p>Bitte laden Sie ein korrigiertes Dokument hoch.</p>' : '<p>Vielen Dank für Ihre Einreichung!</p>'}
    <a href="${data.loginUrl}" class="button">Zum Portal</a>
    <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
    <p>Mit freundlichen Grüßen,<br>Ihr ${data.tenantName} Team</p>
  `;

  const text = `
Hallo ${data.participantName},

Die Prüfung Ihres Dokuments ist abgeschlossen:
Dokumenttyp: ${data.documentType}
Status: ${statusText}
${issuesText}
${recommendationsText}

${!isValid ? 'Bitte laden Sie ein korrigiertes Dokument hoch.' : 'Vielen Dank für Ihre Einreichung!'}

Zum Portal: ${data.loginUrl}

Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen,
Ihr ${data.tenantName} Team
  `.trim();

  return {
    html: getBaseTemplate(branding, content),
    text,
    subject: `Dokument-Prüfung: ${statusText}`,
  };
}

/**
 * Sammeltermin-Reminder E-Mail Template
 */
export function getSammelterminReminderEmail(
  data: SammelterminReminderEmailData,
  branding: TenantBranding
): { html: string; text: string; subject: string } {
  const dateStr = data.sammelterminDate.toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = data.sammelterminDate.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const content = `
    <h2>Erinnerung: Sammeltermin morgen</h2>
    <p>Hallo ${data.participantName},</p>
    <p>Wir möchten Sie daran erinnern, dass morgen Ihr Sammeltermin stattfindet:</p>
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Kurs:</strong> ${data.courseName}</p>
      <p><strong>Datum:</strong> ${dateStr}</p>
      <p><strong>Uhrzeit:</strong> ${timeStr} Uhr</p>
      <p><strong>Ort:</strong> ${data.sammelterminLocation}</p>
    </div>
    <p>Bitte bringen Sie alle erforderlichen Unterlagen mit.</p>
    <a href="${data.loginUrl}" class="button">Zum Portal</a>
    <p>Wir freuen uns auf Ihr Kommen!</p>
    <p>Mit freundlichen Grüßen,<br>Ihr ${data.tenantName} Team</p>
  `;

  const text = `
Hallo ${data.participantName},

Wir möchten Sie daran erinnern, dass morgen Ihr Sammeltermin stattfindet:

Kurs: ${data.courseName}
Datum: ${dateStr}
Uhrzeit: ${timeStr} Uhr
Ort: ${data.sammelterminLocation}

Bitte bringen Sie alle erforderlichen Unterlagen mit.

Zum Portal: ${data.loginUrl}

Wir freuen uns auf Ihr Kommen!

Mit freundlichen Grüßen,
Ihr ${data.tenantName} Team
  `.trim();

  return {
    html: getBaseTemplate(branding, content),
    text,
    subject: `Erinnerung: Sammeltermin morgen - ${data.courseName}`,
  };
}
