'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { fetchAdminJSON } from '@/lib/auth/adminTokenClient';

function pct(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return '0%';
  return `${x.toFixed(1)}%`;
}

function fmtINR(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return '₹0';
  return x.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
}

function fmtIST(iso) {
  try {
    if (!iso) return '';
    return new Date(iso).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(iso || '');
  }
}

export function DailyKpisPanel({ days = 7 }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    setBusy(true);
    setErr('');
    try {
      const { r, j } = await fetchAdminJSON(`/api/admin/daily-metrics?days=${encodeURIComponent(days)}`);
      if (!r.ok || !j?.ok) {
        const msg = j?.error === 'disabled'
          ? 'Analytics disabled (feature flag).'
          : j?.error || `Request failed (${r.status})`;
        setErr(msg);
        return;
      }
      setData(j);
    } catch {
      setErr('Failed to load daily metrics.');
    } finally {
      setBusy(false);
    }
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  const dailyRows = useMemo(() => {
    const rows = Array.isArray(data?.daily) ? data.daily : [];
    return rows.slice(-days);
  }, [data, days]);

  const t = data?.today || null;

  return (
    <section className="sa-panel" style={{ marginTop: 14 }}>
      <div className="sa-panelHead">
        <div className="sa-panelTitle">DAILY KPIs (IST)</div>
        <button className="sa-miniBtn" disabled={busy} onClick={() => void load()}>
          {busy ? '…' : 'Refresh'}
        </button>
      </div>

      {data?.asOf ? (
        <div className="sa-muted" style={{ marginTop: 6 }}>
          As of: {fmtIST(data.asOf)}
        </div>
      ) : null}

      {busy && !data ? (
        <div style={{ marginTop: 10 }}>
          <LoadingSpinner label="Loading KPIs…" />
        </div>
      ) : null}

      {err ? <div className="sa-muted">{err}</div> : null}

      {t ? (
        <>
          <div className="sa-breakdown" style={{ marginTop: 12 }}>
            <div className="sa-breakItem">
              <div className="sa-breakKey">Email Open Rate</div>
              <div className="sa-breakVal">{pct(t?.email?.open_rate_pct)}</div>
              <div className="sa-cardSub">{t?.email?.opened_unique || 0} opens / {t?.email?.sent || 0} sent</div>
            </div>
            <div className="sa-breakItem">
              <div className="sa-breakKey">Email CTOR</div>
              <div className="sa-breakVal">{pct(t?.email?.ctor_open_pct)}</div>
              <div className="sa-cardSub">{t?.email?.clicked_unique || 0} clicks / {t?.email?.opened_unique || 0} opens</div>
            </div>
            <div className="sa-breakItem">
              <div className="sa-breakKey">WhatsApp Replies</div>
              <div className="sa-breakVal">{t?.whatsapp?.replies_unique || 0}</div>
              <div className="sa-cardSub">
                Step1 {pct(t?.whatsapp?.response_rate_pct?.step1)} · Step2 {pct(t?.whatsapp?.response_rate_pct?.step2)} · Step3 {pct(t?.whatsapp?.response_rate_pct?.step3)}
              </div>
            </div>
            <div className="sa-breakItem">
              <div className="sa-breakKey">Revenue (₹399 PDF)</div>
              <div className="sa-breakVal">{fmtINR(t?.revenue?.total_inr || 0)}</div>
              <div className="sa-cardSub">Purchases: {t?.revenue?.purchases || 0}</div>
            </div>
          </div>

          <div className="sa-tableWrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Sent</th>
                  <th>Open%</th>
                  <th>Click%</th>
                  <th>Replies</th>
                  <th>Premium Clicks</th>
                  <th>Purchases</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {dailyRows.length ? (
                  dailyRows.map((d) => {
                    const sent = Number(d?.email_sent) || 0;
                    const opened = Number(d?.email_open_unique) || 0;
                    const clicked = Number(d?.email_click_unique) || 0;
                    const openRate = sent > 0 ? (opened / sent) * 100 : 0;
                    const clickRate = sent > 0 ? (clicked / sent) * 100 : 0;
                    return (
                      <tr key={d?.date_ist || Math.random()}>
                        <td>{d?.date_ist || '-'}</td>
                        <td>{sent}</td>
                        <td>{pct(openRate)}</td>
                        <td>{pct(clickRate)}</td>
                        <td>{Number(d?.whatsapp_replies_unique) || 0}</td>
                        <td>{Number(d?.premium_clicks) || 0}</td>
                        <td>{Number(d?.purchases) || 0}</td>
                        <td>{fmtINR(Number(d?.revenue_inr) || 0)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="sa-muted">
                      No data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="sa-muted" style={{ marginTop: 8 }}>
            Time-to-purchase (minutes): median {Number(t?.time_to_purchase_minutes?.median || 0)} · avg {Number(t?.time_to_purchase_minutes?.avg || 0)} · sample {Number(t?.time_to_purchase_minutes?.sample || 0)}
          </div>
        </>
      ) : null}
    </section>
  );
}
