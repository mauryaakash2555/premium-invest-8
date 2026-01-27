"use client";

import Link from "next/link";

const DEFAULT_WHATSAPP_NUMBER = "918850977259";

function buildWhatsAppUrl({ phone = DEFAULT_WHATSAPP_NUMBER, text }) {
  const p = String(phone || "").trim().replace(/[^\d]/g, "");
  const t = String(text || "").trim();
  if (!p || !t) return null;
  return `https://wa.me/${p}?text=${encodeURIComponent(t)}`;
}

export function ExecutionOptionsCTA({
  title = "Want help executing this?",
  subtitle = "Get a short, actionable plan from a BM Wealth expert.",
  primaryHref = "/execution-partners",
  primaryLabel = "Talk to an expert",
  whatsappNumber = DEFAULT_WHATSAPP_NUMBER,
  whatsappPrefill = "Hi BM Wealth, I just used your calculator and want help executing the next steps.",
  secondaryLabel = "WhatsApp now",
}) {
  const waUrl = buildWhatsAppUrl({ phone: whatsappNumber, text: whatsappPrefill });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-base font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm text-slate-200/75">{subtitle}</div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link
          href={primaryHref}
          className="bm-btn bm-btn-primary px-5 py-3 text-sm font-semibold tracking-wide rounded-xl text-center"
        >
          {primaryLabel}
        </Link>

        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bm-btn bm-btn-secondary px-5 py-3 text-sm font-semibold tracking-wide rounded-xl text-center"
          >
            {secondaryLabel}
          </a>
        ) : null}
      </div>

      <div className="mt-3 text-[11px] text-slate-200/60">
        We do not share your details without consent. Educational guidance only.
      </div>
    </div>
  );
}
