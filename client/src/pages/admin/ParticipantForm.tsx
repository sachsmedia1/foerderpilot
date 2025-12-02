/**
 * FOERDERPILOT - PARTICIPANT FORM
 * 
 * Formular zum Erstellen und Bearbeiten von Teilnehmern
 */

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation, useParams } from 'wouter';

export default function ParticipantForm() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const participantId = params.id ? parseInt(params.id) : null;
  const isEditMode = participantId !== null;

  const [formData, setFormData] = useState({
    courseId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    street: '',
    zipCode: '',
    city: '',
    country: 'Deutschland',
    notes: '',
  });

  const { data: courses } = trpc.courses.list.useQuery();
  const { data: participant, isLoading: loadingParticipant } = trpc.participants.getById.useQuery(
    { id: participantId! },
    { enabled: isEditMode }
  );

  const createMutation = trpc.participants.create.useMutation({
    onSuccess: () => {
      toast.success('Teilnehmer erstellt');
      setLocation('/admin/participants');
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const updateMutation = trpc.participants.update.useMutation({
    onSuccess: () => {
      toast.success('Teilnehmer aktualisiert');
      setLocation('/admin/participants');
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  useEffect(() => {
    if (participant) {
      setFormData({
        courseId: participant.courseId.toString(),
        firstName: participant.firstName,
        lastName: participant.lastName,
        email: participant.email,
        phone: participant.phone || '',
        dateOfBirth: participant.dateOfBirth 
          ? new Date(participant.dateOfBirth).toISOString().split('T')[0]
          : '',
        street: participant.street || '',
        zipCode: participant.zipCode || '',
        city: participant.city || '',
        country: participant.country || 'Deutschland',
        notes: participant.notes || '',
      });
    }
  }, [participant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.courseId || !formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    const data = {
      courseId: parseInt(formData.courseId),
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      street: formData.street || undefined,
      zipCode: formData.zipCode || undefined,
      city: formData.city || undefined,
      country: formData.country || undefined,
      notes: formData.notes || undefined,
    };

    if (isEditMode) {
      updateMutation.mutate({ id: participantId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEditMode && loadingParticipant) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation('/admin/participants')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditMode ? 'Teilnehmer bearbeiten' : 'Neuer Teilnehmer'}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode ? 'Teilnehmerdaten aktualisieren' : 'Neuen Teilnehmer anlegen'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kurs-Auswahl */}
          <Card>
            <CardHeader>
              <CardTitle>Kurs</CardTitle>
              <CardDescription>Wählen Sie den Kurs für den Teilnehmer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="courseId">Kurs *</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                  disabled={isEditMode} // Kurs kann nicht geändert werden
                >
                  <SelectTrigger id="courseId">
                    <SelectValue placeholder="Kurs wählen" />
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
            </CardContent>
          </Card>

          {/* Persönliche Daten */}
          <Card>
            <CardHeader>
              <CardTitle>Persönliche Daten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Vorname *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nachname *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Geburtsdatum</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Adresse */}
          <Card>
            <CardHeader>
              <CardTitle>Adresse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Straße & Hausnummer</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">PLZ</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="city">Stadt</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Land</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notizen */}
          <Card>
            <CardHeader>
              <CardTitle>Notizen</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/admin/participants')}
              disabled={isPending}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Aktualisieren' : 'Erstellen'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
