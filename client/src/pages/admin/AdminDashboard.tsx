import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { Users, BookOpen, Calendar, FileCheck, AlertCircle } from "lucide-react";
import { Link } from "wouter";

const STATUS_COLORS: Record<string, string> = {
  registered: "#6366f1", // Indigo
  documents_pending: "#f59e0b", // Amber
  documents_submitted: "#3b82f6", // Blue
  documents_approved: "#10b981", // Green
  documents_rejected: "#ef4444", // Red
  enrolled: "#8b5cf6", // Purple
  completed: "#14b8a6", // Teal
  dropped_out: "#6b7280", // Gray
};

const STATUS_LABELS: Record<string, string> = {
  registered: "Registriert",
  documents_pending: "Dokumente ausstehend",
  documents_submitted: "Dokumente eingereicht",
  documents_approved: "Dokumente genehmigt",
  documents_rejected: "Dokumente abgelehnt",
  enrolled: "Eingeschrieben",
  completed: "Abgeschlossen",
  dropped_out: "Abgebrochen",
};

// Shortened labels for chart display
const STATUS_LABELS_SHORT: Record<string, string> = {
  registered: "Registriert",
  documents_pending: "Dok. ausstehend",
  documents_submitted: "Dok. eingereicht",
  documents_approved: "Dok. genehmigt",
  documents_rejected: "Dok. abgelehnt",
  enrolled: "Eingeschrieben",
  completed: "Abgeschlossen",
  dropped_out: "Abgebrochen",
};

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.getStats.useQuery();
  const { data: recentActivities, isLoading: activitiesLoading } = trpc.dashboard.getRecentActivities.useQuery();
  const { data: pendingValidations } = trpc.dashboard.getPendingValidations.useQuery();
  const { data: additionalChartData, isLoading: chartDataLoading } = trpc.dashboard.getChartData.useQuery();

  // Prepare chart data with shortened labels
  const statusChartData = stats?.statusDistribution.map((item) => ({
    name: STATUS_LABELS_SHORT[item.status] || item.status,
    value: item.count,
    color: STATUS_COLORS[item.status] || "#6b7280",
  })) || [];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Übersicht über alle wichtigen Kennzahlen und Aktivitäten
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Teilnehmer */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teilnehmer</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.participantCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Gesamt registriert
              </p>
            </CardContent>
          </Card>

          {/* Kurse */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kurse</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.courseCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Aktive Kurse
              </p>
            </CardContent>
          </Card>

          {/* Sammeltermine */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sammeltermine</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.sammelterminCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Geplante Termine
              </p>
            </CardContent>
          </Card>

          {/* Validierungsrate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validierungsrate</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : `${stats?.validationRate || 0}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.validDocs || 0} von {stats?.totalDocs || 0} Dokumenten
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Activities Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Status-Verteilung</CardTitle>
              <CardDescription>
                Übersicht der Teilnehmer nach Status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Lade Daten...</p>
                </div>
              ) : statusChartData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Keine Daten verfügbar</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Chart 2: Anmeldungen pro Woche (Liniendiagramm) */}
          <Card>
            <CardHeader>
              <CardTitle>Anmeldungen pro Woche</CardTitle>
              <CardDescription>
                Entwicklung der Neuanmeldungen (letzte 8 Wochen)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartDataLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Lade Daten...</p>
                </div>
              ) : !additionalChartData?.weeklySignups || additionalChartData.weeklySignups.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Keine Daten verfügbar</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={additionalChartData.weeklySignups}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} name="Anmeldungen" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Chart 3: Dokument-Validierungs-Status (Pie Chart) */}
          <Card>
            <CardHeader>
              <CardTitle>Dokument-Validierung</CardTitle>
              <CardDescription>
                Übersicht der Dokument-Validierungsstatus
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartDataLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Lade Daten...</p>
                </div>
              ) : !additionalChartData?.validationStatusDistribution || additionalChartData.validationStatusDistribution.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Keine Daten verfügbar</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={additionalChartData.validationStatusDistribution.map(item => ({
                        name: item.status === 'pending' ? 'Ausstehend' : item.status === 'valid' ? 'Gültig' : item.status === 'invalid' ? 'Ungültig' : 'Manuelle Prüfung',
                        value: item.count,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {additionalChartData.validationStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.status === 'pending' ? '#f59e0b' : entry.status === 'valid' ? '#10b981' : entry.status === 'invalid' ? '#ef4444' : '#6b7280'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Chart 4: Top 3 Kurse (Balkendiagramm) */}
          <Card>
            <CardHeader>
              <CardTitle>Top 3 Kurse</CardTitle>
              <CardDescription>
                Kurse mit den meisten Teilnehmern
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartDataLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Lade Daten...</p>
                </div>
              ) : !additionalChartData?.topCourses || additionalChartData.topCourses.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Keine Daten verfügbar</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={additionalChartData.topCourses}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="courseName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="participantCount" fill="#6366f1" name="Teilnehmer" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Letzte Aktivitäten</CardTitle>
              <CardDescription>
                Zuletzt registrierte Teilnehmer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : recentActivities && recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <Link key={activity.id} href={`/participants/${activity.id}/view`}>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="flex-1">
                          <p className="font-medium">
                            {activity.firstName} {activity.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.courseName || "Kein Kurs zugewiesen"}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className="inline-block px-2 py-1 text-xs font-medium rounded"
                            style={{
                              backgroundColor: STATUS_COLORS[activity.status] + "20",
                              color: STATUS_COLORS[activity.status],
                            }}
                          >
                            {STATUS_LABELS[activity.status] || activity.status}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(activity.createdAt).toLocaleDateString("de-DE")}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Keine Aktivitäten</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending Validations Alert */}
        {pendingValidations && pendingValidations.total > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Ausstehende Validierungen
              </CardTitle>
              <CardDescription>
                Es gibt {pendingValidations.total} Dokumente, die auf Validierung warten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div>
                  <p className="text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {pendingValidations.pending}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Manual Review</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {pendingValidations.manualReview}
                  </p>
                </div>
              </div>
              <Link href="/validation">
                <button className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
                  Zur Validierung
                </button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
