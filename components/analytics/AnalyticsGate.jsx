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
