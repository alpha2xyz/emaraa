import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Users, Building2, FileText, LogOut, CheckCircle2, XCircle, Clock, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLang } from '../hooks/use-lang';
import { supabase } from '../lib/supabase';
import { LanguageToggle } from '../components/LanguageToggle';

export default function AdminDashboard() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const isRTL = lang === 'ar';

  const t = lang === 'ar'
    ? { title: 'لوحة الإدارة', users: 'المستخدمون', properties: 'العقارات', requests: 'الطلبات', providers: 'مزودو الخدمة', pendingApproval: 'بانتظار الموافقة', approve: 'موافقة', reject: 'رفض', logout: 'تسجيل خروج', loading: 'جارٍ التحميل…', company: 'الشركة', city: 'المدينة', noProviders: 'لا توجد طلبات معلقة', allRequests: 'جميع الطلبات', allUsers: 'جميع المستخدمين', status: { pending: 'معلق', inprogress: 'قيد التنفيذ', completed: 'مكتمل', cancelled: 'ملغي' } }
    : { title: 'Admin Dashboard', users: 'Users', properties: 'Properties', requests: 'Requests', providers: 'Service Providers', pendingApproval: 'Pending Approval', approve: 'Approve', reject: 'Reject', logout: 'Logout', loading: 'Loading…', company: 'Company', city: 'City', noProviders: 'No pending providers', allRequests: 'All Requests', allUsers: 'All Users', status: { pending: 'Pending', inprogress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' } };

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

  const { data: pendingProviders, isLoading } = useQuery({
    queryKey: ['admin', 'pending-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('providers')
        .select('id, companyname, city, created_at, userid, users(name, phone)')
        .eq('approved', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: recentRequests } = useQuery({
    queryKey: ['admin', 'recent-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requests')
        .select('id, servicecategory, status, created_at, properties(name, city)')
        .order('created_at', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });

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
    setLocation('/admin');
  }

  const statCards = [
    { label: t.users, value: stats?.users ?? 0, icon: Users, color: 'text-blue-600' },
    { label: t.properties, value: stats?.properties ?? 0, icon: Building2, color: 'text-green-600' },
    { label: t.requests, value: stats?.requests ?? 0, icon: FileText, color: 'text-purple-600' },
    { label: t.providers, value: stats?.providers ?? 0, icon: Shield, color: 'text-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
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

      <div className="container mx-auto p-6 space-y-6">
        {/* Stats */}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Provider Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />{t.pendingApproval}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <p className="text-muted-foreground text-center py-4">{t.loading}</p>
                : !pendingProviders?.length ? <p className="text-muted-foreground text-center py-4">{t.noProviders}</p>
                : <div className="space-y-3">
                  {pendingProviders.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                      <div>
                        <p className="font-medium">{p.companyname}</p>
                        <p className="text-sm text-muted-foreground">{p.city} · {(p.users as any)?.name} · {(p.users as any)?.phone}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={() => approveMutation.mutate({ id: p.id, approved: true })}>
                          <CheckCircle2 className="h-3 w-3 me-1" />{t.approve}
                        </Button>
                        <Button size="sm" variant="destructive" className="h-8" onClick={() => approveMutation.mutate({ id: p.id, approved: false })}>
                          <XCircle className="h-3 w-3 me-1" />{t.reject}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>}
            </CardContent>
          </Card>

          {/* Recent Requests */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-purple-500" />{t.allRequests}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentRequests?.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between p-2 border rounded bg-white">
                    <div>
                      <p className="text-sm font-medium">{(r.properties as any)?.name}</p>
                      <p className="text-xs text-muted-foreground">{(r.properties as any)?.city} · {r.servicecategory}</p>
                    </div>
                    <Badge variant={r.status === 'completed' ? 'default' : r.status === 'pending' ? 'secondary' : 'outline'}>
                      {t.status[r.status as keyof typeof t.status] ?? r.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}