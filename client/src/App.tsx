import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useLang } from "@/hooks/use-lang";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";

// ── Pages ──────────────────────────────────────────────────────────────────
import LandingPage       from "@/pages/landing-page";
import AuthPage          from "@/pages/auth-page";
import NotFound          from "@/pages/not-found";
import ContactPage       from "@/pages/contact-page";

// Owner
import OwnerDashboard    from "@/pages/owner-dashboard";
import Properties        from "@/pages/properties";
import PropertyForm      from "@/pages/property-form";
import Requests          from "@/pages/requests";
import RequestForm       from "@/pages/request-form";
import OwnerOffersPage   from "@/pages/owner-offers-page";

// Provider
import ProviderDashboard from "@/pages/provider-dashboard";
import ProviderRequests  from "@/pages/provider-requests";
import ProviderOfferForm from "@/pages/provider-offer-form";
import ProviderProfile   from "@/pages/provider-profile";

// Shared
import Settings          from "@/pages/settings";

// Admin
import AdminLoginPage    from "@/pages/admin-login-page";
import AdminDashboard    from "@/pages/admin-dashboard";
import AdminAuth         from "@/pages/admin-auth";

// ── Shared Dashboard Shell ─────────────────────────────────────────────────
function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  const isRTL = lang === "ar";
  return (
    <div
      className="min-h-screen bg-background"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Navbar />
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}

// ── Router ─────────────────────────────────────────────────────────────────
function Router() {
  return (
    <Switch>
      {/* ── Public ──────────────────────────────────────────────────── */}
      <Route path="/"        component={LandingPage} />
      <Route path="/auth"    component={AuthPage} />
      <Route path="/contact" component={ContactPage} />

      {/* ── Admin ───────────────────────────────────────────────────── */}
      <Route path="/admin" component={AdminLoginPage} />
      <Route path="/admin/dashboard">
        <AdminAuth>
          <AdminDashboard />
        </AdminAuth>
      </Route>

      {/* ── Owner ───────────────────────────────────────────────────── */}
      <Route path="/dashboard/owner">
        <DashboardLayout><OwnerDashboard /></DashboardLayout>
      </Route>
      <Route path="/dashboard/owner/properties">
        <DashboardLayout><Properties /></DashboardLayout>
      </Route>
      <Route path="/dashboard/owner/properties/new">
        <DashboardLayout><PropertyForm /></DashboardLayout>
      </Route>
      <Route path="/dashboard/owner/properties/:id/edit">
        <DashboardLayout><PropertyForm /></DashboardLayout>
      </Route>
      <Route path="/dashboard/owner/requests">
        <DashboardLayout><Requests /></DashboardLayout>
      </Route>
      <Route path="/dashboard/owner/requests/new">
        <DashboardLayout><RequestForm /></DashboardLayout>
      </Route>
      <Route path="/dashboard/owner/requests/:id/edit">
        <DashboardLayout><RequestForm /></DashboardLayout>
      </Route>
      <Route path="/dashboard/owner/requests/:id/offers">
        <DashboardLayout><OwnerOffersPage /></DashboardLayout>
      </Route>
      <Route path="/dashboard/owner/settings">
        <DashboardLayout><Settings /></DashboardLayout>
      </Route>

      {/* ── Provider ────────────────────────────────────────────────── */}
      <Route path="/dashboard/provider">
        <DashboardLayout><ProviderDashboard /></DashboardLayout>
      </Route>
      <Route path="/dashboard/provider/requests">
        <DashboardLayout><ProviderRequests /></DashboardLayout>
      </Route>
      <Route path="/dashboard/provider/requests/:id/offer">
        <DashboardLayout><ProviderOfferForm /></DashboardLayout>
      </Route>
      <Route path="/dashboard/provider/profile">
        <DashboardLayout><ProviderProfile /></DashboardLayout>
      </Route>
      <Route path="/dashboard/provider/settings">
        <DashboardLayout><Settings /></DashboardLayout>
      </Route>

      {/* ── 404 ─────────────────────────────────────────────────────── */}
      <Route component={NotFound} />
    </Switch>
  );
}

// ── App Root ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="emaraa-theme">
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}