import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider"; // ← تأكد من هذا
import { useLang } from "@/hooks/use-lang";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";

// استيراد الصفحات
import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import OwnerDashboard from "@/pages/owner-dashboard";
import ProviderRequests from "@/pages/provider-requests";
import ProviderOfferForm from "@/pages/provider-offer-form";
import ProviderDashboard from "@/pages/provider-dashboard";
import ProviderProfile from "@/pages/provider-profile";
import Properties from "@/pages/properties";
import PropertyForm from "@/pages/property-form";
import Requests from "@/pages/requests";
import RequestForm from "@/pages/request-form";
import Settings from "@/pages/settings";

// المظهر العام الموحد (Layout)
function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  const isRTL = lang === "ar";

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="emara-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Switch>
            {/* Public Routes */}
            <Route path="/" component={LandingPage} />
            <Route path="/auth" component={AuthPage} />

            {/* Owner Routes */}
            <Route path="/dashboard/owner">
              {() => (
                <DashboardLayout>
                  <OwnerDashboard />
                </DashboardLayout>
              )}
            </Route>
            <Route path="/dashboard/owner/properties">
              {() => (
                <DashboardLayout>
                  <Properties />
                </DashboardLayout>
              )}
            </Route>
            <Route path="/dashboard/owner/properties/new">
              {() => (
                <DashboardLayout>
                  <PropertyForm />
                </DashboardLayout>
              )}
            </Route>
            <Route path="/dashboard/owner/properties/:id/edit">
              {() => (
                <DashboardLayout>
                  <PropertyForm />
                </DashboardLayout>
              )}
            </Route>
            <Route path="/dashboard/owner/requests">
              {() => (
                <DashboardLayout>
                  <Requests />
                </DashboardLayout>
              )}
            </Route>
            <Route path="/dashboard/owner/requests/new">
              {() => (
                <DashboardLayout>
                  <RequestForm />
                </DashboardLayout>
              )}
            </Route>
            <Route path="/dashboard/owner/settings">
              {() => (
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              )}
            </Route>

            {/* Provider Routes */}
            <Route path="/dashboard/provider">
              {() => (
                <DashboardLayout>
                  <ProviderDashboard />
                </DashboardLayout>
              )}
            </Route>
            <Route path="/dashboard/provider/requests">
              {() => (
                <DashboardLayout>
                  <ProviderRequests />
                </DashboardLayout>
              )}
            </Route>
            <Route path="/dashboard/provider/requests/:id/offer">
              {() => (
                <DashboardLayout>
                  <ProviderOfferForm />
                </DashboardLayout>
              )}
            </Route>
            <Route path="/dashboard/provider/profile">
              {() => (
                <DashboardLayout>
                  <ProviderProfile />
                </DashboardLayout>
              )}
            </Route>
            <Route path="/dashboard/provider/settings">
              {() => (
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              )}
            </Route>

            {/* 404 - Not Found */}
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
