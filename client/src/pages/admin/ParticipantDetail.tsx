/**
 * FOERDERPILOT - PARTICIPANT DETAIL VIEW
 * 
 * Detailansicht für Teilnehmer mit:
 * - Status-Pipeline-Visualisierung
 * - Document-Integration
 * - Persönliche Daten
 * - Aktionen (Status ändern, Bearbeiten, Löschen)
 */

import { AdminLayout } from '@/components/AdminLayout';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  ArrowLeft, 
  Edit, 
  Trash2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useLocation, useParams } from 'wouter';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { DocumentUpload } from '@/components/DocumentUpload';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string; icon: typeof CheckCircle2 }> = {
  registered: { label: 'Registriert', variant: 'secondary', color: 'bg-gray-500', icon: Clock },
  documents_pending: { label: 'Dokumente ausstehend', variant: 'outline', color: 'bg-yellow-500', icon: AlertCircle },
  documents_submitted: { label: 'Dokumente eingereicht', variant: 'default', color: 'bg-blue-500', icon: FileText },
  documents_approved: { label: 'Dokumente genehmigt', variant: 'default', color: 'bg-green-500', icon: CheckCircle2 },
  documents_rejected: { label: 'Dokumente abgelehnt', variant: 'destructive', color: 'bg-red-500', icon: XCircle },
  enrolled: { label: 'Eingeschrieben', variant: 'default', color: 'bg-purple-500', icon: CheckCircle2 },
  completed: { label: 'Abgeschlossen', variant: 'default', color: 'bg-green-600', icon: CheckCircle2 },
  dropped_out: { label: 'Abgebrochen', variant: 'outline', color: 'bg-gray-400', icon: XCircle },
};

const STATUS_PIPELINE = [
  'registered',
  'documents_pending',
  'documents_submitted',
  'documents_approved',
  'enrolled',
  'completed'
];

export default function ParticipantDetail() {
  const [location, setLocation] = useLocation();
  const params = useParams();
  const participantId = parseInt(params.id!);
  const utils = trpc.useUtils();

  const { data: participant, isLoading } = trpc.participants.getById.useQuery({ id: participantId });
  const { data: documents } = trpc.documents.list.useQuery({ participantId });
  const { data: course } = trpc.courses.getById.useQuery(
    { id: participant?.courseId! },
    { enabled: !!participant?.courseId }
  );

  const updateStatusMutation = trpc.participants.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Status aktualisiert');
      utils.participants.getById.invalidate({ id: participantId });
      utils.participants.list.invalidate();
      utils.participants.getStats.invalidate();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const deleteMutation = trpc.participants.delete.useMutation({
    onSuccess: () => {
      toast.success('Teilnehmer gelöscht');
      setLocation('/participants');
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleDelete = () => {
    if (confirm(`Möchten Sie ${participant?.firstName} ${participant?.lastName} wirklich löschen?`)) {
      deleteMutation.mutate({ id: participantId });
    }
  };

  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate({
      id: participantId,
      status: newStatus as any,
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!participant) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Teilnehmer nicht gefunden</p>
        </div>
      </AdminLayout>
    );
  }

  const statusConfig = STATUS_CONFIG[participant.status] || STATUS_CONFIG.registered;
  const StatusIcon = statusConfig.icon;
  const currentStatusIndex = STATUS_PIPELINE.indexOf(participant.status);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLocation('/participants')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {participant.firstName} {participant.lastName}
              </h1>
              <p className="text-muted-foreground">Teilnehmer-Details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setLocation(`/participants/${participantId}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2 text-destructive" />
              Löschen
            </Button>
          </div>
        </div>

        {/* Status Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon className="h-5 w-5" />
              Status-Pipeline
            </CardTitle>
            <CardDescription>Aktueller Status und Fortschritt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Status */}
            <div className="flex items-center gap-4">
              <Badge variant={statusConfig.variant} className="text-sm px-4 py-2">
                {statusConfig.label}
              </Badge>
              <Select
                value={participant.status}
                onValueChange={handleStatusChange}
                disabled={updateStatusMutation.isPending}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pipeline Visualization */}
            <div className="flex items-center gap-2">
              {STATUS_PIPELINE.map((status, index) => {
                const config = STATUS_CONFIG[status];
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;

                return (
                  <div key={status} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted ? config.color : 'bg-muted'
                        } text-white`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </div>
                      <p className={`text-xs mt-2 text-center ${isCurrent ? 'font-semibold' : 'text-muted-foreground'}`}>
                        {config.label}
                      </p>
                    </div>
                    {index < STATUS_PIPELINE.length - 1 && (
                      <div className={`h-0.5 flex-1 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Persönliche Daten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">E-Mail</p>
                  <p className="font-medium">{participant.email}</p>
                </div>
              </div>

              {participant.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefon</p>
                    <p className="font-medium">{participant.phone}</p>
                  </div>
                </div>
              )}

              {participant.dateOfBirth && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Geburtsdatum</p>
                    <p className="font-medium">
                      {format(new Date(participant.dateOfBirth), 'dd.MM.yyyy', { locale: de })}
                    </p>
                  </div>
                </div>
              )}

              {(participant.street || participant.city) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Adresse</p>
                    <div className="font-medium">
                      {participant.street && <p>{participant.street}</p>}
                      {(participant.zipCode || participant.city) && (
                        <p>
                          {participant.zipCode} {participant.city}
                        </p>
                      )}
                      {participant.country && <p>{participant.country}</p>}
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Registriert am</p>
                <p className="font-medium">
                  {format(new Date(participant.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                </p>
              </div>

              {participant.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Notizen</p>
                    <p className="text-sm">{participant.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Course Information */}
          <Card>
            <CardHeader>
              <CardTitle>Kurs-Informationen</CardTitle>
            </CardHeader>
            <CardContent>
              {course ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Kurs</p>
                    <p className="font-semibold text-lg">{course.name}</p>
                  </div>
                  {course.shortDescription && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Beschreibung</p>
                      <p className="text-sm">{course.shortDescription}</p>
                    </div>
                  )}
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Dauer</p>
                      <p className="font-medium">{course.duration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Preis (Brutto)</p>
                      <p className="font-medium">{course.priceGross.toFixed(2)} €</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dokumente ({documents?.length || 0})
            </CardTitle>
            <CardDescription>Hochgeladene Dokumente und deren Validierungs-Status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document Upload */}
            <DocumentUpload participantId={participantId} />

            {/* Document List */}
            {documents && documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.documentType}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(doc.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        doc.validationStatus === 'valid'
                          ? 'default'
                          : doc.validationStatus === 'invalid'
                          ? 'destructive'
                          : 'outline'
                      }
                    >
                      {doc.validationStatus === 'valid' && 'Gültig'}
                      {doc.validationStatus === 'invalid' && 'Ungültig'}
                      {doc.validationStatus === 'pending' && 'Ausstehend'}
                      {doc.validationStatus === 'manual_review' && 'Manuelle Prüfung'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                Noch keine Dokumente hochgeladen
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
