/**
 * FOERDERPILOT - KURSVERWALTUNG
 * 
 * Admin-Interface für Kurse mit:
 * - Liste aller Kurse
 * - Filterung (Aktiv/Inaktiv, Veröffentlicht)
 * - Suche
 * - Schnellaktionen (Bearbeiten, Löschen)
 */

import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  BookOpen 
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function Courses() {
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [filterPublished, setFilterPublished] = useState<boolean | undefined>(undefined);

  const coursesQuery = trpc.courses.list.useQuery({
    search: search || undefined,
    isActive: filterActive,
    isPublished: filterPublished,
  });

  const toggleActiveMutation = trpc.courses.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("Kurs-Status aktualisiert");
      coursesQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const deleteMutation = trpc.courses.delete.useMutation({
    onSuccess: () => {
      toast.success("Kurs gelöscht");
      coursesQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleToggleActive = (id: number, currentStatus: boolean) => {
    toggleActiveMutation.mutate({ id, isActive: !currentStatus });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Möchten Sie den Kurs "${name}" wirklich löschen?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kurse</h1>
            <p className="text-muted-foreground mt-2">
              Verwalten Sie Ihre Kursangebote
            </p>
          </div>
          <Link href="/courses/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Kurs
            </Button>
          </Link>
        </div>

        {/* Filters & Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter & Suche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Kurs suchen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterActive === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterActive(filterActive === true ? undefined : true)}
                >
                  Aktiv
                </Button>
                <Button
                  variant={filterActive === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterActive(filterActive === false ? undefined : false)}
                >
                  Inaktiv
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterPublished === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterPublished(filterPublished === true ? undefined : true)}
                >
                  Veröffentlicht
                </Button>
                <Button
                  variant={filterPublished === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterPublished(filterPublished === false ? undefined : false)}
                >
                  Entwurf
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses List */}
        {coursesQuery.isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Lade Kurse...</p>
          </div>
        ) : coursesQuery.error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-destructive">Fehler beim Laden der Kurse</p>
              <p className="text-sm text-muted-foreground mt-2">{coursesQuery.error.message}</p>
            </CardContent>
          </Card>
        ) : coursesQuery.data && coursesQuery.data.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Keine Kurse gefunden</p>
              <p className="text-sm text-muted-foreground mb-4">
                Erstellen Sie Ihren ersten Kurs, um loszulegen.
              </p>
              <Link href="/courses/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ersten Kurs erstellen
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {coursesQuery.data?.map((course) => {
              const topics = course.topics ? JSON.parse(course.topics as string) : [];
              
              return (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle>{course.name}</CardTitle>
                          {!course.isActive && (
                            <Badge variant="secondary">Inaktiv</Badge>
                          )}
                          {course.isPublished ? (
                            <Badge variant="default">Veröffentlicht</Badge>
                          ) : (
                            <Badge variant="outline">Entwurf</Badge>
                          )}
                        </div>
                        <CardDescription>{course.shortDescription}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(course.id, course.isActive)}
                          title={course.isActive ? "Deaktivieren" : "Aktivieren"}
                        >
                          {course.isActive ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Link href={`/admin/courses/${course.id}`}>
                          <Button variant="ghost" size="icon" title="Details anzeigen">
                            <BookOpen className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/courses/${course.id}/edit`}>
                          <Button variant="ghost" size="icon" title="Bearbeiten">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(course.id, course.name)}
                          title="Löschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Dauer</p>
                        <p className="text-sm text-muted-foreground">{course.duration} Stunden</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Preis (Brutto)</p>
                        <p className="text-sm text-muted-foreground">{formatPrice(course.priceGross)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Förderung</p>
                        <p className="text-sm text-muted-foreground">{course.subsidyPercentage}%</p>
                      </div>
                    </div>
                    {topics.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Themen</p>
                        <div className="flex flex-wrap gap-2">
                          {topics.map((topic: string, index: number) => (
                            <Badge key={index} variant="secondary">{topic}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
