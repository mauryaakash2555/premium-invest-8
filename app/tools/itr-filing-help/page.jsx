'use client';

import { useState } from 'react';

export default function ITRFilingHelp() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
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
            <p className="text-[--destructive]">Error: {error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-[--lux-card] border border-[--lux-foreground-10] rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Extraction Info</h3>
              <p>Pages: {result.totalPages}</p>
              <p>Text items found: {result.totalTextItems}</p>
            </div>

            <div className="bg-[--lux-card] border border-[--lux-foreground-10] rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Extracted Fields</h3>

              {Object.keys(result.fields || {}).length === 0 ? (
                <p className="text-[--lux-accent]">No fields extracted. Check raw text below.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[--lux-foreground-10]">
                      <th className="text-left py-2">Field</th>
                      <th className="text-left py-2">Value</th>
                      <th className="text-left py-2">Raw</th>
                      <th className="text-left py-2">Page</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(result.fields).map(([key, data]) => (
                      <tr key={key} className="border-b border-[--lux-foreground-10]">
                        <td className="py-3">{key}</td>
                        <td className="py-3 font-mono">₹{Number(data.value || 0).toLocaleString('en-IN')}</td>
                        <td className="py-3 text-[--lux-foreground-60]">{data.raw}</td>
                        <td className="py-3">{data.page}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <details className="bg-[--lux-card] border border-[--lux-foreground-10] rounded-lg p-6">
              <summary className="cursor-pointer font-semibold">Raw Text (click to expand)</summary>
              <pre className="mt-4 text-xs overflow-auto max-h-96 text-[--lux-foreground-80]">
                {JSON.stringify(result.rawText || [], null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
