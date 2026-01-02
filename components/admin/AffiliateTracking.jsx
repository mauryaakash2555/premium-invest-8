'use client';

import { useEffect, useMemo, useState } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { fetchAdminJSON } from '@/lib/auth/adminTokenClient';

function fmtINR(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return '₹0';
  return x.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

function fmtPct(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return '0%';
  return `${x}%`;
}

function fmtDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

export function AffiliateTracking() {
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState(null);
  const [edit, setEdit] = useState(null); // { id, platform, affiliate_url, placeholder }
  const [editUrl, setEditUrl] = useState('');
  const [editBusy, setEditBusy] = useState(false);

  async function loadStats() {
    setBusy(true);
    try {
      const { r, j } = await fetchAdminJSON('/api/admin/affiliate-stats');
      setStats(r.ok && j?.ok ? j : null);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void loadStats();
  }, []);

  const platforms = useMemo(() => stats?.platforms || [], [stats]);
  const pendingClicks = useMemo(() => stats?.pendingClicks || [], [stats]);

  async function toggleActive(p) {
    if (!p?.id) return;
    setBusy(true);
    try {
      await fetchAdminJSON('/api/admin/affiliate-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: p.id, is_active: !p.is_active }),
      });
      await loadStats();
    } finally {
      setBusy(false);
    }
  }

  async function markConverted(clickId, amount) {
    if (!clickId) return;
    setBusy(true);
    try {
      await fetchAdminJSON('/api/admin/affiliate-convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clickId, amount }),
      });
      await loadStats();
    } finally {
      setBusy(false);
    }
  }

  async function markFailed(clickId) {
    if (!clickId) return;
    setBusy(true);
    try {
      await fetchAdminJSON('/api/admin/affiliate-fail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clickId }),
      });
      await loadStats();
    } finally {
      setBusy(false);
    }
  }

  function startEdit(p) {
    setEdit(p);
    setEditUrl(String(p?.affiliate_url || ''));
  }

  async function saveEdit() {
    if (!edit?.id) return;
    const url = String(editUrl || '').trim();
    if (!url) return;

    setEditBusy(true);
    try {
      await fetchAdminJSON('/api/admin/affiliate-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: edit.id,
          affiliate_url: url,
          placeholder: false,
          is_active: true,
        }),
      });
      setEdit(null);
      setEditUrl('');
      await loadStats();
    } finally {
      setEditBusy(false);
    }
  }

  if (!stats && busy) {
    return (
      <div style={{ marginTop: 12 }}>
        <LoadingSpinner label="Loading affiliate stats…" />
      </div>
    );
  }

  if (!stats) {
    return <div className="sa-muted">Affiliate stats unavailable (check Supabase setup + schema).</div>;
  }

  return (
    <div>
      <div className="sa-panelHead">
        <div className="sa-panelTitle">AFFILIATE PERFORMANCE</div>
        <button className="sa-miniBtn" onClick={() => void loadStats()} disabled={busy}>
          {busy ? '…' : 'Refresh'}
        </button>
      </div>

      <div className="sa-stats" style={{ marginTop: 12 }}>
        <div className="sa-card">
          <div className="sa-cardLabel">TOTAL CLICKS</div>
          <div className="sa-cardValue">{stats.totalClicks}</div>
          <div className="sa-cardSub">+{stats.clicksToday} today</div>
        </div>
        <div className="sa-card">
          <div className="sa-cardLabel">CONVERSIONS</div>
          <div className="sa-cardValue">{stats.conversions}</div>
          <div className="sa-cardSub">{fmtPct(stats.conversionRate)} rate</div>
        </div>
        <div className="sa-card">
          <div className="sa-cardLabel">EST. EARNINGS</div>
          <div className="sa-cardValue">{fmtINR(stats.earnings)}</div>
          <div className="sa-cardSub">+{fmtINR(stats.earningsToday)} today</div>
        </div>
      </div>

      <div className="sa-panel" style={{ marginTop: 14 }}>
        <div className="sa-panelHead">
          <div className="sa-panelTitle">PLATFORMS</div>
        </div>

        <div className="sa-adminTableWrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Platform</th>
                <th>Status</th>
                <th>Clicks</th>
                <th>Conversions</th>
                <th>Rate</th>
                <th>Earnings</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {platforms.map((p) => (
                <tr key={p.platform}>
                  <td>
                    {p.platform}
                    {p.placeholder ? <span className="sa-chip" style={{ marginLeft: 8 }}>Placeholder</span> : null}
                  </td>
                  <td>{p.is_active ? '✅ Active' : '❌ Inactive'}</td>
                  <td>{p.clicks}</td>
                  <td>{p.conversions}</td>
                  <td>{fmtPct(p.conversion_rate)}</td>
                  <td>{fmtINR(p.earnings)}</td>
                  <td>
                    <button className="sa-miniBtn" onClick={() => startEdit(p)}>
                      Edit
                    </button>{' '}
                    <button className="sa-miniBtn" onClick={() => void toggleActive(p)}>
                      {p.is_active ? 'Pause' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {!platforms.length ? (
                <tr>
                  <td colSpan={7} className="sa-muted">No affiliate links yet. Run seed script to add placeholders.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sa-panel" style={{ marginTop: 14 }}>
        <div className="sa-panelHead">
          <div className="sa-panelTitle">PENDING CONVERSIONS (VERIFY)</div>
        </div>

        {pendingClicks.length ? (
          <div className="sa-list">
            {pendingClicks.map((c) => (
              <div className="sa-row" key={c.id}>
                <div>
                  <div className="sa-rowTitle">
                    {(c.lead_name || 'Lead')} clicked {c.platform}
                  </div>
                  <div className="sa-rowSub">{fmtDate(c.clicked_at)}</div>
                </div>
                <div className="sa-rowActions">
                  <button className="sa-miniBtn" onClick={() => void markConverted(c.id, 500)}>
                    ✅ Converted (₹500)
                  </button>
                  <button className="sa-miniBtn" onClick={() => void markFailed(c.id)}>
                    ❌ Not Converted
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="sa-muted">No pending conversions.</div>
        )}
      </div>

      {edit ? (
        <div className="sa-panel" style={{ marginTop: 14 }}>
          <div className="sa-panelHead">
            <div className="sa-panelTitle">UPDATE {String(edit.platform || '').toUpperCase()} LINK</div>
            <button className="sa-miniBtn" onClick={() => setEdit(null)} disabled={editBusy}>
              Close
            </button>
          </div>

          <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
            <input
              className="sa-input"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              placeholder="Paste real affiliate URL"
            />
            <button className="sa-btn sa-btnGold" onClick={() => void saveEdit()} disabled={editBusy}>
              {editBusy ? 'Saving…' : 'Update & Activate'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
