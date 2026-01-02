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
  const aiToday = analytics?.today?.ai || null;
  const aiMonth = analytics?.month?.ai || null;

  const fmtNum = (n) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return '0';
    try {
      return x.toLocaleString('en-IN');
    } catch {
      return String(x);
    }
  };

  const topProviders = (obj) => {
    const entries = Object.entries(obj || {}).filter(([, v]) => Number(v) > 0);
    entries.sort((a, b) => Number(b[1]) - Number(a[1]));
    return entries.slice(0, 4);
  };

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
          AI Usage
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 10 }}>
          <Stat label="Tokens used (today)" value={fmtNum(aiToday?.tokens_total ?? 0)} />
          <Stat label="Tokens used (month)" value={fmtNum(aiMonth?.tokens_total ?? 0)} />
        </div>

        <div style={{ marginTop: 10, opacity: 0.9, fontSize: 13 }}>
          <div style={{ opacity: 0.75, marginBottom: 6 }}>Top providers (today):</div>
          {topProviders(aiToday?.tokens_by_provider).length ? (
            <div>
              {topProviders(aiToday?.tokens_by_provider).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: 800 }}>{k}</div>
                  <div style={{ color: '#C0A062', fontWeight: 900 }}>{fmtNum(v)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ opacity: 0.65 }}>No token usage events yet.</div>
          )}
        </div>

        <div style={{ marginTop: 10, opacity: 0.65, fontSize: 12 }}>
          Note: This is app-tracked token usage (from provider responses when available). Provider billing/credits remaining requires separate billing APIs + keys.
        </div>
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
