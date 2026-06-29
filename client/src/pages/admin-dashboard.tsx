import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Users,
  Building2,
  FileText,
  LogOut,
  CheckCircle2,
  XCircle,
  Shield,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Package,
  RefreshCw,
  Handshake,
  TrendingUp,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLang } from "../hooks/use-lang";
import { openSignedPdf } from "../lib/storage";
import { LanguageToggle } from "../components/LanguageToggle";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/StatusBadge";

export default function AdminDashboard() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const isRTL = lang === "ar";
  const { toast } = useToast();
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "error">("checking");
  const abortRef = useRef<AbortController | null>(null);

  const t =
    lang === "ar"
      ? {
          title: "لوحة الإدارة",
          overview: "نظرة عامة",
          users: "المستخدمون",
          properties: "العقارات",
          requests: "الطلبات",
          providers: "مزودو الخدمة",
          approve: "موافقة",
          reject: "رفض",
          logout: "تسجيل خروج",
          loading: "جارٍ التحميل…",
          noData: "لا توجد بيانات",
          name: "الاسم",
          phone: "الجوال",
          date: "التاريخ",
          company: "الشركة",
          city: "المدينة",
          status: "الحالة",
          approved: "مقبول",
          pending: "قيد المراجعة",
          owner: "المالك",
          buildingType: "نوع المبنى",
          units: "الوحدات",
          category: "الفئة",
          offers: "العروض",
          viewPdf: "عرض PDF",
          crDoc: "السجل التجاري",
          profileDoc: "بروفايل الشركة",
          falDoc: "رخصة فال",
          noOffers: "لا توجد عروض",
          offerStatus: { pending: "قيد المراجعة", accepted: "مقبول", rejected: "مرفوض" },
          reqStatus: {
            pending: "معلق",
            in_progress: "قيد التنفيذ",
            completed: "مكتمل",
            cancelled: "ملغي",
          },
          cleaning: "نظافة",
          maintenance: "صيانة",
          notes: "ملاحظات",
          price: "السعر الإجمالي",
          neighborhood: "الحي",
          nationalAddress: "العنوان الوطني",
          sar: "ريال",
          profileIncomplete: "لم يكتمل الملف الشخصي",
          deals: "الصفقات",
          gmv: "إجمالي قيمة العقود المؤكدة (GMV)",
          contractValue: "قيمة العقد",
          dealPending: "بانتظار التأكيد",
          dealClosed: "مكتملة",
          dealCancelled: "ملغاة",
          markClosed: "تأكيد كمكتملة",
          markCancelled: "إلغاء",
          signedAt: "تاريخ التوقيع",
          saveDeal: "حفظ",
          noDeals: "لا توجد صفقات بعد — تُنشأ تلقائياً عند قبول المالك لعرض",
          dealNotes: "ملاحظات",
          enterValue: "أدخل قيمة العقد السنوية",
          closedCount: "صفقة مؤكدة",
        }
      : {
          title: "Admin Dashboard",
          overview: "Overview",
          users: "Users",
          properties: "Properties",
          requests: "Requests",
          providers: "Providers",
          approve: "Approve",
          reject: "Reject",
          logout: "Logout",
          loading: "Loading…",
          noData: "No data",
          name: "Name",
          phone: "Phone",
          date: "Date",
          company: "Company",
          city: "City",
          status: "Status",
          approved: "Approved",
          pending: "Pending",
          owner: "Owner",
          buildingType: "Building Type",
          units: "Units",
          category: "Category",
          offers: "Offers",
          viewPdf: "View PDF",
          crDoc: "Commercial Register",
          profileDoc: "Company Profile",
          falDoc: "FAL License",
          noOffers: "No offers",
          offerStatus: { pending: "Pending", accepted: "Accepted", rejected: "Rejected" },
          reqStatus: {
            pending: "Pending",
            in_progress: "In Progress",
            completed: "Completed",
            cancelled: "Cancelled",
          },
          cleaning: "Cleaning",
          maintenance: "Maintenance",
          notes: "Notes",
          price: "Total Price",
          neighborhood: "Neighborhood",
          nationalAddress: "National Address",
          sar: "SAR",
          profileIncomplete: "Profile not completed",
          deals: "Deals",
          gmv: "Confirmed Contract Value (GMV)",
          contractValue: "Contract Value",
          dealPending: "Awaiting confirmation",
          dealClosed: "Closed",
          dealCancelled: "Cancelled",
          markClosed: "Confirm as closed",
          markCancelled: "Cancel",
          signedAt: "Signed date",
          saveDeal: "Save",
          noDeals: "No deals yet — created automatically when an owner accepts an offer",
          dealNotes: "Notes",
          enterValue: "Enter annual contract value",
          closedCount: "confirmed deals",
        };

  const adminHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("adminSessionToken")}`,
  });

  // ── Live DB connection indicator ───────────────────────────────────────────
  useEffect(() => {
    const checkDb = async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      try {
        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${localStorage.getItem("adminSessionToken")}` },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        setDbStatus(res.ok ? "connected" : "error");
      } catch {
        clearTimeout(timeoutId);
        setDbStatus("error");
      }
    };

    checkDb();
    const interval = setInterval(checkDb, 30_000);
    return () => {
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const { data: stats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", { headers: adminHeaders() });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // ── Users (owners) ─────────────────────────────────────────────────────────
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { headers: adminHeaders() });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // ── Providers ──────────────────────────────────────────────────────────────
  const {
    data: allProviders,
    isLoading: providersLoading,
    refetch: refetchProviders,
  } = useQuery({
    queryKey: ["admin", "all-providers"],
    queryFn: async () => {
      const res = await fetch("/api/admin/providers", { headers: adminHeaders() });
      if (!res.ok) throw new Error("Failed to fetch providers");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // ── Properties ─────────────────────────────────────────────────────────────
  const { data: allProperties, isLoading: propertiesLoading } = useQuery({
    queryKey: ["admin", "properties"],
    queryFn: async () => {
      const res = await fetch("/api/admin/properties", { headers: adminHeaders() });
      if (!res.ok) throw new Error("Failed to fetch properties");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // ── Requests + Offers ──────────────────────────────────────────────────────
  const { data: allRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["admin", "requests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/requests", { headers: adminHeaders() });
      if (!res.ok) throw new Error("Failed to fetch requests");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // ── Deals (GMV tracking) ───────────────────────────────────────────────────
  const { data: dealsData, isLoading: dealsLoading } = useQuery({
    queryKey: ["admin", "deals"],
    queryFn: async () => {
      const res = await fetch("/api/admin/deals", { headers: adminHeaders() });
      if (!res.ok) throw new Error("Failed to fetch deals");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const [dealEdits, setDealEdits] = useState<
    Record<string, { contract_value?: string; signed_at?: string; notes?: string }>
  >({});

  const dealMutation = useMutation({
    mutationFn: async ({
      id,
      contract_value,
      status,
      signed_at,
      notes,
    }: {
      id: string;
      contract_value?: string;
      status?: string;
      signed_at?: string;
      notes?: string;
    }) => {
      const res = await fetch(`/api/admin/deals/${id}`, {
        method: "PATCH",
        headers: adminHeaders(),
        body: JSON.stringify({ contract_value, status, signed_at, notes }),
      });
      if (!res.ok) throw new Error("Failed to update deal");
    },
    onSuccess: () => {
      toast({ title: lang === "ar" ? "تم تحديث الصفقة" : "Deal updated" });
      queryClient.invalidateQueries({ queryKey: ["admin", "deals"] });
    },
    onError: () =>
      toast({ variant: "destructive", title: lang === "ar" ? "حدث خطأ" : "An error occurred" }),
  });

  // ── Approve/Reject ─────────────────────────────────────────────────────────
  const approveMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const adminToken = localStorage.getItem("adminSessionToken");
      const res = await fetch("/api/admin/approve-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ id, approved }),
      });
      if (!res.ok) throw new Error("Failed to update provider");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "all-providers"] }),
  });

  async function impersonate(userId: string) {
    const adminToken = localStorage.getItem("adminSessionToken");
    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      toast({
        variant: "destructive",
        title: lang === "ar" ? "فشل تبديل الحساب" : "Impersonation failed",
      });
      return;
    }
    const data = await res.json();
    localStorage.setItem("sessionToken", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("userPhone", data.phone);
    localStorage.setItem("userRole", data.role);
    localStorage.setItem("userName", data.name ?? "");
    setLocation(`/dashboard/${data.role}`);
  }

  function handleLogout() {
    localStorage.removeItem("userRole");
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminSessionToken");
    // Also drop any user session left over from impersonation so the next login starts clean.
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userPhone");
    localStorage.removeItem("userName");
    setLocation("/admin");
  }

  const [sendingReport, setSendingReport] = useState(false);
  async function handleSendReport() {
    if (sendingReport) return;
    setSendingReport(true);
    try {
      const res = await fetch("/api/admin/send-report", {
        method: "POST",
        headers: adminHeaders(),
      });
      if (!res.ok) throw new Error("failed");
      toast({
        title: lang === "ar" ? "تم إرسال التقرير" : "Report sent",
        description:
          lang === "ar"
            ? "وصل التقرير إلى info@emaraa.app"
            : "Report delivered to info@emaraa.app",
      });
    } catch {
      toast({
        variant: "destructive",
        title: lang === "ar" ? "تعذّر إرسال التقرير" : "Could not send report",
      });
    } finally {
      setSendingReport(false);
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString(isRTL ? "ar-SA-u-nu-latn" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const statCards = [
    { label: t.users, value: stats?.users ?? 0, icon: Users, accent: "var(--provider)", iconBg: "var(--provider-soft)" },
    {
      label: t.properties,
      value: stats?.properties ?? 0,
      icon: Building2,
      accent: "var(--ok)",
      iconBg: "var(--ok-soft)",
    },
    {
      label: t.requests,
      value: stats?.requests ?? 0,
      icon: FileText,
      accent: "var(--residential)",
      iconBg: "var(--residential-soft)",
    },
    {
      label: t.providers,
      value: stats?.providers ?? 0,
      icon: Shield,
      accent: "var(--commercial)",
      iconBg: "var(--commercial-soft)",
    },
  ];

  return (
    <div className="page-enter min-h-screen" style={{ background: "var(--navy-2)" }} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm px-4 sm:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--owner-soft)" }}>
            <Shield className="w-5 h-5" style={{ color: "var(--owner)" }} />
          </div>
          <h1 className="text-xl font-bold text-foreground">{t.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                dbStatus === "connected"
                  ? "bg-green-500"
                  : dbStatus === "error"
                    ? "bg-red-500"
                    : "bg-yellow-400 animate-pulse"
              }`}
            />
            <span
              className={
                dbStatus === "connected"
                  ? "text-green-400"
                  : dbStatus === "error"
                    ? "text-red-400"
                    : "text-yellow-400"
              }
            >
              {dbStatus === "connected"
                ? lang === "ar"
                  ? "متصل"
                  : "Connected"
                : dbStatus === "error"
                  ? lang === "ar"
                    ? "خطأ في الاتصال"
                    : "Connection error"
                  : lang === "ar"
                    ? "جارٍ الفحص…"
                    : "Checking…"}
            </span>
          </div>
          <LanguageToggle className="text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSendReport}
            disabled={sendingReport}
            className="text-[var(--provider)] hover:text-[var(--provider)]"
          >
            <Mail className="w-4 h-4 me-2" />
            {sendingReport
              ? lang === "ar"
                ? "جارٍ الإرسال…"
                : "Sending…"
              : lang === "ar"
                ? "أرسل التقرير"
                : "Send report"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700"
          >
            <LogOut className="w-4 h-4 me-2" />
            {t.logout}
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-4 sm:p-6">
        <Tabs defaultValue="overview">
          <TabsList className="flex flex-wrap h-auto gap-1 mb-6 bg-white/5 border border-border">
            <TabsTrigger value="overview">{t.overview}</TabsTrigger>
            <TabsTrigger value="providers">{t.providers}</TabsTrigger>
            <TabsTrigger value="users">{t.users}</TabsTrigger>
            <TabsTrigger value="properties">{t.properties}</TabsTrigger>
            <TabsTrigger value="requests">{t.requests}</TabsTrigger>
            <TabsTrigger value="deals">{t.deals}</TabsTrigger>
          </TabsList>

          {/* ── Overview ──────────────────────────────────────────────── */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map(({ label, value, icon: Icon, accent, iconBg }) => (
                <div
                  key={label}
                  className="bg-card rounded-2xl shadow-sm p-5"
                  style={{ borderTop: `4px solid ${accent}` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className="text-3xl font-bold">{value}</p>
                    </div>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: iconBg }}
                    >
                      <Icon className="h-5 w-5" style={{ color: accent }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── Providers ─────────────────────────────────────────────── */}
          <TabsContent value="providers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-500" />
                    {t.providers}
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => refetchProviders()}
                    disabled={providersLoading}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <RefreshCw className={`h-3 w-3 ${providersLoading ? "animate-spin" : ""}`} />
                    {lang === "ar" ? "تحديث" : "Refresh"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {providersLoading ? (
                  <p className="text-center py-8 text-muted-foreground">{t.loading}</p>
                ) : !allProviders?.length ? (
                  <p className="text-center py-8 text-muted-foreground">{t.noData}</p>
                ) : (
                  <div className="space-y-3">
                    {allProviders.map((p: any) => {
                      const profile = Array.isArray(p.providers) ? p.providers[0] : p.providers;
                      return (
                        <div key={p.id} className="p-4 border border-border rounded-lg space-y-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  onClick={() => impersonate(p.id)}
                                  className="font-semibold hover:text-[#0DB8D3] hover:underline text-start"
                                >
                                  {profile?.company_name ?? p.name}
                                </button>
                                {profile ? (
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profile.approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                                  >
                                    {profile.approved ? t.approved : t.pending}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-muted-foreground">
                                    {t.profileIncomplete}
                                  </span>
                                )}
                              </div>
                              {profile?.city && (
                                <p className="text-sm text-muted-foreground">{profile.city}</p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                {p.name} · {p.phone}
                              </p>
                              {profile?.email && (
                                <p className="text-sm text-muted-foreground" dir="ltr">
                                  {profile.email}
                                </p>
                              )}
                              {profile?.description && (
                                <p className="text-sm text-muted-foreground mt-1">{profile.description}</p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {formatDate(p.created_at)}
                              </p>
                            </div>
                            {profile && !profile.approved && (
                              <div className="flex gap-2 shrink-0">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 h-8"
                                  disabled={approveMutation.isPending}
                                  onClick={() =>
                                    approveMutation.mutate({ id: profile.id, approved: true })
                                  }
                                >
                                  <CheckCircle2 className="h-3 w-3 me-1" />
                                  {t.approve}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-8"
                                  disabled={approveMutation.isPending}
                                  onClick={() =>
                                    approveMutation.mutate({ id: profile.id, approved: false })
                                  }
                                >
                                  <XCircle className="h-3 w-3 me-1" />
                                  {t.reject}
                                </Button>
                              </div>
                            )}
                          </div>
                          {profile &&
                            (profile.commercial_register_url ||
                              profile.company_profile_url ||
                              profile.fal_license_url) && (
                              <div className="flex gap-2 flex-wrap pt-1 border-t">
                                {profile.commercial_register_url && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs gap-1"
                                    onClick={() =>
                                      openSignedPdf(
                                        "provider-documents",
                                        profile.commercial_register_url,
                                        { admin: true }
                                      )
                                    }
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    {t.crDoc}
                                  </Button>
                                )}
                                {profile.company_profile_url && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs gap-1"
                                    onClick={() =>
                                      openSignedPdf(
                                        "provider-documents",
                                        profile.company_profile_url,
                                        { admin: true }
                                      )
                                    }
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    {t.profileDoc}
                                  </Button>
                                )}
                                {profile.fal_license_url && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs gap-1"
                                    onClick={() =>
                                      openSignedPdf("provider-documents", profile.fal_license_url, {
                                        admin: true,
                                      })
                                    }
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    {t.falDoc}
                                  </Button>
                                )}
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Users ─────────────────────────────────────────────────── */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#3D6187]" />
                  {t.users}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <p className="text-center py-8 text-muted-foreground">{t.loading}</p>
                ) : !allUsers?.length ? (
                  <p className="text-center py-8 text-muted-foreground">{t.noData}</p>
                ) : (
                  <div className="space-y-2">
                    {allUsers.map((u: any) => (
                      <div
                        key={u.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg bg-white/5 gap-2"
                      >
                        <div>
                          <button
                            onClick={() => impersonate(u.id)}
                            className="font-medium hover:text-[#0DB8D3] hover:underline text-start"
                          >
                            {u.name || "—"}
                          </button>
                          <p className="text-sm text-muted-foreground">{u.phone}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(u.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Properties ────────────────────────────────────────────── */}
          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-green-500" />
                  {t.properties}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {propertiesLoading ? (
                  <p className="text-center py-8 text-muted-foreground">{t.loading}</p>
                ) : !allProperties?.length ? (
                  <p className="text-center py-8 text-muted-foreground">{t.noData}</p>
                ) : (
                  <div className="space-y-2">
                    {allProperties.map((p: any) => (
                      <div key={p.id} className="p-3 border rounded-lg bg-white/5 space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(p.created_at)}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {p.city} · {p.building_type}{" "}
                          {p.units_count
                            ? `· ${p.units_count} ${
                                p.building_type === "commercial"
                                  ? isRTL
                                    ? "م²"
                                    : "m²"
                                  : isRTL
                                    ? "وحدة"
                                    : "units"
                              }`
                            : ""}
                        </p>
                        {p.address && (
                          <p className="text-sm text-muted-foreground">
                            {t.neighborhood}: {p.address}
                            {p.national_address
                              ? ` · ${t.nationalAddress}: ${p.national_address}`
                              : ""}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {t.owner}: {(p.users as any)?.name} · {(p.users as any)?.phone}
                        </p>
                        {p.map_url && (
                          <a
                            href={p.map_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs inline-flex items-center gap-1 hover:underline"
                            style={{ color: "var(--owner)" }}
                          >
                            <ExternalLink className="h-3 w-3" />
                            {isRTL ? "فتح الخريطة" : "Open map"}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Requests ──────────────────────────────────────────────── */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  {t.requests}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <p className="text-center py-8 text-muted-foreground">{t.loading}</p>
                ) : !allRequests?.length ? (
                  <p className="text-center py-8 text-muted-foreground">{t.noData}</p>
                ) : (
                  <div className="space-y-2">
                    {allRequests.map((r: any) => {
                      const offers = r.provider_offers ?? [];
                      const isExpanded = expandedRequest === r.id;
                      return (
                        <div key={r.id} className="border rounded-lg bg-white/5 overflow-hidden">
                          <button
                            className="w-full p-3 text-start hover:bg-white/5 transition-colors"
                            onClick={() => setExpandedRequest(isExpanded ? null : r.id)}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium">{(r.properties as any)?.name}</p>
                                  <Badge variant="secondary" className="text-xs">
                                    {r.service_category === "standard"
                                      ? lang === "ar"
                                        ? "نطاق الخدمات المطلوبة"
                                        : "Scope of Services"
                                      : r.service_category === "cleaning"
                                        ? t.cleaning
                                        : t.maintenance}
                                  </Badge>
                                  <StatusBadge status={r.status} lang={lang} />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {(r.properties as any)?.city} · {t.owner}:{" "}
                                  {(r.properties as any)?.users?.name}
                                  {(r.properties as any)?.users?.phone
                                    ? ` · ${(r.properties as any).users.phone}`
                                    : ""}
                                </p>
                                {r.description && (
                                  <p className="text-xs text-muted-foreground">{r.description}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(r.created_at)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge className="bg-purple-500/15 text-purple-200 text-xs">
                                  <Package className="h-3 w-3 me-1" />
                                  {offers.length} {t.offers}
                                </Badge>
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="border-t bg-white/5 p-3 space-y-2">
                              {offers.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-2">
                                  {t.noOffers}
                                </p>
                              ) : (
                                offers.map((o: any) => (
                                  <div
                                    key={o.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-card border rounded"
                                  >
                                    <div className="space-y-0.5">
                                      <p className="text-sm font-medium">
                                        {o.providers?.company_name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {o.providers?.city}
                                      </p>
                                      {o.price_total != null && (
                                        <p className="text-xs font-medium text-foreground">
                                          {t.price}: {o.price_total.toLocaleString("en-US")} {t.sar}
                                        </p>
                                      )}
                                      {o.notes && (
                                        <p className="text-xs text-muted-foreground">
                                          {t.notes}: {o.notes}
                                        </p>
                                      )}
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${o.status === "accepted" ? "border-green-400 text-green-300" : o.status === "rejected" ? "border-red-400 text-red-300" : "border-yellow-400 text-yellow-300"}`}
                                      >
                                        {t.offerStatus[o.status as keyof typeof t.offerStatus] ??
                                          o.status}
                                      </Badge>
                                    </div>
                                    {o.offer_file_url && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs gap-1 shrink-0"
                                        onClick={() =>
                                          openSignedPdf("provider-offers", o.offer_file_url, {
                                            admin: true,
                                          })
                                        }
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                        {t.viewPdf}
                                      </Button>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Deals (GMV tracking) ──────────────────────────────────── */}
          <TabsContent value="deals">
            {/* GMV summary banner */}
            <div
              className="rounded-xl p-5 mb-4 flex items-center gap-4"
              style={{ background: "var(--ok-soft)", border: "1px solid var(--ok)" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "var(--ok)" }}
              >
                <TrendingUp className="w-6 h-6" style={{ color: "var(--navy-2)" }} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.gmv}</p>
                <p className="text-2xl font-bold text-foreground">
                  {Number(dealsData?.gmv ?? 0).toLocaleString("en-US")} {t.sar}
                </p>
                <p className="text-xs text-muted-foreground">
                  {dealsData?.closedCount ?? 0} {t.closedCount}
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="h-5 w-5" style={{ color: "var(--ok)" }} />
                  {t.deals}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dealsLoading ? (
                  <p className="text-center py-8 text-muted-foreground">{t.loading}</p>
                ) : !dealsData?.deals?.length ? (
                  <p className="text-center py-8 text-muted-foreground">{t.noDeals}</p>
                ) : (
                  <div className="space-y-3">
                    {dealsData.deals.map((d: any) => {
                      const edit = dealEdits[d.id] ?? {};
                      const property = d.requests?.properties;
                      const statusColor =
                        d.status === "closed"
                          ? "var(--ok)"
                          : d.status === "cancelled"
                            ? "var(--err)"
                            : "var(--warn)";
                      const statusLabel =
                        d.status === "closed"
                          ? t.dealClosed
                          : d.status === "cancelled"
                            ? t.dealCancelled
                            : t.dealPending;
                      return (
                        <div
                          key={d.id}
                          className="p-4 border border-border rounded-lg space-y-3"
                          style={{ background: "rgba(255,255,255,0.02)" }}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-foreground">
                                {property?.name ?? "—"}
                                <span className="text-xs text-muted-foreground font-normal">
                                  {" · "}
                                  {property?.city}
                                  {property?.building_type ? ` · ${property.building_type}` : ""}
                                </span>
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {t.providers}: {d.providers?.company_name ?? "—"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {t.owner}: {d.owner?.name ?? "—"}
                                {d.owner?.phone ? ` · ${d.owner.phone}` : ""}
                              </p>
                            </div>
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                              style={{ background: `${statusColor}22`, color: statusColor }}
                            >
                              {statusLabel}
                            </span>
                          </div>

                          {/* Editable fields */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">
                                {t.contractValue} ({t.sar})
                              </label>
                              <input
                                type="number"
                                min="0"
                                placeholder={t.enterValue}
                                defaultValue={d.contract_value ?? ""}
                                onChange={(e) =>
                                  setDealEdits((p) => ({
                                    ...p,
                                    [d.id]: { ...p[d.id], contract_value: e.target.value },
                                  }))
                                }
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">{t.signedAt}</label>
                              <input
                                type="date"
                                defaultValue={d.signed_at ? d.signed_at.slice(0, 10) : ""}
                                onChange={(e) =>
                                  setDealEdits((p) => ({
                                    ...p,
                                    [d.id]: { ...p[d.id], signed_at: e.target.value },
                                  }))
                                }
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={dealMutation.isPending}
                              onClick={() =>
                                dealMutation.mutate({
                                  id: d.id,
                                  contract_value: edit.contract_value,
                                  signed_at: edit.signed_at,
                                })
                              }
                            >
                              {t.saveDeal}
                            </Button>
                            {d.status !== "closed" && (
                              <Button
                                size="sm"
                                className="text-white"
                                style={{ background: "var(--ok)", color: "var(--navy-2)" }}
                                disabled={dealMutation.isPending}
                                onClick={() =>
                                  dealMutation.mutate({
                                    id: d.id,
                                    status: "closed",
                                    contract_value: edit.contract_value,
                                    signed_at:
                                      edit.signed_at ||
                                      (d.signed_at ? d.signed_at.slice(0, 10) : new Date().toISOString().slice(0, 10)),
                                  })
                                }
                              >
                                <CheckCircle2 className="h-3 w-3 me-1" />
                                {t.markClosed}
                              </Button>
                            )}
                            {d.status !== "cancelled" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={dealMutation.isPending}
                                onClick={() => dealMutation.mutate({ id: d.id, status: "cancelled" })}
                              >
                                <XCircle className="h-3 w-3 me-1" />
                                {t.markCancelled}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
