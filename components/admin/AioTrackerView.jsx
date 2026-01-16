'use client';

import { useMemo, useState } from 'react';

function fmtNum(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return '0';
  try {
    return x.toLocaleString('en-IN');
  } catch {
    return String(x);
  }
}

function toLines(recentCaptures) {
  const emails = (recentCaptures || [])
    .map((r) => String(r?.email || '').trim())
    .filter(Boolean);
  // unique + preserve order
  const seen = new Set();
  const out = [];
  for (const e of emails) {
    const k = e.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(e);
  }
  return out.join('\n');
}

export function AioTrackerView({ data }) {
  const [copied, setCopied] = useState(false);

  const emailsText = useMemo(() => toLines(data?.recentCaptures), [data?.recentCaptures]);

  async function copyEmails() {
    try {
      await navigator.clipboard.writeText(emailsText || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  if (!data) {
    return <div style={{ marginTop: 22, opacity: 0.75 }}>AIO tracker not available (not authorized or not configured).</div>;
  }

  const totals = data?.totals || {};
  const top = data?.top || {};

  return (
    <div style={{ marginTop: 22 }}>
      <h2 style={{ color: '#C0A062', fontSize: 18 }}>AIO Tracker</h2>
      <div style={{ opacity: 0.7, fontSize: 12, marginTop: 6 }}>
        Window: {data?.windowDays} days · Unique emails: {fmtNum(totals.unique_emails || 0)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 12 }}>
        <Stat label="Opens" value={fmtNum(totals.opens || 0)} />
        <Stat label="Calculates" value={fmtNum(totals.calculates || 0)} />
        <Stat label="Shares" value={fmtNum(totals.shares || 0)} />
        <Stat label="Leads Captured" value={fmtNum(totals.leads || 0)} />
        <Stat label="Email Submit" value={fmtNum(totals.email_submit || 0)} />
        <Stat label="Email Sent" value={fmtNum(totals.email_sent || 0)} />
        <Stat label="Email Failed" value={fmtNum(totals.email_failed || 0)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginTop: 16 }}>
        <List title="Top Campaigns" items={top.campaigns} />
        <List title="Top utm_content" items={top.contents} />
        <List title="Top Calculators" items={top.calcs} />
        <List title="Top Share Methods" items={top.methods} />
      </div>

      <div style={{ marginTop: 18, padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 900, color: '#C0A062' }}>Recent Captured Emails</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>From AIO lead capture events (copy/paste into email tools)</div>
          </div>
          <button
            type="button"
            onClick={copyEmails}
            disabled={!emailsText}
            style={{
              borderRadius: 10,
              padding: '10px 12px',
              border: '1px solid rgba(192,160,98,0.25)',
              background: 'rgba(192,160,98,0.08)',
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {copied ? 'Copied' : 'Copy Emails'}
          </button>
        </div>

        <textarea
          readOnly
          value={emailsText}
          rows={8}
          style={{
            marginTop: 10,
            width: '100%',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.25)',
            color: 'rgba(255,255,255,0.85)',
            padding: 12,
            fontSize: 12,
            outline: 'none',
          }}
        />
      </div>

      {Array.isArray(data?.recentCaptures) && data.recentCaptures.length ? (
        <div style={{ marginTop: 18, overflowX: 'auto' }}>
          <div style={{ color: '#C0A062', fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            Recent Captures (detail)
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ textAlign: 'left', opacity: 0.7 }}>
                <th style={{ padding: '8px 6px' }}>Time</th>
                <th style={{ padding: '8px 6px' }}>Calc</th>
                <th style={{ padding: '8px 6px' }}>Email</th>
                <th style={{ padding: '8px 6px' }}>Phone</th>
                <th style={{ padding: '8px 6px' }}>Campaign</th>
                <th style={{ padding: '8px 6px' }}>Content</th>
              </tr>
            </thead>
            <tbody>
              {data.recentCaptures.map((r, idx) => (
                <tr key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '10px 6px', whiteSpace: 'nowrap' }}>{r.at ? new Date(r.at).toLocaleString() : '-'}</td>
                  <td style={{ padding: '10px 6px' }}>{r.calc || '-'}</td>
                  <td style={{ padding: '10px 6px' }}>{r.email || '-'}</td>
                  <td style={{ padding: '10px 6px' }}>{r.phone || '-'}</td>
                  <td style={{ padding: '10px 6px' }}>{r.utm?.utm_campaign || '-'}</td>
                  <td style={{ padding: '10px 6px' }}>{r.utm?.utm_content || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ marginTop: 12, opacity: 0.6, fontSize: 12 }}>No AIO lead captures in this window yet.</div>
      )}
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

function List({ title, items }) {
  const rows = Array.isArray(items) ? items : [];
  return (
    <div style={{ padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
      <div style={{ fontSize: 12, fontWeight: 900, color: '#C0A062' }}>{title}</div>
      {rows.length ? (
        <div style={{ marginTop: 10 }}>
          {rows.map((r) => (
            <div
              key={r.key}
              style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div style={{ fontWeight: 800, opacity: 0.9 }}>{r.key}</div>
              <div style={{ color: '#C0A062', fontWeight: 900 }}>{fmtNum(r.count)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 8, opacity: 0.65, fontSize: 12 }}>No data yet.</div>
      )}
    </div>
  );
}
