/**
 * FILE: components/admin/AdminDashboard.jsx
 * PURPOSE: Admin dashboard page UI (wrapper).
 * CATEGORY: admin
 *
 * SIMPLE EXPLANATION:
 * Admin can see leads and analytics.
 * This component is the main container for admin views.
 */

'use client';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { LeadsList } from '@/components/admin/LeadsList';
import { AnalyticsView } from '@/components/admin/AnalyticsView';
import { fetchAdminJSON } from '@/lib/auth/adminTokenClient';

export function AdminDashboard() {
  const [tab, setTab] = useState('summary');
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setBusy(true);
      try {
        const { r, j } = await fetchAdminJSON('/api/admin/summary');
        if (mounted) setSummary(r.ok && j?.ok ? j : null);
      } finally {
        if (mounted) setBusy(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function loadAnalytics() {
    setBusy(true);
    try {
      const { r, j } = await fetchAdminJSON('/api/admin/analytics');
      setAnalytics(r.ok && j?.ok ? j : null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '120px 16px 60px', color: '#fff' }}>
      <h1 style={{ color: 'var(--lux-accent)', fontFamily: '"Playfair Display", serif' }}>Admin</h1>

      <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
        <button onClick={() => setTab('summary')} style={btnStyle(tab === 'summary')}>Summary</button>
        <button
          onClick={async () => { setTab('analytics'); if (!analytics) await loadAnalytics(); }}
          style={btnStyle(tab === 'analytics')}
        >
          Analytics
        </button>
      </div>

      <div style={{ marginTop: 18 }}>
        {busy ? <LoadingSpinner label="Loading admin data..." /> : null}
      </div>

      {tab === 'summary' ? <LeadsList summary={summary} /> : null}
      {tab === 'analytics' ? <AnalyticsView analytics={analytics} /> : null}

      {!busy && !summary && tab === 'summary' ? (
        <div style={{ marginTop: 18, opacity: 0.75 }}>Not authorized or not configured.</div>
      ) : null}
    </div>
  );
}

function btnStyle(active) {
  return {
    padding: '10px 14px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.10)',
    background: active ? 'color-mix(in oklab, var(--lux-accent) 15%, transparent)' : 'rgba(255,255,255,0.04)',
    color: active ? 'var(--lux-accent)' : 'rgba(255,255,255,0.85)',
    cursor: 'pointer',
  };
}
