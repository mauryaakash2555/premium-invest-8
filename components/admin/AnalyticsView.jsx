/**
 * FILE: components/admin/AnalyticsView.jsx
 * PURPOSE: Show admin analytics response.
 * CATEGORY: admin
 *
 * SIMPLE EXPLANATION:
 * This shows counts like visitors, leads, and conversion.
 */

'use client';

export function AnalyticsView({ analytics }) {
  if (!analytics) {
    return <div style={{ marginTop: 22, opacity: 0.75 }}>Analytics not available (not authorized or not configured).</div>;
  }

  return (
    <div style={{ marginTop: 22 }}>
      <h2 style={{ color: '#C0A062', fontSize: 18 }}>Analytics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 12 }}>
        <Stat label="Visitors (today)" value={analytics?.today?.visitors ?? 0} />
        <Stat label="Conversations" value={analytics?.today?.conversations_started ?? 0} />
        <Stat label="Leads" value={analytics?.today?.leads_captured ?? 0} />
        <Stat label="Conversion" value={(analytics?.today?.conversion_rate ?? 0) + '%'} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
      <div style={{ fontSize: 11, opacity: 0.65, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 22, fontWeight: 900, color: '#C0A062' }}>{value}</div>
    </div>
  );
}
