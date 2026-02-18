'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { LeadsList } from '@/components/admin/LeadsList';
import { AnalyticsView } from '@/components/admin/AnalyticsView';
import { AffiliateTracking } from '@/components/admin/AffiliateTracking';
import { EmailPreferences } from '@/components/admin/EmailPreferences';
import { DailyKpisPanel } from '@/components/admin/DailyKpisPanel';
import { DeliverablesView } from '@/components/admin/DeliverablesView';
import { LiveIntelligenceAdmin } from '@/components/admin/LiveIntelligenceAdmin';
import { AioTrackerView } from '@/components/admin/AioTrackerView';
import { AiProvidersPanel } from '@/components/admin/AiProvidersPanel';
import { CommunityPostsManager } from '@/components/admin/CommunityPostsManager';
import { BlogImagesManager } from '@/components/admin/BlogImagesManager';
import { SessionManager } from '@/lib/auth/session';
import { fetchAdminJSON } from '@/lib/auth/adminTokenClient';

/* ─── Helpers ─── */

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

/* ─── Sidebar navigation config ─── */

const NAV_SECTIONS = [
  {
    label: 'Core',
    items: [
      { id: 'overview',     name: 'Overview',          icon: '📊' },
      { id: 'leads',        name: 'Leads',             icon: '👤' },
      { id: 'deliverables', name: 'Deliverables',      icon: '📦' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'live-intel',   name: 'Live Intelligence', icon: '🧠' },
      { id: 'analytics',    name: 'Analytics',         icon: '📈' },
      { id: 'aio-tracker',  name: 'AIO Tracker',       icon: '🔎' },
    ],
  },
  {
    label: 'Content',
    items: [
      { id: 'community',    name: 'Community Posts',   icon: '💬' },
      { id: 'blog-images',  name: 'Blog Images',       icon: '🖼️' },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'system',       name: 'System & Config',   icon: '⚙️' },
    ],
  },
];

/* ─── Component ─── */

