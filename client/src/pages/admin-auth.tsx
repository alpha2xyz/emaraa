import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';

interface AdminAuthProps {
  children: React.ReactNode;
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const [, setLocation] = useLocation();
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verifySession() {
      const role = localStorage.getItem('userRole');
      const token = localStorage.getItem('adminSessionToken');

      if (role !== 'admin' || !token) {
        setLocation('/admin');
        return;
      }

      // Live DB verification — token must exist and not be expired in Supabase
      const { data: valid, error } = await supabase
        .rpc('verify_admin_session', { p_token: token });

      if (error || !valid) {
        localStorage.removeItem('userRole');
        localStorage.removeItem('adminId');
        localStorage.removeItem('adminSessionToken');
        setLocation('/admin');
        return;
      }

      setVerified(true);
      setChecking(false);
    }

    verifySession();
  }, [setLocation]);

  if (checking || !verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-slate-400 text-sm">جارٍ التحقق من الجلسة…</p>
      </div>
    );
  }

  return <>{children}</>;
}
