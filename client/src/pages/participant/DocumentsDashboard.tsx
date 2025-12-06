import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, XCircle, AlertCircle, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";

type DocumentStatus = "missing" | "pending" | "valid" | "invalid";

interface Document {
  type: string;
  name: string;
  description: string;
  status: DocumentStatus;
  uploadedAt?: Date;
  validatedAt?: Date;
  rejectionReason?: string;
}

export default function DocumentsDashboard() {
  const { data, isLoading } = trpc.documents.getRequiredDocuments.useQuery();
  const utils = trpc.useUtils();

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Lade Dokumente...</div>
        </div>
      </div>
    );
  }

  if (!data || !data.documents) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <FileText className="w-12 h-12 text-muted-foreground" />
          <div className="text-muted-foreground">Keine Dokumente gefunden</div>
          <p className="text-sm text-center text-muted-foreground max-w-md">
            Sie sind noch keinem Kurs zugeordnet. Bitte wenden Sie sich an Ihren Bildungsträger.
          </p>
        </div>
      </div>
    );
  }

  const { documents } = data;

  // Calculate progress
  const totalDocs = documents.length;
  const validDocs = documents.filter((d: Document) => d.status === "valid").length;
  const progressPercent = totalDocs > 0 ? (validDocs / totalDocs) * 100 : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Meine Dokumente</h1>
        <p className="text-muted-foreground mt-2">
          Laden Sie die erforderlichen Dokumente hoch. Unsere KI prüft sie automatisch.
        </p>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Fortschritt</CardTitle>
          <CardDescription>
            {validDocs} von {totalDocs} Dokumenten gültig
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercent} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {progressPercent === 100
              ? "🎉 Alle Dokumente vollständig!"
              : `Noch ${totalDocs - validDocs} Dokument(e) erforderlich`}
          </p>
        </CardContent>
      </Card>

      {/* Document Cards */}
      <div className="grid gap-4">
        {documents.map((doc: Document) => (
          <DocumentCard key={doc.type} document={doc} onUploadSuccess={() => utils.documents.getRequiredDocuments.invalidate()} />
        ))}
      </div>
    </div>
  );
}

function DocumentCard({ document, onUploadSuccess }: { document: Document; onUploadSuccess: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: () => {
      toast.success("Dokument hochgeladen! Wird geprüft...");
      setUploading(false);
      setUploadProgress(0);
      onUploadSuccess();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
      setUploading(false);
      setUploadProgress(0);
    },
  });

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      toast.error("Keine Datei ausgewählt");
      return;
    }

    const file = acceptedFiles[0];

    // File size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Datei zu groß (max. 10MB)");
      return;
    }

    setUploading(true);
    setUploadProgress(30);

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setUploadProgress(60);

      try {
        await uploadMutation.mutateAsync({
          documentType: document.type,
          fileName: file.name,
          fileData: base64,
          mimeType: file.type,
        });
        setUploadProgress(100);
      } catch (error) {
        console.error("Upload error:", error);
      }
    };

    reader.onerror = () => {
      toast.error("Fehler beim Lesen der Datei");
      setUploading(false);
      setUploadProgress(0);
    };

    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const { status } = document;

  // Status Icon & Color
  const getStatusIcon = () => {
    switch (status) {
      case "valid":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "pending":
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case "invalid":
        return <XCircle className="w-6 h-6 text-red-500" />;
      case "missing":
      default:
        return <AlertCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "valid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Gültig ✓</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Wird geprüft...</Badge>;
      case "invalid":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Ungültig ✗</Badge>;
      case "missing":
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Fehlt</Badge>;
    }
  };

  const showUploadButton = status === "missing" || status === "invalid";

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Icon + Info */}
          <div className="flex items-start gap-4 flex-1">
            {getStatusIcon()}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{document.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{document.description}</p>

              {/* Status Badge */}
              <div className="mt-2">{getStatusBadge()}</div>

              {/* Rejection Reason */}
              {status === "invalid" && document.rejectionReason && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">
                    <strong>Ablehnungsgrund:</strong> {document.rejectionReason}
                  </p>
                </div>
              )}

              {/* Upload Date */}
              {document.uploadedAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Hochgeladen: {new Date(document.uploadedAt).toLocaleDateString("de-DE")}
                </p>
              )}
            </div>
          </div>

          {/* Right: Upload Button or Drag & Drop */}
          {showUploadButton && (
            <div className="w-64">
              {uploading ? (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground">Wird hochgeladen...</p>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 hover:border-primary hover:bg-gray-50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">
                    {isDragActive ? "Datei hier ablegen" : "Datei hochladen"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Drag & Drop oder klicken
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (max. 10MB)</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
