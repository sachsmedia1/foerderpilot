/**
 * FOERDERPILOT - VORHABENANTRAG EXPORT COMPONENT
 * 
 * Component für Z-EU-S Vorhabenantrag-Datenexport eines einzelnen Teilnehmers
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { FileDown, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VorhabenantragExportProps {
  participantId: number;
}

export function VorhabenantragExport({ participantId }: VorhabenantragExportProps) {
  const [showPreview, setShowPreview] = useState(false);
  
  const { data, isLoading, error } = trpc.zeus.generateVorhabenantrag.useQuery(
    { participantId },
    { enabled: showPreview }
  );

  const handleExport = () => {
    if (!data) return;
    
    // JSON Export
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vorhabenantrag_${participantId}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Z-EU-S Vorhabenantrag Export</CardTitle>
        <CardDescription>
          Exportieren Sie alle Daten für die Einreichung im Z-EU-S Portal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={() => setShowPreview(!showPreview)}
          variant="outline"
          disabled={isLoading}
        >
          {showPreview ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Vorschau ausblenden
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Daten generieren & Vorschau anzeigen
            </>
          )}
        </Button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-900">Fehler beim Laden</p>
              <p className="text-sm text-red-700">{error.message}</p>
            </div>
          </div>
        )}

        {showPreview && data && (
          <div className="space-y-4">
            {/* Status-Check */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Vollständigkeits-Check</h3>
              <div className="space-y-1">
                <StatusItem
                  label="Phase 1 Dokumente (vor Kurs)"
                  complete={data.dokumente.phase1Komplett}
                />
                <StatusItem
                  label="Phase 2 Dokumente (nach Kurs)"
                  complete={data.dokumente.phase2Komplett}
                />
                <StatusItem
                  label="Begründungstexte"
                  complete={data.begruendungen.length >= 5}
                />
              </div>
              
              <div className="mt-3">
                <Badge 
                  variant={data.export.status === 'vollstaendig' ? 'default' : 'secondary'}
                  className={data.export.status === 'vollstaendig' ? 'bg-green-600' : 'bg-amber-600'}
                >
                  {data.export.status === 'vollstaendig' ? '✓ Vollständig' : '⚠ Unvollständig'}
                </Badge>
              </div>
            </div>

            {/* Data Preview */}
            <details className="border rounded-lg">
              <summary className="cursor-pointer font-medium p-3 hover:bg-gray-50">
                Daten-Vorschau anzeigen (JSON)
              </summary>
              <div className="p-3 border-t bg-gray-50">
                <pre className="text-xs overflow-auto max-h-96 p-3 bg-white border rounded">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </details>

            {/* Export Button */}
            <Button
              onClick={handleExport}
              className="w-full"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Als JSON herunterladen
            </Button>

            <p className="text-xs text-muted-foreground">
              Die JSON-Datei enthält alle relevanten Daten für die manuelle Übertragung ins Z-EU-S Portal.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusItem({ label, complete }: { label: string; complete: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {complete ? (
        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
      )}
      <span className={complete ? 'text-green-900' : 'text-amber-900'}>
        {label}: {complete ? 'Vollständig' : 'Unvollständig'}
      </span>
    </div>
  );
}
