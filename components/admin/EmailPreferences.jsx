'use client';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

async function fetchJSON(url, opts) {
  const r = await fetch(url, opts);
  const j = await r.json().catch(() => null);
  return { r, j };
}

export function EmailPreferences() {
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [prefs, setPrefs] = useState(null);

  async function load() {
    setBusy(true);
    try {
      const { r, j } = await fetchJSON('/api/admin/email-preferences');
      setPrefs(r.ok && j?.ok ? j.prefs : null);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    if (!prefs) return;
    setSaving(true);
    try {
      await fetchJSON('/api/admin/email-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function testEmail(type) {
    setTesting(true);
    try {
      await fetchJSON('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
    } finally {
      setTesting(false);
    }
  }

  if (busy && !prefs) {
    return (
      <div style={{ marginTop: 12 }}>
        <LoadingSpinner label="Loading email preferences…" />
      </div>
    );
  }

  if (!prefs) {
    return <div className="sa-muted">Email preferences unavailable (check Supabase setup + schema + admin session).</div>;
  }

  return (
    <div className="sa-panel" style={{ marginTop: 14 }}>
      <div className="sa-panelHead">
        <div className="sa-panelTitle">EMAIL NOTIFICATIONS</div>
        <button className="sa-miniBtn" onClick={() => void load()} disabled={busy}>
          {busy ? '…' : 'Refresh'}
        </button>
      </div>

      <div className="sa-list" style={{ marginTop: 10 }}>
        <div className="sa-row">
          <div>
            <div className="sa-rowTitle">Email address</div>
            <div className="sa-rowSub">Where notifications are sent</div>
          </div>
          <div className="sa-rowActions">
            <input
              value={prefs.email_address || ''}
              onChange={(e) => setPrefs({ ...prefs, email_address: e.target.value })}
              placeholder="akash@bmwealth.co.in"
              style={{ padding: 8, borderRadius: 8, border: '1px solid #ddd', minWidth: 260 }}
            />
          </div>
        </div>

        <div className="sa-row">
          <div>
            <div className="sa-rowTitle">Hot Lead Alerts</div>
            <div className="sa-rowSub">Instant email when lead_score ≥ 80</div>
          </div>
          <div className="sa-rowActions">
            <label className="sa-miniBtn" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={Boolean(prefs.hot_lead_alerts)}
                onChange={(e) => setPrefs({ ...prefs, hot_lead_alerts: e.target.checked })}
                style={{ marginRight: 8 }}
              />
              Enabled
            </label>
          </div>
        </div>

        <div className="sa-row">
          <div>
            <div className="sa-rowTitle">Daily Summary</div>
            <div className="sa-rowSub">Cron: 8 PM daily</div>
          </div>
          <div className="sa-rowActions">
            <label className="sa-miniBtn" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={Boolean(prefs.daily_summary)}
                onChange={(e) => setPrefs({ ...prefs, daily_summary: e.target.checked })}
                style={{ marginRight: 8 }}
              />
              Enabled
            </label>
          </div>
        </div>

        <div className="sa-row">
          <div>
            <div className="sa-rowTitle">Weekly Summary</div>
            <div className="sa-rowSub">Cron: Sunday 8 PM</div>
          </div>
          <div className="sa-rowActions">
            <label className="sa-miniBtn" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={Boolean(prefs.weekly_summary)}
                onChange={(e) => setPrefs({ ...prefs, weekly_summary: e.target.checked })}
                style={{ marginRight: 8 }}
              />
              Enabled
            </label>
          </div>
        </div>

        <div className="sa-row">
          <div>
            <div className="sa-rowTitle">Conversion Alerts</div>
            <div className="sa-rowSub">Instant email on affiliate conversion</div>
          </div>
          <div className="sa-rowActions">
            <label className="sa-miniBtn" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={Boolean(prefs.conversion_alerts)}
                onChange={(e) => setPrefs({ ...prefs, conversion_alerts: e.target.checked })}
                style={{ marginRight: 8 }}
              />
              Enabled
            </label>
          </div>
        </div>

        <div className="sa-row">
          <div>
            <div className="sa-rowTitle">Error Alerts</div>
            <div className="sa-rowSub">Email on cron/convert failures (best-effort)</div>
          </div>
          <div className="sa-rowActions">
            <label className="sa-miniBtn" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={Boolean(prefs.error_alerts)}
                onChange={(e) => setPrefs({ ...prefs, error_alerts: e.target.checked })}
                style={{ marginRight: 8 }}
              />
              Enabled
            </label>
          </div>
        </div>
      </div>

      <div className="sa-quickActions" style={{ marginTop: 12 }}>
        <button className="sa-btn sa-btnGold" onClick={() => void save()} disabled={saving}>
          {saving ? 'Saving…' : 'Save Preferences'}
        </button>

        <button className="sa-btn" onClick={() => void testEmail('hot_lead')} disabled={testing}>
          {testing ? '…' : 'Send Test Hot Lead Alert'}
        </button>
        <button className="sa-btn" onClick={() => void testEmail('daily_summary')} disabled={testing}>
          {testing ? '…' : 'Send Test Daily Summary'}
        </button>
      </div>

      <div className="sa-muted" style={{ marginTop: 8 }}>
        Requires env: RESEND_API_KEY, RESEND_FROM_EMAIL (verified), CRON_SECRET.
      </div>
    </div>
  );
}
