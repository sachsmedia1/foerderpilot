import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, User, Mail, Calendar } from "lucide-react";

// 13-Step Status Pipeline
const STATUS_COLUMNS = [
  { id: "registered", label: "Registriert", color: "bg-gray-100" },
  { id: "documents_requested", label: "Dokumente angefordert", color: "bg-blue-100" },
  { id: "documents_uploaded", label: "Dokumente hochgeladen", color: "bg-blue-200" },
  { id: "documents_validated", label: "Dokumente validiert", color: "bg-green-100" },
  { id: "kompass_pending", label: "KOMPASS ausstehend", color: "bg-yellow-100" },
  { id: "kompass_approved", label: "KOMPASS genehmigt", color: "bg-green-200" },
  { id: "kompass_rejected", label: "KOMPASS abgelehnt", color: "bg-red-100" },
  { id: "contract_sent", label: "Vertrag versendet", color: "bg-purple-100" },
  { id: "contract_signed", label: "Vertrag unterschrieben", color: "bg-purple-200" },
  { id: "course_scheduled", label: "Kurs terminiert", color: "bg-indigo-100" },
  { id: "course_active", label: "Kurs aktiv", color: "bg-indigo-200" },
  { id: "completed", label: "Abgeschlossen", color: "bg-green-300" },
  { id: "dropped_out", label: "Abgebrochen", color: "bg-gray-300" },
] as const;

type ParticipantStatus = typeof STATUS_COLUMNS[number]["id"];

interface Participant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: ParticipantStatus;
  courseName: string;
  createdAt: Date;
}

interface ParticipantCardProps {
  participant: Participant;
  isDragging?: boolean;
}

function ParticipantCard({ participant, isDragging }: ParticipantCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: participant.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="p-3 mb-2 cursor-move hover:shadow-md transition-shadow">
        <div className="flex items-start gap-2">
          <div {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="font-medium text-sm truncate">
                {participant.firstName} {participant.lastName}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {participant.email}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {participant.courseName}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function ParticipantsKanban() {
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [activeId, setActiveId] = useState<number | null>(null);

  const { data: participants, refetch } = trpc.participants.list.useQuery({});
  const { data: courses } = trpc.courses.list.useQuery({});
  const updateStatusMutation = trpc.participants.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group participants by status
  const participantsByStatus = STATUS_COLUMNS.reduce((acc, column) => {
    acc[column.id] = (participants || []).filter(
      (p) =>
        p.status === column.id &&
        (selectedCourse === "all" || p.courseId === parseInt(selectedCourse))
    );
    return acc;
  }, {} as Record<ParticipantStatus, Participant[]>);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const participantId = active.id as number;
    const newStatus = over.id as ParticipantStatus;

    // Find the participant
    const participant = (participants || []).find((p) => p.id === participantId);

    if (participant && participant.status !== newStatus) {
      // Optimistic update
      updateStatusMutation.mutate({
        id: participantId,
        status: newStatus,
      });
    }

    setActiveId(null);
  };

  const activeParticipant = participants?.find((p) => p.id === activeId);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Teilnehmer Kanban</h1>
            <p className="text-muted-foreground">
              Drag & Drop zum Ändern des Status
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Kurs filtern" />
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
            <Button variant="outline" onClick={() => refetch()}>
              Aktualisieren
            </Button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STATUS_COLUMNS.map((column) => (
              <SortableContext
                key={column.id}
                id={column.id}
                items={participantsByStatus[column.id].map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex-shrink-0 w-[280px]">
                  <Card className={`${column.color} p-4`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-sm">{column.label}</h3>
                      <Badge variant="secondary">
                        {participantsByStatus[column.id].length}
                      </Badge>
                    </div>
                    <div className="space-y-2 min-h-[200px]">
                      {participantsByStatus[column.id].map((participant) => (
                        <ParticipantCard
                          key={participant.id}
                          participant={participant}
                          isDragging={activeId === participant.id}
                        />
                      ))}
                    </div>
                  </Card>
                </div>
              </SortableContext>
            ))}
          </div>

          <DragOverlay>
            {activeParticipant && (
              <ParticipantCard participant={activeParticipant} />
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </AdminLayout>
  );
}
