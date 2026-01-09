import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { useLang } from "@/hooks/use-lang";

// استيراد المكونات الجديدة
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";

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

// المظهر العام بعد إلغاء السايدبار
function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  const isRTL = lang === "ar";

  return (
    <div
      className="min-h-screen w-full bg-background flex flex-col"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* الشريط العلوي */}
      <Navbar />

      {/* المحتوى الرئيسي - أضفنا container لتوسيط المحتوى و padding سفلي للجوال */}
      <main className="flex-1 pb-20 md:pb-8">
        {" "}
        {/* pb-20 هي اللي بتمنع التداخل مع المحتوى */}
        {children}
      </main>

      {/* الشريط السفلي للجوال */}
      <BottomNav />
    </div>
  );
}

function AppContent() {
  return (
    <TooltipProvider>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/provider-profile" component={ProviderProfile} />

        {/* جميع هذه المسارات تستخدم الهيكل الجديد بدون سايدبار */}
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
