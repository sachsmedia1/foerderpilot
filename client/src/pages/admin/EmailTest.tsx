/**
 * FOERDERPILOT - E-MAIL TEST PAGE
 * 
 * Admin-Seite zum Testen aller E-Mail-Templates
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function EmailTest() {
  const [email, setEmail] = useState('sachs@stefan-sachs.de');

  const sendTestEmail = trpc.emailTest.sendTestEmail.useMutation({
    onSuccess: () => {
      toast.success('E-Mail versendet', {
        description: 'Test-E-Mail wurde erfolgreich versendet',
      });
    },
    onError: (error) => {
      toast.error('Fehler', {
        description: error.message,
      });
    },
  });

  const testStatusChange = trpc.emailTest.testStatusChangeEmail.useMutation({
    onSuccess: () => {
      toast({
        title: 'E-Mail versendet',
        description: 'Status-Change E-Mail wurde erfolgreich versendet',
      });
    },
    onError: (error) => {
      toast.error('Fehler', {
        description: error.message,
      });
    },
  });

  const testDocumentUpload = trpc.emailTest.testDocumentUploadEmail.useMutation({
    onSuccess: () => {
      toast({
        title: 'E-Mail versendet',
        description: 'Document-Upload E-Mail wurde erfolgreich versendet',
      });
    },
    onError: (error) => {
      toast.error('Fehler', {
        description: error.message,
      });
    },
  });

  const testValidationValid = trpc.emailTest.testDocumentValidationEmailValid.useMutation({
    onSuccess: () => {
      toast({
        title: 'E-Mail versendet',
        description: 'Document-Validation E-Mail (Valid) wurde erfolgreich versendet',
      });
    },
    onError: (error) => {
      toast.error('Fehler', {
        description: error.message,
      });
    },
  });

  const testValidationInvalid = trpc.emailTest.testDocumentValidationEmailInvalid.useMutation({
    onSuccess: () => {
      toast({
        title: 'E-Mail versendet',
        description: 'Document-Validation E-Mail (Invalid) wurde erfolgreich versendet',
      });
    },
    onError: (error) => {
      toast.error('Fehler', {
        description: error.message,
      });
    },
  });

  const testSammelterminReminder = trpc.emailTest.testSammelterminReminderEmail.useMutation({
    onSuccess: () => {
      toast({
        title: 'E-Mail versendet',
        description: 'Sammeltermin-Reminder E-Mail wurde erfolgreich versendet',
      });
    },
    onError: (error) => {
      toast.error('Fehler', {
        description: error.message,
      });
    },
  });

  const isLoading =
    sendTestEmail.isPending ||
    testStatusChange.isPending ||
    testDocumentUpload.isPending ||
    testValidationValid.isPending ||
    testValidationInvalid.isPending ||
    testSammelterminReminder.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">E-Mail Templates testen</h1>
          <p className="text-muted-foreground mt-2">
            Testen Sie alle E-Mail-Templates mit Ihrem Tenant-Branding
          </p>
        </div>

        {/* E-Mail Input */}
        <Card>
          <CardHeader>
            <CardTitle>Test-E-Mail-Adresse</CardTitle>
            <CardDescription>
              Geben Sie die E-Mail-Adresse ein, an die die Test-E-Mails gesendet werden sollen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ihre@email.de"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Basis-Test
            </CardTitle>
            <CardDescription>
              Einfache Test-E-Mail ohne Template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => sendTestEmail.mutate({ to: email })}
              disabled={isLoading || !email}
            >
              <Send className="h-4 w-4 mr-2" />
              Test-E-Mail senden
            </Button>
          </CardContent>
        </Card>

        {/* Status-Change Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Status-Änderung Template
            </CardTitle>
            <CardDescription>
              E-Mail bei Teilnehmer-Status-Änderung (z.B. "Dokumente ausstehend" → "Dokumente genehmigt")
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => testStatusChange.mutate({ to: email })}
              disabled={isLoading || !email}
            >
              <Send className="h-4 w-4 mr-2" />
              Status-Change E-Mail senden
            </Button>
          </CardContent>
        </Card>

        {/* Document-Upload Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Dokument-Upload Template
            </CardTitle>
            <CardDescription>
              Bestätigungs-E-Mail nach erfolgreichem Dokument-Upload
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => testDocumentUpload.mutate({ to: email })}
              disabled={isLoading || !email}
            >
              <Send className="h-4 w-4 mr-2" />
              Document-Upload E-Mail senden
            </Button>
          </CardContent>
        </Card>

        {/* Document-Validation Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Dokument-Validierung Templates
            </CardTitle>
            <CardDescription>
              E-Mails nach Dokument-Prüfung (genehmigt oder abgelehnt)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Dokument genehmigt</h3>
              <Button
                onClick={() => testValidationValid.mutate({ to: email })}
                disabled={isLoading || !email}
                variant="outline"
              >
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                Validation Valid E-Mail senden
              </Button>
            </div>
            <div>
              <h3 className="font-medium mb-2">Dokument abgelehnt (mit Issues & Recommendations)</h3>
              <Button
                onClick={() => testValidationInvalid.mutate({ to: email })}
                disabled={isLoading || !email}
                variant="outline"
              >
                <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                Validation Invalid E-Mail senden
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sammeltermin-Reminder Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-600" />
              Sammeltermin-Reminder Template
            </CardTitle>
            <CardDescription>
              Erinnerungs-E-Mail 24 Stunden vor Sammeltermin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => testSammelterminReminder.mutate({ to: email })}
              disabled={isLoading || !email}
            >
              <Send className="h-4 w-4 mr-2" />
              Sammeltermin-Reminder E-Mail senden
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
