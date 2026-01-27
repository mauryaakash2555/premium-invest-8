"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { trackEvent } from "@/lib/analytics";

const DISMISS_KEY = "bm.crisisMode.dismissedAt";

function formatPct(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export default function CrisisModeBanner(props) {
  const { placement = "unknown" } = props || {};

  const [data, setData] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DISMISS_KEY);
      if (!raw) return;
      const ts = Number(raw);
      if (!Number.isFinite(ts)) return;
      // Dismiss for 12 hours.
      if (Date.now() - ts < 12 * 60 * 60 * 1000) setDismissed(true);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (dismissed) return;

    let mounted = true;
    void (async () => {
      try {
        const res = await fetch("/api/intelligence/crisis-mode?nocache=1", { cache: "no-store" });
        const json = await res.json();
        if (!mounted) return;
        setData(json);

        if (json?.active) {
          trackEvent("crisis_banner_view", {
            placement,
            min_pct: json?.minPct,
            nifty_pct: json?.indices?.nifty50,
            sensex_pct: json?.indices?.sensex,
          });
        }
      } catch {
        if (mounted) setData(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [dismissed, placement]);

  const view = useMemo(() => {
    if (!data || data?.ok === false) return null;
    if (!data?.active) return null;
    return data;
  }, [data]);

  if (dismissed || !view) return null;

  return (
    <section className="px-6 lg:px-10 pt-4">
      <div className="max-w-5xl mx-auto rounded-2xl border border-white/10 bg-black/35 backdrop-blur-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white/85">Live market alert (education-only)</div>
            <div className="mt-1 text-sm sm:text-base font-semibold gold-gradient-text">
              {view.headline || "Markets are down today"}
            </div>
            <div className="mt-1 text-xs text-white/70">
              {view.detail || "Try a quick simulation before making emotional decisions."}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/60">
              {typeof view?.indices?.nifty50 === "number" ? <span>NIFTY: {formatPct(view.indices.nifty50)}</span> : null}
              {typeof view?.indices?.sensex === "number" ? <span>SENSEX: {formatPct(view.indices.sensex)}</span> : null}
              {view?.asOf ? <span>As of: {String(view.asOf).slice(0, 16).replace("T", " ")}</span> : null}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:pl-4">
            <Link
              href={view?.cta?.href || "/intelligence/sip-vs-panic"}
              className="min-h-11 inline-flex items-center justify-center rounded-xl bg-[color:var(--lux-accent)] px-4 py-2 text-sm font-semibold text-black hover:opacity-95"
              data-ga-event="crisis_banner_click"
              data-ga-label={placement}
              onClick={() => {
                try {
                  trackEvent("crisis_banner_click", { placement, href: view?.cta?.href || "/intelligence/sip-vs-panic" });
                } catch {
                  // ignore
                }
              }}
            >
              {view?.cta?.label || "Run SIP vs Panic"}
            </Link>

            <button
              type="button"
              className="min-h-11 inline-flex items-center justify-center rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/80 hover:border-white/15"
              onClick={() => {
                try {
                  window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
                } catch {
                  // ignore
                }

                setDismissed(true);

                try {
                  trackEvent("crisis_banner_dismiss", { placement });
                } catch {
                  // ignore
                }
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
