/**
 * FILE: components/admin/LeadsList.jsx
 * PURPOSE: Show leads list from admin summary response.
 * CATEGORY: admin
 *
 * SIMPLE EXPLANATION:
 * This shows the people (leads) who chatted with the site.
 */

'use client';

export function LeadsList({ summary }) {
  const leads = summary?.all?.leads || [];
  return (
    <div style={{ marginTop: 22 }}>
      <h2 style={{ color: '#C0A062', fontSize: 18 }}>Leads</h2>
      {leads.length === 0 ? <div style={{ opacity: 0.7 }}>No leads yet.</div> : null}
      <div style={{ marginTop: 10, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Phone</th>
              <th style={th}>Captured</th>
            </tr>
          </thead>
          <tbody>
            {leads.slice(0, 200).map((l) => (
              <tr key={l.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <td style={td}>{l.name || 'Anonymous'}</td>
                <td style={td}>{l.email || '-'}</td>
                <td style={td}>{l.phone || '-'}</td>
                <td style={td}>{String(l.created_at || '').slice(0, 19).replace('T', ' ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = { textAlign: 'left', padding: '10px 12px', fontSize: 12, color: 'rgba(255,255,255,0.72)' };
const td = { textAlign: 'left', padding: '10px 12px', fontSize: 13, color: 'rgba(255,255,255,0.90)' };
