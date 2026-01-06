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
    name: "",
    email: "",
    gap: "",
  });

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Preparing your PDF…");
  const [lastError, setLastError] = useState("");
  const [step, setStep] = useState(1);

  const canDownload = useMemo(() => Boolean(query.downloadToken && query.tokenPayload), [query.downloadToken, query.tokenPayload]);

  async function doDownload() {
    if (!canDownload) {
      setLastError("Missing download authorization. Please contact support.");
      return;
    }

    setBusy(true);
    setLastError("");
    setStep(2);
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
      setStep(3);
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
        name: sp.get("name") || "",
        email: sp.get("email") || "",
        gap: sp.get("gap") || "",
      });
    } catch {}

    // Auto-download once on load.
    void doDownload();
  }, []);

  return (
    <main className="min-h-[70vh] px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold">Payment Successful</h1>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between text-[12px] text-slate-200/80">
            <span className={step >= 1 ? "text-white" : ""}>Payment confirmed</span>
            <span className={step >= 2 ? "text-white" : ""}>Preparing PDF</span>
            <span className={step >= 3 ? "text-white" : ""}>Download ready</span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-black/30 overflow-hidden" aria-hidden>
            <div
              className="h-full bg-[color:var(--color-matte-gold)] transition-all duration-500"
              style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
            />
          </div>
          {(query.name || query.email || query.gap) ? (
            <div className="mt-3 text-[12px] text-slate-200/70">
              {query.name ? <div>Name: <span className="text-white/90">{query.name}</span></div> : null}
              {query.email ? <div>Email: <span className="text-white/90">{query.email}</span></div> : null}
              {query.gap ? <div>Wealth gap: <span className="text-white/90">₹{query.gap}Cr</span></div> : null}
            </div>
          ) : null}
        </div>

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

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold text-white">Need help?</div>
          <p className="mt-1 text-[12px] text-slate-200/75">WhatsApp us and we’ll help you download your PDF.</p>
          <a
            className="mt-3 inline-block rounded-md bg-[color:var(--color-matte-gold)] px-4 py-2 text-sm font-semibold text-black"
            href={`https://wa.me/918850977259?text=${encodeURIComponent(
              `Hi BM Wealth, I paid ₹399. Please help me with my Property vs SIP report. Name: ${query.name || ""} Email: ${query.email || ""} Gap: ${query.gap ? `₹${query.gap}Cr` : ""}`
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp Support
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
