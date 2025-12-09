import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { BrandingProvider } from "./components/BrandingProvider";
import { ThemeProvider } from "./contexts/ThemeContext";
import RootRedirect from "./pages/RootRedirect";
import SuperAdmin from "./pages/SuperAdmin";
import TenantForm from "./pages/TenantForm";
import TenantDetail from "./pages/TenantDetail";
import Maintenance from "./pages/Maintenance";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Courses from "./pages/admin/Courses";
import CourseDetail from "./pages/admin/CourseDetail";
import CourseForm from "@/pages/admin/CourseForm";
import Documents from "@/pages/admin/Documents";
import Participants from "./pages/admin/Participants";
import ParticipantsKanban from "./pages/admin/ParticipantsKanban";
import ValidationDashboard from "@/pages/admin/ValidationDashboard";
import ParticipantForm from "@/pages/admin/ParticipantForm";
import ParticipantDetail from "@/pages/admin/ParticipantDetail";
import Sammeltermine from "@/pages/admin/sammeltermine/index";
import SammeltermineForm from "@/pages/admin/sammeltermine/SammeltermineForm";
import Settings from "@/pages/admin/Settings";
import EmailTest from "@/pages/admin/EmailTest";
import EmailTemplatesSettings from "@/pages/admin/EmailTemplatesSettings";
import WorkflowTemplates from "@/pages/admin/WorkflowTemplates";
import VorhabenantragBulkExport from "@/pages/admin/VorhabenantragBulkExport";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RegisterFunnelConversational from "@/pages/RegisterFunnelConversational";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import SetPassword from "@/pages/SetPassword";
import ParticipantDashboard from "@/pages/ParticipantDashboard";
import DocumentsDashboard from "@/pages/participant/DocumentsDashboard";
import BegruendungsWizard from "@/pages/participant/BegruendungsWizard";
import DebugUserInfo from "@/pages/DebugUserInfo";
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
      <Route path={"/"} component={RootRedirect} />
      <Route path={"/dashboard"} component={AdminDashboard} />
          <Route path="/courses" component={Courses} />
          <Route path="/courses/new" component={CourseForm} />
          <Route path="/courses/:id/edit" component={CourseForm} />
          <Route path="/courses/:id" component={CourseDetail} />
      <Route path={"/documents"} component={Documents} />
      <Route path={"/participants"} component={Participants} />
      <Route path={"/participants/board"} component={ParticipantsKanban} />
      <Route path={"/participants/new"} component={ParticipantForm} />
      <Route path={"/participants/:id/view"} component={ParticipantDetail} />
      <Route path={"/participants/:id/edit"} component={ParticipantForm} />
        <Route path="/validation" component={ValidationDashboard} />
        <Route path="/email-test" component={EmailTest} />
      <Route path={"/sammeltermine"} component={Sammeltermine} />
      <Route path={"/sammeltermine/new"} component={SammeltermineForm} />
      <Route path={"/sammeltermine/:id/edit"} component={SammeltermineForm} />      <Route path={"/settings"} component={Settings} />
      <Route path={"/settings/email-templates"} component={EmailTemplatesSettings} />
      <Route path={"/settings/workflows"} component={WorkflowTemplates} />
      <Route path={"/zeus-export"} component={VorhabenantragBulkExport} />
      <Route path={"/superadmin"} component={SuperAdmin} />
      <Route path={"/superadmin/tenants/new"} component={TenantForm} />
      <Route path={"/superadmin/tenants/:id"} component={TenantDetail} />
      <Route path={"/superadmin/tenants/:id/edit"} component={TenantForm} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/anmeldung"} component={RegisterFunnelConversational} />
      <Route path="/teilnehmer/documents" component={DocumentsDashboard} />
      <Route path="/teilnehmer/:id/begruendung" component={BegruendungsWizard} />
      <Route path={"/teilnehmer/:id"} component={ParticipantDetail} />
      <Route path={"/teilnehmer"} component={ParticipantDashboard} />
      <Route path={"/debug/user-info"} component={DebugUserInfo} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/reset-password"} component={ResetPassword} />
      <Route path={"/set-password"} component={SetPassword} />
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
