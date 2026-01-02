/**
 * Super Admin Dashboard
 * Full control panel for Akash only
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { SuperAdminDashboard } from '@/components/admin/SuperAdminDashboard';
import { clearAdminToken, setAdminToken, fetchAdminJSON } from '@/lib/auth/adminTokenClient';

import './admin.css';

export default function SuperAdminPage() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { r, j } = await fetchAdminJSON('/api/admin/verify');
        if (!mounted) return;
        setAuthed(Boolean(r.ok && j?.authenticated));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function handleLogin(password) {
    const { r, j } = await fetchAdminJSON('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (r.status === 429 && j?.error === 'locked') {
      return { lockedForSeconds: Number(j?.retryAfterSeconds) || 300 };
    }

    if (!r.ok) {
      throw new Error(r.status === 401 ? 'Wrong password' : 'Login failed');
    }

    if (j?.token) setAdminToken(j.token);

    setAuthed(true);
    return { ok: true };
  }

  async function handleLogout() {
    try {
      await fetchAdminJSON('/api/admin/logout', { method: 'POST' });
    } catch {}
    clearAdminToken();
    setAuthed(false);
    router.push('/');
  }

  if (loading) return <div className="sa-loading">Loading…</div>;

  if (!authed) {
    return (
      <AdminLogin
        onLogin={handleLogin}
        title="🎛️ Akash's Control Panel"
        subtitle="Super Admin Access"
      />
    );
  }

  return <SuperAdminDashboard onLogout={handleLogout} />;
}
