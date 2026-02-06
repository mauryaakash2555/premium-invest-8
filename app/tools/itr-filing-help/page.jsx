'use client';

import { useState } from 'react';

export default function ITRFilingHelp() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [errorDebug, setErrorDebug] = useState(null);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setErrorDebug(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/itr/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setResult(data.extracted);
      } else {
        setError(data.error || 'Extraction failed');
        setErrorDebug(data.debug || null);
      }
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[--lux-background] text-[--lux-foreground] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-semibold mb-2">Free ITR Filing Help</h1>
        <p className="text-[--lux-foreground-60] mb-8">Upload Form 16, AIS, or Bank Interest Statement</p>

        <div className="bg-[--lux-card] border border-[--lux-foreground-10] rounded-lg p-8 mb-8">
          <input
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            disabled={uploading}
            className="w-full"
          />
          {uploading && <p className="mt-4 text-[--lux-accent]">Extracting...</p>}
        </div>

        {error && (
          <div className="bg-[--lux-card] border border-[--destructive] rounded-lg p-4 mb-8">
            <p className="text-[--destructive] font-medium">Error: {error}</p>
            {errorDebug && (
              <p className="mt-2 text-sm text-[--lux-foreground-60]">
                Debug: pages={String(errorDebug.pages ?? '')} textLength={String(errorDebug.textLength ?? '')}
              </p>
            )}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-[--lux-card] border border-[--lux-foreground-10] rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-[--lux-accent]">Extraction Info</h3>
              <div className="space-y-2 text-[--lux-foreground-80]">
                <p>
                  Pages: <span className="text-[--lux-foreground]">{result.totalPages}</span>
                </p>
                <p>
                  Text length: <span className="text-[--lux-foreground]">{result.totalTextLength} characters</span>
                </p>
                <p>
                  Fields found:{' '}
                  <span className="text-[--lux-foreground]">{Object.keys(result.fields || {}).length}</span>
                </p>
              </div>
            </div>

            <div className="bg-[--lux-card] border border-[--lux-foreground-10] rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Extracted Fields</h3>

              {Object.keys(result.fields || {}).length === 0 ? (
                <div className="border border-[--lux-foreground-10] rounded p-4">
                  <p className="text-[--lux-accent] font-medium">No fields extracted automatically.</p>
                  <p className="text-sm text-[--lux-foreground-60] mt-2">
                    Check the raw text preview below to see what was extracted from the PDF.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(result.fields).map(([key, data]) => (
                    <div key={key} className="flex items-center justify-between gap-4 border-b border-[--lux-foreground-10] pb-3">
                      <div>
                        <p className="font-semibold">
                          {String(key)
                            .replace(/([A-Z])/g, ' $1')
                            .trim()}
                        </p>
                        <p className="text-sm text-[--lux-foreground-60]">Raw: {data.raw}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-mono text-[--lux-accent]">
                          ₹{Number(data.value || 0).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-[--lux-foreground-40]">
                          Confidence: {Number((data.confidence || 0) * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <details className="bg-[--lux-card] border border-[--lux-foreground-10] rounded-lg p-6">
              <summary className="cursor-pointer font-semibold text-[--lux-accent]">
                Raw Text Preview (click to expand)
              </summary>
              <pre className="mt-4 text-xs overflow-auto max-h-96 border border-[--lux-foreground-10] rounded p-4 bg-[--lux-background] text-[--lux-foreground-80]">
                {result.rawTextPreview}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
