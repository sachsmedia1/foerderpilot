import { useParams, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Users, FileText, Edit, Plus, Trash2, Pencil, Link2, Copy } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CourseScheduleModal } from "@/components/CourseScheduleModal";
import { useState } from "react";
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

export default function CourseDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const courseId = parseInt(id || "0");
  const utils = trpc.useUtils();

  // Modal States
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<number | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingScheduleId, setDeletingScheduleId] = useState<number | undefined>();

  const { data, isLoading } = trpc.courses.getDetail.useQuery({ id: courseId });

  // Assign Participant Mutation
  const assignParticipantMutation = trpc.participants.assignToSchedule.useMutation({
    onSuccess: () => {
      toast.success("Teilnehmer zugewiesen");
      utils.courses.getDetail.invalidate();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Delete Mutation
  const deleteMutation = trpc.courseSchedules.delete.useMutation({
    onSuccess: () => {
      toast.success("Kurstermin gelöscht");
      utils.courses.getDetail.invalidate();
      setDeleteDialogOpen(false);
      setDeletingScheduleId(undefined);
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleDeleteSchedule = () => {
    if (deletingScheduleId) {
      deleteMutation.mutate({ id: deletingScheduleId });
    }
  };

  const openEditModal = (scheduleId: number) => {
    setEditingScheduleId(scheduleId);
    setScheduleModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingScheduleId(undefined);
    setScheduleModalOpen(true);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Lade Kurs-Details...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-muted-foreground">Kurs nicht gefunden</div>
          <Button onClick={() => setLocation("/courses")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Übersicht
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const { course, schedules, sammeltermine, stats, unassignedParticipants } = data;

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("de-DE");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/courses")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{course.name}</h1>
              <p className="text-muted-foreground">{course.shortDescription}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setLocation(`/courses/${course.id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Bearbeiten
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Teilnehmer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParticipants}</div>
              <p className="text-xs text-muted-foreground">
                {stats.unassignedParticipants} nicht zugeordnet
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Kurstermine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSchedules}</div>
              <p className="text-xs text-muted-foreground">Geplante Durchgänge</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sammeltermine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSammeltermine}</div>
              <p className="text-xs text-muted-foreground">
                {stats.upcomingSammeltermine} anstehend
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Preis (Brutto)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(course.priceGross)}</div>
              <p className="text-xs text-muted-foreground">
                {course.subsidyPercentage}% Förderung
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Registration Link Generator */}
        <Card>
          <CardHeader>
            <CardTitle>Direkter Anmelde-Link</CardTitle>
            <CardDescription>
              Teilen Sie diesen Link, um Teilnehmer direkt zu diesem Kurs anzumelden (ohne Kursauswahl)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                readOnly
                value={`${window.location.origin}/anmeldung?courseId=${course.id}`}
                className="flex-1 font-mono text-sm"
              />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/anmeldung?courseId=${course.id}`);
                  toast.success('Link kopiert!');
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Kopieren
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Course Information */}
        <Card>
          <CardHeader>
            <CardTitle>Kurs-Informationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Dauer</div>
                <div>{course.duration} Stunden</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Max. Teilnehmer</div>
                <div>{course.maxParticipants || "Unbegrenzt"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Preis (Netto)</div>
                <div>{formatPrice(course.priceNet)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <div className="flex gap-2">
                  <Badge variant={course.isActive ? "default" : "secondary"}>
                    {course.isActive ? "Aktiv" : "Inaktiv"}
                  </Badge>
                  <Badge variant={course.isPublished ? "default" : "secondary"}>
                    {course.isPublished ? "Veröffentlicht" : "Entwurf"}
                  </Badge>
                </div>
              </div>
            </div>

            {course.detailedDescription && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Beschreibung</div>
                <div className="text-sm whitespace-pre-wrap">{course.detailedDescription}</div>
              </div>
            )}

            {course.trainerNames && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Trainer</div>
                <div className="text-sm">{course.trainerNames}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Schedules */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Kurstermine</CardTitle>
                <CardDescription>Geplante Kurs-Durchgänge mit Teilnehmer-Zuordnung</CardDescription>
              </div>
              <Button size="sm" onClick={openCreateModal}>
                <Plus className="w-4 h-4 mr-2" />
                Termin hinzufügen
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {schedules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Noch keine Kurstermine angelegt
              </div>
            ) : (
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <Card key={schedule.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {formatDate(schedule.startDate)}
                              {schedule.endDate && ` - ${formatDate(schedule.endDate)}`}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {schedule.participantCount} Teilnehmer
                              {schedule.maxParticipants && ` / ${schedule.maxParticipants} Plätze`}
                              {schedule.availableSlots !== null && schedule.availableSlots > 0 && (
                                <span className="text-green-600 ml-2">
                                  ({schedule.availableSlots} frei)
                                </span>
                              )}
                              {schedule.availableSlots === 0 && (
                                <span className="text-red-600 ml-2">(Ausgebucht)</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              schedule.status === "scheduled"
                                ? "default"
                                : schedule.status === "in_progress"
                                ? "secondary"
                                : schedule.status === "completed"
                                ? "outline"
                                : "destructive"
                            }
                          >
                            {schedule.status === "scheduled" && "Geplant"}
                            {schedule.status === "in_progress" && "Läuft"}
                            {schedule.status === "completed" && "Abgeschlossen"}
                            {schedule.status === "cancelled" && "Abgesagt"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openEditModal(schedule.id)}
                            title="Bearbeiten"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setDeletingScheduleId(schedule.id);
                              setDeleteDialogOpen(true);
                            }}
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {schedule.participants.length > 0 && (
                      <CardContent className="pt-0">
                        <div className="text-sm">
                          <div className="font-medium mb-2">Zugeordnete Teilnehmer:</div>
                          <div className="space-y-1">
                            {schedule.participants.slice(0, 5).map((p) => (
                              <Link key={p.id} href={`/teilnehmer/${p.id}`}>
                                <div className="text-sm hover:underline cursor-pointer">
                                  {p.firstName} {p.lastName}
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {p.status}
                                  </Badge>
                                </div>
                              </Link>
                            ))}
                            {schedule.participants.length > 5 && (
                              <div className="text-xs text-muted-foreground">
                                + {schedule.participants.length - 5} weitere
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unassigned Participants */}
        {unassignedParticipants.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-amber-600">Nicht zugeordnete Teilnehmer</CardTitle>
              <CardDescription>
                Diese Teilnehmer sind noch keinem Kurstermin zugeordnet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {unassignedParticipants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex-1">
                      <div className="font-medium">
                        {p.firstName} {p.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">{p.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{p.status}</Badge>
                      <Select
                        value=""
                        onValueChange={(scheduleId) => {
                          if (scheduleId) {
                            assignParticipantMutation.mutate({
                              participantId: p.id,
                              courseScheduleId: parseInt(scheduleId),
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Termin zuweisen" />
                        </SelectTrigger>
                        <SelectContent>
                          {schedules.map((schedule) => (
                            <SelectItem key={schedule.id} value={schedule.id.toString()}>
                              {formatDate(schedule.startDate)}
                              {schedule.availableSlots !== null && schedule.availableSlots > 0 && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  ({schedule.availableSlots} frei)
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sammeltermine */}
        {sammeltermine.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Sammeltermine (KOMPASS)</CardTitle>
              <CardDescription>Einreichungsfristen für diesen Kurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sammeltermine.map((termin) => (
                  <div key={termin.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{formatDate(termin.date)}</div>
                        {termin.submissionDeadline && (
                          <div className="text-sm text-muted-foreground">
                            Einreichung bis: {formatDate(termin.submissionDeadline)}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={
                        termin.status === "scheduled"
                          ? "default"
                          : termin.status === "completed"
                          ? "outline"
                          : "destructive"
                      }
                    >
                      {termin.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Course Schedule Modal */}
      <CourseScheduleModal
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        courseId={courseId}
        scheduleId={editingScheduleId}
        onSuccess={() => {
          utils.courses.getDetail.invalidate();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kurstermin löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diesen Kurstermin wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
              Teilnehmer-Zuordnungen bleiben erhalten, müssen aber neu zugewiesen werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSchedule}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
