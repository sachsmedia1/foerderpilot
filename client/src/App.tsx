import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { BrandingProvider } from "./components/BrandingProvider";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SuperAdmin from "./pages/SuperAdmin";
import Maintenance from "./pages/Maintenance";
import AdminDashboard from "./pages/admin/Dashboard";
import Courses from "./pages/admin/Courses";
import CourseForm from "./pages/admin/CourseForm";
import { useAuth } from "./_core/hooks/useAuth";

function Router() {
  const { isMaintenanceMode, loading } = useAuth();

  // Zeige Wartungsseite wenn auf Root-Domain (foerderpilot.io)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade...</p>
        </div>
      </div>
    );
  }

  if (isMaintenanceMode) {
    return <Maintenance />;
  }

  // Normale Routing-Logik für app.foerderpilot.io und Tenant-Subdomains
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/courses"} component={Courses} />
      <Route path={"/admin/courses/new"} component={CourseForm} />
      <Route path={"/admin/courses/:id/edit"} component={CourseForm} />
      <Route path={"/superadmin"} component={SuperAdmin} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <BrandingProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </BrandingProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