export function SuperAdminDashboard({ onLogout }) {
  const [tab, setTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [aioTracker, setAioTracker] = useState(null);
  const [aioDays, setAioDays] = useState(30);
  const [strategy, setStrategy] = useState(null);
  const [strategyBusy, setStrategyBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [verifyNote, setVerifyNote] = useState('');

  const smartCache = summary?.today?.smart_cache || null;
  const cacheHitRatePct = useMemo(() => {
    const r = Number(smartCache?.cache_hit_rate);
    if (!Number.isFinite(r) || r < 0) return 0;
    return Math.min(100, Math.max(0, r * 100));
  }, [smartCache]);

  const sessionRef = useRef(null);
  const verifyThrottledRef = useRef(0);

  /* ── Derived data ── */
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

  /* ── Load summary on mount ── */
  useEffect(() => {
    let mounted = true;
    async function loadSummary() {
      setBusy(true);
      try {
        const { r, j } = await fetchAdminJSON('/api/admin/summary');
        if (!mounted) return;
        setSummary(r.ok && j?.ok ? j : null);
      } catch {
        if (!mounted) return;
        setSummary(null);
      } finally {
        if (mounted) setBusy(false);
      }
    }
    loadSummary();
    return () => { mounted = false; };
  }, []);

  /* ── Verify & cookie refresh ── */
  async function verifyAndRefreshCookie() {
    const now = Date.now();
    if (now - verifyThrottledRef.current < 15_000) return;
    verifyThrottledRef.current = now;
    try {
      const { r } = await fetchAdminJSON('/api/admin/verify');
      if (!r.ok) {
        await onLogout();
        setVerifyNote('Session expired.');
        setTimeout(() => setVerifyNote(''), 4000);
      } else {
        setVerifyNote('Session OK ✅');
        setTimeout(() => setVerifyNote(''), 2500);
      }
    } catch {
      setVerifyNote('Verify failed (network).');
      setTimeout(() => setVerifyNote(''), 4000);
    }
  }

  /* ── Session management ── */
  useEffect(() => {
    const sm = new SessionManager({ timeoutMinutes: 30, onLogout: () => { void onLogout(); } });
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
      try { sm.stopTimer(); sm.active = false; } catch {}
    };
  }, [onLogout]);

  /* ── Lazy loaders ── */
  async function loadAnalytics() {
    setBusy(true);
    try {
      const { r, j } = await fetchAdminJSON('/api/admin/analytics');
      setAnalytics(r.ok && j?.ok ? j : null);
    } catch { setAnalytics(null); }
    finally { setBusy(false); }
  }

  async function loadAioTracker(days = aioDays) {
    setBusy(true);
    try {
      const { r, j } = await fetchAdminJSON(`/api/admin/aio-tracker?days=${encodeURIComponent(String(days))}`);
      setAioTracker(r.ok && j?.ok ? j : null);
    } catch { setAioTracker(null); }
    finally { setBusy(false); }
  }

  async function loadStrategy(force = false) {
    setStrategyBusy(true);
    try {
      const u = force ? '/api/admin/strategy?force=1' : '/api/admin/strategy';
      const { r, j } = await fetchAdminJSON(u);
      setStrategy(r.ok && j?.ok ? j : null);
    } catch { setStrategy(null); }
    finally { setStrategyBusy(false); }
  }

  async function downloadExport() {
    setBusy(true);
    try {
      const token = (() => {
        try { return typeof window !== 'undefined' ? window.localStorage.getItem('bm_admin_token_v1') : null; } catch { return null; }
      })();
      const headers = token ? { 'x-bm-admin-token': token } : undefined;
      const r = await fetch('/api/admin/export', { method: 'GET', credentials: 'include', headers });
      if (!r.ok) return;
      const blob = await r.blob();
      const cd = r.headers.get('content-disposition') || '';
      const m = cd.match(/filename="?([^";]+)"?/i);
      const filename = m?.[1] || `bm-wealth-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } finally { setBusy(false); }
  }

  async function refreshSummary() {
    setBusy(true);
    try {
      const { r, j } = await fetchAdminJSON('/api/admin/summary');
      setSummary(r.ok && j?.ok ? j : summary);
    } catch {/* keep existing */}
    finally { setBusy(false); }
  }

  /* ── Tab change helper ── */
  function switchTab(id) {
    setTab(id);
    if (id === 'analytics' && !analytics) void loadAnalytics();
    if (id === 'aio-tracker' && !aioTracker) void loadAioTracker();
  }

  /* ── Current section label for topbar ── */
  const currentNavItem = NAV_SECTIONS.flatMap(s => s.items).find(i => i.id === tab);

  /* ═════════════════════════ RENDER ═════════════════════════ */
  return (
    <div className="sa-shell">

      {/* ────── SIDEBAR ────── */}
      <aside className="sa-sidebar">
        <div className="sa-sidebar-brand">
          <div className="sa-sidebar-brand-title">BM Wealth</div>
          <div className="sa-sidebar-brand-sub">Super Admin · God Mode</div>
        </div>

        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <div className="sa-sidebar-section">{section.label}</div>
            {section.items.map(item => (
              <button
                key={item.id}
                className={`sa-navItem${tab === item.id ? ' sa-navItemActive' : ''}`}
                onClick={() => switchTab(item.id)}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.name}
              </button>
            ))}
          </div>
        ))}

        <div className="sa-sidebar-bottom">
          <button className="sa-navItem" onClick={() => void onLogout()} style={{ color: 'rgba(255,180,180,0.8)' }}>
            <span style={{ fontSize: 15 }}>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ────── MOBILE TAB BAR ────── */}
      <nav className="sa-mobileTabs">
        {NAV_SECTIONS.flatMap(s => s.items).map(item => (
          <button
            key={item.id}
            className={tab === item.id ? 'sa-tab sa-tabActive' : 'sa-tab'}
            onClick={() => switchTab(item.id)}
          >
            {item.icon} {item.name}
          </button>
        ))}
      </nav>

      {/* ────── TOPBAR ────── */}
      <header className="sa-topbar">
        <div>
          <div className="sa-title">{currentNavItem?.icon} {currentNavItem?.name || 'Admin'}</div>
          <div className="sa-sub">Akash&apos;s Control Panel</div>
        </div>
        <div className="sa-actions">
          {verifyNote ? <span className="sa-sub" style={{ marginRight: 8 }}>{verifyNote}</span> : null}
          <button className="sa-btn" onClick={() => { setBusy(true); void (async () => { await verifyAndRefreshCookie(); setBusy(false); })(); }}>
            Verify
          </button>
          <button className="sa-btn sa-btnAccent" onClick={() => void refreshSummary()}>
            Refresh Data
          </button>
        </div>
      </header>

      {/* ────── CONTENT ────── */}
      <main className="sa-content">
        {busy ? <div style={{ marginBottom: 12 }}><LoadingSpinner label="Loading…" /></div> : null}

        {/* ═══ OVERVIEW ═══ */}
        {tab === 'overview' && (
          <>
            <div className="sa-stats">
              <div className="sa-card">
                <div className="sa-cardLabel">TOTAL LEADS</div>
                <div className="sa-cardValue">{totals.totalLeads}</div>
                <div className="sa-cardSub">+{totals.newToday} today</div>
              </div>
              <div className="sa-card">
                <div className="sa-cardLabel">REVENUE (MONTH)</div>
                <div className="sa-cardValue">{fmtINR(totals.revenueMonth)}</div>
                <div className="sa-cardSub">Today: {fmtINR(totals.revenueToday)}</div>
              </div>
              <div className="sa-card">
                <div className="sa-cardLabel">CONVERSATIONS</div>
                <div className="sa-cardValue">{totals.convToday}</div>
                <div className="sa-cardSub">Active today</div>
              </div>
              <div className="sa-card">
                <div className="sa-cardLabel">CACHE HIT RATE</div>
                <div className="sa-cardValue">{cacheHitRatePct.toFixed(0)}%</div>
                <div className="sa-cardSub">{Number(smartCache?.api_calls_saved_today) || 0} API calls saved</div>
              </div>
            </div>

            <DailyKpisPanel days={7} />

            <div className="sa-grid2">
              {/* ── Hot Leads ── */}
              <section className="sa-panel">
                <div className="sa-panelHead">
                  <div className="sa-panelTitle">HOT LEADS ({hotLeads.length})</div>
                  <button className="sa-miniBtn" onClick={() => switchTab('leads')}>View All →</button>
                </div>
                {hotLeads.length ? (
                  <div className="sa-list">
                    {hotLeads.map(l => {
                      const s = scoreOf(summary, l.id);
                      const w = waLink(l.phone);
                      return (
                        <div className="sa-row" key={l.id}>
                          <div>
                            <div className="sa-rowTitle">
                              {l.name || 'Anonymous'}
                              <span className="sa-chip">{s != null ? `Score ${s}` : 'HOT'}</span>
                            </div>
                            <div className="sa-rowSub">{l.phone || '—'} · {l.email || '—'}</div>
                          </div>
                          <div className="sa-rowActions">
                            {w ? <a className="sa-miniBtn" href={w} target="_blank" rel="noopener noreferrer">WhatsApp</a> : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="sa-muted">No hot leads yet.</div>
                )}
              </section>

              {/* ── Claude AI ── */}
              <section className="sa-panel">
                <div className="sa-panelHead">
                  <div className="sa-panelTitle">CLAUDE AI STRATEGY</div>
                  <button className="sa-miniBtn" disabled={strategyBusy} onClick={() => void loadStrategy(true)}>
                    {strategyBusy ? '…' : 'Refresh'}
                  </button>
                </div>
                <div className="sa-quickPrompts">
                  <button className="sa-pill" onClick={() => void loadStrategy(true)}>Analyze today&apos;s leads</button>
                  <button className="sa-pill" onClick={() => void loadStrategy(true)}>Revenue ideas</button>
                  <button className="sa-pill" onClick={() => void loadStrategy(true)}>Focus priorities</button>
                </div>
                <div className="sa-aiBox">
                  {strategyBusy ? <div className="sa-muted">Thinking…</div> : null}
                  {!strategyBusy && strategy?.text ? <pre className="sa-pre">{strategy.text}</pre> : null}
                  {!strategyBusy && !strategy?.text ? <div className="sa-muted">Click Refresh to generate strategic advice.</div> : null}
                </div>
              </section>
            </div>

            {/* ── Revenue Breakdown ── */}
            <section className="sa-panel" style={{ marginTop: 14 }}>
              <div className="sa-panelHead">
                <div className="sa-panelTitle">REVENUE BREAKDOWN</div>
                <button className="sa-miniBtn" onClick={() => void refreshSummary()}>Refresh</button>
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
                <button className="sa-btn" onClick={() => void downloadExport()}>Export All Leads (CSV)</button>
                <button className="sa-btn" onClick={() => switchTab('analytics')}>Full Analytics</button>
                <button className="sa-btn" onClick={() => switchTab('system')}>System Health</button>
              </div>
            </section>
          </>
        )}

        {/* ═══ TAB: Leads ═══ */}
        {tab === 'leads' && <LeadsList summary={summary} />}

        {/* ═══ TAB: Deliverables ═══ */}
        {tab === 'deliverables' && <DeliverablesView />}

        {/* ═══ TAB: Live Intelligence ═══ */}
        {tab === 'live-intel' && <LiveIntelligenceAdmin />}

        {/* ═══ TAB: Community Posts ═══ */}
        {tab === 'community' && <CommunityPostsManager />}

        {/* ═══ TAB: Blog Images ═══ */}
        {tab === 'blog-images' && <BlogImagesManager />}

        {/* ═══ TAB: Analytics ═══ */}
        {tab === 'analytics' && <AnalyticsView analytics={analytics} />}

        {/* ═══ TAB: AIO Tracker ═══ */}
        {tab === 'aio-tracker' && (
          <div className="sa-panel">
            <div className="sa-panelHead">
              <div className="sa-panelTitle">AIO TRACKER</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ opacity: 0.6, fontSize: 12 }}>Window</span>
                {[7, 30, 90].map(d => (
                  <button
                    key={d}
                    className={`sa-miniBtn${aioDays === d ? ' sa-miniBtnActive' : ''}`}
                    onClick={() => { setAioDays(d); void loadAioTracker(d); }}
                  >
                    {d}d
                  </button>
                ))}
                <button className="sa-miniBtn" onClick={() => void loadAioTracker(aioDays)}>Refresh</button>
              </div>
            </div>
            <AioTrackerView data={aioTracker} />
          </div>
        )}

        {/* ═══ TAB: System ═══ */}
        {tab === 'system' && (
          <div className="sa-panel">
            <div className="sa-panelHead">
              <div className="sa-panelTitle">SYSTEM CONTROLS &amp; CONFIG</div>
            </div>

            <section className="sa-block">
              <h3 className="sa-panelTitle">Smart Cache Performance</h3>
              <p className="sa-line">Cache Hit Rate: {cacheHitRatePct.toFixed(1)}% {cacheHitRatePct >= 90 ? '✅' : ''}</p>
              <p className="sa-line">API Calls Saved Today: {Number(smartCache?.api_calls_saved_today) || 0}</p>
              <p className="sa-line">Questions in Cache: {Number(smartCache?.questions_in_cache) || 0}</p>
              <p className="sa-line">Most Asked: &quot;{smartCache?.most_asked?.question || 'N/A'}&quot; ({Number(smartCache?.most_asked?.count) || 0} times)</p>
            </section>

            <AiProvidersPanel summary={summary} />
            <AffiliateTracking />
            <EmailPreferences />
          </div>
        )}
      </main>
    </div>
  );
}
