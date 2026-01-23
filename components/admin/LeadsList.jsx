/**
 * FILE: components/admin/LeadsList.jsx
 * PURPOSE: Show leads list from admin summary response.
 * CATEGORY: admin
 *
 * SIMPLE EXPLANATION:
 * This shows the people (leads) who chatted with the site.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchAdminJSON } from '@/lib/auth/adminTokenClient';

export function LeadsList({ summary }) {
  const initialLeads = useMemo(() => summary?.all?.leads || [], [summary]);
  const [filter, setFilter] = useState('all');
  const [leads, setLeads] = useState(initialLeads);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Keep something visible immediately while fetching.
    setLeads(initialLeads);
  }, [initialLeads]);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const { r, j } = await fetchAdminJSON(`/api/admin/leads?filter=${encodeURIComponent(filter)}`,
          { signal: controller.signal }
        );
        if (!alive) return;
        if (!r.ok || !j?.ok) {
          setError(j?.error || 'failed');
          return;
        }
        setLeads(Array.isArray(j.leads) ? j.leads : []);
      } catch (e) {
        if (!alive) return;
        const msg = String(e?.name || '').toLowerCase() === 'aborterror' ? null : String(e?.message || 'failed');
        if (msg) setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [filter]);

  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <h2 style={{ color: 'var(--lux-accent)', fontSize: 18, margin: 0 }}>Leads</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={selectStyle} aria-label="Lead time filter">
          <option value="today" style={optionStyle}>Today</option>
          <option value="yesterday" style={optionStyle}>Yesterday</option>
          <option value="week" style={optionStyle}>This Week</option>
          <option value="month" style={optionStyle}>This Month</option>
          <option value="year" style={optionStyle}>This Year</option>
          <option value="all" style={optionStyle}>All Time</option>
        </select>
      </div>
      {loading ? <div style={{ marginTop: 8, opacity: 0.7 }}>Loading…</div> : null}
      {!loading && error ? <div style={{ marginTop: 8, opacity: 0.7 }}>Could not load leads ({String(error)}).</div> : null}
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

const selectStyle = {
  background: '#111214',
  border: '1px solid rgba(255,255,255,0.10)',
  color: '#ffffff',
  borderRadius: 10,
  padding: '8px 10px',
  fontSize: 13,
};

const optionStyle = {
  background: '#111214',
  color: '#ffffff',
};
