'use client';

import { useEffect, useMemo, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function PDFSourceViewer({ fileId, page, bbox, pageWidth, pageHeight, onClose }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(null);
  const [pagePxWidth, setPagePxWidth] = useState(880);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setError(null);
        const resp = await fetch(`/api/itr/file?fileId=${encodeURIComponent(fileId)}`, { cache: 'no-store' });
        if (!resp.ok) throw new Error(`Failed to load PDF (${resp.status})`);
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        if (!active) return;
        setBlobUrl(url);
      } catch (e) {
        if (!active) return;
        setError(e?.message || String(e));
      }
    })();
    return () => {
      active = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  const overlay = useMemo(() => {
    if (!bbox || !pageWidth || !pageHeight) return null;
    const scale = pagePxWidth / pageWidth;
    const left = clamp(bbox.x0 * scale, 0, pagePxWidth);
    const top = clamp(bbox.top * scale, 0, pageHeight * scale);
    const width = clamp((bbox.x1 - bbox.x0) * scale, 0, pagePxWidth);
    const height = clamp((bbox.bottom - bbox.top) * scale, 0, pageHeight * scale);
    return { left, top, width, height };
  }, [bbox, pageWidth, pageHeight, pagePxWidth]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl rounded-2xl border border-white/10 ultra-luxury-glass p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-white/80">Source viewer — page {page}</div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-white/60">Width</label>
            <input
              type="range"
              min={640}
              max={1100}
              value={pagePxWidth}
              onChange={(e) => setPagePxWidth(Number(e.target.value))}
            />
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl border border-white/15 text-xs hover:border-white/25"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        {error ? <div className="mt-3 text-xs text-amber-200">{error}</div> : null}

        <div className="mt-3 overflow-auto rounded-xl border border-white/10 bg-black/30">
          {blobUrl ? (
            <div className="relative inline-block">
              <Document file={blobUrl} loading={<div className="p-6 text-xs text-white/60">Loading…</div>}>
                <div className="relative">
                  <Page pageNumber={page} width={pagePxWidth} renderTextLayer={false} renderAnnotationLayer={false} />
                  {overlay ? (
                    <div
                      className="absolute border-2 border-amber-300/90 bg-amber-300/20"
                      style={{ left: overlay.left, top: overlay.top, width: overlay.width, height: overlay.height }}
                    />
                  ) : null}
                </div>
              </Document>
            </div>
          ) : (
            <div className="p-6 text-xs text-white/60">Loading PDF…</div>
          )}
        </div>

        <div className="mt-2 text-[11px] text-white/50">
          Highlight uses word-level bbox from extraction output. If this doc is scanned, OCR source highlights require the OCR worker.
        </div>
      </div>
    </div>
  );
}
