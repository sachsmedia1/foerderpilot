/**
 * FOERDERPILOT - PARTICIPANT LAYOUT
 * 
 * Dashboard-Layout für Teilnehmer mit:
 * - Sidebar-Navigation (links)
 * - Header mit Tenant-Branding
 * - Mobile-responsive
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { useBranding } from "@/hooks/useBranding";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  FileText, 
  Settings,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ParticipantLayoutProps {
  children: ReactNode;
}

interface NavItem {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/teilnehmer",
    icon: LayoutDashboard,
  },
  {
    title: "Dokumente",
    href: "/teilnehmer/documents",
    icon: FileText,
  },
];

export function ParticipantLayout({ children }: ParticipantLayoutProps) {
  const { user, tenant, logout } = useAuth();
  const branding = useBranding();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect Admins zu ihrem Dashboard
  if (user && user.role === "admin") {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden border-b bg-card">
        <div className="flex h-16 items-center px-4 justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <div className="flex items-center gap-2">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.tenantName} className="h-8" />
            ) : (
              <img src="/logo.png" alt="FörderPilot" className="h-8" />
            )}
            <span className="font-semibold">{branding.tenantName || "FörderPilot"}</span>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transition-transform lg:translate-x-0 lg:static",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            {/* Logo/Header */}
            <div className="hidden lg:flex h-16 items-center gap-2 border-b px-6">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt={branding.tenantName} className="h-8" />
              ) : (
                <img src="/logo.png" alt="FörderPilot" className="h-8" />
              )}
              <span className="font-semibold text-lg">{branding.tenantName || "FörderPilot"}</span>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href || location.startsWith(item.href + "/");
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <a
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        {item.title}
                      </a>
                    </Link>
                  );
                })}
              </nav>
            </ScrollArea>

            <Separator />

            {/* User Info & Logout */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Abmelden
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
