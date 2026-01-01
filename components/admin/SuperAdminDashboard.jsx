'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { LeadsList } from '@/components/admin/LeadsList';
import { AnalyticsView } from '@/components/admin/AnalyticsView';
import { AffiliateTracking } from '@/components/admin/AffiliateTracking';
import { SessionManager } from '@/lib/auth/session';

function fmtINR(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return '₹0';
  return x.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

function digitsOnly(s) {
  return String(s || '').replace(/\D+/g, '');
}

function waLink(phone) {
  const d = digitsOnly(phone);
  if (!d) return null;
  const p = d.length === 10 ? `91${d}` : d;
  return `https://wa.me/${p}`;
}

function scoreOf(summary, leadId) {
  const s = summary?.today?.lead_scores?.[leadId]?.score;
  return Number.isFinite(Number(s)) ? Number(s) : null;
}

function tierOf(summary, leadId) {
  const t = String(summary?.today?.lead_scores?.[leadId]?.tier || '').toUpperCase();
  return t === 'HOT' || t === 'WARM' ? t : 'COLD';
}

function revenueBySource(entries) {
  const out = { Affiliate: 0, 'Lead Sale': 0, Product: 0, Other: 0 };
  for (const e of entries || []) {
    const amt = Number(e?.data?.amount);
    if (!Number.isFinite(amt)) continue;
    const src = String(e?.data?.source || 'Other');
    if (out[src] == null) out[src] = 0;
    out[src] += amt;
  }
  return out;
}

async function fetchJSON(url, opts) {
  const r = await fetch(url, opts);
  const j = await r.json().catch(() => null);
  return { r, j };
}

export function SuperAdminDashboard({ onLogout }) {
  const [tab, setTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [strategy, setStrategy] = useState(null);
  const [strategyBusy, setStrategyBusy] = useState(false);
  const [busy, setBusy] = useState(false);

  const sessionRef = useRef(null);
  const verifyThrottledRef = useRef(0);

  const totals = useMemo(() => {
    const totalLeads = summary?.all?.total_leads ?? (summary?.all?.leads || []).length ?? 0;
    const newToday = summary?.all?.new_today ?? 0;
    const convToday = summary?.all?.total_conversations_today ?? 0;
    const revenueMonth = summary?.today?.revenue_month ?? 0;
    const revenueToday = summary?.today?.revenue_today ?? 0;
    return { totalLeads, newToday, convToday, revenueMonth, revenueToday };
  }, [summary]);

  const hotLeads = useMemo(() => {
    const leads = summary?.all?.leads || [];
    const hot = [];
    for (const l of leads) {
      if (!l?.id) continue;
      if (tierOf(summary, l.id) !== 'HOT') continue;
      hot.push(l);
      if (hot.length >= 12) break;
    }
    return hot;
  }, [summary]);

  const revBreakdown = useMemo(() => {
    return revenueBySource(summary?.today?.revenue_entries || []);
  }, [summary]);

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      setBusy(true);
      try {
        const { r, j } = await fetchJSON('/api/admin/summary');
        if (!mounted) return;
        setSummary(r.ok && j?.ok ? j : null);
      } finally {
        if (mounted) setBusy(false);
      }
    }

    loadSummary();

    return () => {
      mounted = false;
    };
  }, []);

  async function verifyAndRefreshCookie() {
    const now = Date.now();
    if (now - verifyThrottledRef.current < 15_000) return;
    verifyThrottledRef.current = now;

    const { r } = await fetchJSON('/api/admin/verify');
    if (!r.ok) {
      // session expired / invalid
      await onLogout();
    }
  }

  useEffect(() => {
    // Client-side inactivity logout + server-side sliding cookie refresh
    const sm = new SessionManager({
      timeoutMinutes: 30,
      onLogout: () => {
        void onLogout();
      },
    });
    sessionRef.current = sm;
    sm.login();

    const onActivity = () => {
      sm.activity();
      void verifyAndRefreshCookie();
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    for (const ev of events) window.addEventListener(ev, onActivity, { passive: true });

    const interval = setInterval(() => void verifyAndRefreshCookie(), 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      for (const ev of events) window.removeEventListener(ev, onActivity);
      // Important: do NOT call onLogout on unmount (Fast Refresh would constantly log you out in dev).
      try {
        sm.stopTimer();
        sm.active = false;
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onLogout]);

  async function loadAnalytics() {
    setBusy(true);
    try {
      const { r, j } = await fetchJSON('/api/admin/analytics');
      setAnalytics(r.ok && j?.ok ? j : null);
    } finally {
      setBusy(false);
    }
  }

  async function loadStrategy(force = false) {
    setStrategyBusy(true);
    try {
      const u = force ? '/api/admin/strategy?force=1' : '/api/admin/strategy';
      const { r, j } = await fetchJSON(u);
      setStrategy(r.ok && j?.ok ? j : null);
    } finally {
      setStrategyBusy(false);
    }
  }

  return (
    <div className="sa-shell">
      <header className="sa-topbar">
        <div className="sa-brand">
          <div className="sa-title">🎛️ Akash&apos;s Control Panel</div>
          <div className="sa-sub">BM Wealth · Super Admin</div>
        </div>
        <div className="sa-actions">
          <button className="sa-btn" onClick={() => setBusy(true) || void (async () => { await verifyAndRefreshCookie(); setBusy(false); })()}>
            Verify
          </button>
          <button className="sa-btn sa-btnGold" onClick={() => void onLogout()}>
            Logout
          </button>
        </div>
      </header>

      <nav className="sa-tabs">
        <button className={tab === 'overview' ? 'sa-tab sa-tabActive' : 'sa-tab'} onClick={() => setTab('overview')}>Overview</button>
        <button className={tab === 'leads' ? 'sa-tab sa-tabActive' : 'sa-tab'} onClick={() => setTab('leads')}>Leads</button>
        <button className={tab === 'analytics' ? 'sa-tab sa-tabActive' : 'sa-tab'} onClick={() => { setTab('analytics'); if (!analytics) void loadAnalytics(); }}>Analytics</button>
        <button className={tab === 'system' ? 'sa-tab sa-tabActive' : 'sa-tab'} onClick={() => setTab('system')}>System</button>
      </nav>

      <main className="sa-content">
        {busy ? <div style={{ marginBottom: 12 }}><LoadingSpinner label="Loading…" /></div> : null}

        {tab === 'overview' ? (
          <>
            <div className="sa-stats">
              <div className="sa-card">
                <div className="sa-cardLabel">LEADS</div>
                <div className="sa-cardValue">{totals.totalLeads}</div>
                <div className="sa-cardSub">+{totals.newToday} today</div>
              </div>
              <div className="sa-card">
                <div className="sa-cardLabel">REVENUE (MONTH)</div>
                <div className="sa-cardValue">{fmtINR(totals.revenueMonth)}</div>
                <div className="sa-cardSub">Today: {fmtINR(totals.revenueToday)}</div>
              </div>
              <div className="sa-card">
                <div className="sa-cardLabel">CONVERSATIONS (TODAY)</div>
                <div className="sa-cardValue">{totals.convToday}</div>
                <div className="sa-cardSub">Live activity</div>
              </div>
            </div>

            <div className="sa-grid2">
              <section className="sa-panel">
                <div className="sa-panelHead">
                  <div className="sa-panelTitle">HOT LEADS ({hotLeads.length})</div>
                  <button className="sa-miniBtn" onClick={() => setTab('leads')}>View All</button>
                </div>

                {hotLeads.length ? (
                  <div className="sa-list">
                    {hotLeads.map((l) => {
                      const s = scoreOf(summary, l.id);
                      const w = waLink(l.phone);
                      return (
                        <div className="sa-row" key={l.id}>
                          <div>
                            <div className="sa-rowTitle">{l.name || 'Anonymous'} <span className="sa-chip">{s != null ? `Score ${s}` : 'HOT'}</span></div>
                            <div className="sa-rowSub">{l.phone || '-'} · {l.email || '-'}</div>
                          </div>
                          <div className="sa-rowActions">
                            {w ? <a className="sa-miniBtn" href={w} target="_blank" rel="noopener noreferrer">WhatsApp</a> : null}
                            <button className="sa-miniBtn" onClick={() => void verifyAndRefreshCookie()}>Ping</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="sa-muted">No hot leads yet.</div>
                )}
              </section>

              <section className="sa-panel">
                <div className="sa-panelHead">
                  <div className="sa-panelTitle">CLAUDE AI</div>
                  <button className="sa-miniBtn" disabled={strategyBusy} onClick={() => void loadStrategy(true)}>
                    {strategyBusy ? '…' : 'Refresh'}
                  </button>
                </div>

                <div className="sa-quickPrompts">
                  <button className="sa-pill" onClick={() => void loadStrategy(true)}>Analyze today&apos;s leads</button>
                  <button className="sa-pill" onClick={() => void loadStrategy(true)}>Revenue optimization ideas</button>
                  <button className="sa-pill" onClick={() => void loadStrategy(true)}>What should I focus on?</button>
                </div>

                <div className="sa-aiBox">
                  {strategyBusy ? <div className="sa-muted">Thinking…</div> : null}
                  {!strategyBusy && strategy?.text ? <pre className="sa-pre">{strategy.text}</pre> : null}
                  {!strategyBusy && !strategy?.text ? <div className="sa-muted">Click Refresh to generate strategic advice.</div> : null}
                </div>
              </section>
            </div>

            <section className="sa-panel" style={{ marginTop: 14 }}>
              <div className="sa-panelHead">
                <div className="sa-panelTitle">REVENUE BREAKDOWN</div>
                <button className="sa-miniBtn" onClick={() => void (async () => { setBusy(true); const { r, j } = await fetchJSON('/api/admin/summary'); setSummary(r.ok && j?.ok ? j : summary); setBusy(false); })()}>Refresh</button>
              </div>

              <div className="sa-breakdown">
                {Object.entries(revBreakdown).map(([k, v]) => (
                  <div className="sa-breakItem" key={k}>
                    <div className="sa-breakKey">{k}</div>
                    <div className="sa-breakVal">{fmtINR(v)}</div>
                  </div>
                ))}
              </div>

              <div className="sa-quickActions">
                <a className="sa-btn" href="/api/admin/export" target="_blank" rel="noopener noreferrer">Export All Leads (CSV)</a>
                <button className="sa-btn" onClick={() => { setTab('analytics'); if (!analytics) void loadAnalytics(); }}>📊 Full Analytics</button>
                <button className="sa-btn" onClick={() => setTab('system')}>System Health</button>
              </div>
            </section>
          </>
        ) : null}

        {tab === 'leads' ? <LeadsList summary={summary} /> : null}
        {tab === 'analytics' ? <AnalyticsView analytics={analytics} /> : null}

        {tab === 'system' ? (
          <div className="sa-panel">
            <div className="sa-panelHead">
              <div className="sa-panelTitle">SYSTEM CONTROLS</div>
            </div>
            <AffiliateTracking />
          </div>
        ) : null}
      </main>
    </div>
  );
}


