'use client';

import { useMemo, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = '/api/itr/pdfjs-worker';

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ZoomInIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
    />
  </svg>
);

const ZoomOutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
    />
  </svg>
);

export default function PDFSidePanel({
  fileId,
  blobUrl,
  page,
  bbox,
  pageWidth,
  pageHeight,
  onClose,
  onPageChange,
}) {
  const [pagePxWidth, setPagePxWidth] = useState(420);
  const [numPages, setNumPages] = useState(null);

  const effectiveUrl = blobUrl || null;
  const error = fileId && !effectiveUrl ? 'PDF preview unavailable (no persisted upload). Re-upload the PDF to preview it.' : null;

  const overlay = useMemo(() => {
    if (!bbox || !pageWidth || !pageHeight) return null;
    const scale = pagePxWidth / pageWidth;
    const left = clamp(bbox.x0 * scale, 0, pagePxWidth);
    const top = clamp(bbox.top * scale, 0, pageHeight * scale);
    const width = clamp((bbox.x1 - bbox.x0) * scale, 0, pagePxWidth);
    const height = clamp((bbox.bottom - bbox.top) * scale, 0, pageHeight * scale);
    return { left, top, width, height };
  }, [bbox, pageWidth, pageHeight, pagePxWidth]);

  const goToPrevPage = () => {
    if (page > 1) onPageChange?.(page - 1);
  };

  const goToNextPage = () => {
    if (numPages && page < numPages) onPageChange?.(page + 1);
  };

  return (
    <aside className="rounded-xl overflow-hidden bg-[--lux-card] border border-[--lux-foreground-10]">
      <div className="flex items-center justify-between px-4 py-3 bg-[--lux-background] border-b border-[--lux-foreground-10]">
        <h4 className="font-medium text-sm text-[--lux-foreground]">PDF Source</h4>
        <button
          type="button"
          className="p-1.5 rounded-lg transition-colors text-[--lux-foreground-60] hover:text-[--lux-foreground]"
          onClick={onClose}
          title="Close"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="flex items-center justify-between px-4 py-2 bg-[--lux-background]/80 border-b border-[--lux-foreground-10]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToPrevPage}
            disabled={page <= 1}
            className="p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[--lux-foreground-60] hover:text-[--lux-foreground]"
            title="Previous page"
          >
            <ChevronLeftIcon />
          </button>
          <div className="flex items-center gap-1.5 px-2">
            <input
              type="number"
              min={1}
              max={numPages || 1}
              className="w-12 rounded-md px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-[--lux-accent] bg-[--lux-card] border border-[--lux-foreground-10] text-[--lux-foreground]"
              value={page || 1}
              onChange={(e) => onPageChange?.(Number(e.target.value || 1))}
            />
            <span className="text-xs text-[--lux-foreground-40]">of {numPages ?? '—'}</span>
          </div>
          <button
            type="button"
            onClick={goToNextPage}
            disabled={!numPages || page >= numPages}
            className="p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[--lux-foreground-60] hover:text-[--lux-foreground]"
            title="Next page"
          >
            <ChevronRightIcon />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPagePxWidth((w) => Math.max(280, w - 60))}
            className="p-1.5 rounded-lg transition-colors text-[--lux-foreground-60] hover:text-[--lux-foreground]"
            title="Zoom out"
          >
            <ZoomOutIcon />
          </button>
          <div className="w-20">
            <input
              type="range"
              min={280}
              max={800}
              value={pagePxWidth}
              onChange={(e) => setPagePxWidth(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-[--lux-foreground-10] accent-[--lux-accent]"
            />
          </div>
          <button
            type="button"
            onClick={() => setPagePxWidth((w) => Math.min(800, w + 60))}
            className="p-1.5 rounded-lg transition-colors text-[--lux-foreground-60] hover:text-[--lux-foreground]"
            title="Zoom in"
          >
            <ZoomInIcon />
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/30">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      <div className="overflow-auto bg-[--lux-background]" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {effectiveUrl ? (
          <div className="flex justify-center p-4">
            <div className="relative inline-block shadow-2xl rounded-lg overflow-hidden">
              <Document file={effectiveUrl} loading={null} onLoadSuccess={(pdf) => setNumPages(pdf?.numPages || null)}>
                <div className="relative">
                  <Page
                    pageNumber={page || 1}
                    width={pagePxWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="bg-white"
                  />
                  {overlay && (
                    <div
                      className="absolute pointer-events-none border-2 border-[--lux-accent] bg-[--lux-accent]/20 rounded-sm animate-pulse"
                      style={{
                        left: overlay.left,
                        top: overlay.top,
                        width: Math.max(overlay.width, 4),
                        height: Math.max(overlay.height, 4),
                      }}
                    />
                  )}
                </div>
              </Document>
            </div>
          </div>
        ) : !error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-[--lux-card]">
              <svg className="w-6 h-6 text-[--lux-foreground-40]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-sm text-[--lux-foreground-60]">No PDF selected</p>
          </div>
        ) : null}
      </div>

      <div className="px-4 py-2 bg-[--lux-background]/80 border-t border-[--lux-foreground-10]">
        <p className="text-[11px] text-[--lux-foreground-40]">Highlighted areas show the source location of extracted values.</p>
      </div>
    </aside>
  );
}
