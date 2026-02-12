"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { trackEvent } from "@/lib/analytics";

const inr0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatLakhs(amount: number): string {
  const v = Number.isFinite(amount) ? amount : 0;
  return `₹${(v / 100_000).toFixed(2)}L`;
}

interface ShareScenarioProps {
  monthlySIP: number;
  years: number;
  crashPreset: string;
  disciplineAmount: number;
  panicAmount: number;
  loss: number;
  lang?: string;
}

export function ShareScenario(props: ShareScenarioProps) {
  const {
    monthlySIP,
    years,
    crashPreset,
    disciplineAmount,
    panicAmount,
    loss,
    lang = "en",
  } = props;

  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const generateScenarioURL = useCallback(() => {
    if (typeof window === "undefined") return "";
    const baseURL = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set("share", "1");
    params.set("m", String(monthlySIP));
    params.set("y", String(years));
    params.set("crash", crashPreset);
    params.set("lang", lang);
    return `${baseURL}?${params.toString()}`;
  }, [monthlySIP, years, crashPreset, lang]);

  const scenarioURL = generateScenarioURL();

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(scenarioURL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      trackEvent("sip_vs_panic_share_copied", {
        calculator_type: "sip_vs_panic_selling",
        channel: "clipboard",
        monthly_amount: monthlySIP,
        duration_years: years,
      });
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = scenarioURL;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [scenarioURL, monthlySIP, years]);

  const handleShareWhatsApp = useCallback(() => {
    const lossFormatted = formatLakhs(loss);
    const disciplineFormatted = formatLakhs(disciplineAmount);
    const panicFormatted = formatLakhs(panicAmount);
    const sipFormatted = inr0.format(monthlySIP);

    const message = `🎯 SIP vs Panic Simulator Results

💰 Monthly SIP: ${sipFormatted}
📅 Duration: ${years} years
📉 Crash Scenario: ${crashPreset}

Results:
✅ Stay Calm: ${disciplineFormatted}
⚠️ Panic Sell: ${panicFormatted}
❌ Cost of Panic: ${lossFormatted}

Try your own scenario:
${scenarioURL}

#SIPvsPanic #InvestmentEducation`;

    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank", "noopener,noreferrer");

    trackEvent("sip_vs_panic_share_whatsapp", {
      calculator_type: "sip_vs_panic_selling",
      channel: "whatsapp",
      behavioral_cost: loss,
      monthly_amount: monthlySIP,
      duration_years: years,
    });
  }, [scenarioURL, monthlySIP, years, crashPreset, disciplineAmount, panicAmount, loss]);

  const handleShareTwitter = useCallback(() => {
    const lossFormatted = formatLakhs(loss);

    const message = `I just ran the SIP vs Panic Simulator! 📊

Stopping SIP during a -20% crash could cost me ${lossFormatted} over ${years} years.

Lesson learned: Stay calm, keep investing! 💪

Try yours: ${scenarioURL}

#SIPvsPanic #InvestSmart`;

    const twitterURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
    window.open(twitterURL, "_blank", "noopener,noreferrer");

    trackEvent("sip_vs_panic_share_twitter", {
      calculator_type: "sip_vs_panic_selling",
      channel: "twitter",
      behavioral_cost: loss,
      monthly_amount: monthlySIP,
      duration_years: years,
    });
  }, [scenarioURL, years, loss, monthlySIP]);

  const handleShareLinkedIn = useCallback(() => {
    const linkedInURL = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(scenarioURL)}`;
    window.open(linkedInURL, "_blank", "noopener,noreferrer");

    trackEvent("sip_vs_panic_share_linkedin", {
      calculator_type: "sip_vs_panic_selling",
      channel: "linkedin",
      behavioral_cost: loss,
      monthly_amount: monthlySIP,
      duration_years: years,
    });
  }, [scenarioURL, loss, monthlySIP, years]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="share-scenario-section rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold gold-gradient-text-static">📤 Share Your Scenario</h3>
          <p className="mt-1 text-xs text-white/70">Share your results with friends and challenge them!</p>
        </div>
      </div>

      {/* URL Box */}
      <div className="mt-4 flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={scenarioURL}
            readOnly
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80 font-mono truncate focus:outline-none focus:border-white/20"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCopyLink}
          className="min-w-[100px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="copied"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-[color:var(--lux-accent)]"
              >
                ✓ Copied!
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                📋 Copy
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Share Buttons */}
      <div className="mt-4 flex flex-wrap gap-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleShareWhatsApp}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/5 hover:border-white/15 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          WhatsApp
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleShareTwitter}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/5 hover:border-white/15 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Twitter/X
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleShareLinkedIn}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/5 hover:border-white/15 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          LinkedIn
        </motion.button>
      </div>

      {/* Challenge Mode */}
      <div className="mt-5 p-4 rounded-xl border border-white/10 bg-black/20">
        <div className="flex items-center gap-2 text-[color:var(--lux-accent)]">
          <span className="text-lg">🎯</span>
          <span className="font-semibold text-sm">Challenge a Friend</span>
        </div>
        <p className="mt-2 text-xs text-white/60">
          Ask them: "What would YOU do if the market dropped {crashPreset === "2020" ? "40%" : crashPreset === "2008" ? "60%" : "35%"}?"
          <br />
          Share your link and compare results!
        </p>
      </div>

      {/* Scenario Summary */}
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-white/5 bg-black/20 p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/50">Monthly SIP</div>
          <div className="text-sm font-semibold text-white/90 tabular-nums">{inr0.format(monthlySIP)}</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-black/20 p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/50">Duration</div>
          <div className="text-sm font-semibold text-white/90">{years} years</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-black/20 p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/50">Crash</div>
          <div className="text-sm font-semibold text-white/90">{crashPreset}</div>
        </div>
      </div>
    </motion.div>
  );
}
