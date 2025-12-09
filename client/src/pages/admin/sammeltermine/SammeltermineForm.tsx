/**
 * FOERDERPILOT - SAMMELTERMIN FORMULAR
 * 
 * Formular zum Erstellen und Bearbeiten von Sammelterminen
 */

import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/AdminLayout";

export default function SammelterminForm() {
  const [, navigate] = useLocation();
  const params = useParams();
  const isEdit = params.id !== "new";
  const terminId = isEdit ? parseInt(params.id!) : null;

  // Form State
  const [courseId, setCourseId] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [submissionDate, setSubmissionDate] = useState("");
  const [submissionTime, setSubmissionTime] = useState("23:59");
  const [zoomLink, setZoomLink] = useState("");
  const [kompassReviewerEmail, setKompassReviewerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"scheduled" | "completed" | "cancelled">("scheduled");

  // Queries
  const { data: courses } = trpc.courses.list.useQuery({});
  const { data: existingTermin, isLoading } = trpc.sammeltermins.getById.useQuery(
    { id: terminId! },
    { enabled: isEdit && terminId !== null }
  );

  // Load existing data for edit mode
  useEffect(() => {
    if (existingTermin) {
      setCourseId(existingTermin.courseId || null);
      
      const terminDate = new Date(existingTermin.date);
      setDate(terminDate.toISOString().split('T')[0]);
      setTime(terminDate.toTimeString().slice(0, 5));

      const deadlineDate = new Date(existingTermin.submissionDeadline);
      setSubmissionDate(deadlineDate.toISOString().split('T')[0]);
      setSubmissionTime(deadlineDate.toTimeString().slice(0, 5));

      setZoomLink(existingTermin.zoomLink || "");
      setKompassReviewerEmail(existingTermin.kompassReviewerEmail || "");
      setNotes(existingTermin.notes || "");
      setStatus(existingTermin.status as "scheduled" | "completed" | "cancelled");
    }
  }, [existingTermin]);

  // Auto-calculate submission deadline (1 day before termin)
  useEffect(() => {
    if (date && !submissionDate) {
      const terminDate = new Date(date);
      terminDate.setDate(terminDate.getDate() - 1);
      setSubmissionDate(terminDate.toISOString().split('T')[0]);
    }
  }, [date]);

  // Mutations
  const createMutation = trpc.sammeltermins.create.useMutation({
    onSuccess: () => {
      toast.success("Sammeltermin erstellt");
      navigate("/sammeltermine");
    },
    onError: (error) => {
      toast.error(`Fehler beim Erstellen: ${error.message}`);
    },
  });

  const updateMutation = trpc.sammeltermins.update.useMutation({
    onSuccess: () => {
      toast.success("Sammeltermin aktualisiert");
      navigate("/sammeltermine");
    },
    onError: (error) => {
      toast.error(`Fehler beim Aktualisieren: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId) {
      toast.error("Bitte wählen Sie einen Kurs aus");
      return;
    }

    if (!date) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    // Combine date and time
    const terminDateTime = new Date(`${date}T${time}`);
    
    // If submissionDate is empty, calculate it (1 day before termin at 23:59)
    let submissionDateTime: Date;
    if (!submissionDate) {
      submissionDateTime = new Date(terminDateTime);
      submissionDateTime.setDate(submissionDateTime.getDate() - 1);
      submissionDateTime.setHours(23, 59, 0, 0);
    } else {
      submissionDateTime = new Date(`${submissionDate}T${submissionTime}`);
    }
    
    // Validate dates
    if (isNaN(terminDateTime.getTime()) || isNaN(submissionDateTime.getTime())) {
      toast.error("Ungültiges Datum");
      return;
    }

    const data = {
      courseId,
      date: terminDateTime,
      submissionDeadline: submissionDateTime,
      zoomLink: zoomLink || undefined,
      kompassReviewerEmail: kompassReviewerEmail || undefined,
      notes: notes || undefined,
    };

    if (isEdit && terminId) {
      updateMutation.mutate({
        id: terminId,
        ...data,
        status,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-muted-foreground">Lade Termin...</div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/sammeltermine")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? "Sammeltermin bearbeiten" : "Neuer Sammeltermin"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit ? "Termin-Details aktualisieren" : "KOMPASS-Einreichungstermin erstellen"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Basis-Informationen */}
          <Card>
            <CardHeader>
              <CardTitle>Termin-Informationen</CardTitle>
              <CardDescription>Grundlegende Details zum Sammeltermin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="courseId">Kurs *</Label>
                <Select
                  value={courseId?.toString() || ""}
                  onValueChange={(value) => setCourseId(parseInt(value))}
                >
                  <SelectTrigger id="courseId">
                    <SelectValue placeholder="Kurs auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Termin-Datum *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Uhrzeit *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="submissionDate">Einreichungsfrist (Datum)</Label>
                  <Input
                    id="submissionDate"
                    type="date"
                    value={submissionDate}
                    onChange={(e) => setSubmissionDate(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Standardmäßig 1 Tag vor dem Termin um 23:59 Uhr
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="submissionTime">Einreichungsfrist (Uhrzeit)</Label>
                  <Input
                    id="submissionTime"
                    type="time"
                    value={submissionTime}
                    onChange={(e) => setSubmissionTime(e.target.value)}
                  />
                </div>
              </div>

              {isEdit && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value: "scheduled" | "completed" | "cancelled") => setStatus(value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Geplant</SelectItem>
                      <SelectItem value="completed">Abgeschlossen</SelectItem>
                      <SelectItem value="cancelled">Abgesagt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zusätzliche Details */}
          <Card>
            <CardHeader>
              <CardTitle>Zusätzliche Details</CardTitle>
              <CardDescription>Optionale Informationen zum Termin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zoomLink">Zoom-Link</Label>
                <Input
                  id="zoomLink"
                  type="url"
                  value={zoomLink}
                  onChange={(e) => setZoomLink(e.target.value)}
                  placeholder="https://zoom.us/j/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kompassReviewerEmail">KOMPASS Reviewer E-Mail</Label>
                <Input
                  id="kompassReviewerEmail"
                  type="email"
                  value={kompassReviewerEmail}
                  onChange={(e) => setKompassReviewerEmail(e.target.value)}
                  placeholder="reviewer@kompass.de"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notizen</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Interne Notizen zum Termin..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/sammeltermine")}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? "Aktualisieren" : "Erstellen"}
            </Button>
          </div>
        </div>
      </form>
      </div>
    </AdminLayout>
  );
}
