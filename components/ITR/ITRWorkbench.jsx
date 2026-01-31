'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import ITRDisclaimer from '@/components/Legal/ITRDisclaimer';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const PDFSourceViewer = dynamic(() => import('./PDFSourceViewer'), { ssr: false });

function Badge({ children, tone = 'neutral' }) {
  const cls =
    tone === 'ok'
      ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/20'
      : tone === 'warn'
        ? 'bg-amber-500/15 text-amber-200 border-amber-500/20'
        : 'bg-white/10 text-white/70 border-white/15';
  return <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full border ${cls}`}>{children}</span>;
}

export default function ITRWorkbench() {
  const [busy, setBusy] = useState(false);
  const [uploaded, setUploaded] = useState([]); // [{fileId, filename, type, pages, docType}]
  const [extractions, setExtractions] = useState({}); // fileId -> {fields:[]}
  const [activeSource, setActiveSource] = useState(null); // {fileId, page, bbox, pageWidth, pageHeight}
  const [message, setMessage] = useState(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditEvents, setAuditEvents] = useState([]);

  const allFields = useMemo(() => {
    const out = [];
    for (const u of uploaded) {
      const ex = extractions[u.fileId];
      if (!ex) continue;
      for (const f of ex.fields || []) out.push({ ...f, fileId: u.fileId, filename: u.filename });
    }
    return out;
  }, [uploaded, extractions]);

  async function onUploadFiles(files) {
    setMessage(null);
    setBusy(true);
    try {
      const fd = new FormData();
      for (const f of files) fd.append('files', f);

      const resp = await fetch('/api/itr/upload', { method: 'POST', body: fd });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || data?.error || 'Upload failed');

      setUploaded((prev) => [...prev, ...(data.files || [])]);
      setMessage('Uploaded. Next: Extract values (no guessing).');
    } catch (e) {
      setMessage(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function runExtract() {
    setMessage(null);
    setBusy(true);
    try {
      const fileIds = uploaded.map((u) => u.fileId);
      const resp = await fetch('/api/itr/extract', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fileIds }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.userMessage || data?.message || data?.error || 'Extraction failed');

      const next = {};
      for (const r of data.results || []) {
        next[r.fileId] = { fields: r.fields || [] };
      }
      setExtractions((prev) => ({ ...prev, ...next }));
      setMessage('Extraction complete. Review flagged fields and correct manually.');
    } catch (e) {
      setMessage(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function saveOverride(fileId, fieldKey, newValueText) {
    setMessage(null);
    setBusy(true);
    try {
      const resp = await fetch('/api/itr/override', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fileId, fieldKey, newValueText }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || data?.error || 'Override failed');
      setMessage('Saved manual override.');
    } catch (e) {
      setMessage(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function runValidate() {
    setMessage(null);
    setBusy(true);
    try {
      const fileIds = uploaded.map((u) => u.fileId);
      const resp = await fetch('/api/itr/validate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fileIds }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || data?.error || 'Validation failed');
      if (data.ok) setMessage('Validation: OK');
      else setMessage(`Validation warnings: ${data.flags?.length || 0}. Open highlighted sources and confirm values.`);
    } catch (e) {
      setMessage(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function deleteFile(fileId) {
    setMessage(null);
    setBusy(true);
    try {
      const resp = await fetch('/api/itr/delete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fileId }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || data?.error || 'Delete failed');
      setUploaded((prev) => prev.filter((u) => u.fileId !== fileId));
      setExtractions((prev) => {
        const n = { ...prev };
        delete n[fileId];
        return n;
      });
      setMessage('Deleted file and related artifacts.');
    } catch (e) {
      setMessage(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function fetchAudit() {
    const resp = await fetch('/api/itr/audit', { cache: 'no-store' });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.message || data?.error || 'Audit fetch failed');
    setAuditEvents(Array.isArray(data?.events) ? data.events : []);
  }

  async function toggleAudit() {
    try {
      if (!auditOpen) await fetchAudit();
      setAuditOpen((v) => !v);
    } catch (e) {
      setMessage(e?.message || String(e));
    }
  }

  function exportPdfSummary() {
    const rows = allFields.map((f) => [
      String(f.label || ''),
      String(f.valueText ?? ''),
      String(f.status || ''),
      f.source?.page ? `p.${f.source.page}` : '',
    ]);

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('ITR Extraction Summary (Educational)', 40, 48);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(
      'Disclaimer: This summary is for educational estimation only. No automatic numeric guessing was performed. You must verify every value against the source document before filing.',
      40,
      66,
      { maxWidth: 515 }
    );

    autoTable(doc, {
      startY: 92,
      head: [['Field', 'Value (as extracted/entered)', 'Status', 'Source'] ],
      body: rows,
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 40, right: 40 },
    });

    doc.save('itr-summary.pdf');
  }

  async function downloadJson() {
    setMessage(null);
    setBusy(true);
    try {
      const fileIds = uploaded.map((u) => u.fileId).join(',');
      const resp = await fetch(`/api/itr/download-json?fileIds=${encodeURIComponent(fileIds)}`);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || data?.error || 'Download failed');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'itr-extraction.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage('Downloaded JSON.');
    } catch (e) {
      setMessage(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-sm text-white/85 font-medium">Upload → Extract → Review → Validate → Export</div>
          <div className="text-xs text-white/60">No paid APIs. No numeric guessing. Every value must trace to a source token.</div>
        </div>
        <div className="flex items-center gap-2">
          <label className={`px-3 py-2 rounded-xl border border-white/15 text-sm ${busy ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-white/25'}`}>
            <input
              type="file"
              accept="application/pdf,image/*"
              multiple
              disabled={busy}
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length) onUploadFiles(files);
                e.target.value = '';
              }}
            />
            Upload
          </label>
          <button
            type="button"
            disabled={busy || uploaded.length === 0}
            onClick={runExtract}
            className={`px-3 py-2 rounded-xl text-sm border border-white/15 ${busy || uploaded.length === 0 ? 'opacity-60' : 'hover:border-white/25'}`}
          >
            Extract
          </button>
          <button
            type="button"
            disabled={busy || uploaded.length === 0}
            onClick={runValidate}
            className={`px-3 py-2 rounded-xl text-sm border border-white/15 ${busy || uploaded.length === 0 ? 'opacity-60' : 'hover:border-white/25'}`}
          >
            Validate
          </button>
          <button
            type="button"
            disabled={busy || uploaded.length === 0}
            onClick={downloadJson}
            className={`px-3 py-2 rounded-xl text-sm border border-white/15 ${busy || uploaded.length === 0 ? 'opacity-60' : 'hover:border-white/25'}`}
          >
            Export JSON
          </button>
          <button
            type="button"
            disabled={busy || allFields.length === 0}
            onClick={exportPdfSummary}
            className={`px-3 py-2 rounded-xl text-sm border border-white/15 ${busy || allFields.length === 0 ? 'opacity-60' : 'hover:border-white/25'}`}
          >
            Export PDF
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={toggleAudit}
            className={`px-3 py-2 rounded-xl text-sm border border-white/15 ${busy ? 'opacity-60' : 'hover:border-white/25'}`}
          >
            {auditOpen ? 'Hide audit' : 'View audit'}
          </button>
        </div>
      </div>

      {message ? <div className="mt-4 text-xs text-white/70">{message}</div> : null}

      <div className="mt-5">
        <ITRDisclaimer />
      </div>

      {uploaded.length > 0 ? (
        <div className="mt-6">
          <div className="text-sm text-white/80 mb-2">Uploaded files</div>
          <div className="space-y-2">
            {uploaded.map((u) => (
              <div key={u.fileId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-white/10 p-3">
                <div className="min-w-0">
                  <div className="text-sm text-white/90 truncate">{u.filename}</div>
                  <div className="text-xs text-white/60 flex flex-wrap gap-2">
                    <Badge>{u.docType}</Badge>
                    <Badge tone={u.type === 'DIGITAL_PDF' ? 'ok' : 'warn'}>{u.type}</Badge>
                    <span>{u.pages} page(s)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-white/55">FileId: {u.fileId}</div>
                  <button
                    type="button"
                    disabled={busy}
                    className={`px-2 py-1 rounded-lg border border-white/15 text-xs ${busy ? 'opacity-60' : 'hover:border-white/25'}`}
                    onClick={() => deleteFile(u.fileId)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {auditOpen ? (
        <div className="mt-6 rounded-xl border border-white/10 p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/80">Audit log (session)</div>
            <button
              type="button"
              className="px-2 py-1 rounded-lg border border-white/15 text-xs hover:border-white/25"
              onClick={async () => {
                try {
                  await fetchAudit();
                } catch (e) {
                  setMessage(e?.message || String(e));
                }
              }}
            >
              Refresh
            </button>
          </div>
          <div className="mt-2 max-h-56 overflow-auto text-[11px] text-white/65">
            {auditEvents.length === 0 ? (
              <div className="text-white/45">No audit events yet.</div>
            ) : (
              auditEvents.map((ev, i) => (
                <div key={i} className="py-1 border-b border-white/5">
                  <span className="text-white/80">{ev.type}</span>
                  {ev.fieldKey ? <span> — {ev.fieldKey}</span> : null}
                  {ev.at ? <span className="text-white/45"> — {ev.at}</span> : null}
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {allFields.length > 0 ? (
        <div className="mt-8">
          <div className="text-sm text-white/80 mb-2">Extracted fields (review required)</div>
          <div className="overflow-auto rounded-xl border border-white/10">
            <table className="min-w-[820px] w-full text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="p-3 text-xs text-white/70">Field</th>
                  <th className="p-3 text-xs text-white/70">Value</th>
                  <th className="p-3 text-xs text-white/70">Status</th>
                  <th className="p-3 text-xs text-white/70">Source</th>
                </tr>
              </thead>
              <tbody>
                {allFields.map((f) => (
                  <tr key={`${f.fileId}:${f.key}`} className="border-t border-white/10">
                    <td className="p-3 text-xs text-white/85">
                      <div className="text-white/90">{f.label}</div>
                      <div className="text-white/50">{f.key}</div>
                    </td>
                    <td className="p-3">
                      <input
                        className="w-full bg-transparent border border-white/15 rounded-lg px-2 py-1 text-xs text-white/85"
                        value={f.valueText ?? ''}
                        placeholder="(missing)"
                        onChange={(e) => {
                          const v = e.target.value;
                          setExtractions((prev) => {
                            const ex = prev[f.fileId];
                            if (!ex) return prev;
                            const fields = (ex.fields || []).map((x) => (x.key === f.key ? { ...x, valueText: v, status: 'FLAGGED' } : x));
                            return { ...prev, [f.fileId]: { ...ex, fields } };
                          });
                        }}
                        onBlur={(e) => saveOverride(f.fileId, f.key, e.target.value)}
                      />
                    </td>
                    <td className="p-3 text-xs">
                      {f.status === 'OK' ? <Badge tone="ok">OK</Badge> : <Badge tone="warn">FLAGGED</Badge>}
                      {f.reason ? <div className="mt-1 text-[11px] text-white/50">{f.reason}</div> : null}
                    </td>
                    <td className="p-3 text-xs text-white/70">
                      {f.source?.page ? (
                        <button
                          type="button"
                          className="underline underline-offset-4 hover:text-white"
                          onClick={() =>
                            setActiveSource({
                              fileId: f.fileId,
                              page: f.source.page,
                              bbox: f.source.bbox,
                              pageWidth: f.source.pageWidth,
                              pageHeight: f.source.pageHeight,
                            })
                          }
                        >
                          View source (p.{f.source.page})
                        </button>
                      ) : (
                        <span className="text-white/45">No source</span>
                      )}
                      <div className="mt-1 text-[11px] text-white/45 truncate">{f.filename}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-[11px] text-white/55">
            Note: flagged means missing/low-confidence/format mismatch — values must be manually confirmed.
          </div>
        </div>
      ) : null}

      {activeSource ? (
        <PDFSourceViewer
          fileId={activeSource.fileId}
          page={activeSource.page}
          bbox={activeSource.bbox}
          pageWidth={activeSource.pageWidth}
          pageHeight={activeSource.pageHeight}
          onClose={() => setActiveSource(null)}
        />
      ) : null}
    </div>
  );
}
