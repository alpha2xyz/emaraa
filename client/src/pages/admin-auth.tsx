/**
 * admin-auth.tsx  — Admin route guard
 *
 * Wraps any admin-only page. Reads the admin session stored in
 * localStorage (set by admin-login-page after successful Supabase auth).
 * Redirects to /admin if the session is missing.
 */
import React, { useEffect } from 'react';
import { useLocation } from 'wouter';

interface AdminAuthProps {
  children: React.ReactNode;
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const isAdmin =
      localStorage.getItem('userRole') === 'admin' &&
      !!localStorage.getItem('adminId');

    if (!isAdmin) {
      setLocation('/admin');
    }
  }, [setLocation]);

  const isAdmin =
    localStorage.getItem('userRole') === 'admin' &&
    !!localStorage.getItem('adminId');

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-slate-400 text-sm">Redirecting to admin login…</p>
      </div>
    );
  }

  return <>{children}</>;
}
