/**
 * FILE: app\layout.js
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - next/font/google
 * - @/components/user/Navigation
 * - @/components/user/Footer
 * - @/components/user/WhatsAppFloat
 * - @/components/user/LuxuryMobileDock
 * - @vercel/analytics/react
 * - @vercel/speed-insights/react
 *
 * USED BY:
 * - (search the repo for this filename)
 *
 * SIMPLE EXPLANATION:
 * This file is part of the app.
 * It helps one specific feature work correctly.
 *
 * TO MODIFY:
 * - 🔧 Search for "TO MODIFY" notes inside the file.
 */

'use client';

import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import { usePathname } from 'next/navigation';
import "./globals.css";
import Navigation from "@/components/user/Navigation";
import Footer from "@/components/user/Footer";
import WhatsAppFloat from "@/components/user/WhatsAppFloat";
import { LuxuryMobileDock } from "@/components/user/LuxuryMobileDock";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import CookieConsent from "@/components/shared/CookieConsent";
import { AnalyticsGate } from "@/components/analytics/AnalyticsGate";
import { schemaGraph } from "./metadata";
import Script from "next/script";

const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim() || null;

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({ children, buildId: buildIdProp, host: hostProp }) {
  // Used only for deploy verification/debugging (no visual output)
  const buildId = buildIdProp || 'local';
  const host = typeof hostProp === 'string' ? hostProp : '';
  const hostClean = String(host).split(',')[0].trim().toLowerCase();
  const hostNoPort = hostClean.split(':')[0];
  const normalizedHost = hostNoPort.startsWith('www.') ? hostNoPort.slice(4) : hostNoPort;
  const isStoreHost = normalizedHost === 'store.bmwealth.co.in';

  const pathname = usePathname();
  const isLaserPage = pathname === '/live-intelligence';
  const isClientPortal = pathname === '/client-portal';
  // Pages with their own custom footer - don't add global Footer
  const hasCustomFooter = isLaserPage || isClientPortal;

  const siteUrl = isStoreHost ? "https://store.bmwealth.co.in" : "https://bmwealth.co.in";
  return (
    <html lang="en">
      <head>
        <meta name="x-ui-build" content={buildId} />

        {/*
          Pre-hydration SW/cache reset.
          Fixes hydration mismatches when a stale service worker serves old JS bundles
          while the server HTML is new (common on localhost/127 after past PWAs).

          - Auto-runs once per tab on localhost/127.0.0.1
          - Can be forced on any origin via ?resetSW=1 or ?reset-sw=1
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(() => {
  try {
    const url = new URL(window.location.href);
    const params = url.searchParams;

    // One-time loop guard that does not rely on storage (some browsers/extensions block it).
    const doneParam = '__swResetDone';
    const alreadyDone = params.get(doneParam) === '1';
    if (alreadyDone) {
      params.delete(doneParam);
      url.search = params.toString();
      try {
        window.history.replaceState(null, '', url.toString());
      } catch {}
    } else {
      // Detect deploy changes (works on live environments).
      // If a stale SW/cache is serving old JS bundles, this prevents hydration mismatches.
      let buildMeta = '';
      try {
        const el = document.querySelector('meta[name="x-ui-build"]');
        buildMeta = (el && el.getAttribute('content')) || '';
      } catch {}

      let buildChanged = false;
      let prevBuild = '';
      try {
        if (buildMeta && window.localStorage) {
          const buildKey = '__bmw_ui_build_v1';
          prevBuild = localStorage.getItem(buildKey) || '';
          if (prevBuild && prevBuild !== buildMeta) buildChanged = true;
          localStorage.setItem(buildKey, buildMeta);
        }
      } catch {}

      let hasController = false;
      try {
        hasController = 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;
      } catch {}

      const firstSeenBuildWithSW = !!buildMeta && !prevBuild && hasController;

      const force =
        params.get('resetSW') === '1' ||
        params.get('reset-sw') === '1' ||
        params.has('resetSW') ||
        params.has('reset-sw');

      const isLocalHost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

      // Localhost/dev can still hit stale cached HTML/chunks (often from an old SW or browser cache),
      // which can surface as webpack runtime errors like:
      //   TypeError: Cannot read properties of undefined (reading 'call')
      // We only trigger a reload if we actually deleted caches/unregistered SW.
      const shouldRun = !!(force || buildChanged || firstSeenBuildWithSW || isLocalHost);

      // Avoid reload loops.
      const flagKey = '__bmw_sw_reset_done_v2:' + (buildMeta || 'no-build');
      const alreadyRan = !!(!force && window.sessionStorage && sessionStorage.getItem(flagKey) === '1');

      if (shouldRun && !alreadyRan) {
        let didWork = false;
        const tasks = [];

        const devHardKey = '__bmw_dev_hard_reload_v1';
        let shouldDevHardReload = false;
        try {
          shouldDevHardReload =
            isLocalHost &&
            !!window.sessionStorage &&
            sessionStorage.getItem(devHardKey) !== '1';
        } catch {}

        if ('serviceWorker' in navigator) {
          tasks.push(
            navigator.serviceWorker
              .getRegistrations()
              .then((regs) => {
                if (regs && regs.length) didWork = true;
                return Promise.all(
                  (regs || []).map((r) => {
                    try {
                      return r.unregister();
                    } catch {
                      return Promise.resolve();
                    }
                  })
                );
              })
              .catch(() => {})
          );
        }

        if ('caches' in window) {
          tasks.push(
            caches
              .keys()
              .then((keys) => {
                if (keys && keys.length) didWork = true;
                return Promise.all(
                  (keys || []).map((k) => {
                    try {
                      return caches.delete(k);
                    } catch {
                      return Promise.resolve();
                    }
                  })
                );
              })
              .catch(() => {})
          );
        }

        Promise.all(tasks).finally(() => {
          try {
            if (window.sessionStorage) sessionStorage.setItem(flagKey, '1');
          } catch {}

          const doReload = didWork || shouldDevHardReload;
          if (!doReload) return;
          try {
            if (shouldDevHardReload && window.sessionStorage) {
              sessionStorage.setItem(devHardKey, '1');
            }
          } catch {}
          params.delete('resetSW');
          params.delete('reset-sw');
          params.set(doneParam, '1');
          url.search = params.toString();
          window.location.replace(url.toString());
        });
      }
    }
  } catch {
    // ignore
  }
})();
            `,
          }}
        />

  {/* Google Analytics */}
  {GA4_MEASUREMENT_ID && (
            <>
              <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`} />
              <script
                dangerouslySetInnerHTML={{
                                __html: `
                                                window.dataLayer = window.dataLayer || [];
                                                                function gtag(){dataLayer.push(arguments);}
                                                                                gtag('js', new Date());
                                                                                                gtag('config', '${GA4_MEASUREMENT_ID}');
                                                                                                              `,
                }}
            />
              </>
                    )}

        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#090A0C" />

        {/* CueLinks Affiliate Tracking (Publisher ID: 223077) — main site only */}
        {!isStoreHost && (
          <Script id="cuelinks" strategy="afterInteractive">
            {`
(function(d, t) {
  var cId = '223077';
  var s = document.createElement('script');
  s.type = 'text/javascript';
  s.async = true;
  s.src = 'https://cdn0.cuelinks.com/js/' + 'cuelinkssv2.js';
  document.getElementsByTagName('body')[0].appendChild(s);
})(document, 'script');
            `}
          </Script>
        )}
      </head>
      <body
        className={`${playfair.variable} ${inter.variable} ${jetbrainsMono.variable}`}
        style={{
          backgroundColor: "#000",
          color: "#fff",
          margin: 0,
          overflowX: "hidden",
          maxWidth: "100%",
          width: "100%",
        }}
      >
        {!isStoreHost && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph(siteUrl)) }}
          />
        )}
        <div
          className="main-wrapper"
          data-ui-build={buildId}
          style={{
            overflowX: "hidden",
            maxWidth: "100%",
            width: "100%",
            position: "relative",
          }}
        >
          {!isStoreHost && <Navigation />}
          {!isStoreHost && <Breadcrumbs />}
          <main style={{ overflowX: "hidden", maxWidth: "100%", width: "100%" }}>
            {children}
          </main>
          {/* Only render global Footer if page doesn't have custom footer */}
          {!hasCustomFooter && !isStoreHost && <Footer />}
        </div>
        {!isStoreHost && <LuxuryMobileDock />}
        {!isStoreHost && <WhatsAppFloat />}
        <CookieConsent />
        <AnalyticsGate measurementId={GA4_MEASUREMENT_ID} />
      </body>
    </html>
  );

}
