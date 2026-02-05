'use client';

import { useMemo, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ITRDisclaimer from '@/components/Legal/ITRDisclaimer';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const PDFSidePanel = dynamic(() => import('./PDFSidePanel'), { ssr: false });

// LUX Theme (matches About Us page exactly)
const LUX = {
  background: 'oklch(0.06 0.005 280)',
  foreground: 'oklch(0.95 0.01 85)',
  foreground80: 'oklch(0.95 0.01 85 / 0.80)',
  foreground60: 'oklch(0.95 0.01 85 / 0.60)',
  foreground40: 'oklch(0.95 0.01 85 / 0.40)',
  foreground10: 'oklch(0.95 0.01 85 / 0.10)',
  foreground05: 'oklch(0.95 0.01 85 / 0.05)',
  card: 'oklch(0.10 0.005 280)',
  muted: 'oklch(0.55 0.01 85)',
  accent: 'oklch(0.78 0.08 65)',
};

// Theme wrapper styles
const themeStyles = {
  '--lux-background': LUX.background,
  '--lux-foreground': LUX.foreground,
  '--lux-foreground-80': LUX.foreground80,
  '--lux-foreground-60': LUX.foreground60,
  '--lux-foreground-40': LUX.foreground40,
  '--lux-foreground-10': LUX.foreground10,
  '--lux-foreground-05': LUX.foreground05,
  '--lux-card': LUX.card,
  '--lux-muted': LUX.muted,
  '--lux-accent': LUX.accent,
};

// Icons
const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const ExtractIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const ValidateIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const FileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-[var(--lux-card)] text-[var(--lux-foreground-60)] border-[var(--lux-foreground-10)]',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-[var(--lux-accent)]/20 text-[var(--lux-accent)] border-[var(--lux-accent)]/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded border ${variants[variant]}`}>
      {children}
    </span>
  );
}

