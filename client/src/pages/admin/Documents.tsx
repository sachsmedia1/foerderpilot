/**
 * FOERDERPILOT - DOCUMENTS ADMIN PAGE
 * 
 * Admin-Interface für Dokumentenverwaltung mit:
 * - Document-Liste mit Filterung
 * - AI-Validierung
 * - Status-Übersicht
 */

import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileCheck, FileX, Clock, AlertCircle, Loader2, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  personalausweis: 'Personalausweis',
  lebenslauf: 'Lebenslauf',
  zeugnisse: 'Zeugnisse',
  arbeitsvertrag: 'Arbeitsvertrag',
  kuendigungsbestaetigung: 'Kündigungsbestätigung',
  other: 'Sonstiges',
};

const STATUS_CONFIG = {
  pending: { label: 'Ausstehend', icon: Clock, variant: 'secondary' as const, color: 'text-gray-500' },
  validating: { label: 'Wird validiert', icon: Loader2, variant: 'default' as const, color: 'text-blue-500' },
  valid: { label: 'Gültig', icon: FileCheck, variant: 'default' as const, color: 'text-green-500' },
  invalid: { label: 'Ungültig', icon: FileX, variant: 'destructive' as const, color: 'text-red-500' },
  manual_review: { label: 'Manuelle Prüfung', icon: AlertCircle, variant: 'outline' as const, color: 'text-orange-500' },
};

export default function Documents() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const utils = trpc.useUtils();

  const { data: documents, isLoading } = trpc.documents.list.useQuery({
    validationStatus: statusFilter === 'all' ? undefined : statusFilter as any,
  });

  const validateMutation = trpc.documents.validate.useMutation({
    onSuccess: (data) => {
      toast.success(`Dokument validiert: ${STATUS_CONFIG[data.status].label}`);
      utils.documents.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Validierung fehlgeschlagen: ${error.message}`);
    },
  });

  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success('Dokument gelöscht');
      utils.documents.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Löschen fehlgeschlagen: ${error.message}`);
    },
  });

  const handleValidate = (documentId: number) => {
    if (confirm('Möchten Sie dieses Dokument mit KI validieren?')) {
      validateMutation.mutate({ documentId });
    }
  };

  const handleDelete = (documentId: number) => {
    if (confirm('Möchten Sie dieses Dokument wirklich löschen?')) {
      deleteMutation.mutate({ id: documentId });
    }
  };

  // Calculate statistics
  const stats = {
    total: documents?.length || 0,
    pending: documents?.filter(d => d.validationStatus === 'pending').length || 0,
    valid: documents?.filter(d => d.validationStatus === 'valid').length || 0,
    invalid: documents?.filter(d => d.validationStatus === 'invalid').length || 0,
    manual_review: documents?.filter(d => d.validationStatus === 'manual_review').length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dokumente</h1>
          <p className="text-muted-foreground">
            Verwalten und validieren Sie hochgeladene Dokumente
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Gesamt</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Ausstehend</CardDescription>
              <CardTitle className="text-3xl text-gray-500">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Gültig</CardDescription>
              <CardTitle className="text-3xl text-green-500">{stats.valid}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Ungültig</CardDescription>
              <CardTitle className="text-3xl text-red-500">{stats.invalid}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Manuelle Prüfung</CardDescription>
              <CardTitle className="text-3xl text-orange-500">{stats.manual_review}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="pending">Ausstehend</SelectItem>
                  <SelectItem value="validating">Wird validiert</SelectItem>
                  <SelectItem value="valid">Gültig</SelectItem>
                  <SelectItem value="invalid">Ungültig</SelectItem>
                  <SelectItem value="manual_review">Manuelle Prüfung</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Dokumente ({documents?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : documents && documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((doc) => {
                  const statusConfig = STATUS_CONFIG[doc.validationStatus as keyof typeof STATUS_CONFIG];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <StatusIcon className={`h-5 w-5 ${statusConfig.color} flex-shrink-0 ${doc.validationStatus === 'validating' ? 'animate-spin' : ''}`} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate">{doc.filename}</p>
                            <Badge variant={statusConfig.variant}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}</span>
                            <span>•</span>
                            <span>Teilnehmer ID: {doc.participantId}</span>
                            <span>•</span>
                            <span>{format(new Date(doc.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.fileUrl, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {doc.validationStatus === 'pending' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleValidate(doc.id)}
                            disabled={validateMutation.isPending}
                          >
                            {validateMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Validieren'
                            )}
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(doc.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Keine Dokumente gefunden
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
