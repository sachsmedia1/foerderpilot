import { useState } from "react";
import { ParticipantLayout } from "@/components/ParticipantLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Clock, XCircle, AlertCircle, Upload, FileText, Info, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";

type DocumentStatus = "missing" | "pending" | "validating" | "valid" | "invalid" | "manual_review";

interface DocumentTypeConfig {
  id: string;
  label: string;
  description: string;
  category: 'required' | 'conditional' | 'optional';
  generated?: boolean;
  validationRules: {
    maxSize: number;
    allowedFormats: string[];
  };
  helpText?: string;
}

function DocumentsDashboardContent() {
  const { data: participantData, isLoading: participantLoading, error: participantError } = trpc.participants.getMyData.useQuery();
  const { data: documentTypes, isLoading: typesLoading } = trpc.documents.getDocumentTypes.useQuery();
  const { data: documents } = trpc.documents.list.useQuery(
    { participantId: participantData?.id || 0 },
    { enabled: !!participantData?.id }
  );

  // Loading state
  if (participantLoading || typesLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Lade Dokumente...</div>
        </div>
      </div>
    );
  }

  // Error state - Participant not found
  if (participantError || !participantData) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              Teilnehmer nicht gefunden
            </CardTitle>
            <CardDescription>
              Sie sind noch nicht als Teilnehmer registriert.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Um Dokumente hochladen zu können, müssen Sie zunächst von einem Bildungsträger als Teilnehmer angelegt werden.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Nächste Schritte:
              </p>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Wenden Sie sich an Ihren Bildungsträger</li>
                <li>Bitten Sie um Registrierung als Teilnehmer im System</li>
                <li>Nach der Registrierung können Sie hier Ihre Dokumente hochladen</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Wait for document types
  if (!documentTypes) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Lade Dokumenttypen...</div>
        </div>
      </div>
    );
  }

  const getDocumentStatus = (typeId: string): DocumentStatus => {
    const doc = documents?.find(d => d.documentType === typeId);
    if (!doc) return "missing";
    return doc.validationStatus as DocumentStatus;
  };

  const getDocument = (typeId: string) => {
    return documents?.find(d => d.documentType === typeId);
  };

  // Calculate progress
  const allRequired = [...documentTypes.required, ...documentTypes.conditional];
  const uploadedRequired = allRequired.filter(t => getDocumentStatus(t.id) !== "missing").length;
  const validRequired = allRequired.filter(t => getDocumentStatus(t.id) === "valid").length;
  const progressPercentage = allRequired.length > 0 ? Math.round((uploadedRequired / allRequired.length) * 100) : 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Meine Dokumente</h1>
        <p className="text-muted-foreground mt-2">
          Laden Sie die erforderlichen KOMPASS-Dokumente hoch. Unsere KI prüft sie automatisch.
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium">Fortschritt Pflichtdokumente</p>
              <p className="text-2xl font-bold">{uploadedRequired} / {allRequired.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{validRequired} validiert</p>
              <p className="text-3xl font-bold text-primary">{progressPercentage}%</p>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </CardContent>
      </Card>

      {/* Info Banner */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Nach dem Upload werden alle Dokumente automatisch durch unsere KI geprüft. 
          Sie erhalten eine Benachrichtigung, sobald die Validierung abgeschlossen ist.
        </AlertDescription>
      </Alert>

      {/* PFLICHTDOKUMENTE */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-semibold">Erforderliche Dokumente</h2>
          <Badge variant="destructive">Pflicht</Badge>
        </div>
        
        <div className="grid gap-4">
          {documentTypes.required.map((type: DocumentTypeConfig) => (
            <DocumentCard
              key={type.id}
              documentType={type}
              status={getDocumentStatus(type.id)}
              participantId={participantData.id}
              document={getDocument(type.id)}
            />
          ))}
        </div>
      </div>

      {/* BEDINGTE DOKUMENTE (nur wenn vorhanden) */}
      {documentTypes.conditional && documentTypes.conditional.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-semibold">Zusätzlich erforderlich</h2>
            <Badge variant="destructive">Pflicht (für Ihre Situation)</Badge>
          </div>
          
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Diese Dokumente sind erforderlich, da Sie Mitarbeiter beschäftigen.
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-4">
            {documentTypes.conditional.map((type: DocumentTypeConfig) => (
              <DocumentCard
                key={type.id}
                documentType={type}
                status={getDocumentStatus(type.id)}
                participantId={participantData.id}
                document={getDocument(type.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* OPTIONALE DOKUMENTE */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-semibold">Optionale Dokumente</h2>
          <Badge variant="secondary">Optional</Badge>
        </div>
        
        <div className="grid gap-4">
          {documentTypes.optional.map((type: DocumentTypeConfig) => (
            <DocumentCard
              key={type.id}
              documentType={type}
              status={getDocumentStatus(type.id)}
              participantId={participantData.id}
              document={getDocument(type.id)}
              isOptional
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface DocumentCardProps {
  documentType: DocumentTypeConfig;
  status: DocumentStatus;
  participantId: number;
  document?: any;
  isOptional?: boolean;
}

function DocumentCard({ documentType, status, participantId, document, isOptional = false }: DocumentCardProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const utils = trpc.useUtils();

  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: () => {
      toast.success(`${documentType.label} erfolgreich hochgeladen`);
      utils.documents.list.invalidate();
      utils.documents.getDocumentTypes.invalidate();
      setUploading(false);
      setUploadProgress(0);
    },
    onError: (error) => {
      toast.error(`Upload fehlgeschlagen: ${error.message}`);
      setUploading(false);
      setUploadProgress(0);
    },
  });

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validate file size
    if (file.size > documentType.validationRules.maxSize) {
      const maxMB = documentType.validationRules.maxSize / 1024 / 1024;
      toast.error(`Datei zu groß (max. ${maxMB}MB)`);
      return;
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!documentType.validationRules.allowedFormats.includes(fileExtension)) {
      toast.error(`Nur ${documentType.validationRules.allowedFormats.join(', ').toUpperCase()} erlaubt`);
      return;
    }

    setUploading(true);
    setUploadProgress(30);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result?.toString().split(",")[1];
      if (!base64) {
        toast.error("Fehler beim Lesen der Datei");
        setUploading(false);
        return;
      }

      setUploadProgress(60);

      uploadMutation.mutate({
        participantId,
        documentType: documentType.id as any,
        filename: file.name,
        fileData: base64,
        mimeType: file.type,
      });

      setUploadProgress(100);
    };

    reader.readAsDataURL(file);
  };

  // Build accept object for dropzone
  const acceptTypes: Record<string, string[]> = {};
  if (documentType.validationRules.allowedFormats.includes('pdf')) {
    acceptTypes["application/pdf"] = [".pdf"];
  }
  if (documentType.validationRules.allowedFormats.includes('jpg') || documentType.validationRules.allowedFormats.includes('jpeg')) {
    acceptTypes["image/jpeg"] = [".jpg", ".jpeg"];
  }
  if (documentType.validationRules.allowedFormats.includes('png')) {
    acceptTypes["image/png"] = [".png"];
  }
  if (documentType.validationRules.allowedFormats.includes('heic')) {
    acceptTypes["image/heic"] = [".heic"];
    acceptTypes["image/heif"] = [".heif"];
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptTypes,
    maxFiles: 1,
    disabled: uploading,
  });

  const getStatusIcon = () => {
    switch (status) {
      case "valid":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
      case "validating":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "invalid":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "manual_review":
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "valid":
        return <Badge className="bg-green-600">✓ Gültig</Badge>;
      case "pending":
        return <Badge variant="secondary">⏳ Ausstehend</Badge>;
      case "validating":
        return <Badge variant="secondary">⏳ Wird geprüft</Badge>;
      case "invalid":
        return <Badge variant="destructive">✗ Ungültig</Badge>;
      case "manual_review":
        return <Badge className="bg-orange-600">⚠ Manuelle Prüfung</Badge>;
      default:
        return <Badge variant="outline">❌ Fehlt</Badge>;
    }
  };

  const cardClassName = status === "valid" 
    ? "border-green-500 bg-green-50/50" 
    : isOptional 
      ? "border-dashed" 
      : "";

  return (
    <Card className={cardClassName}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">{getStatusIcon()}</div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{documentType.label}</h3>
                {!isOptional && <Badge variant="destructive" className="text-xs">Pflicht</Badge>}
                {documentType.generated && (
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Auto-generiert
                  </Badge>
                )}
              </div>
              {getStatusBadge()}
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">{documentType.description}</p>

            {/* Hilfetext */}
            {documentType.helpText && (
              <Alert className="mb-3">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {documentType.helpText}
                </AlertDescription>
              </Alert>
            )}

            {/* Upload-Bereich für nicht-generierte Dokumente */}
            {!documentType.generated && status === "missing" && (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 hover:border-primary hover:bg-gray-50"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive ? "Datei hier ablegen..." : "Klicken oder Datei hierher ziehen"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {documentType.validationRules.allowedFormats.join(', ').toUpperCase()} 
                  (max. {(documentType.validationRules.maxSize / 1024 / 1024).toFixed(0)}MB)
                </p>
              </div>
            )}

            {/* Hinweis für auto-generierte Dokumente */}
            {documentType.generated && status === "missing" && (
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  Dieses Dokument wird automatisch nach der Vorvertrag-Bestätigung generiert. 
                  Sie müssen es nur noch unterschreiben und hier hochladen.
                </AlertDescription>
              </Alert>
            )}

            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-muted-foreground">Wird hochgeladen... {uploadProgress}%</p>
              </div>
            )}

            {document && status !== "missing" && (
              <div className="text-sm text-muted-foreground">
                <p>Hochgeladen: {new Date(document.createdAt).toLocaleDateString("de-DE")}</p>
                {document.validatedAt && (
                  <p>Geprüft: {new Date(document.validatedAt).toLocaleDateString("de-DE")}</p>
                )}
                {status === "invalid" && document.validationResult && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800">
                    <p className="font-medium">Ablehnungsgrund:</p>
                    <p className="text-xs mt-1">
                      {(() => {
                        try {
                          return JSON.parse(document.validationResult).issues?.join(", ") || "Dokument entspricht nicht den Anforderungen";
                        } catch {
                          return "Dokument entspricht nicht den Anforderungen";
                        }
                      })()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


export default function DocumentsDashboard() {
  return (
    <ParticipantLayout>
      <DocumentsDashboardContent />
    </ParticipantLayout>
  );
}
