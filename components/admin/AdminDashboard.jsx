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
        const r = await fetch('/api/admin/summary');
        const j = await r.json().catch(() => null);
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
      const r = await fetch('/api/admin/analytics');
      const j = await r.json().catch(() => null);
      setAnalytics(r.ok && j?.ok ? j : null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '120px 16px 60px', color: '#fff' }}>
      <h1 style={{ color: '#C0A062', fontFamily: '"Playfair Display", serif' }}>Admin</h1>

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
    background: active ? 'rgba(192,160,98,0.15)' : 'rgba(255,255,255,0.04)',
    color: active ? '#C0A062' : 'rgba(255,255,255,0.85)',
    cursor: 'pointer',
  };
}
