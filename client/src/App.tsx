import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useLang } from "@/hooks/use-lang";

import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import OwnerDashboard from "@/pages/owner-dashboard";
import ProviderDashboard from "@/pages/provider-dashboard";
import ProviderProfile from "@/pages/provider-profile";
import Properties from "@/pages/properties";
import PropertyForm from "@/pages/property-form";
import Requests from "@/pages/requests";
import RequestForm from "@/pages/request-form";
import Settings from "@/pages/settings";

// Layout للصفحات اللي فيها Sidebar
function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  const isRTL = lang === "ar";

  return (
    <SidebarProvider defaultOpen={true}>
      <div
        className="flex min-h-screen w-full bg-background"
        dir={isRTL ? "rtl" : "ltr"}
        style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
      >
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <header
            className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4"
            style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
          >
            <SidebarTrigger />
          </header>
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 md:p-6">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function AppContent() {
  return (
    <TooltipProvider>
      <Switch>
        {/* صفحات بدون Sidebar */}
        <Route path="/" component={LandingPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/provider-profile" component={ProviderProfile} />

        {/* صفحات مع Sidebar */}
        <Route path="/dashboard/owner">
          <DashboardLayout>
            <OwnerDashboard />
          </DashboardLayout>
        </Route>

        <Route path="/dashboard/provider">
          <DashboardLayout>
            <ProviderDashboard />
          </DashboardLayout>
        </Route>

        <Route path="/properties">
          <DashboardLayout>
            <Properties />
          </DashboardLayout>
        </Route>

        <Route path="/properties/new">
          <DashboardLayout>
            <PropertyForm />
          </DashboardLayout>
        </Route>

        <Route path="/properties/edit/:id">
          <DashboardLayout>
            <PropertyForm />
          </DashboardLayout>
        </Route>

        <Route path="/requests">
          <DashboardLayout>
            <Requests />
          </DashboardLayout>
        </Route>

        <Route path="/requests/new">
          <DashboardLayout>
            <RequestForm />
          </DashboardLayout>
        </Route>

        <Route path="/settings">
          <DashboardLayout>
            <Settings />
          </DashboardLayout>
        </Route>

        {/* 404 Page */}
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </TooltipProvider>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
