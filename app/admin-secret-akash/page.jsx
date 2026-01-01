/**
 * Super Admin Dashboard
 * Full control panel for Akash only
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { SuperAdminDashboard } from '@/components/admin/SuperAdminDashboard';

import './admin.css';

async function fetchJSON(url, opts) {
  const r = await fetch(url, opts);
  const j = await r.json().catch(() => null);
  return { r, j };
}

export default function SuperAdminPage() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { r, j } = await fetchJSON('/api/admin/verify');
        if (!mounted) return;
        setAuthed(Boolean(r.ok && j?.authenticated));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogin(password) {
    const { r, j } = await fetchJSON('/api/admin/login', {
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

    setAuthed(true);
    return { ok: true };
  }

  async function handleLogout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
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
