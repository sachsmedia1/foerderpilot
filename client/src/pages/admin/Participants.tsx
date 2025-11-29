/**
 * FOERDERPILOT - PARTICIPANTS ADMIN PAGE
 * 
 * Admin-Interface für Teilnehmerverwaltung mit:
 * - Participant-Liste mit Filterung
 * - Status-Pipeline-Visualisierung
 * - CRUD-Operationen
 */

import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  UserPlus, 
  Loader2, 
  Trash2, 
  Eye,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Link } from 'wouter';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
  registered: { label: 'Registriert', variant: 'secondary', color: 'bg-gray-500' },
  documents_pending: { label: 'Dokumente ausstehend', variant: 'outline', color: 'bg-yellow-500' },
  documents_submitted: { label: 'Dokumente eingereicht', variant: 'default', color: 'bg-blue-500' },
  documents_approved: { label: 'Dokumente genehmigt', variant: 'default', color: 'bg-green-500' },
  documents_rejected: { label: 'Dokumente abgelehnt', variant: 'destructive', color: 'bg-red-500' },
  enrolled: { label: 'Eingeschrieben', variant: 'default', color: 'bg-purple-500' },
  completed: { label: 'Abgeschlossen', variant: 'default', color: 'bg-green-600' },
  dropped_out: { label: 'Abgebrochen', variant: 'outline', color: 'bg-gray-400' },
};

export default function Participants() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const utils = trpc.useUtils();

  const { data: participants, isLoading } = trpc.participants.list.useQuery({
    status: statusFilter === 'all' ? undefined : statusFilter as any,
    search: searchQuery || undefined,
  });

  const { data: stats } = trpc.participants.getStats.useQuery();

  const deleteMutation = trpc.participants.delete.useMutation({
    onSuccess: () => {
      toast.success('Teilnehmer gelöscht');
      utils.participants.list.invalidate();
      utils.participants.getStats.invalidate();
    },
    onError: (error) => {
      toast.error(`Löschen fehlgeschlagen: ${error.message}`);
    },
  });

  const handleDelete = (participantId: number, name: string) => {
    if (confirm(`Möchten Sie ${name} wirklich löschen?`)) {
      deleteMutation.mutate({ id: participantId });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Teilnehmer</h1>
            <p className="text-muted-foreground">
              Verwalten Sie Teilnehmer und deren Status
            </p>
          </div>
          <Link href="/admin/participants/new">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Neuer Teilnehmer
            </Button>
          </Link>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Gesamt</CardDescription>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Registriert</CardDescription>
                <CardTitle className="text-3xl text-gray-500">{stats.registered}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Dokumente eingereicht</CardDescription>
                <CardTitle className="text-3xl text-blue-500">{stats.documents_submitted}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Eingeschrieben</CardDescription>
                <CardTitle className="text-3xl text-purple-500">{stats.enrolled}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Suche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Name oder E-Mail suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="registered">Registriert</SelectItem>
                  <SelectItem value="documents_pending">Dokumente ausstehend</SelectItem>
                  <SelectItem value="documents_submitted">Dokumente eingereicht</SelectItem>
                  <SelectItem value="documents_approved">Dokumente genehmigt</SelectItem>
                  <SelectItem value="documents_rejected">Dokumente abgelehnt</SelectItem>
                  <SelectItem value="enrolled">Eingeschrieben</SelectItem>
                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                  <SelectItem value="dropped_out">Abgebrochen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Participants List */}
        <Card>
          <CardHeader>
            <CardTitle>Teilnehmer ({participants?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : participants && participants.length > 0 ? (
              <div className="space-y-4">
                {participants.map((participant) => {
                  const statusConfig = STATUS_CONFIG[participant.status] || STATUS_CONFIG.registered;

                  return (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Status Indicator */}
                        <div className={`w-3 h-3 rounded-full ${statusConfig.color} flex-shrink-0`} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">
                              {participant.firstName} {participant.lastName}
                            </p>
                            <Badge variant={statusConfig.variant}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{participant.email}</span>
                            {participant.phone && (
                              <>
                                <span>•</span>
                                <span>{participant.phone}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>Kurs ID: {participant.courseId}</span>
                            <span>•</span>
                            <span>{format(new Date(participant.createdAt), 'dd.MM.yyyy', { locale: de })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Link href={`/admin/participants/${participant.id}/view`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(participant.id, `${participant.firstName} ${participant.lastName}`)}
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
                {searchQuery || statusFilter !== 'all' 
                  ? 'Keine Teilnehmer gefunden'
                  : 'Noch keine Teilnehmer vorhanden'
                }
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
