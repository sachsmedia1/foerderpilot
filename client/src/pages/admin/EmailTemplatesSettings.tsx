import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Eye, Save } from 'lucide-react';

const TEMPLATE_TYPES = [
  { value: 'welcome', label: 'Willkommens-E-Mail' },
  { value: 'password_reset', label: 'Passwort-Reset' },
  { value: 'document_validation_valid', label: 'Dokument-Validierung (Gültig)' },
  { value: 'document_validation_invalid', label: 'Dokument-Validierung (Ungültig)' },
  { value: 'status_change', label: 'Status-Änderung' },
  { value: 'sammeltermin_reminder', label: 'Sammeltermin-Erinnerung' },
];

const PLACEHOLDERS = [
  '{{vorname}}',
  '{{nachname}}',
  '{{email}}',
  '{{kurstitel}}',
  '{{starttermin}}',
  '{{kurspreis}}',
  '{{foerderbetrag}}',
  '{{passwordResetLink}}',
  '{{tenantName}}',
];

export default function EmailTemplatesSettings() {
  const [selectedType, setSelectedType] = useState('welcome');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const { data, isLoading } = trpc.emailTemplates.list.useQuery();
  const updateMutation = trpc.emailTemplates.update.useMutation({
    onSuccess: () => {
      toast.success('Template gespeichert!');
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const previewMutation = trpc.emailTemplates.preview.useMutation({
    onSuccess: (data) => {
      setShowPreview(true);
      // Preview in neuem Fenster öffnen
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>E-Mail Preview: ${data.preview.subject}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .subject { font-size: 18px; font-weight: bold; margin-bottom: 20px; padding: 10px; background: #f3f4f6; border-left: 4px solid #6366f1; }
              </style>
            </head>
            <body>
              <div class="subject">Betreff: ${data.preview.subject}</div>
              ${data.preview.bodyHtml}
            </body>
          </html>
        `);
        previewWindow.document.close();
      }
    },
  });

  // Load template when type changes
  useEffect(() => {
    if (data?.templates) {
      const template = data.templates.find((t: any) => t.templateType === selectedType);
      if (template) {
        setSubject(template.subject);
        setBodyHtml(template.bodyHtml);
      }
    }
  }, [selectedType, data]);

  const handleSave = () => {
    const template = data?.templates?.find((t: any) => t.templateType === selectedType);
    if (!template) {
      toast.error('Template nicht gefunden');
      return;
    }

    updateMutation.mutate({
      id: template.id,
      subject,
      bodyHtml,
    });
  };

  const handlePreview = () => {
    previewMutation.mutate({
      templateType: selectedType,
      subject,
      bodyHtml,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">E-Mail-Vorlagen</h1>
        <p className="text-muted-foreground mt-2">
          Passen Sie die E-Mail-Templates für Ihren Bildungsträger an
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template bearbeiten</CardTitle>
          <CardDescription>
            Wählen Sie ein Template aus und passen Sie Betreff und Inhalt an
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template-Auswahl */}
          <div className="space-y-2">
            <Label htmlFor="template-type">Template-Typ</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger id="template-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Betreff */}
          <div className="space-y-2">
            <Label htmlFor="subject">Betreff</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="z.B. ✅ Anmeldung bestätigt: {{kurstitel}}"
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">E-Mail-Text (HTML)</Label>
            <Textarea
              id="body"
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              className="font-mono min-h-[300px]"
              placeholder="<p>Hallo {{vorname}},</p><p>Vielen Dank für Ihre Anmeldung...</p>"
            />
          </div>

          {/* Platzhalter */}
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="text-sm">Verfügbare Platzhalter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {PLACEHOLDERS.map((placeholder) => (
                  <code
                    key={placeholder}
                    className="px-2 py-1 bg-background rounded text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => {
                      // Copy to clipboard
                      navigator.clipboard.writeText(placeholder);
                      toast.success(`${placeholder} kopiert!`);
                    }}
                  >
                    {placeholder}
                  </code>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Klicken Sie auf einen Platzhalter, um ihn zu kopieren
              </p>
            </CardContent>
          </Card>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={previewMutation.isPending}
            >
              {previewMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              Preview anzeigen
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Speichern
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
