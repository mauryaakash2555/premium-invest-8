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

  const pitches = analytics?.week?.pitch_performance || [];

  return (
    <div style={{ marginTop: 22 }}>
      <h2 style={{ color: '#C0A062', fontSize: 18 }}>Analytics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 12 }}>
        <Stat label="Visitors (today)" value={analytics?.today?.visitors ?? 0} />
        <Stat label="Conversations" value={analytics?.today?.conversations_started ?? 0} />
        <Stat label="Leads" value={analytics?.today?.leads_captured ?? 0} />
        <Stat label="Conversion" value={(analytics?.today?.conversion_rate ?? 0) + '%'} />
      </div>

      <div style={{ marginTop: 18 }}>
        <h3 style={{ color: '#C0A062', fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Product Pitch Performance (Week)
        </h3>

        {pitches.length ? (
          <div style={{ marginTop: 10, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', opacity: 0.7 }}>
                  <th style={{ padding: '8px 6px' }}>Pitch</th>
                  <th style={{ padding: '8px 6px' }}>Shown</th>
                  <th style={{ padding: '8px 6px' }}>Clicked</th>
                  <th style={{ padding: '8px 6px' }}>Conversion</th>
                </tr>
              </thead>
              <tbody>
                {pitches.map((p) => (
                  <tr key={p.pitch} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '10px 6px', fontWeight: 800 }}>{p.pitch}</td>
                    <td style={{ padding: '10px 6px' }}>{p.shown}</td>
                    <td style={{ padding: '10px 6px' }}>{p.clicked}</td>
                    <td style={{ padding: '10px 6px' }}>{p.conversion_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ marginTop: 10, opacity: 0.65 }}>No pitch events yet this week.</div>
        )}
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
