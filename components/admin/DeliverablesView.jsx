'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { fetchAdminJSON, getAdminToken } from '@/lib/auth/adminTokenClient';

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

export function DeliverablesView() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [items, setItems] = useState([]);

  const [mode, setMode] = useState('sent'); // 'sent' | 'library'
  const [leadId, setLeadId] = useState('');

  const [selected, setSelected] = useState(null);
  const [previewMode, setPreviewMode] = useState(null); // 'email' | 'pdf'
  const [emailPreview, setEmailPreview] = useState(null); // {subject, html}
  const [pdfUrl, setPdfUrl] = useState('');

  const load = useCallback(async () => {
    setBusy(true);
    setErr('');
    try {
      const { r, j } = await fetchAdminJSON('/api/admin/deliverables?limit=80');
      if (!r.ok || !j?.ok) {
        setErr(j?.error || `Request failed (${r.status})`);
        setItems([]);
        return;
      }
      setItems(Array.isArray(j.items) ? j.items : []);
    } catch {
      setErr('Failed to load deliverables.');
      setItems([]);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
    return () => {
      try {
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedId = selected?.id || null;

  const openEmail = useCallback(async (it) => {
    setSelected(it);
    setPreviewMode('email');
    setEmailPreview(null);
    setErr('');
    try {
      const { r, j } = await fetchAdminJSON(`/api/admin/deliverables/email?id=${encodeURIComponent(it.id)}`);
      if (!r.ok || !j?.ok) {
        setErr(j?.error || `Email preview failed (${r.status})`);
        return;
      }
      setEmailPreview({ subject: j.subject || '', html: j.html || '' });
    } catch {
      setErr('Email preview failed (network).');
    }
  }, []);

  const openLibraryEmail = useCallback(async (kind) => {
    setSelected({ id: `library:${kind}` });
    setPreviewMode('email');
    setEmailPreview(null);
    setErr('');
    try {
      const q = new URLSearchParams({ kind });
      if (leadId.trim()) q.set('leadId', leadId.trim());
      const { r, j } = await fetchAdminJSON(`/api/admin/deliverables/preview/email?${q.toString()}`);
      if (!r.ok || !j?.ok) {
        setErr(j?.error || `Email preview failed (${r.status})`);
        return;
      }
      setEmailPreview({ subject: j.subject || '', html: j.html || '' });
    } catch {
      setErr('Email preview failed (network).');
    }
  }, [leadId]);

  const openPdf = useCallback(async (it) => {
    setSelected(it);
    setPreviewMode('pdf');
    setErr('');

    try {
      if (pdfUrl) {
        try { URL.revokeObjectURL(pdfUrl); } catch {}
        setPdfUrl('');
      }

      const token = getAdminToken();
      const headers = new Headers();
      if (token) headers.set('x-bm-admin-token', token);

      const r = await fetch(`/api/admin/deliverables/pdf?id=${encodeURIComponent(it.id)}`, {
        method: 'GET',
        credentials: 'include',
        headers,
        cache: 'no-store',
      });

      if (!r.ok) {
        const j = await r.json().catch(() => null);
        setErr(j?.error || `PDF preview failed (${r.status})`);
        return;
      }

      const buf = await r.arrayBuffer();
      const blob = new Blob([buf], { type: 'application/pdf' });
      const u = URL.createObjectURL(blob);
      setPdfUrl(u);
    } catch {
      setErr('PDF preview failed (network).');
    }
  }, [pdfUrl]);

  const openLibraryPdf = useCallback(async (kind) => {
    setSelected({ id: `library:${kind}` });
    setPreviewMode('pdf');
    setErr('');

    try {
      if (pdfUrl) {
        try { URL.revokeObjectURL(pdfUrl); } catch {}
        setPdfUrl('');
      }

      const token = getAdminToken();
      const headers = new Headers();
      if (token) headers.set('x-bm-admin-token', token);

      const q = new URLSearchParams({ kind });
      if (leadId.trim()) q.set('leadId', leadId.trim());

      const r = await fetch(`/api/admin/deliverables/preview/pdf?${q.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers,
        cache: 'no-store',
      });

      if (!r.ok) {
        const j = await r.json().catch(() => null);
        setErr(j?.error || `PDF preview failed (${r.status})`);
        return;
      }

      const buf = await r.arrayBuffer();
      const blob = new Blob([buf], { type: 'application/pdf' });
      const u = URL.createObjectURL(blob);
      setPdfUrl(u);
    } catch {
      setErr('PDF preview failed (network).');
    }
  }, [leadId, pdfUrl]);

  const rows = useMemo(() => items || [], [items]);

  return (
    <div className="sa-grid2">
      <section className="sa-panel">
        <div className="sa-panelHead">
          <div className="sa-panelTitle">DELIVERABLES (EMAILS + PDFs)</div>
          <div className="sa-rowActions">
            <button
              className={mode === 'sent' ? 'sa-miniBtn sa-miniBtnActive' : 'sa-miniBtn'}
              disabled={busy}
              onClick={() => setMode('sent')}
              title="View deliverables that were actually sent/logged"
            >
              Sent
            </button>
            <button
              className={mode === 'library' ? 'sa-miniBtn sa-miniBtnActive' : 'sa-miniBtn'}
              disabled={busy}
              onClick={() => setMode('library')}
              title="God-eye: preview tool emails/PDFs without requiring payment/events"
            >
              Tools Library
            </button>
            <button className="sa-miniBtn" disabled={busy || mode !== 'sent'} onClick={() => void load()}>
              {busy ? '…' : 'Refresh'}
            </button>
          </div>
        </div>

        {busy && mode === 'sent' ? (
          <div style={{ marginTop: 10 }}>
            <LoadingSpinner label="Loading…" />
          </div>
        ) : null}

        {err ? <div className="sa-muted">{err}</div> : null}

        {mode === 'sent' && !busy && !rows.length ? <div className="sa-muted">No deliverables logged yet.</div> : null}

        {mode === 'library' ? (
          <div style={{ marginTop: 10 }}>
            <div className="sa-muted" style={{ marginBottom: 10 }}>
              Preview any tool deliverable (emails/PDFs) without payment. Optional: paste a leadId to personalize using their latest tool inputs (when available).
            </div>

            <div className="sa-row" style={{ marginBottom: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div className="sa-rowTitle">Optional Lead ID</div>
                <div className="sa-rowSub">If empty, uses sample data.</div>
              </div>
              <div className="sa-rowActions" style={{ gap: 8, alignItems: 'center' }}>
                <input
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  placeholder="Paste lead UUID"
                  style={{
                    width: 260,
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(0,0,0,0.25)',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                />
                <button className="sa-miniBtn" onClick={() => setLeadId('')}>Clear</button>
              </div>
            </div>

            <div className="sa-list">
              <div className="sa-row">
                <div style={{ minWidth: 0 }}>
                  <div className="sa-rowTitle">Property vs SIP</div>
                  <div className="sa-rowSub">Free email + paid email + paid PDF</div>
                </div>
                <div className="sa-rowActions">
                  <a className="sa-miniBtn" href="/tools/property-vs-sip" target="_blank" rel="noopener noreferrer">Open Tool</a>
                  <button className="sa-miniBtn" onClick={() => void openLibraryEmail('property_vs_sip_free')}>Preview Free Email</button>
                  <button className="sa-miniBtn" onClick={() => void openLibraryEmail('property_vs_sip_paid')}>Preview Paid Email</button>
                  <button className="sa-miniBtn" onClick={() => void openLibraryPdf('property_vs_sip_paid')}>Preview PDF</button>
                </div>
              </div>

              <div className="sa-row">
                <div style={{ minWidth: 0 }}>
                  <div className="sa-rowTitle">Tax Optimization Blueprint</div>
                  <div className="sa-rowSub">Paid email + paid PDF</div>
                </div>
                <div className="sa-rowActions">
                  <a className="sa-miniBtn" href="/tools/tax-optimization" target="_blank" rel="noopener noreferrer">Open Tool</a>
                  <button className="sa-miniBtn" onClick={() => void openLibraryEmail('tax_blueprint_paid')}>Preview Paid Email</button>
                  <button className="sa-miniBtn" onClick={() => void openLibraryPdf('tax_blueprint_paid')}>Preview PDF</button>
                </div>
              </div>

              <div className="sa-row">
                <div style={{ minWidth: 0 }}>
                  <div className="sa-rowTitle">Other Tools</div>
                  <div className="sa-rowSub">Premium deliverables not configured yet for these tools in this codebase.</div>
                </div>
                <div className="sa-rowActions">
                  <a className="sa-miniBtn" href="/tools" target="_blank" rel="noopener noreferrer">All Tools</a>
                  <a className="sa-miniBtn" href="/tools/insurance-value" target="_blank" rel="noopener noreferrer">Insurance Value</a>
                  <a className="sa-miniBtn" href="/tools/lumpsum-planner" target="_blank" rel="noopener noreferrer">Lumpsum Planner</a>
                  <a className="sa-miniBtn" href="/tools/retirement-gap" target="_blank" rel="noopener noreferrer">Retirement Gap</a>
                  <a className="sa-miniBtn" href="/tools/tax-leak-detector" target="_blank" rel="noopener noreferrer">Tax Leak Detector</a>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {mode === 'sent' && rows.length ? (
          <div className="sa-list">
            {rows.map((it) => {
              const active = selectedId && it.id === selectedId;
              const lead = it.lead || null;
              const meta = it.meta || {};
              return (
                <div
                  className="sa-row"
                  key={it.id}
                  style={{ borderColor: active ? 'rgba(198,161,91,0.45)' : undefined }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div className="sa-rowTitle">
                      {it.tool || it.event_type}{' '}
                      {meta?.status ? <span className="sa-chip">{String(meta.status).toUpperCase()}</span> : null}
                    </div>
                    <div className="sa-rowSub" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {fmtIST(it.created_at)} · {lead?.name || 'Anonymous'} · {meta?.email || lead?.email || '-'}
                    </div>
                  </div>

                  <div className="sa-rowActions">
                    <button className="sa-miniBtn" onClick={() => void openEmail(it)}>
                      View Email
                    </button>
                    {meta?.hasPdf ? (
                      <button className="sa-miniBtn" onClick={() => void openPdf(it)}>
                        View PDF
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="sa-panel">
        <div className="sa-panelHead">
          <div className="sa-panelTitle">PREVIEW</div>
        </div>

        {!selected ? <div className="sa-muted">Select an item to preview.</div> : null}

        {selected && previewMode === 'email' ? (
          <>
            <div className="sa-muted" style={{ marginTop: 8 }}>
              Subject: <span style={{ color: 'rgba(255,255,255,0.85)' }}>{emailPreview?.subject || '—'}</span>
            </div>
            {emailPreview?.html ? (
              <div className="sa-tableWrap" style={{ marginTop: 10, padding: 10 }}>
                <iframe
                  title="Email preview"
                  style={{ width: '100%', height: 560, border: '0', background: '#fff', borderRadius: 10 }}
                  srcDoc={emailPreview.html}
                />
              </div>
            ) : (
              <div className="sa-muted">Loading email…</div>
            )}
          </>
        ) : null}

        {selected && previewMode === 'pdf' ? (
          <>
            {!pdfUrl ? <div className="sa-muted">Loading PDF…</div> : null}
            {pdfUrl ? (
              <>
                <div className="sa-rowActions" style={{ marginTop: 10 }}>
                  <a className="sa-miniBtn" href={pdfUrl} target="_blank" rel="noopener noreferrer">
                    Open PDF (new tab)
                  </a>
                </div>
                <div className="sa-tableWrap" style={{ marginTop: 10, padding: 10 }}>
                  <iframe
                    title="PDF preview"
                    style={{ width: '100%', height: 560, border: '0', background: '#111', borderRadius: 10 }}
                    src={pdfUrl}
                  />
                </div>
              </>
            ) : null}
          </>
        ) : null}
      </section>
    </div>
  );
}
