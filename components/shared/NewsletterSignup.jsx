"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 5000);
      }
    } catch (error) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <div className="bm-newsletter relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 px-6 py-8 md:px-10 md:py-9">
      <div className="bm-newsletter__accent" aria-hidden />

      <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row md:items-center">
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-3">
            <span className="h-[1px] w-10 bg-[oklch(0.78_0.08_65_/_0.35)]" aria-hidden />
            <div className="text-[10px] uppercase tracking-[0.55em] text-white/55">Private Note</div>
            <span className="h-[1px] w-10 bg-[oklch(0.78_0.08_65_/_0.35)]" aria-hidden />
          </div>

          <h3 className="mt-3 text-2xl md:text-[34px] font-serif m-0 tracking-[0.02em] drop-shadow-[0_0_10px_oklch(0.78_0.08_65_/_0.20)]" style={{ color: 'oklch(0.95 0.01 85 / 0.88)' }}>
            BM Wealth Dispatch
          </h3>
          <p className="mt-2 text-sm md:text-[13px] text-white/70 m-0 max-w-xl tracking-wide">
            One note monthly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full md:w-auto">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="bm-newsletter__fieldwrap w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={status === "loading"}
                className="w-full sm:w-[320px] rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white placeholder:text-white/45 outline-none transition-colors hover:border-white/20 focus:ring-1 focus:ring-[color:var(--color-matte-gold)]"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className={
                status === "loading"
                  ? "group relative overflow-hidden rounded-xl px-7 py-3 opacity-70 cursor-not-allowed"
                  : "group relative overflow-hidden rounded-xl px-7 py-3"
              }
              style={{
                backgroundColor: 'oklch(0.06 0.005 280)',
                border: '1px solid oklch(0.78 0.08 65 / 0.35)',
                boxShadow: '0 0 0 1px oklch(0.78 0.08 65 / 0.10), 0 18px 60px rgba(0, 0, 0, 0.55)',
              }}
            >
              <span
                className="relative z-10 flex items-center justify-center gap-5 text-[10px] tracking-[0.25em] uppercase font-semibold transition-colors duration-700 group-hover:text-black"
                style={{ color: 'oklch(0.95 0.01 85 / 0.92)' }}
              >
                {status === "loading" ? "Subscribing..." : "Subscribe"}
                <ArrowRight className="h-4 w-4 transition-transform duration-700 group-hover:translate-x-2" />
              </span>
              <span
                aria-hidden
                className="absolute inset-0 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-700"
                style={{ backgroundColor: 'oklch(0.78 0.08 65)' }}
              />
            </button>
          </div>

          {status === "success" ? (
            <div className="mt-3 text-[11px] text-emerald-300/90">Subscribed. Check your inbox.</div>
          ) : status === "error" ? (
            <div className="mt-3 text-[11px] text-red-300/90">Unable to subscribe right now. Try again.</div>
          ) : (
            <div className="mt-3 text-[11px] text-white/50" data-newsletter-unsub-note>
              Unsubscribe anytime.
            </div>
          )}
        </form>
      </div>

      <style jsx>{`
        .bm-newsletter {
          box-shadow:
            0 0 0 1px color-mix(in oklab, var(--color-matte-gold) 10%, transparent),
            0 18px 60px rgba(0, 0, 0, 0.55);
        }

        .bm-newsletter__accent {
          position: absolute;
          inset: -1px;
          pointer-events: none;
          background:
            radial-gradient(900px 320px at 10% 10%, color-mix(in oklab, var(--color-matte-gold) 18%, transparent) 0%, transparent 60%),
            radial-gradient(700px 260px at 90% 0%, color-mix(in oklab, var(--color-matte-gold) 14%, transparent) 0%, transparent 62%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(0, 0, 0, 0) 55%);
          opacity: 0.9;
        }

        .bm-newsletter::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            110deg,
            transparent 0%,
            rgba(255, 255, 255, 0.06) 18%,
            transparent 38%,
            transparent 100%
          );
          transform: translateX(-120%);
          animation: bmNewsletterSheen 9s ease-in-out infinite;
        }

        .bm-newsletter__fieldwrap {
          position: relative;
        }

        .bm-newsletter__fieldwrap::after {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: 14px;
          pointer-events: none;
          box-shadow: 0 0 0 1px color-mix(in oklab, var(--color-matte-gold) 14%, transparent);
          opacity: 0.55;
        }

        @keyframes bmNewsletterSheen {
          0%, 55% {
            transform: translateX(-120%);
            opacity: 0;
          }
          62% {
            opacity: 1;
          }
          78% {
            transform: translateX(120%);
            opacity: 0.85;
          }
          100% {
            transform: translateX(120%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
