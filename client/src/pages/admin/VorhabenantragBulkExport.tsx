/**
 * FOERDERPILOT - VORHABENANTRAG BULK EXPORT PAGE
 * 
 * Admin-Seite für Z-EU-S Vorhabenantrag-Datenexport mehrerer Teilnehmer
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { FileDown, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function VorhabenantragBulkExport() {
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  
  const { data: participants, isLoading } = trpc.participants.list.useQuery({});
  const { data: exportData, refetch, isFetching } = trpc.zeus.generateVorhabenantragBulk.useQuery(
    { participantIds: selectedParticipants },
    { enabled: false }
  );

  const handleToggle = (id: number) => {
    setSelectedParticipants(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (!participants) return;
    if (selectedParticipants.length === participants.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(participants.map(p => p.id));
    }
  };

  const handleGenerateExport = async () => {
    if (selectedParticipants.length === 0) {
      toast.error('Bitte wählen Sie mindestens einen Teilnehmer aus');
      return;
    }

    await refetch();
    toast.success(`Export-Daten für ${selectedParticipants.length} Teilnehmer generiert`);
  };

  const handleDownload = () => {
    if (!exportData) return;

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vorhabenantrag_bulk_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Export-Datei heruntergeladen');
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Lade Teilnehmer...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Z-EU-S Bulk-Export</h1>
        <p className="text-muted-foreground mt-2">
          Exportieren Sie Vorhabenantrag-Daten für mehrere Teilnehmer gleichzeitig
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teilnehmer auswählen</CardTitle>
          <CardDescription>
            Wählen Sie die Teilnehmer aus, deren Daten Sie exportieren möchten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Select All */}
          <div className="flex items-center gap-2 pb-3 border-b">
            <Checkbox
              id="select-all"
              checked={participants && selectedParticipants.length === participants.length}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="font-medium cursor-pointer">
              Alle auswählen ({participants?.length || 0} Teilnehmer)
            </label>
          </div>

          {/* Participant List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {participants?.map(participant => (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
              >
                <Checkbox
                  id={`participant-${participant.id}`}
                  checked={selectedParticipants.includes(participant.id)}
                  onCheckedChange={() => handleToggle(participant.id)}
                />
                <label
                  htmlFor={`participant-${participant.id}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium">
                    {participant.firstName} {participant.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {participant.email}
                  </div>
                </label>
                <Badge variant="outline">
                  {participant.status === 'registered' ? 'Registriert' :
                   participant.status === 'course_completed' ? 'Kurs abgeschlossen' :
                   participant.status === 'documents_submitted' ? 'Dokumente eingereicht' :
                   participant.status}
                </Badge>
              </div>
            ))}
          </div>

          {/* Selection Summary */}
          <div className="flex items-center gap-2 pt-3 border-t">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">
              {selectedParticipants.length} Teilnehmer ausgewählt
            </span>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateExport}
            disabled={selectedParticipants.length === 0 || isFetching}
            className="w-full"
          >
            {isFetching ? (
              'Generiere Export-Daten...'
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                Export-Daten generieren
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Export Preview */}
      {exportData && (
        <Card>
          <CardHeader>
            <CardTitle>Export-Vorschau</CardTitle>
            <CardDescription>
              {exportData.export.anzahl} Teilnehmer bereit zum Export
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Vollständig</div>
                <div className="text-2xl font-bold text-green-600">
                  {exportData.teilnehmer.filter(t => t.export.status === 'vollstaendig').length}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Unvollständig</div>
                <div className="text-2xl font-bold text-amber-600">
                  {exportData.teilnehmer.filter(t => t.export.status === 'unvollstaendig').length}
                </div>
              </div>
            </div>

            {/* Data Preview */}
            <details className="border rounded-lg">
              <summary className="cursor-pointer font-medium p-3 hover:bg-gray-50">
                Daten-Vorschau anzeigen (JSON)
              </summary>
              <div className="p-3 border-t bg-gray-50">
                <pre className="text-xs overflow-auto max-h-96 p-3 bg-white border rounded">
                  {JSON.stringify(exportData, null, 2)}
                </pre>
              </div>
            </details>

            {/* Download Button */}
            <Button
              onClick={handleDownload}
              className="w-full"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Als JSON herunterladen ({exportData.export.anzahl} Teilnehmer)
            </Button>

            <p className="text-xs text-muted-foreground">
              Die JSON-Datei enthält alle relevanten Daten aller ausgewählten Teilnehmer für die manuelle Übertragung ins Z-EU-S Portal.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
