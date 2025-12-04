/**
 * FOERDERPILOT - VALIDATION DASHBOARD
 * 
 * Admin-Dashboard für Dokument-Validierung:
 * - Tabs für Status-Filter (Pending, Valid, Invalid, Manual Review)
 * - Document-Preview (PDF/Image inline)
 * - Bulk-Actions (Approve/Reject mehrere Dokumente)
 * - Stats-Cards mit Validierungsrate
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileCheck, FileX, FileWarning, RefreshCw, CheckCircle, XCircle, Eye, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AdminLayout } from "@/components/AdminLayout";

export default function ValidationDashboard() {
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  const utils = trpc.useUtils();

  // Get all documents
  const { data: documents, isLoading } = trpc.documents.list.useQuery({});

  // Re-validate mutation
  const revalidateMutation = trpc.documents.validate.useMutation({
    onSuccess: () => {
      toast.success("Dokument wird neu validiert");
      utils.documents.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Update validation status mutation
  const updateStatusMutation = trpc.documents.updateValidationStatus.useMutation({
    onSuccess: () => {
      toast.success("Status aktualisiert");
      utils.documents.list.invalidate();
      setSelectedDocs([]);
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Delete mutation (for reject action)
  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Dokument abgelehnt und gelöscht");
      utils.documents.list.invalidate();
      setSelectedDocs([]);
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Filter documents by tab
  const filteredDocuments = documents?.filter((doc) => {
    const matchesTab = activeTab === "all" || doc.validationStatus === activeTab;
    const matchesSearch = 
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Calculate statistics
  const stats = {
    total: documents?.length || 0,
    pending: documents?.filter((d) => d.validationStatus === "pending").length || 0,
    valid: documents?.filter((d) => d.validationStatus === "valid").length || 0,
    invalid: documents?.filter((d) => d.validationStatus === "invalid").length || 0,
    manualReview: documents?.filter((d) => d.validationStatus === "manual_review").length || 0,
    validationRate: documents?.length 
      ? Math.round((documents.filter((d) => d.validationStatus === "valid").length / documents.length) * 100)
      : 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-green-100 text-green-800">Gültig</Badge>;
      case "invalid":
        return <Badge variant="destructive">Ungültig</Badge>;
      case "validating":
        return <Badge className="bg-blue-100 text-blue-800">Validierung läuft</Badge>;
      case "manual_review":
        return <Badge className="bg-yellow-100 text-yellow-800">Manuelle Prüfung</Badge>;
      case "pending":
      default:
        return <Badge variant="secondary">Ausstehend</Badge>;
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "text-gray-500";
    if (confidence >= 90) return "text-green-600";
    if (confidence >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const parseValidationResult = (result?: string | null) => {
    if (!result) return null;
    try {
      return JSON.parse(result);
    } catch {
      return null;
    }
  };

  const handleSelectDoc = (docId: number) => {
    setSelectedDocs((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocs.length === filteredDocuments?.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(filteredDocuments?.map((d) => d.id) || []);
    }
  };

  const handleBulkApprove = () => {
    selectedDocs.forEach((docId) => {
      updateStatusMutation.mutate({ id: docId, status: "valid" });
    });
  };

  const handleBulkReject = () => {
    if (confirm(`${selectedDocs.length} Dokumente wirklich ablehnen und löschen?`)) {
      selectedDocs.forEach((docId) => {
        deleteMutation.mutate({ id: docId });
      });
    }
  };

  const isImage = (filename: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
  };

  const isPDF = (filename: string) => {
    return /\.pdf$/i.test(filename);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Lade Dokumente...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dokument-Validierung</h1>
          <p className="text-muted-foreground">
            Verwalten und validieren Sie hochgeladene Dokumente
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gesamt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ausstehend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gültig
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ungültig
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.invalid}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Validierungsrate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{stats.validationRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Bulk Actions */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Suche nach Dateiname oder Typ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {selectedDocs.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedDocs.length} ausgewählt
              </span>
              <Button
                size="sm"
                variant="default"
                onClick={handleBulkApprove}
                disabled={updateStatusMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Genehmigen
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkReject}
                disabled={deleteMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Ablehnen
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              Ausstehend ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="manual_review">
              Manuelle Prüfung ({stats.manualReview})
            </TabsTrigger>
            <TabsTrigger value="valid">
              Gültig ({stats.valid})
            </TabsTrigger>
            <TabsTrigger value="invalid">
              Ungültig ({stats.invalid})
            </TabsTrigger>
            <TabsTrigger value="all">
              Alle ({stats.total})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedDocs.length === filteredDocuments?.length && filteredDocuments.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Dateiname</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Hochgeladen</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Keine Dokumente gefunden
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments?.map((doc) => {
                      const result = parseValidationResult(doc.validationResult);
                      return (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedDocs.includes(doc.id)}
                              onCheckedChange={() => handleSelectDoc(doc.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{doc.filename}</TableCell>
                          <TableCell>{doc.documentType}</TableCell>
                          <TableCell>{getStatusBadge(doc.validationStatus)}</TableCell>
                          <TableCell>
                            {result?.confidence ? (
                              <span className={`font-medium ${getConfidenceColor(result.confidence)}`}>
                                {result.confidence}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(doc.uploadedAt).toLocaleDateString("de-DE")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setPreviewDoc(doc)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(doc.fileUrl, "_blank")}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {doc.validationStatus !== "valid" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => updateStatusMutation.mutate({ id: doc.id, status: "valid" })}
                                    disabled={updateStatusMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      if (confirm("Dokument wirklich ablehnen und löschen?")) {
                                        deleteMutation.mutate({ id: doc.id });
                                      }
                                    }}
                                    disabled={deleteMutation.isPending}
                                  >
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => revalidateMutation.mutate({ id: doc.id })}
                                disabled={revalidateMutation.isPending}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Document Preview Dialog */}
        <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{previewDoc?.filename}</DialogTitle>
            </DialogHeader>
            {previewDoc && (
              <div className="space-y-4">
                {/* Document Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Typ:</span> {previewDoc.documentType}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {getStatusBadge(previewDoc.validationStatus)}
                  </div>
                  <div>
                    <span className="font-medium">Hochgeladen:</span>{" "}
                    {new Date(previewDoc.uploadedAt).toLocaleString("de-DE")}
                  </div>
                  <div>
                    <span className="font-medium">Confidence:</span>{" "}
                    {parseValidationResult(previewDoc.validationResult)?.confidence || "-"}%
                  </div>
                </div>

                {/* Document Preview */}
                <div className="border rounded-lg overflow-hidden">
                  {isImage(previewDoc.filename) ? (
                    <img
                      src={previewDoc.fileUrl}
                      alt={previewDoc.filename}
                      className="w-full h-auto"
                    />
                  ) : isPDF(previewDoc.filename) ? (
                    <iframe
                      src={previewDoc.fileUrl}
                      className="w-full h-[600px]"
                      title={previewDoc.filename}
                    />
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <p>Vorschau nicht verfügbar</p>
                      <Button
                        className="mt-4"
                        onClick={() => window.open(previewDoc.fileUrl, "_blank")}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Herunterladen
                      </Button>
                    </div>
                  )}
                </div>

                {/* Validation Result */}
                {previewDoc.validationResult && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Validierungsergebnis:</h4>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      {JSON.stringify(parseValidationResult(previewDoc.validationResult), null, 2)}
                    </pre>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPreviewDoc(null)}
                  >
                    Schließen
                  </Button>
                  {previewDoc.validationStatus !== "valid" && (
                    <>
                      <Button
                        variant="default"
                        onClick={() => {
                          updateStatusMutation.mutate({ id: previewDoc.id, status: "valid" });
                          setPreviewDoc(null);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Genehmigen
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (confirm("Dokument wirklich ablehnen und löschen?")) {
                            deleteMutation.mutate({ id: previewDoc.id });
                            setPreviewDoc(null);
                          }
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Ablehnen
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
