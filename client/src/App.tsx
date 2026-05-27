import React, { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

// ── Error Boundary ─────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            حدث خطأ غير متوقع / Something went wrong
          </h1>
          <p className="text-gray-500">يرجى تحديث الصفحة / Please refresh the page</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            تحديث / Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useLang } from "@/hooks/use-lang";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import RequireAuth from "@/components/RequireAuth";
import { useIdleLogout } from "@/hooks/use-idle-logout";

// ── Pages ──────────────────────────────────────────────────────────────────
// Public pages — loaded eagerly (seen before auth)
import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import ContactPage from "@/pages/contact-page";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import AboutPage from "@/pages/about-page";

// Auth-gated pages — lazy loaded (split into separate chunks)
const OwnerDashboard = React.lazy(() => import("@/pages/owner-dashboard"));
const Properties = React.lazy(() => import("@/pages/properties"));
const PropertyForm = React.lazy(() => import("@/pages/property-form"));
const Requests = React.lazy(() => import("@/pages/requests"));
const RequestForm = React.lazy(() => import("@/pages/request-form"));
const OwnerOffersPage = React.lazy(() => import("@/pages/owner-offers-page"));

const ProviderDashboard = React.lazy(() => import("@/pages/provider-dashboard"));
const ProviderRequests = React.lazy(() => import("@/pages/provider-requests"));
const ProviderOfferForm = React.lazy(() => import("@/pages/provider-offer-form"));
const ProviderProfile = React.lazy(() => import("@/pages/provider-profile"));
const ProviderOffers = React.lazy(() => import("@/pages/provider-offers"));

const Settings = React.lazy(() => import("@/pages/settings"));
const OwnerOnboarding = React.lazy(() => import("@/pages/owner-onboarding"));

const AdminLoginPage = React.lazy(() => import("@/pages/admin-login-page"));
const AdminDashboard = React.lazy(() => import("@/pages/admin-dashboard"));
const AdminAuth = React.lazy(() => import("@/pages/admin-auth"));

// ── Shared Dashboard Shell ─────────────────────────────────────────────────
function DashboardLayout({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "owner" | "provider";
}) {
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const isRTL = lang === "ar";
  const isImpersonating = !!localStorage.getItem("adminSessionToken");
  useIdleLogout();

  function backToAdmin() {
    localStorage.setItem("userRole", "admin");
    setLocation("/admin/dashboard");
  }

  return (
    <RequireAuth role={role}>
      {isImpersonating && (
        <div className="bg-amber-500 text-white text-xs px-4 py-2 flex items-center justify-between sticky top-0 z-50">
          <span>Admin view — logged in as {role}</span>
          <button onClick={backToAdmin} className="underline font-semibold">
            ← Back to Admin
          </button>
        </div>
      )}
      <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <Navbar />
        <main className={role === "owner" ? "pb-4" : "pb-20"}>{children}</main>
        <BottomNav />
      </div>
    </RequireAuth>
  );
}

// ── Router ─────────────────────────────────────────────────────────────────
function Router() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#2E4A6B] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ScrollToTop />
      <Switch>
        {/* ── Public ──────────────────────────────────────────────────── */}
        <Route path="/" component={LandingPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/about" component={AboutPage} />

        {/* ── Admin ───────────────────────────────────────────────────── */}
        <Route path="/admin" component={AdminLoginPage} />
        <Route path="/admin/dashboard">
          <AdminAuth>
            <AdminDashboard />
          </AdminAuth>
        </Route>

        {/* ── Owner ───────────────────────────────────────────────────── */}
        <Route path="/dashboard/owner">
          <DashboardLayout role="owner">
            <OwnerDashboard />
          </DashboardLayout>
        </Route>
        <Route path="/dashboard/owner/properties">
          <DashboardLayout role="owner">
            <Properties />
          </DashboardLayout>
        </Route>
        <Route path="/dashboard/owner/onboarding">
          <DashboardLayout role="owner">
            <OwnerOnboarding />
          </DashboardLayout>
        </Route>
        <Route path="/dashboard/owner/properties/new">
          <DashboardLayout role="owner">
            <PropertyForm />
          </DashboardLayout>
        </Route>
        <Route path="/dashboard/owner/properties/:id/edit">
          <DashboardLayout role="owner">
            <PropertyForm />
          </DashboardLayout>
        </Route>
        <Route path="/dashboard/owner/requests">
          <DashboardLayout role="owner">
            <Requests />
          </DashboardLayout>
        </Route>
        <Route path="/dashboard/owner/requests/new">
          <DashboardLayout role="owner">
            <RequestForm />
          </DashboardLayout>
        </Route>
        <Route path="/dashboard/owner/requests/:id/edit">
          <DashboardLayout role="owner">
            <RequestForm />
          </DashboardLayout>
        </Route>
        <Route path="/dashboard/owner/requests/:id/offers">
          <DashboardLayout role="owner">
            <OwnerOffersPage />
          </DashboardLayout>
        </Route>
        <Route path="/dashboard/owner/settings">
          <DashboardLayout role="owner">
            <Settings />
          </DashboardLayout>
        </Route>

        {/* ── Provider ────────────────────────────────────────────────── */}
        <Route path="/dashboard/provider">
          <DashboardLayout role="provider">
            <ProviderDashboard />
          </DashboardLayout>
        </Route>
        <Route path="/dashboard/provider/requests">
          <DashboardLayout role="provider">
            <ProviderRequests />
          </DashboardLayout>
        </Route>
        <Route path="/dashboard/provider/requests/:id/offer">
          <DashboardLayout role="provider">
            <ProviderOfferForm />
          </DashboardLayout>
        </Route>
        <Route path="/dashboard/provider/profile">
          <DashboardLayout role="provider">
            <ProviderProfile />
          </DashboardLayout>
        </Route>
        <Route path="/dashboard/provider/offers">
          <DashboardLayout role="provider">
            <ProviderOffers />
          </DashboardLayout>
        </Route>

        {/* ── 404 ─────────────────────────────────────────────────────── */}
        <Route component={NotFound} />
      </Switch>
    </React.Suspense>
  );
}

// ── App Root ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
