/**
 * FOERDERPILOT - VALIDATION DASHBOARD
 * 
 * Admin-Dashboard für Dokument-Validierung:
 * - Übersicht aller Dokumente mit Validierungsstatus
 * - Filter nach Status
 * - Confidence-Score Anzeige
 * - Quick-Actions (Re-validate, Approve, Reject)
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileCheck, FileX, FileWarning, RefreshCw, CheckCircle, XCircle, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ValidationDashboard() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Delete mutation (for reject action)
  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Dokument abgelehnt und gelöscht");
      utils.documents.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Filter documents
  const filteredDocuments = documents?.filter((doc) => {
    const matchesStatus = statusFilter === "all" || doc.validationStatus === statusFilter;
    const matchesSearch = 
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate statistics
  const stats = {
    total: documents?.length || 0,
    pending: documents?.filter((d) => d.validationStatus === "pending").length || 0,
    validating: documents?.filter((d) => d.validationStatus === "validating").length || 0,
    valid: documents?.filter((d) => d.validationStatus === "valid").length || 0,
    invalid: documents?.filter((d) => d.validationStatus === "invalid").length || 0,
    manualReview: documents?.filter((d) => d.validationStatus === "manual_review").length || 0,
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
        return <Badge variant="default">Ausstehend</Badge>;
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Validierungs-Dashboard</h1>
        <p className="text-muted-foreground">
          Übersicht aller Dokument-Validierungen mit KI-Confidence-Scores
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
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
              Validierung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.validating}</div>
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
              Manuelle Prüfung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.manualReview}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Dokumente filtern</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Dateiname oder Typ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Status filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="pending">Ausstehend</SelectItem>
              <SelectItem value="validating">Validierung läuft</SelectItem>
              <SelectItem value="valid">Gültig</SelectItem>
              <SelectItem value="invalid">Ungültig</SelectItem>
              <SelectItem value="manual_review">Manuelle Prüfung</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dokumente ({filteredDocuments?.length || 0})</CardTitle>
          <CardDescription>
            Alle Dokumente mit Validierungsstatus und Confidence-Score
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Lade Dokumente...
            </div>
          ) : filteredDocuments && filteredDocuments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dateiname</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Hochgeladen</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => {
                  const validationResult = parseValidationResult(doc.validationResult);
                  const confidence = validationResult?.confidence;

                  return (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.filename}</TableCell>
                      <TableCell>{doc.documentType}</TableCell>
                      <TableCell>{getStatusBadge(doc.validationStatus)}</TableCell>
                      <TableCell>
                        {confidence ? (
                          <span className={`font-semibold ${getConfidenceColor(confidence)}`}>
                            {confidence}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(doc.uploadedAt).toLocaleDateString("de-DE")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => revalidateMutation.mutate({ documentId: doc.id })}
                            disabled={revalidateMutation.isPending}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          {doc.validationStatus === "invalid" || doc.validationStatus === "manual_review" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (confirm("Dokument wirklich ablehnen und löschen?")) {
                                  deleteMutation.mutate({ id: doc.id });
                                }
                              }}
                              disabled={deleteMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Keine Dokumente gefunden
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
