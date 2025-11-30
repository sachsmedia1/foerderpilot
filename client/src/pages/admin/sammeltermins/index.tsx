/**
 * FOERDERPILOT - SAMMELTERMINE ÜBERSICHT
 * 
 * Admin-Seite für die Verwaltung von KOMPASS-Sammelterminen
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Plus, Trash2, Edit, Video, Mail, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function SammelterminsPage() {
  const [, navigate] = useLocation();

  const utils = trpc.useUtils();

  // Filter States
  const [upcomingFilter, setUpcomingFilter] = useState<boolean | undefined>(true);
  const [courseFilter, setCourseFilter] = useState<number | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTerminId, setSelectedTerminId] = useState<number | null>(null);

  // Queries
  const { data: termins, isLoading } = trpc.sammeltermins.list.useQuery({
    upcoming: upcomingFilter,
    courseId: courseFilter,
  });

  const { data: courses } = trpc.courses.list.useQuery({});

  // Mutations
  const deleteMutation = trpc.sammeltermins.delete.useMutation({
    onSuccess: () => {
      toast.success("Sammeltermin gelöscht");
      utils.sammeltermins.list.invalidate();
      setDeleteDialogOpen(false);
      setSelectedTerminId(null);
    },
    onError: (error) => {
      toast.error(`Fehler beim Löschen: ${error.message}`);
    },
  });

  const updateStatusMutation = trpc.sammeltermins.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status aktualisiert");
      utils.sammeltermins.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Fehler beim Aktualisieren: ${error.message}`);
    },
  });

  const handleDelete = (id: number) => {
    setSelectedTerminId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedTerminId) {
      deleteMutation.mutate({ id: selectedTerminId });
    }
  };

  const handleStatusChange = (id: number, status: "scheduled" | "completed" | "cancelled") => {
    updateStatusMutation.mutate({ id, status });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Clock className="h-3 w-3 mr-1" />Geplant</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Abgeschlossen</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Abgesagt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isUpcoming = (date: Date) => {
    return new Date(date) > new Date();
  };

  const isPastDeadline = (deadline: Date) => {
    return new Date(deadline) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sammeltermine</h1>
          <p className="text-muted-foreground mt-1">
            KOMPASS-Einreichungstermine verwalten
          </p>
        </div>
        <Button onClick={() => navigate("/admin/sammeltermins/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Termin
        </Button>
      </div>

      {/* Filter & Suche */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Optionen</CardTitle>
          <CardDescription>Termine nach Zeitraum und Kurs filtern</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Zeitraum</label>
              <Select
                value={upcomingFilter === undefined ? "all" : upcomingFilter ? "upcoming" : "all"}
                onValueChange={(value) => {
                  if (value === "upcoming") setUpcomingFilter(true);
                  else if (value === "all") setUpcomingFilter(undefined);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Zeitraum wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Nur zukünftige Termine</SelectItem>
                  <SelectItem value="all">Alle Termine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Kurs</label>
              <Select
                value={courseFilter?.toString() || "all"}
                onValueChange={(value) => {
                  if (value === "all") setCourseFilter(undefined);
                  else setCourseFilter(parseInt(value));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kurs wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kurse</SelectItem>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Termine-Tabelle */}
      <Card>
        <CardHeader>
          <CardTitle>Termine</CardTitle>
          <CardDescription>
            {termins?.length || 0} Termin{termins?.length !== 1 ? "e" : ""} gefunden
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Lade Termine...</div>
          ) : termins && termins.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Termin-Datum</TableHead>
                  <TableHead>Kurs</TableHead>
                  <TableHead>Einreichungsfrist</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {termins.map((termin) => (
                  <TableRow key={termin.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {format(new Date(termin.date), "dd. MMM yyyy", { locale: de })}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(termin.date), "HH:mm", { locale: de })} Uhr
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {termin.course ? (
                        <div className="font-medium">{termin.course.name}</div>
                      ) : (
                        <span className="text-muted-foreground">Kein Kurs</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className={isPastDeadline(termin.submissionDeadline) && termin.status === "scheduled" ? "text-red-600 font-medium" : ""}>
                        {format(new Date(termin.submissionDeadline), "dd. MMM yyyy, HH:mm", { locale: de })} Uhr
                        {isPastDeadline(termin.submissionDeadline) && termin.status === "scheduled" && (
                          <div className="text-xs text-red-600">Abgelaufen</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(termin.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {termin.zoomLink && (
                          <a
                            href={termin.zoomLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Video className="h-4 w-4" />
                          </a>
                        )}
                        {termin.kompassReviewerEmail && (
                          <a
                            href={`mailto:${termin.kompassReviewerEmail}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/sammeltermins/${termin.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(termin.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine Termine gefunden</h3>
              <p className="text-muted-foreground mb-4">
                Erstellen Sie einen neuen Sammeltermin für KOMPASS-Einreichungen.
              </p>
              <Button onClick={() => navigate("/admin/sammeltermins/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Ersten Termin erstellen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sammeltermin löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Dieser Vorgang kann nicht rückgängig gemacht werden. Der Termin wird
              dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
