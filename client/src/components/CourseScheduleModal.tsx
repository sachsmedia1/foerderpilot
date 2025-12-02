/**
 * FOERDERPILOT - COURSE SCHEDULE MODAL
 * 
 * Modal-Formular für Kurstermin-Verwaltung:
 * - Erstellen neuer Kurstermine
 * - Bearbeiten bestehender Kurstermine
 * - Validierung (Enddatum nach Startdatum, max. Teilnehmer)
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CourseScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: number;
  scheduleId?: number; // Wenn gesetzt: Edit-Modus, sonst Create-Modus
  onSuccess?: () => void;
}

export function CourseScheduleModal({
  open,
  onOpenChange,
  courseId,
  scheduleId,
  onSuccess,
}: CourseScheduleModalProps) {
  const utils = trpc.useUtils();
  const isEditMode = !!scheduleId;

  // Form State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [status, setStatus] = useState<"scheduled" | "in_progress" | "completed" | "cancelled">("scheduled");
  const [notes, setNotes] = useState("");

  // Load existing schedule data in edit mode
  const { data: existingSchedule } = trpc.courseSchedules.getById.useQuery(
    { id: scheduleId! },
    { enabled: isEditMode && !!scheduleId }
  );

  // Populate form when editing
  useEffect(() => {
    if (existingSchedule) {
      setStartDate(new Date(existingSchedule.startDate).toISOString().split('T')[0]);
      setEndDate(existingSchedule.endDate ? new Date(existingSchedule.endDate).toISOString().split('T')[0] : "");
      setMaxParticipants(existingSchedule.maxParticipants?.toString() || "");
      setStatus(existingSchedule.status as any);
      setNotes(existingSchedule.notes || "");
    }
  }, [existingSchedule]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setStartDate("");
      setEndDate("");
      setMaxParticipants("");
      setStatus("scheduled");
      setNotes("");
    }
  }, [open]);

  // Create Mutation
  const createMutation = trpc.courseSchedules.create.useMutation({
    onSuccess: () => {
      toast.success("Kurstermin erstellt");
      utils.courseSchedules.list.invalidate();
      utils.courses.getDetail.invalidate();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Update Mutation
  const updateMutation = trpc.courseSchedules.update.useMutation({
    onSuccess: () => {
      toast.success("Kurstermin aktualisiert");
      utils.courseSchedules.list.invalidate();
      utils.courses.getDetail.invalidate();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!startDate) {
      toast.error("Bitte Startdatum angeben");
      return;
    }

    if (endDate && new Date(endDate) < new Date(startDate)) {
      toast.error("Enddatum muss nach Startdatum liegen");
      return;
    }

    const data = {
      courseId,
      startDate,
      endDate: endDate || undefined,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
      status,
      notes: notes || undefined,
    };

    if (isEditMode) {
      updateMutation.mutate({ id: scheduleId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Kurstermin bearbeiten" : "Neuer Kurstermin"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Ändern Sie die Details des Kurstermins."
              : "Erstellen Sie einen neuen Kurstermin mit Startdatum und maximaler Teilnehmerzahl."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Startdatum */}
          <div className="space-y-2">
            <Label htmlFor="startDate">
              Startdatum <span className="text-destructive">*</span>
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          {/* Enddatum */}
          <div className="space-y-2">
            <Label htmlFor="endDate">Enddatum (optional)</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Max. Teilnehmer */}
          <div className="space-y-2">
            <Label htmlFor="maxParticipants">Maximale Teilnehmerzahl (optional)</Label>
            <Input
              id="maxParticipants"
              type="number"
              min="1"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(val: any) => setStatus(val)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Geplant</SelectItem>
                <SelectItem value="in_progress">Läuft</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
                <SelectItem value="cancelled">Abgesagt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notizen */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notizen (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Speichert..." : isEditMode ? "Speichern" : "Erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
