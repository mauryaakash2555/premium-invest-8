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

const SOURCE_OPTIONS = ['All Sources', 'blueprint', 'homepage', 'blog', 'other'];

function formatDateIST(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

function isRealLead(source) {
  const s = (source || '').toLowerCase();
  return s === 'blueprint' || s === 'homepage';
}

export function LeadsList({ summary }) {
  const initialLeads = useMemo(() => summary?.all?.leads || [], [summary]);
  const [filter, setFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('All Sources');
  const [leads, setLeads] = useState(initialLeads);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
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
          setError(j?.error || `HTTP ${r.status}`);
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

  const displayLeads = useMemo(() => {
    let list = [...leads];
    // Sort newest first
    list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    // Source filter
    if (sourceFilter !== 'All Sources') {
      if (sourceFilter === 'other') {
        list = list.filter((l) => {
          const s = (l.source || '').toLowerCase();
          return s && !['blueprint', 'homepage', 'blog'].includes(s);
        });
      } else {
        list = list.filter((l) => (l.source || '').toLowerCase() === sourceFilter);
      }
    }
    return list.slice(0, 200);
  }, [leads, sourceFilter]);

  return (
    <div style={{ marginTop: 22 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ color: 'var(--lux-accent)', fontSize: 18, margin: 0 }}>Leads</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} style={selectStyle} aria-label="Source filter">
            {SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s} style={optionStyle}>{s}</option>
            ))}
          </select>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={selectStyle} aria-label="Lead time filter">
            <option value="today" style={optionStyle}>Today</option>
            <option value="yesterday" style={optionStyle}>Yesterday</option>
            <option value="week" style={optionStyle}>This Week</option>
            <option value="month" style={optionStyle}>This Month</option>
            <option value="year" style={optionStyle}>This Year</option>
            <option value="all" style={optionStyle}>All Time</option>
          </select>
        </div>
      </div>

      {/* Lead count */}
      {!loading && leads.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.50)' }}>
          Showing {displayLeads.length} lead{displayLeads.length !== 1 ? 's' : ''}
        </div>
      )}

      {loading ? <div style={{ marginTop: 8, opacity: 0.7 }}>Loading…</div> : null}
      {!loading && error ? <div style={{ marginTop: 8, opacity: 0.7 }}>Could not load leads ({String(error)}).</div> : null}
      {!loading && !error && leads.length === 0 ? <div style={{ opacity: 0.7 }}>No leads yet.</div> : null}

      <div style={{ marginTop: 10, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Phone</th>
              <th style={th}>Interest</th>
              <th style={th}>Source</th>
              <th style={th}>Status</th>
              <th style={th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {displayLeads.map((l) => {
              const real = isRealLead(l.source);
              return (
                <tr key={l.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', ...(real ? { borderLeft: '2px solid var(--lux-accent)' } : {}) }}>
                  <td style={td}>{l.name || 'Anonymous'}</td>
                  <td style={td}>{l.email || '—'}</td>
                  <td style={td}>{l.phone || '—'}</td>
                  <td style={td}>{l.interest || '—'}</td>
                  <td style={td}>
                    {real ? <span style={badgeStyle}>{l.source}</span> : (l.source || '—')}
                  </td>
                  <td style={td}>{l.status || '—'}</td>
                  <td style={td}>{formatDateIST(l.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = { textAlign: 'left', padding: '10px 12px', fontSize: 12, color: 'rgba(255,255,255,0.72)', whiteSpace: 'nowrap' };
const td = { textAlign: 'left', padding: '10px 12px', fontSize: 13, color: 'rgba(255,255,255,0.90)', whiteSpace: 'nowrap' };

const badgeStyle = {
  display: 'inline-block',
  padding: '2px 8px',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.05em',
  color: 'var(--lux-accent)',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.04)',
  borderRadius: 6,
};

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
