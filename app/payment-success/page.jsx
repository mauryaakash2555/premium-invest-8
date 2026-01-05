"use client";

import { useEffect, useMemo, useState } from "react";

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export default function PaymentSuccessPage() {
  const [query, setQuery] = useState({
    downloadToken: "",
    tokenPayload: "",
    leadId: "",
    filename: "Mumbai-Property-vs-SIP-Wealth-Gap-Report.pdf",
    emailStatus: "",
  });

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Preparing your PDF…");
  const [lastError, setLastError] = useState("");

  const canDownload = useMemo(() => Boolean(query.downloadToken && query.tokenPayload), [query.downloadToken, query.tokenPayload]);

  async function doDownload() {
    if (!canDownload) {
      setLastError("Missing download authorization. Please contact support.");
      return;
    }

    setBusy(true);
    setLastError("");
    setStatus("Generating your premium PDF…");

    try {
      const res = await fetch("/api/pdf/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "property_vs_sip_paid",
          leadId: query.leadId || undefined,
          downloadToken: query.downloadToken,
          tokenPayload: query.tokenPayload,
        }),
      });

      if (!res.ok) {
        setLastError("Could not generate your PDF right now. Please try again.");
        setStatus("PDF generation failed.");
        return;
      }

      const blob = await res.blob();
      downloadBlob(query.filename, blob);
      setStatus("Downloaded successfully.");
    } catch {
      setLastError("Something went wrong while downloading.");
      setStatus("Download failed.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search || "");
      setQuery({
        downloadToken: sp.get("downloadToken") || "",
        tokenPayload: sp.get("tokenPayload") || "",
        leadId: sp.get("leadId") || "",
        filename: sp.get("filename") || "Mumbai-Property-vs-SIP-Wealth-Gap-Report.pdf",
        emailStatus: sp.get("emailStatus") || "",
      });
    } catch {}

    // Auto-download once on load.
    void doDownload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-[70vh] px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold">Payment Successful</h1>
        <p className="mt-2 text-sm opacity-80">{status}</p>

        {query.emailStatus ? (
          <p className="mt-2 text-sm opacity-80">
            Email status: <span className="font-medium">{query.emailStatus}</span>
          </p>
        ) : null}

        {lastError ? <p className="mt-4 text-sm text-red-400">{lastError}</p> : null}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            className="rounded-md bg-[color:var(--color-matte-gold)] px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
            disabled={busy}
            onClick={() => void doDownload()}
          >
            {busy ? "Working…" : "Download Again"}
          </button>

          <a
            className="rounded-md border border-white/10 px-4 py-2 text-sm font-semibold"
            href="/tools/property-vs-sip"
          >
            Back to Tool
          </a>
        </div>

        {!canDownload ? (
          <p className="mt-6 text-xs opacity-70">
            Note: This page needs a valid download token from the payment confirmation.
          </p>
        ) : null}
      </div>
    </main>
  );
}
