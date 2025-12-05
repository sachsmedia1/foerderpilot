import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Mail, Edit, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type EmailTemplate = {
  id: number;
  templateType: string;
  subject: string;
  bodyHtml: string;
  bodyText: string | null;
  isActive: boolean;
};

export default function EmailTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  const { data, isLoading, refetch } = trpc.emailTemplates.list.useQuery();
  const updateMutation = trpc.emailTemplates.update.useMutation();
  const previewMutation = trpc.emailTemplates.preview.useMutation();

  const templates = data?.templates || [];

  const getTemplateLabel = (type: string) => {
    const labels: Record<string, string> = {
      welcome: 'Willkommen Teilnehmer',
      password_reset: 'Passwort zurücksetzen',
      document_validation_valid: 'Dokument validiert',
      document_validation_invalid: 'Dokument abgelehnt',
      sammeltermin_reminder: 'Sammeltermin-Erinnerung',
      status_change: 'Status-Änderung',
    };
    return labels[type] || type;
  };

  const getTemplateDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      welcome: 'Wird nach erfolgreicher Registrierung versendet',
      password_reset: 'Wird bei Passwort-Anfrage versendet',
      document_validation_valid: 'Wird nach erfolgreicher Dokumentenprüfung versendet',
      document_validation_invalid: 'Wird bei abgelehntem Dokument versendet',
      sammeltermin_reminder: 'Wird vor Sammeltermin versendet',
      status_change: 'Wird bei Status-Änderung versendet',
    };
    return descriptions[type] || '';
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedTemplate.id,
        subject: selectedTemplate.subject,
        bodyHtml: selectedTemplate.bodyHtml,
        bodyText: selectedTemplate.bodyText || undefined,
      });
      toast.success('Template erfolgreich gespeichert');
      setIsEditing(false);
      setSelectedTemplate(null);
      refetch();
    } catch (error) {
      toast.error('Fehler beim Speichern des Templates');
    }
  };

  const handlePreview = async () => {
    if (!selectedTemplate) return;

    try {
      const result = await previewMutation.mutateAsync({
        templateType: selectedTemplate.templateType,
        subject: selectedTemplate.subject,
        bodyHtml: selectedTemplate.bodyHtml,
        testData: {
          vorname: 'Max',
          nachname: 'Mustermann',
          email: 'max.mustermann@example.com',
          kurstitel: 'Social Media Marketing',
          kursStartdatum: '15.01.2025',
          resetLink: 'https://app.foerderpilot.io/reset-password/token123',
        },
      });
      setPreviewHtml(result.html);
      setIsPreviewOpen(true);
    } catch (error) {
      toast.error('Fehler beim Erstellen der Vorschau');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">E-Mail-Vorlagen</h1>
        <p className="text-gray-600 mt-2">
          Bearbeiten Sie die E-Mail-Vorlagen für automatische System-E-Mails
        </p>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{getTemplateLabel(template.templateType)}</CardTitle>
                    <CardDescription>{getTemplateDescription(template.templateType)}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {template.isActive && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Aktiv
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Bearbeiten
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                <strong>Betreff:</strong> {template.subject}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate && getTemplateLabel(selectedTemplate.templateType)} bearbeiten
            </DialogTitle>
            <DialogDescription>
              Passen Sie Betreff und Inhalt der E-Mail-Vorlage an
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Betreff</label>
                <Input
                  value={selectedTemplate.subject}
                  onChange={(e) =>
                    setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })
                  }
                  placeholder="E-Mail-Betreff"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">E-Mail-Text (HTML)</label>
                <Textarea
                  value={selectedTemplate.bodyHtml}
                  onChange={(e) =>
                    setSelectedTemplate({ ...selectedTemplate, bodyHtml: e.target.value })
                  }
                  rows={15}
                  className="font-mono text-sm"
                  placeholder="HTML-Inhalt der E-Mail"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Verfügbare Platzhalter:
                </p>
                <code className="text-xs text-blue-800 block">
                  {'{{vorname}}, {{nachname}}, {{email}}, {{kurstitel}}, {{kursStartdatum}}, {{resetLink}}'}
                </code>
                <p className="text-xs text-blue-700 mt-2">
                  Platzhalter werden automatisch durch echte Daten ersetzt
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Abbrechen
            </Button>
            <Button variant="outline" onClick={handlePreview} disabled={previewMutation.isPending}>
              <Eye className="w-4 h-4 mr-2" />
              Vorschau
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>E-Mail-Vorschau</DialogTitle>
            <DialogDescription>
              So sieht die E-Mail mit Test-Daten aus
            </DialogDescription>
          </DialogHeader>

          <div
            className="border rounded-lg p-6 bg-white"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />

          <DialogFooter>
            <Button onClick={() => setIsPreviewOpen(false)}>Schließen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
