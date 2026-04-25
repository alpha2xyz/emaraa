import { useState } from 'react';
import { useLocation } from 'wouter';
import { Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LanguageToggle } from '../components/LanguageToggle';
import { useLang } from '../hooks/use-lang';
import { supabase } from '../lib/supabase';

export default function AdminLoginPage() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const isRTL = lang === 'ar';

  const t = lang === 'ar'
    ? { title: 'لوحة الإدارة', subtitle: 'مخصصة للمسؤولين فقط', user: 'اسم المستخدم', pass: 'كلمة المرور', login: 'تسجيل الدخول', loading: 'جارٍ الدخول…', back: 'الرجوع للرئيسية', invalid: 'اسم المستخدم أو كلمة المرور غير صحيحة' }
    : { title: 'Admin Login', subtitle: 'Restricted to administrators only', user: 'Username', pass: 'Password', login: 'Login', loading: 'Logging in…', back: 'Back to Home', invalid: 'Invalid username or password' };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .rpc('check_admin_login', { p_username: username.trim(), p_password: password });
      const admin = data?.[0] ?? null;
      if (dbError || !admin) { setError(t.invalid); return; }

      // Generate a real server-side session token — stored in DB with 24h expiry
      const { data: token, error: tokenError } = await supabase
        .rpc('create_admin_session', { p_admin_id: admin.id });
      if (tokenError || !token) { setError(t.invalid); return; }

      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('adminId', admin.id);
      localStorage.setItem('adminSessionToken', token);
      setLocation('/admin/dashboard');
    } catch {
      setError(t.invalid);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-enter min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute top-4 end-4"><LanguageToggle className="text-slate-300" /></div>
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-600/20 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <CardTitle className="text-2xl text-white">{t.title}</CardTitle>
          <CardDescription className="text-slate-400">{t.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-200">{t.user}</Label>
              <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="username" required className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">{t.pass}</Label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="bg-slate-700/50 border-slate-600 text-white pr-10" />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 end-0 flex items-center px-3 text-slate-400 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? t.loading : t.login}</Button>
            <Button type="button" variant="ghost" className="w-full text-slate-400 hover:text-white" onClick={() => setLocation('/')}>
              <ArrowLeft className="w-4 h-4 me-2" />{t.back}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}