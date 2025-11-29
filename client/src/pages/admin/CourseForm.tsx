/**
 * FOERDERPILOT - KURS FORMULAR
 * 
 * Formular zum Erstellen und Bearbeiten von Kursen
 */

import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function CourseForm() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const courseId = params.id ? parseInt(params.id) : null;
  const isEditMode = courseId !== null;

  // Form State
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [topics, setTopics] = useState("");
  const [duration, setDuration] = useState("");
  const [scheduleType, setScheduleType] = useState<"weeks" | "months" | "custom">("weeks");
  const [weeks, setWeeks] = useState("");
  const [sessionsPerWeek, setSessionsPerWeek] = useState("");
  const [hoursPerSession, setHoursPerSession] = useState("");
  const [priceNet, setPriceNet] = useState("");
  const [priceGross, setPriceGross] = useState("");
  const [subsidyPercentage, setSubsidyPercentage] = useState("");
  const [trainerNames, setTrainerNames] = useState("");
  const [trainerQualifications, setTrainerQualifications] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Load existing course data in edit mode
  const courseQuery = trpc.courses.getById.useQuery(
    { id: courseId! },
    { enabled: isEditMode }
  );

  useEffect(() => {
    if (courseQuery.data) {
      const course = courseQuery.data;
      setName(course.name);
      setShortDescription(course.shortDescription || "");
      setDetailedDescription(course.detailedDescription || "");
      setTopics(course.topics ? JSON.parse(course.topics as string).join(", ") : "");
      setDuration(course.duration?.toString() || "");
      setScheduleType(course.scheduleType as "weeks" | "months" | "custom");
      
      const scheduleDetails = course.scheduleDetails ? JSON.parse(course.scheduleDetails as string) : {};
      setWeeks(scheduleDetails.weeks?.toString() || "");
      setSessionsPerWeek(scheduleDetails.sessionsPerWeek?.toString() || "");
      setHoursPerSession(scheduleDetails.hoursPerSession?.toString() || "");
      
      setPriceNet((course.priceNet / 100).toString());
      setPriceGross((course.priceGross / 100).toString());
      setSubsidyPercentage(course.subsidyPercentage?.toString() || "");
      setTrainerNames(course.trainerNames || "");
      setTrainerQualifications(course.trainerQualifications || "");
      setMaxParticipants(course.maxParticipants?.toString() || "");
      setIsPublished(course.isPublished);
    }
  }, [courseQuery.data]);

  const createMutation = trpc.courses.create.useMutation({
    onSuccess: () => {
      toast.success("Kurs erfolgreich erstellt");
      setLocation("/admin/courses");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const updateMutation = trpc.courses.update.useMutation({
    onSuccess: () => {
      toast.success("Kurs erfolgreich aktualisiert");
      setLocation("/admin/courses");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const topicsArray = topics.split(",").map(t => t.trim()).filter(t => t);
    
    const scheduleDetails = {
      weeks: weeks ? parseInt(weeks) : undefined,
      sessionsPerWeek: sessionsPerWeek ? parseInt(sessionsPerWeek) : undefined,
      hoursPerSession: hoursPerSession ? parseInt(hoursPerSession) : undefined,
    };

    const data = {
      name,
      shortDescription,
      detailedDescription: detailedDescription || undefined,
      topics: topicsArray.length > 0 ? topicsArray : undefined,
      duration: parseInt(duration),
      scheduleType,
      scheduleDetails,
      priceNet: Math.round(parseFloat(priceNet) * 100),
      priceGross: Math.round(parseFloat(priceGross) * 100),
      subsidyPercentage: parseInt(subsidyPercentage),
      trainerNames: trainerNames || undefined,
      trainerQualifications: trainerQualifications || undefined,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
      isPublished,
    };

    if (isEditMode) {
      updateMutation.mutate({ id: courseId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/courses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? "Kurs bearbeiten" : "Neuer Kurs"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isEditMode ? "Aktualisieren Sie die Kursinformationen" : "Erstellen Sie einen neuen Kurs"}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grundinformationen */}
          <Card>
            <CardHeader>
              <CardTitle>Grundinformationen</CardTitle>
              <CardDescription>
                Allgemeine Informationen über den Kurs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Kursname *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="z.B. Digitales Marketing & Social Media"
                />
              </div>

              <div>
                <Label htmlFor="shortDescription">Kurzbeschreibung *</Label>
                <Textarea
                  id="shortDescription"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  required
                  placeholder="Eine kurze Beschreibung des Kurses"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="detailedDescription">Detaillierte Beschreibung</Label>
                <Textarea
                  id="detailedDescription"
                  value={detailedDescription}
                  onChange={(e) => setDetailedDescription(e.target.value)}
                  placeholder="Ausführliche Beschreibung des Kursinhalts"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="topics">Themen (kommagetrennt)</Label>
                <Input
                  id="topics"
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  placeholder="z.B. Social Media, Content Marketing, SEO"
                />
              </div>
            </CardContent>
          </Card>

          {/* Zeitplan */}
          <Card>
            <CardHeader>
              <CardTitle>Zeitplan & Dauer</CardTitle>
              <CardDescription>
                Informationen zur Kursdauer und zum Zeitplan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="duration">Gesamtdauer (Stunden) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                    min="1"
                  />
                </div>

                <div>
                  <Label htmlFor="scheduleType">Zeitplan-Typ *</Label>
                  <Select value={scheduleType} onValueChange={(value: any) => setScheduleType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weeks">Wochen</SelectItem>
                      <SelectItem value="months">Monate</SelectItem>
                      <SelectItem value="custom">Individuell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {scheduleType === "weeks" && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="weeks">Anzahl Wochen</Label>
                    <Input
                      id="weeks"
                      type="number"
                      value={weeks}
                      onChange={(e) => setWeeks(e.target.value)}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sessionsPerWeek">Termine/Woche</Label>
                    <Input
                      id="sessionsPerWeek"
                      type="number"
                      value={sessionsPerWeek}
                      onChange={(e) => setSessionsPerWeek(e.target.value)}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hoursPerSession">Stunden/Termin</Label>
                    <Input
                      id="hoursPerSession"
                      type="number"
                      value={hoursPerSession}
                      onChange={(e) => setHoursPerSession(e.target.value)}
                      min="1"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preise & Förderung */}
          <Card>
            <CardHeader>
              <CardTitle>Preise & Förderung</CardTitle>
              <CardDescription>
                Preisinformationen und Fördersatz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="priceNet">Preis Netto (EUR) *</Label>
                  <Input
                    id="priceNet"
                    type="number"
                    step="0.01"
                    value={priceNet}
                    onChange={(e) => setPriceNet(e.target.value)}
                    required
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="priceGross">Preis Brutto (EUR) *</Label>
                  <Input
                    id="priceGross"
                    type="number"
                    step="0.01"
                    value={priceGross}
                    onChange={(e) => setPriceGross(e.target.value)}
                    required
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="subsidyPercentage">Förderung (%) *</Label>
                  <Input
                    id="subsidyPercentage"
                    type="number"
                    value={subsidyPercentage}
                    onChange={(e) => setSubsidyPercentage(e.target.value)}
                    required
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trainer & Teilnehmer */}
          <Card>
            <CardHeader>
              <CardTitle>Trainer & Teilnehmer</CardTitle>
              <CardDescription>
                Informationen zu Trainern und Teilnehmerzahl
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="trainerNames">Trainer-Namen</Label>
                <Input
                  id="trainerNames"
                  value={trainerNames}
                  onChange={(e) => setTrainerNames(e.target.value)}
                  placeholder="z.B. Sarah Schmidt, Michael Weber"
                />
              </div>

              <div>
                <Label htmlFor="trainerQualifications">Trainer-Qualifikationen</Label>
                <Textarea
                  id="trainerQualifications"
                  value={trainerQualifications}
                  onChange={(e) => setTrainerQualifications(e.target.value)}
                  placeholder="Qualifikationen und Erfahrung der Trainer"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="maxParticipants">Max. Teilnehmerzahl</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  min="1"
                  placeholder="z.B. 15"
                />
              </div>
            </CardContent>
          </Card>

          {/* Veröffentlichung */}
          <Card>
            <CardHeader>
              <CardTitle>Veröffentlichung</CardTitle>
              <CardDescription>
                Status und Sichtbarkeit des Kurses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isPublished">Kurs veröffentlichen</Label>
                  <p className="text-sm text-muted-foreground">
                    Veröffentlichte Kurse sind für Teilnehmer sichtbar
                  </p>
                </div>
                <Switch
                  id="isPublished"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Speichern..." : "Kurs speichern"}
            </Button>
            <Link href="/admin/courses">
              <Button type="button" variant="outline">
                Abbrechen
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
