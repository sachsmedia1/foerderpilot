import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, UserCheck, UserX, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Users() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "kompass_reviewer" | "user">("all");
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);

  const { data: users, isLoading, refetch } = trpc.userManagement.list.useQuery({
    search: search || undefined,
    role: roleFilter,
    isActive: statusFilter,
  });

  const toggleStatusMutation = trpc.userManagement.toggleStatus.useMutation({
    onSuccess: (data) => {
      toast.success(data.newStatus ? "User aktiviert" : "User deaktiviert");
      refetch();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const deleteMutation = trpc.userManagement.delete.useMutation({
    onSuccess: () => {
      toast.success("User gelöscht");
      refetch();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate({ id });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Möchten Sie den User "${name}" wirklich löschen?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      admin: { label: "Admin", variant: "default" },
      kompass_reviewer: { label: "KOMPASS Reviewer", variant: "secondary" },
      user: { label: "User", variant: "outline" },
    };
    const config = variants[role] || { label: role, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Team-Verwaltung</h1>
            <p className="text-muted-foreground mt-1">
              Verwalten Sie Ihre Team-Mitglieder und deren Rollen
            </p>
          </div>
          <Button onClick={() => navigate("/users/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Neuer User
          </Button>
        </div>

        {/* Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suche nach Name oder E-Mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as any)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Alle Rollen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Rollen</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="kompass_reviewer">KOMPASS Reviewer</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter === undefined ? "all" : statusFilter ? "active" : "inactive"}
            onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v === "active")}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="inactive">Inaktiv</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Letzter Login</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Lade User...
                  </TableCell>
                </TableRow>
              ) : !users || users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Keine User gefunden
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "—"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Aktiv
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          Inaktiv
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.lastSignedIn
                        ? new Date(user.lastSignedIn).toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "Noch nie"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => navigate(`/users/${user.id}/edit`)}
                          title="Bearbeiten"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleToggleStatus(user.id)}
                          title={user.isActive ? "Deaktivieren" : "Aktivieren"}
                        >
                          {user.isActive ? (
                            <UserX className="h-4 w-4 text-orange-600" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(user.id, user.name || user.email)}
                          title="Löschen"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
