/**
 * FOERDERPILOT - DOCUMENT UPLOAD COMPONENT
 * 
 * Drag & Drop File Upload mit:
 * - File-Type-Validierung
 * - Progress-Tracking
 * - S3-Upload via tRPC
 */

import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, FileCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentUploadProps {
  participantId: number;
  onUploadComplete?: () => void;
}

const DOCUMENT_TYPES = [
  // Phase 1: Vor Kurs (Förderberechtigung)
  { value: 'nachweis_haupterwerb', label: 'Nachweis Haupterwerb' },
  { value: 'vzae_rechner', label: 'VZÄ-Rechner' },
  { value: 'nachweis_beginn_selbststaendigkeit', label: 'Nachweis Beginn Selbstständigkeit' },
  { value: 'de_minimis_erklaerung', label: 'De-minimis-Erklärung' },
  // Phase 2: Nach Kurs (Rückerstattung)
  { value: 'teilnahmebescheinigung', label: 'Teilnahmebescheinigung' },
  { value: 'kursrechnung', label: 'Kursrechnung' },
  { value: 'zahlungsnachweis', label: 'Zahlungsnachweis' },
];

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/heic',
  'image/heif',
  'application/pdf',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function DocumentUpload({ participantId, onUploadComplete }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<'nachweis_haupterwerb' | 'vzae_rechner' | 'nachweis_beginn_selbststaendigkeit' | 'de_minimis_erklaerung' | 'teilnahmebescheinigung' | 'kursrechnung' | 'zahlungsnachweis' | ''>('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: () => {
      toast.success('Dokument erfolgreich hochgeladen');
      setSelectedFile(null);
      setDocumentType('');
      setProgress(0);
      onUploadComplete?.();
    },
    onError: (error) => {
      toast.error(`Upload fehlgeschlagen: ${error.message}`);
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error('Nur PDF, JPG, PNG und HEIC Dateien sind erlaubt');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Datei ist zu groß (max. 10MB)');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      toast.error('Bitte wählen Sie eine Datei und einen Dokumenttyp');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1]; // Remove data:image/jpeg;base64, prefix

        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        await uploadMutation.mutateAsync({
          participantId,
          documentType,
          filename: selectedFile.name,
          fileData: base64Data,
          mimeType: selectedFile.type,
        });

        clearInterval(progressInterval);
        setProgress(100);
      };

      reader.onerror = () => {
        toast.error('Fehler beim Lesen der Datei');
        setUploading(false);
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dokument hochladen</CardTitle>
        <CardDescription>
          Laden Sie Dokumente für den Teilnehmer hoch (max. 10MB, PDF/JPG/PNG/HEIC)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Dokumenttyp</label>
          <Select value={documentType} onValueChange={(value) => setDocumentType(value as typeof documentType)}>
            <SelectTrigger>
              <SelectValue placeholder="Dokumenttyp wählen" />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Drag & Drop Area */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            ${selectedFile ? 'bg-muted' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            className="hidden"
            accept={ALLOWED_MIME_TYPES.join(',')}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />

          {selectedFile ? (
            <div className="flex flex-col items-center gap-2">
              <FileCheck className="h-12 w-12 text-primary" />
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <p className="font-medium">Datei hier ablegen oder klicken</p>
              <p className="text-sm text-muted-foreground">
                PDF, JPG, PNG oder HEIC (max. 10MB)
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">
              {progress}% hochgeladen...
            </p>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !documentType || uploading}
          className="w-full"
        >
          {uploading ? 'Wird hochgeladen...' : 'Hochladen'}
        </Button>

        {/* Info */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            Nach dem Upload wird das Dokument automatisch mit KI validiert.
            Sie erhalten eine Benachrichtigung über das Ergebnis.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
