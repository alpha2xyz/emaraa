import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useLang } from "@/hooks/use-lang";
import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Properties from "@/pages/properties";
import PropertyForm from "@/pages/property-form";
import Requests from "@/pages/requests";
import RequestForm from "@/pages/request-form";
import AdminDashboard from "@/pages/admin-dashboard";

// Wrapper component to access lang context
function AppContent() {
  const { lang } = useLang();
  const isRTL = lang === "ar";

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <Switch>
      {/* Landing Page - No Sidebar */}
      <Route path="/" component={LandingPage} />

      {/* Auth Page - No Sidebar */}
      <Route path="/auth" component={AuthPage} />

      {/* Dashboard - With Sidebar */}
      <Route path="/dashboard">
        <SidebarProvider style={sidebarStyle as React.CSSProperties}>
          <div
            className={`flex h-screen w-full ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header
                className={`flex items-center justify-between gap-2 p-2 border-b shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-auto">
                <Dashboard />
              </main>
            </div>
          </div>
        </SidebarProvider>
      </Route>

      {/* Properties - With Sidebar */}
      <Route path="/properties">
        <SidebarProvider style={sidebarStyle as React.CSSProperties}>
          <div
            className={`flex h-screen w-full ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header
                className={`flex items-center justify-between gap-2 p-2 border-b shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-auto">
                <Properties />
              </main>
            </div>
          </div>
        </SidebarProvider>
      </Route>

      <Route path="/properties/new">
        <SidebarProvider style={sidebarStyle as React.CSSProperties}>
          <div
            className={`flex h-screen w-full ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header
                className={`flex items-center justify-between gap-2 p-2 border-b shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-auto">
                <PropertyForm />
              </main>
            </div>
          </div>
        </SidebarProvider>
      </Route>

      {/* Requests - With Sidebar */}
      <Route path="/requests">
        <SidebarProvider style={sidebarStyle as React.CSSProperties}>
          <div
            className={`flex h-screen w-full ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header
                className={`flex items-center justify-between gap-2 p-2 border-b shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-auto">
                <Requests />
              </main>
            </div>
          </div>
        </SidebarProvider>
      </Route>

      <Route path="/requests/new">
        <SidebarProvider style={sidebarStyle as React.CSSProperties}>
          <div
            className={`flex h-screen w-full ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header
                className={`flex items-center justify-between gap-2 p-2 border-b shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-auto">
                <RequestForm />
              </main>
            </div>
          </div>
        </SidebarProvider>
      </Route>

      {/* Admin Dashboard */}
      <Route path="/admin">
        <div
          className="flex h-screen"
          dir={isRTL ? "rtl" : "ltr"}
          style={sidebarStyle as any}
        >
          <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto p-4">
                <SidebarTrigger />
                <AdminDashboard />
              </div>
            </main>
          </SidebarProvider>
        </div>
      </Route>

      {/* 404 Page */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
