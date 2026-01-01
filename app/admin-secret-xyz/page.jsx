/**
 * FILE: app/admin-secret-xyz/page.jsx
 * PURPOSE: Hidden admin page (login + dashboard).
 * CATEGORY: app
 *
 * SIMPLE EXPLANATION:
 * This page is not linked from the main site.
 * Admin enters a password, then sees the dashboard.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminSecretXYZPage() {
  const passwordRef = useRef(null);
  const [authed, setAuthed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 🔵 Quick auth check (will work only if cookie is present)
    let mounted = true;
    (async () => {
      try {
        const r = await fetch('/api/admin/summary');
        const j = await r.json().catch(() => null);
        if (!mounted) return;
        setAuthed(Boolean(r.ok && j?.ok));
      } catch {
        if (!mounted) return;
        setAuthed(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function login(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    const password = String(passwordRef.current?.value || '');

    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!r.ok) {
        setError(r.status === 401 ? 'Wrong password' : 'Login failed');
        setAuthed(false);
        return;
      }

      setAuthed(true);
    } catch {
      setError('Login failed');
      setAuthed(false);
    } finally {
      setBusy(false);
    }
  }

  if (authed) return <AdminDashboard />;

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '120px 16px 60px', color: '#fff' }}>
      <h1 style={{ color: '#C0A062', fontFamily: '"Playfair Display", serif' }}>Admin Login</h1>
      <p style={{ marginTop: 10, opacity: 0.75 }}>
        Enter the admin password to see the dashboard.
      </p>

      <form onSubmit={login} style={{ marginTop: 18, display: 'grid', gap: 10 }}>
        <input
          ref={passwordRef}
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          style={{
            padding: '12px 14px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(255,255,255,0.05)',
            color: '#fff',
            outline: 'none',
          }}
        />

        <button
          type="submit"
          disabled={busy}
          style={{
            padding: '12px 14px',
            borderRadius: 12,
            border: '1px solid rgba(192,160,98,0.35)',
            background: busy ? 'rgba(192,160,98,0.12)' : 'rgba(192,160,98,0.18)',
            color: '#C0A062',
            cursor: busy ? 'not-allowed' : 'pointer',
            fontWeight: 700,
          }}
        >
          {busy ? 'Logging in...' : 'Login'}
        </button>

        {error ? <div style={{ color: '#ffb4b4' }}>{error}</div> : null}
      </form>

      <div style={{ marginTop: 18, opacity: 0.55, fontSize: 12 }}>
        Tip: In production this is protected by a secure admin cookie.
      </div>
    </div>
  );
}
