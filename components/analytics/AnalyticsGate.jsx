"use client";

import Script from "next/script";
import { Suspense, useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { GA4PageView } from "@/components/analytics/GA4PageView";

function readConsent() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("cookieConsent");
  } catch {
    return null;
  }
}

export function AnalyticsGate({ measurementId }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const update = () => setEnabled(readConsent() === "accepted");

    update();
    window.addEventListener("storage", update);
    window.addEventListener("cookie-consent", update);

    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("cookie-consent", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !measurementId) return;
    if (typeof window === "undefined") return;

    const sendEvent = (eventName, params) => {
      try {
        if (typeof window.gtag !== "function") return;
        window.gtag("event", eventName, params || {});
      } catch {
        // ignore
      }
    };

    const onClickCapture = (event) => {
      try {
        const target = event.target;
        if (!(target instanceof Element)) return;

        const tagged = target.closest("[data-ga-event]");
        if (tagged) {
          const name = tagged.getAttribute("data-ga-event") || "cta_click";
          const label = tagged.getAttribute("data-ga-label") || tagged.textContent?.trim()?.slice(0, 120) || "";
          const valueRaw = tagged.getAttribute("data-ga-value");
          const value = valueRaw != null && valueRaw !== "" ? Number(valueRaw) : undefined;
          sendEvent(name, {
            event_category: "engagement",
            event_label: label,
            value: Number.isFinite(value) ? value : undefined,
          });
          return;
        }

        const link = target.closest("a[href]");
        if (!link) return;

        const href = link.getAttribute("href") || "";
        const text = link.textContent?.trim()?.slice(0, 120) || "";

        // Contact methods
        if (href.startsWith("tel:")) {
          sendEvent("contact_click", { method: "tel", link_url: href, link_text: text });
          return;
        }
        if (href.startsWith("mailto:")) {
          sendEvent("contact_click", { method: "email", link_url: href, link_text: text });
          return;
        }
        if (/wa\.me\//i.test(href) || /api\.whatsapp\.com/i.test(href)) {
          sendEvent("contact_click", { method: "whatsapp", link_url: href, link_text: text });
          return;
        }

        // Outbound click
        let absoluteUrl;
        try {
          absoluteUrl = new URL(href, window.location.href);
        } catch {
          return;
        }

        const isOutbound = absoluteUrl.hostname !== window.location.hostname;
        if (isOutbound) {
          sendEvent("outbound_click", {
            link_url: absoluteUrl.toString(),
            link_domain: absoluteUrl.hostname,
            link_text: text,
          });
        }
      } catch {
        // ignore
      }
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [enabled, measurementId]);

  if (!enabled) return null;

  return (
    <>
      {measurementId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html:
                "window.dataLayer = window.dataLayer || [];\n" +
                "function gtag(){dataLayer.push(arguments);}\n" +
                "gtag('js', new Date());\n" +
                `gtag('config', '${measurementId}', { send_page_view: false });`,
            }}
          />
          <Suspense fallback={null}>
            <GA4PageView measurementId={measurementId} />
          </Suspense>
        </>
      ) : null}

      <Analytics />
      <SpeedInsights />
    </>
  );
}
