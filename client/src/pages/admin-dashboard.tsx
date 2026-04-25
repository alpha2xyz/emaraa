import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import {
  Users, Building2, FileText, LogOut, CheckCircle2, XCircle,
  Clock, Shield, ExternalLink, ChevronDown, ChevronUp, Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLang } from '../hooks/use-lang';
import { supabase } from '../lib/supabase';
import { openSignedPdf } from '../lib/storage';
import { LanguageToggle } from '../components/LanguageToggle';

export default function AdminDashboard() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const isRTL = lang === 'ar';
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  const t = lang === 'ar'
    ? {
        title: 'لوحة الإدارة',
        overview: 'نظرة عامة',
        users: 'المستخدمون',
        properties: 'العقارات',
        requests: 'الطلبات',
        providers: 'مزودو الخدمة',
        approve: 'موافقة',
        reject: 'رفض',
        logout: 'تسجيل خروج',
        loading: 'جارٍ التحميل…',
        noData: 'لا توجد بيانات',
        name: 'الاسم',
        phone: 'الجوال',
        date: 'التاريخ',
        company: 'الشركة',
        city: 'المدينة',
        status: 'الحالة',
        approved: 'مقبول',
        pending: 'قيد المراجعة',
        owner: 'المالك',
        buildingType: 'نوع المبنى',
        units: 'الوحدات',
        category: 'الفئة',
        offers: 'العروض',
        viewPdf: 'عرض PDF',
        crDoc: 'السجل التجاري',
        profileDoc: 'بروفايل الشركة',
        noOffers: 'لا توجد عروض',
        offerStatus: { pending: 'قيد المراجعة', accepted: 'مقبول', rejected: 'مرفوض' },
        reqStatus: { pending: 'معلق', in_progress: 'قيد التنفيذ', completed: 'مكتمل', cancelled: 'ملغي' },
        cleaning: 'نظافة',
        maintenance: 'صيانة',
        notes: 'ملاحظات',
      }
    : {
        title: 'Admin Dashboard',
        overview: 'Overview',
        users: 'Users',
        properties: 'Properties',
        requests: 'Requests',
        providers: 'Providers',
        approve: 'Approve',
        reject: 'Reject',
        logout: 'Logout',
        loading: 'Loading…',
        noData: 'No data',
        name: 'Name',
        phone: 'Phone',
        date: 'Date',
        company: 'Company',
        city: 'City',
        status: 'Status',
        approved: 'Approved',
        pending: 'Pending',
        owner: 'Owner',
        buildingType: 'Building Type',
        units: 'Units',
        category: 'Category',
        offers: 'Offers',
        viewPdf: 'View PDF',
        crDoc: 'Commercial Register',
        profileDoc: 'Company Profile',
        noOffers: 'No offers',
        offerStatus: { pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected' },
        reqStatus: { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' },
        cleaning: 'Cleaning',
        maintenance: 'Maintenance',
        notes: 'Notes',
      };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const [users, properties, requests, providers] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('requests').select('id', { count: 'exact', head: true }),
        supabase.from('providers').select('id', { count: 'exact', head: true }),
      ]);
      return { users: users.count ?? 0, properties: properties.count ?? 0, requests: requests.count ?? 0, providers: providers.count ?? 0 };
    },
  });

  // ── Users (owners) ─────────────────────────────────────────────────────────
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, phone, role, created_at')
        .eq('role', 'owner')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // ── Providers ──────────────────────────────────────────────────────────────
  const { data: allProviders, isLoading: providersLoading } = useQuery({
    queryKey: ['admin', 'all-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('providers')
        .select('id, company_name, city, approved, created_at, commercial_register_url, company_profile_url, description, users(name, phone)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // ── Properties ─────────────────────────────────────────────────────────────
  const { data: allProperties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['admin', 'properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, city, building_type, units_count, created_at, users(name, phone)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // ── Requests + Offers ──────────────────────────────────────────────────────
  const { data: allRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['admin', 'requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requests')
        .select('id, service_category, status, created_at, description, properties(name, city, users(name, phone)), provider_offers(id, status, offer_file_url, notes, providers(company_name, city))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // ── Approve/Reject ─────────────────────────────────────────────────────────
  const approveMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase.from('providers').update({ approved }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  });

  function handleLogout() {
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminSessionToken');
    setLocation('/admin');
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  const statCards = [
    { label: t.users, value: stats?.users ?? 0, icon: Users, color: 'text-blue-600' },
    { label: t.properties, value: stats?.properties ?? 0, icon: Building2, color: 'text-green-600' },
    { label: t.requests, value: stats?.requests ?? 0, icon: FileText, color: 'text-purple-600' },
    { label: t.providers, value: stats?.providers ?? 0, icon: Shield, color: 'text-orange-600' },
  ];

  return (
    <div className="page-enter min-h-screen bg-slate-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold">{t.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle className="text-slate-300" />
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300">
            <LogOut className="w-4 h-4 me-2" />{t.logout}
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-4 sm:p-6">
        <Tabs defaultValue="overview">
          <TabsList className="flex flex-wrap h-auto gap-1 mb-6 bg-white border">
            <TabsTrigger value="overview">{t.overview}</TabsTrigger>
            <TabsTrigger value="providers">{t.providers}</TabsTrigger>
            <TabsTrigger value="users">{t.users}</TabsTrigger>
            <TabsTrigger value="properties">{t.properties}</TabsTrigger>
            <TabsTrigger value="requests">{t.requests}</TabsTrigger>
          </TabsList>

          {/* ── Overview ──────────────────────────────────────────────── */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map(({ label, value, icon: Icon, color }) => (
                <Card key={label}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="text-3xl font-bold">{value}</p>
                      </div>
                      <Icon className={`h-10 w-10 ${color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Providers ─────────────────────────────────────────────── */}
          <TabsContent value="providers">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-orange-500" />{t.providers}</CardTitle></CardHeader>
              <CardContent>
                {providersLoading ? <p className="text-center py-8 text-muted-foreground">{t.loading}</p>
                  : !allProviders?.length ? <p className="text-center py-8 text-muted-foreground">{t.noData}</p>
                  : <div className="space-y-3">
                    {allProviders.map((p: any) => (
                        <div key={p.id} className="p-4 border rounded-lg bg-white space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold">{p.company_name}</p>
                                <Badge variant={p.approved ? 'default' : 'secondary'} className={p.approved ? 'bg-green-100 text-gray-900' : 'bg-yellow-100 text-gray-900'}>
                                  {p.approved ? t.approved : t.pending}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{p.city}</p>
                              <p className="text-sm text-muted-foreground">{(p.users as any)?.name} · {(p.users as any)?.phone}</p>
                              {p.description && <p className="text-sm text-gray-600 mt-1">{p.description}</p>}
                              <p className="text-xs text-muted-foreground">{formatDate(p.created_at)}</p>
                            </div>
                            {!p.approved && (
                              <div className="flex gap-2 shrink-0">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={() => approveMutation.mutate({ id: p.id, approved: true })}>
                                  <CheckCircle2 className="h-3 w-3 me-1" />{t.approve}
                                </Button>
                                <Button size="sm" variant="destructive" className="h-8" onClick={() => approveMutation.mutate({ id: p.id, approved: false })}>
                                  <XCircle className="h-3 w-3 me-1" />{t.reject}
                                </Button>
                              </div>
                            )}
                          </div>
                          {(p.commercial_register_url || p.company_profile_url) && (
                            <div className="flex gap-2 flex-wrap pt-1 border-t">
                              {p.commercial_register_url && (
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => openSignedPdf('provider-documents', p.commercial_register_url)}>
                                  <ExternalLink className="h-3 w-3" />{t.crDoc}
                                </Button>
                              )}
                              {p.company_profile_url && (
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => openSignedPdf('provider-documents', p.company_profile_url)}>
                                  <ExternalLink className="h-3 w-3" />{t.profileDoc}
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                    ))}
                  </div>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Users ─────────────────────────────────────────────────── */}
          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-blue-500" />{t.users}</CardTitle></CardHeader>
              <CardContent>
                {usersLoading ? <p className="text-center py-8 text-muted-foreground">{t.loading}</p>
                  : !allUsers?.length ? <p className="text-center py-8 text-muted-foreground">{t.noData}</p>
                  : <div className="space-y-2">
                    {allUsers.map((u: any) => (
                      <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg bg-white gap-2">
                        <div>
                          <p className="font-medium">{u.name || '—'}</p>
                          <p className="text-sm text-muted-foreground">{u.phone}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(u.created_at)}</p>
                      </div>
                    ))}
                  </div>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Properties ────────────────────────────────────────────── */}
          <TabsContent value="properties">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-green-500" />{t.properties}</CardTitle></CardHeader>
              <CardContent>
                {propertiesLoading ? <p className="text-center py-8 text-muted-foreground">{t.loading}</p>
                  : !allProperties?.length ? <p className="text-center py-8 text-muted-foreground">{t.noData}</p>
                  : <div className="space-y-2">
                    {allProperties.map((p: any) => (
                      <div key={p.id} className="p-3 border rounded-lg bg-white space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(p.created_at)}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{p.city} · {p.building_type} {p.units_count ? `· ${p.units_count} ${isRTL ? 'وحدة' : 'units'}` : ''}</p>
                        <p className="text-sm text-muted-foreground">{t.owner}: {(p.users as any)?.name} · {(p.users as any)?.phone}</p>
                      </div>
                    ))}
                  </div>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Requests ──────────────────────────────────────────────── */}
          <TabsContent value="requests">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-purple-500" />{t.requests}</CardTitle></CardHeader>
              <CardContent>
                {requestsLoading ? <p className="text-center py-8 text-muted-foreground">{t.loading}</p>
                  : !allRequests?.length ? <p className="text-center py-8 text-muted-foreground">{t.noData}</p>
                  : <div className="space-y-2">
                    {allRequests.map((r: any) => {
                      const offers = r.provider_offers ?? [];
                      const isExpanded = expandedRequest === r.id;
                      return (
                        <div key={r.id} className="border rounded-lg bg-white overflow-hidden">
                          <button
                            className="w-full p-3 text-start hover:bg-gray-50 transition-colors"
                            onClick={() => setExpandedRequest(isExpanded ? null : r.id)}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium">{(r.properties as any)?.name}</p>
                                  <Badge variant="secondary" className="text-xs">
                                    {r.service_category === "standard"
                                      ? (lang === "ar" ? "نطاق الخدمات المطلوبة" : "Scope of Services")
                                      : (r.service_category === "cleaning" ? t.cleaning : t.maintenance)}
                                  </Badge>
                                  <Badge variant={r.status === 'completed' ? 'default' : 'outline'} className="text-xs">
                                    {t.reqStatus[r.status as keyof typeof t.reqStatus] ?? r.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{(r.properties as any)?.city} · {t.owner}: {(r.properties as any)?.users?.name}</p>
                                {r.description && <p className="text-xs text-gray-500">{r.description}</p>}
                                <p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge className="bg-purple-100 text-gray-900 text-xs">
                                  <Package className="h-3 w-3 me-1" />{offers.length} {t.offers}
                                </Badge>
                                {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                              </div>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="border-t bg-gray-50 p-3 space-y-2">
                              {offers.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-2">{t.noOffers}</p>
                              ) : offers.map((o: any) => (
                                <div key={o.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-white border rounded">
                                  <div className="space-y-0.5">
                                    <p className="text-sm font-medium">{o.providers?.company_name}</p>
                                    <p className="text-xs text-muted-foreground">{o.providers?.city}</p>
                                    {o.notes && <p className="text-xs text-gray-500">{t.notes}: {o.notes}</p>}
                                    <Badge variant="outline" className={`text-xs ${o.status === 'accepted' ? 'border-green-400 text-green-700' : o.status === 'rejected' ? 'border-red-400 text-red-700' : 'border-yellow-400 text-yellow-700'}`}>
                                      {t.offerStatus[o.status as keyof typeof t.offerStatus] ?? o.status}
                                    </Badge>
                                  </div>
                                  {o.offer_file_url && (
                                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 shrink-0" onClick={() => openSignedPdf('provider-offers', o.offer_file_url)}>
                                      <ExternalLink className="h-3 w-3" />{t.viewPdf}
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
