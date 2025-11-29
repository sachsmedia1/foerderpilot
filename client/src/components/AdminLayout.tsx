/**
 * FOERDERPILOT - ADMIN LAYOUT
 * 
 * Dashboard-Layout für Tenant-Admins mit:
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
  Building2, 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Users, 
  Settings,
  Menu,
  X,
  LogOut,
  FileCheck
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
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
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Kurse",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    title: "Sammeltermine",
    href: "/admin/sammeltermins",
    icon: Calendar,
  },
  {
    title: "Teilnehmer",
    href: "/admin/participants",
    icon: Users,
  },
  {
    title: "Dokumente",
    href: "/admin/documents",
    icon: FileCheck,
  },
  {
    title: "Einstellungen",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, tenant, logout } = useAuth();
  const branding = useBranding();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
              <Building2 className="h-6 w-6 text-primary" />
            )}
            <span className="font-semibold">{branding.tenantName}</span>
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
                <Building2 className="h-6 w-6 text-primary" />
              )}
              <span className="font-semibold text-lg">{branding.tenantName}</span>
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
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        {item.title}
                      </a>
                    </Link>
                  );
                })}
              </nav>
            </ScrollArea>

            {/* User Info */}
            <div className="border-t p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name || "Admin"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Abmelden
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="container py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