function Button({ children, onClick, disabled, variant = 'default', size = 'md', className = '' }) {
  const variants = {
    default: 'bg-[var(--lux-card)] hover:bg-[var(--lux-foreground-10)] text-[var(--lux-foreground)] border-[var(--lux-foreground-10)]',
    primary: 'bg-[var(--lux-accent)] hover:brightness-110 text-[var(--lux-background)] font-semibold border-[var(--lux-accent)]',
    success: 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white border-emerald-500',
    ghost: 'bg-transparent hover:bg-[var(--lux-foreground-05)] text-[var(--lux-foreground-60)] border-transparent',
    danger: 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-500/30',
  };
  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg border transition-all duration-200 ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export default function ITRWorkbench() {
  const [busy, setBusy] = useState(false);
  const [busyAction, setBusyAction] = useState(null);
  const [uploaded, setUploaded] = useState([]);
  const [extractions, setExtractions] = useState({});
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [panel, setPanel] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const allFields = useMemo(() => {
    const out = [];
    for (const u of uploaded) {
      const ex = extractions[u.fileId];
      if (!ex) continue;
      for (const f of ex.fields || []) out.push({ ...f, fileId: u.fileId, filename: u.filename });
    }
    return out;
  }, [uploaded, extractions]);

  const showMessage = useCallback((msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
    if (type !== 'error') {
      setTimeout(() => setMessage(null), 5000);
    }
  }, []);

  async function onUploadFiles(files) {
    setMessage(null);
    setBusy(true);
    setBusyAction('upload');
    try {
      const fd = new FormData();
      for (const f of files) fd.append('files', f);

      const resp = await fetch('/api/itr/upload', { method: 'POST', body: fd });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || data?.error || 'Upload failed');

      setUploaded((prev) => [...prev, ...(data.files || [])]);
      showMessage(`✓ ${data.files?.length || 1} file(s) uploaded successfully. Click "Extract Data" to parse.`, 'success');

      const first = (data.files || [])[0];
      if (first?.fileId) {
        setPanel({ fileId: first.fileId, page: 1, bbox: null, pageWidth: null, pageHeight: null });
      }
    } catch (e) {
      showMessage(e?.message || String(e), 'error');
    } finally {
      setBusy(false);
      setBusyAction(null);
    }
  }

  async function runExtract() {
    setMessage(null);
    setBusy(true);
    setBusyAction('extract');
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
      let totalFields = 0;
      let flaggedFields = 0;
      for (const r of data.results || []) {
        next[r.fileId] = { fields: r.fields || [], warnings: r.warnings || [] };
        totalFields += (r.fields || []).length;
        flaggedFields += (r.fields || []).filter(f => f.status === 'FLAGGED').length;
      }
      setExtractions((prev) => ({ ...prev, ...next }));
      
      if (flaggedFields > 0) {
        showMessage(`Extracted ${totalFields} fields. ${flaggedFields} need manual review (highlighted in yellow).`, 'warning');
      } else {
        showMessage(`✓ Extracted ${totalFields} fields successfully.`, 'success');
      }
    } catch (e) {
      showMessage(e?.message || String(e), 'error');
    } finally {
      setBusy(false);
      setBusyAction(null);
    }
  }

  async function saveOverride(fileId, fieldKey, newValueText) {
    try {
      await fetch('/api/itr/override', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fileId, fieldKey, newValueText }),
      });
    } catch (e) {
      // Silent fail for auto-save
    }
  }

  async function runValidate() {
    setMessage(null);
    setBusy(true);
    setBusyAction('validate');
    try {
      const fileIds = uploaded.map((u) => u.fileId);
      const resp = await fetch('/api/itr/validate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fileIds }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || data?.error || 'Validation failed');
      if (data.ok) {
        showMessage('✓ Validation passed! All values look consistent.', 'success');
      } else {
        showMessage(`Found ${data.flags?.length || 0} inconsistencies. Review flagged fields.`, 'warning');
      }
    } catch (e) {
      showMessage(e?.message || String(e), 'error');
    } finally {
      setBusy(false);
      setBusyAction(null);
    }
  }

  async function deleteFile(fileId) {
    setBusy(true);
    try {
      await fetch('/api/itr/delete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fileId }),
      });
      setUploaded((prev) => prev.filter((u) => u.fileId !== fileId));
      setExtractions((prev) => {
        const n = { ...prev };
        delete n[fileId];
        return n;
      });
      if (panel?.fileId === fileId) setPanel(null);
      showMessage('File deleted.', 'info');
    } catch (e) {
      showMessage(e?.message || String(e), 'error');
    } finally {
      setBusy(false);
    }
  }

  function exportPdfSummary() {
    const rows = allFields.map((f) => [
      String(f.label || ''),
      String(f.valueText ?? '-'),
      f.status === 'OK' ? 'OK' : 'Review Required',
      f.source?.page ? `Page ${f.source.page}` : '-',
    ]);

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('ITR Extraction Summary', 40, 48);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Educational estimate only. Verify all values before filing.', 40, 66);
    doc.setTextColor(0);

    autoTable(doc, {
      startY: 85,
      head: [['Field', 'Value', 'Status', 'Source']],
      body: rows,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 40, right: 40 },
    });

    doc.save('itr-extraction-summary.pdf');
    showMessage('PDF summary downloaded.', 'success');
  }

  async function downloadJson() {
    setBusy(true);
    setBusyAction('export');
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
      showMessage('JSON data downloaded.', 'success');
    } catch (e) {
      showMessage(e?.message || String(e), 'error');
    } finally {
      setBusy(false);
      setBusyAction(null);
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length) onUploadFiles(files);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  return (
    <div style={themeStyles} className="min-h-[600px] text-[color:var(--lux-foreground)]">
      {/* Header / Status Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg border flex items-start gap-2 text-sm ${
          messageType === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
          messageType === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
          messageType === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
          'bg-[var(--lux-accent)]/10 border-[var(--lux-accent)]/30 text-[var(--lux-accent)]'
        }`}>
          {messageType === 'success' && <CheckIcon />}
          {messageType === 'warning' && <AlertIcon />}
          {messageType === 'error' && <AlertIcon />}
          <span>{message}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_480px] gap-6">
        {/* Left Column: Main Content */}
        <div className="space-y-6">
          {/* Step 1: Upload */}
          <div className="bg-[var(--lux-card)] border border-[var(--lux-foreground-10)] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--lux-accent)]/20 flex items-center justify-center text-[var(--lux-accent)] font-bold text-sm">1</div>
              <h3 className="text-[color:var(--lux-foreground)] font-semibold">Upload Documents</h3>
            </div>
            
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragOver ? 'border-[var(--lux-accent)] bg-[var(--lux-accent)]/10' : 'border-[var(--lux-foreground-10)] hover:border-[var(--lux-accent)]/50'
              }`}
            >
              <input
                type="file"
                accept="application/pdf,image/*"
                multiple
                disabled={busy}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length) onUploadFiles(files);
                  e.target.value = '';
                }}
              />
              <div className="flex flex-col items-center gap-3">
                {busyAction === 'upload' ? <SpinnerIcon /> : <UploadIcon />}
                <div>
                  <p className="text-[color:var(--lux-foreground)] font-medium">Drop files here or click to browse</p>
                  <p className="text-[color:var(--lux-foreground-60)] text-sm mt-1">Supports Form 16, AIS, Bank Statements (PDF)</p>
                </div>
              </div>
            </div>

            {/* Uploaded Files List */}
            {uploaded.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploaded.map((u) => (
                  <div key={u.fileId} className="flex items-center justify-between bg-[var(--lux-background)]/80 rounded-lg p-3 border border-[var(--lux-foreground-10)]">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileIcon />
                      <div className="min-w-0">
                        <p className="text-[color:var(--lux-foreground)] text-sm font-medium truncate">{u.filename}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={u.type === 'DIGITAL_PDF' ? 'success' : 'warning'}>
                            {u.type === 'DIGITAL_PDF' ? 'Digital' : 'Scanned'}
                          </Badge>
                          <Badge variant="info">{u.docType || 'unknown'}</Badge>
                          <span className="text-[color:var(--lux-foreground-40)] text-xs">{u.pages} page(s)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setPanel({ fileId: u.fileId, page: 1, bbox: null })}>
                        <EyeIcon />
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => deleteFile(u.fileId)} disabled={busy}>
                        <TrashIcon />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Extract & Validate */}
          {uploaded.length > 0 && (
            <div className="bg-[var(--lux-card)] border border-[var(--lux-foreground-10)] rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--lux-accent)]/20 flex items-center justify-center text-[var(--lux-accent)] font-bold text-sm">2</div>
              <h3 className="text-[color:var(--lux-foreground)] font-semibold">Extract & Review Data</h3>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" onClick={runExtract} disabled={busy}>
                  {busyAction === 'extract' ? <SpinnerIcon /> : <ExtractIcon />}
                  Extract Data
                </Button>
                <Button variant="success" onClick={runValidate} disabled={busy || allFields.length === 0}>
                  {busyAction === 'validate' ? <SpinnerIcon /> : <ValidateIcon />}
                  Validate
                </Button>
                <Button variant="default" onClick={exportPdfSummary} disabled={busy || allFields.length === 0}>
                  <DownloadIcon />
                  Export PDF
                </Button>
                <Button variant="default" onClick={downloadJson} disabled={busy || allFields.length === 0}>
                  {busyAction === 'export' ? <SpinnerIcon /> : <DownloadIcon />}
                  Export JSON
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Extracted Data Table */}
          {allFields.length > 0 && (
            <div className="bg-[var(--lux-card)] border border-[var(--lux-foreground-10)] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--lux-accent)]/20 flex items-center justify-center text-[var(--lux-accent)] font-bold text-sm">3</div>
                  <h3 className="text-[color:var(--lux-foreground)] font-semibold">Extracted Values</h3>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="success">{allFields.filter(f => f.status === 'OK').length} OK</Badge>
                  <Badge variant="warning">{allFields.filter(f => f.status !== 'OK').length} Need Review</Badge>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[var(--lux-foreground-10)]">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[var(--lux-background)]">
                      <th className="text-left p-3 text-xs font-semibold text-[color:var(--lux-foreground-60)] uppercase tracking-wider">Field</th>
                      <th className="text-left p-3 text-xs font-semibold text-[color:var(--lux-foreground-60)] uppercase tracking-wider min-w-[180px]">Value</th>
                      <th className="text-center p-3 text-xs font-semibold text-[color:var(--lux-foreground-60)] uppercase tracking-wider">Status</th>
                      <th className="text-left p-3 text-xs font-semibold text-[color:var(--lux-foreground-60)] uppercase tracking-wider">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--lux-foreground-10)]">
                    {allFields.map((f) => (
                      <tr key={`${f.fileId}:${f.key}`} className={`hover:bg-[var(--lux-card)]/50 transition-colors ${f.status !== 'OK' ? 'bg-amber-500/5' : ''}`}>
                        <td className="p-3">
                          <div className="text-[color:var(--lux-foreground)] text-sm font-medium">{f.label}</div>
                          <div className="text-[color:var(--lux-foreground-40)] text-xs mt-0.5">{f.key}</div>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            className={`w-full bg-[var(--lux-card)]/80 border rounded-lg px-3 py-2 text-sm text-[color:var(--lux-foreground)] placeholder-[color:var(--lux-foreground-40)] focus:outline-none focus:ring-2 focus:ring-[var(--lux-accent)]/50 ${
                              f.status !== 'OK' ? 'border-amber-500/50' : 'border-[var(--lux-foreground-10)]'
                            }`}
                            value={f.valueText ?? ''}
                            placeholder="Enter value..."
                            onChange={(e) => {
                              const v = e.target.value;
                              setExtractions((prev) => {
                                const ex = prev[f.fileId];
                                if (!ex) return prev;
                                const fields = (ex.fields || []).map((x) =>
                                  x.key === f.key ? { ...x, valueText: v, status: 'FLAGGED' } : x
                                );
                                return { ...prev, [f.fileId]: { ...ex, fields } };
                              });
                            }}
                            onFocus={() => {
                              if (f.source?.page) {
                                setPanel({
                                  fileId: f.fileId,
                                  page: f.source.page,
                                  bbox: f.source.bbox,
                                  pageWidth: f.source.pageWidth,
                                  pageHeight: f.source.pageHeight,
                                });
                              }
                            }}
                            onBlur={(e) => saveOverride(f.fileId, f.key, e.target.value)}
                          />
                        </td>
                        <td className="p-3 text-center">
                          {f.status === 'OK' ? (
                            <Badge variant="success">
                              <CheckIcon />
                              <span className="ml-1">OK</span>
                            </Badge>
                          ) : (
                            <Badge variant="warning">
                              <AlertIcon />
                              <span className="ml-1">Review</span>
                            </Badge>
                          )}
                        </td>
                        <td className="p-3">
                          {f.source?.page ? (
                            <button
                              type="button"
                              className="text-[var(--lux-accent)] hover:brightness-110 text-sm flex items-center gap-1 transition-colors"
                              onClick={() =>
                                setPanel({
                                  fileId: f.fileId,
                                  page: f.source.page,
                                  bbox: f.source.bbox,
                                  pageWidth: f.source.pageWidth,
                                  pageHeight: f.source.pageHeight,
                                })
                              }
                            >
                              <EyeIcon />
                              Page {f.source.page}
                            </button>
                          ) : (
                            <span className="text-[color:var(--lux-foreground-40)] text-sm">—</span>
                          )}
                          {f.reason && (
                            <div className="text-amber-400/70 text-xs mt-1">{f.reason.replace(/_/g, ' ')}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[color:var(--lux-foreground-40)] text-xs mt-3">
                💡 Click on a field to view its source in the PDF. Yellow rows need manual verification.
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <ITRDisclaimer />
        </div>

        {/* Right Column: PDF Viewer */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          {panel?.fileId ? (
            <PDFSidePanel
              fileId={panel.fileId}
              page={panel.page}
              bbox={panel.bbox}
              pageWidth={panel.pageWidth}
              pageHeight={panel.pageHeight}
              onClose={() => setPanel(null)}
              onPageChange={(nextPage) =>
                setPanel((prev) => (prev ? { ...prev, page: Number(nextPage || 1) || 1 } : prev))
              }
            />
          ) : (
            <div className="bg-[var(--lux-card)] border border-[var(--lux-foreground-10)] rounded-xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--lux-background)] flex items-center justify-center">
                <FileIcon />
              </div>
              <h4 className="text-[color:var(--lux-foreground)] font-medium mb-2">PDF Preview</h4>
              <p className="text-[color:var(--lux-foreground-60)] text-sm">
                Upload a document to view it here. Click on extracted values to highlight their source.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
